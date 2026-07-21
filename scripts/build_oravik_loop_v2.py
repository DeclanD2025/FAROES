#!/usr/bin/env python3
"""Select the best grounded Øravík loop from all trail/road crossings.

Version 1 correctly rejected an early village-road crossing that produced a
0.97 km circuit. This version evaluates every sustained crossing between the
official Øravík–Fámjin village path and the tunnel-free OSM road network, then
selects the complete loop closest to 4 km. It writes diagnostics before applying
the publishability gate so a failed result remains auditable.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import gpxpy
import gpxpy.gpx
import networkx as nx
from shapely.geometry import Point

import build_oravik_loop as base

OUTPUT_DIR = base.OUTPUT_DIR
TARGET_M = 4_000.0
MIN_TRAIL_DISTANCE_M = 650.0
MAX_TRAIL_DISTANCE_M = 3_200.0
MAX_CROSSING_DISTANCE_M = 22.0


def candidate_crossings(official, ways):
    trail_2d = [(lon, lat) for lon, lat, _ in official]
    dists = base.cumulative_m(trail_2d)

    road_lines = []
    for way in ways:
        if not base.usable_way(way, base.DRIVABLE_HIGHWAYS):
            continue
        if base.route_length_m(way.coords) < 80:
            continue
        road_lines.append((way, base.projected_line(way.coords)))

    raw = []
    for index, coord in enumerate(trail_2d):
        trail_m = dists[index]
        if trail_m < MIN_TRAIL_DISTANCE_M:
            continue
        if trail_m > MAX_TRAIL_DISTANCE_M:
            break
        point = Point(base.TO_METRES.transform(*coord))
        nearest_distance = float("inf")
        nearest_way = None
        for way, line in road_lines:
            distance = point.distance(line)
            if distance < nearest_distance:
                nearest_distance = distance
                nearest_way = way
        if nearest_way is not None and nearest_distance <= MAX_CROSSING_DISTANCE_M:
            raw.append((index, trail_m, coord, nearest_distance, nearest_way))

    # Group consecutive GPX points that describe the same physical crossing.
    groups = []
    current = []
    for item in raw:
        if current and item[0] > current[-1][0] + 2:
            groups.append(current)
            current = []
        current.append(item)
    if current:
        groups.append(current)

    # Ignore single noisy points. Take the middle point of each sustained group.
    return [group[len(group) // 2] for group in groups if len(group) >= 2]


def road_names(edges):
    names = []
    for edge in edges:
        label = edge.get("name") or edge.get("ref") or edge.get("highway")
        if label and label not in names:
            names.append(label)
    return names


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    official_path = OUTPUT_DIR / "source-official-oravik-famjin.gpx"
    pbf_path = OUTPUT_DIR / "source-faroe-islands.osm.pbf"
    base.download(base.OFFICIAL_GPX_URL, official_path)
    base.download(base.OSM_PBF_URL, pbf_path)

    official = base.load_official_gpx(official_path)
    ways = base.load_osm_ways(pbf_path)
    trail_2d = [(lon, lat) for lon, lat, _ in official]
    official_dists = base.cumulative_m(trail_2d)
    gate = trail_2d[0]

    approach_graph, approach_positions = base.build_graph(ways, base.APPROACH_HIGHWAYS)
    road_graph, road_positions = base.build_graph(ways, base.DRIVABLE_HIGHWAYS)
    approach_coords, approach_edges = base.graph_route(
        approach_graph, approach_positions, base.START, gate
    )
    approach_m = base.route_length_m(approach_coords)

    evaluated = []
    for index, trail_m, crossing, proximity_m, way in candidate_crossings(official, ways):
        try:
            return_coords, return_edges = base.graph_route(
                road_graph, road_positions, crossing, base.START
            )
        except (nx.NetworkXNoPath, RuntimeError) as exc:
            evaluated.append(
                {
                    "trail_index": index,
                    "trail_distance_m": round(trail_m, 1),
                    "crossing": {"lon": crossing[0], "lat": crossing[1]},
                    "osm_way_id": way.osm_id,
                    "road_name": way.name,
                    "road_ref": way.ref,
                    "highway": way.highway,
                    "proximity_m": round(proximity_m, 1),
                    "usable": False,
                    "error": str(exc),
                }
            )
            continue

        trail_coords = trail_2d[: index + 1]
        combined = base.dedupe([*approach_coords, *trail_coords, *return_coords])
        return_m = base.route_length_m(return_coords)
        total_m = base.route_length_m(combined)
        evaluated.append(
            {
                "trail_index": index,
                "trail_distance_m": round(trail_m, 1),
                "crossing": {"lon": crossing[0], "lat": crossing[1]},
                "osm_way_id": way.osm_id,
                "road_name": way.name,
                "road_ref": way.ref,
                "highway": way.highway,
                "proximity_m": round(proximity_m, 1),
                "usable": True,
                "approach_distance_m": round(approach_m, 1),
                "road_return_distance_m": round(return_m, 1),
                "total_distance_m": round(total_m, 1),
                "delta_from_4km_m": round(total_m - TARGET_M, 1),
                "road_sequence": road_names(return_edges),
                "return_edges": return_edges,
                "combined": combined,
                "return_coords": return_coords,
            }
        )

    public_diagnostics = []
    for item in evaluated:
        public_diagnostics.append({k: v for k, v in item.items() if k not in {"combined", "return_coords", "return_edges"}})
    (OUTPUT_DIR / "crossing-candidates.json").write_text(
        json.dumps(public_diagnostics, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    usable = [item for item in evaluated if item.get("usable")]
    if not usable:
        raise RuntimeError("No tunnel-free road return could be built from any sustained trail crossing")

    # Prefer a loop genuinely close to 4 km. A later crossing wins a tie because it
    # provides more of the official fell route and less arbitrary road mileage.
    usable.sort(key=lambda item: (abs(item["delta_from_4km_m"]), -item["trail_distance_m"]))
    chosen = usable[0]
    total_m = float(chosen["total_distance_m"])

    if not 3_650 <= total_m <= 4_350:
        nearest = ", ".join(
            f"{item['total_distance_m']/1000:.2f} km at trail {item['trail_distance_m']/1000:.2f} km"
            for item in usable[:5]
        )
        raise RuntimeError(
            "No grounded trail/road circuit falls within 3.65–4.35 km. "
            f"Closest candidates: {nearest}. Do not publish an invented 4 km loop."
        )

    combined_2d = chosen["combined"]
    elevated = base.enrich_elevation(combined_2d)
    elevations = [ele for _, _, ele in elevated if ele is not None]
    ascent = 0.0
    descent = 0.0
    for a, b in zip(elevations, elevations[1:]):
        delta = b - a
        if delta > 0:
            ascent += delta
        else:
            descent += abs(delta)

    crossing = chosen["crossing"]
    report = {
        "route_name": "Øravík fell-and-road loop",
        "status": "geometry generated; mixed-surface route requires weather and footing check",
        "distance_km": round(total_m / 1000, 3),
        "distance_target_delta_m": round(total_m - TARGET_M, 1),
        "selection_method": "All sustained crossings of the official trail with tunnel-free OSM roads were evaluated; the complete circuit closest to 4 km was selected.",
        "start": {"lon": base.START[0], "lat": base.START[1], "label": "Við á 7"},
        "gate": {"lon": gate[0], "lat": gate[1]},
        "crossing": {
            "lon": crossing[0],
            "lat": crossing[1],
            "official_trail_distance_from_gate_m": chosen["trail_distance_m"],
            "distance_to_osm_road_m": chosen["proximity_m"],
            "osm_way_id": chosen["osm_way_id"],
            "road_name": chosen["road_name"],
            "road_ref": chosen["road_ref"],
            "highway": chosen["highway"],
        },
        "sections": {
            "accommodation_to_gate_km": round(approach_m / 1000, 3),
            "official_village_path_to_old_road_km": round(chosen["trail_distance_m"] / 1000, 3),
            "tunnel_free_road_return_km": round(chosen["road_return_distance_m"] / 1000, 3),
        },
        "road_sequence": chosen["road_sequence"],
        "elevation": {
            "source": "Open-Meteo approximate raster elevation",
            "min_m": round(min(elevations), 1),
            "max_m": round(max(elevations), 1),
            "ascent_m": round(ascent, 1),
            "descent_m": round(descent, 1),
        },
        "surface_and_safety": {
            "classification": "mixed-surface fell/trail loop, not a normal road run",
            "known_conditions": [
                "grass-covered village path with wet ground possible",
                "stony, steep and less visible ground near Fámjinsklovn/Øraskarð",
                "live roads on the return section",
                "Fámjinstunnilin is excluded from the route",
            ],
            "decision_rule": "Use the coastal road alternative when visibility, wind, rain or footing make the fell section unsuitable.",
        },
        "source_urls": {
            "official_hike": "https://visitfaroeislands.com/en/whatson/hiking/hike/oravik-famjin",
            "official_gpx": base.OFFICIAL_GPX_URL,
            "osm_extract": base.OSM_PBF_URL,
            "elevation": "https://api.open-meteo.com/v1/elevation",
        },
        "approach_edges": approach_edges,
        "return_edges": chosen["return_edges"],
    }

    base.write_geojson(elevated, report)
    base.write_gpx(elevated, report)
    (OUTPUT_DIR / "oravik-loop-audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    summary = [
        "# Øravík loop route audit",
        "",
        f"- Distance: **{report['distance_km']} km** ({report['distance_target_delta_m']:+.1f} m from 4 km)",
        f"- Við á 7 to official path: **{report['sections']['accommodation_to_gate_km']} km**",
        f"- Official fell/path section: **{report['sections']['official_village_path_to_old_road_km']} km**",
        f"- Tunnel-free road return: **{report['sections']['tunnel_free_road_return_km']} km**",
        f"- Approximate ascent: **{report['elevation']['ascent_m']} m**",
        f"- Return roads: **{' → '.join(report['road_sequence'])}**",
        "",
        "This is a mixed-surface fell/trail loop. It must not be presented as an ordinary all-road run.",
    ]
    (OUTPUT_DIR / "README.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print("\n".join(summary))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ROUTE BUILD FAILED: {exc}", file=sys.stderr)
        raise
