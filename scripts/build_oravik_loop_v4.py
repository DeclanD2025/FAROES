#!/usr/bin/env python3
"""Generate the validated 4.139 km Øravík true loop.

Uses the official path entrance as start/finish (about 112 m from Við á 7),
the official Visit Faroe Islands Øravík–Fámjin trail GPX to the first suitable
old-road crossing, and a tunnel-free OSM road return.
"""

from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET

import networkx as nx

import build_oravik_loop as base
from build_oravik_loop_v2 import candidate_crossings, road_names

TARGET_M = 4_000.0
ACCOMMODATION = base.START


def main() -> None:
    out = base.OUTPUT_DIR
    out.mkdir(parents=True, exist_ok=True)
    official_path = out / "source-official-oravik-famjin.gpx"
    pbf_path = out / "source-faroe-islands.osm.pbf"
    base.download(base.OFFICIAL_GPX_URL, official_path)
    base.download(base.OSM_PBF_URL, pbf_path)

    official = base.load_official_gpx(official_path)
    ways = base.load_osm_ways(pbf_path)
    trail_2d = [(lon, lat) for lon, lat, _ in official]
    gate = trail_2d[0]
    accommodation_distance_m = base.haversine_m(ACCOMMODATION, gate)
    if accommodation_distance_m > 1_000:
        raise RuntimeError("Official path entrance falls outside the requested 1 km radius")

    road_graph, road_positions = base.build_graph(ways, base.DRIVABLE_HIGHWAYS)
    evaluated = []
    for index, trail_m, crossing, proximity_m, way in candidate_crossings(official, ways):
        try:
            return_coords, return_edges = base.graph_route(
                road_graph, road_positions, crossing, gate
            )
        except (nx.NetworkXNoPath, RuntimeError) as exc:
            evaluated.append({
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
            })
            continue

        trail_coords = trail_2d[: index + 1]
        combined = base.dedupe([*trail_coords, *return_coords])
        total_m = base.route_length_m(combined)
        evaluated.append({
            "trail_index": index,
            "trail_distance_m": round(trail_m, 1),
            "crossing": {"lon": crossing[0], "lat": crossing[1]},
            "osm_way_id": way.osm_id,
            "road_name": way.name,
            "road_ref": way.ref,
            "highway": way.highway,
            "proximity_m": round(proximity_m, 1),
            "usable": True,
            "road_return_distance_m": round(base.route_length_m(return_coords), 1),
            "total_distance_m": round(total_m, 1),
            "delta_from_4km_m": round(total_m - TARGET_M, 1),
            "road_sequence": road_names(return_edges),
            "return_edges": return_edges,
            "combined": combined,
        })

    public = [
        {k: v for k, v in item.items() if k not in {"combined", "return_edges"}}
        for item in evaluated
    ]
    (out / "crossing-candidates.json").write_text(
        json.dumps(public, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    usable = [item for item in evaluated if item.get("usable")]
    if not usable:
        raise RuntimeError("No tunnel-free road return was available")
    usable.sort(key=lambda item: abs(item["delta_from_4km_m"]))
    chosen = usable[0]
    total_m = float(chosen["total_distance_m"])
    if not 3_850 <= total_m <= 4_250:
        raise RuntimeError(
            f"Closest grounded loop is {total_m/1000:.3f} km; outside the strict 3.85–4.25 km acceptance range"
        )

    elevated = base.enrich_elevation(chosen["combined"])
    elevations = [ele for _, _, ele in elevated if ele is not None]
    ascent = descent = 0.0
    for a, b in zip(elevations, elevations[1:]):
        delta = b - a
        if delta > 0:
            ascent += delta
        else:
            descent += abs(delta)

    crossing = chosen["crossing"]
    report = {
        "route_name": "Øravík village-path and old-road loop",
        "status": "validated geometry; check weather, visibility and footing before use",
        "distance_km": round(total_m / 1000, 3),
        "distance_target_delta_m": round(total_m - TARGET_M, 1),
        "start": {
            "lon": gate[0],
            "lat": gate[1],
            "label": "Bønhúsið / official village-path entrance",
            "distance_from_vid_a_7_m": round(accommodation_distance_m, 1),
        },
        "accommodation": {
            "lon": ACCOMMODATION[0],
            "lat": ACCOMMODATION[1],
            "label": "Við á 7",
        },
        "crossing": {
            "lon": crossing["lon"],
            "lat": crossing["lat"],
            "official_trail_distance_from_start_m": chosen["trail_distance_m"],
            "distance_to_osm_road_m": chosen["proximity_m"],
            "osm_way_id": chosen["osm_way_id"],
            "road_name": chosen["road_name"],
            "road_ref": chosen["road_ref"],
            "highway": chosen["highway"],
        },
        "sections": {
            "official_path_km": round(chosen["trail_distance_m"] / 1000, 3),
            "tunnel_free_road_return_km": round(chosen["road_return_distance_m"] / 1000, 3),
            "walk_from_accommodation_to_start_km": round(accommodation_distance_m / 1000, 3),
        },
        "road_sequence": chosen["road_sequence"],
        "elevation": {
            "source": "Open-Meteo approximate raster elevation",
            "min_m": round(min(elevations), 1),
            "max_m": round(max(elevations), 1),
            "ascent_m": round(ascent, 1),
            "descent_m": round(descent, 1),
        },
        "brief_compliance": {
            "requested_distance_km": 4.0,
            "actual_distance_km": round(total_m / 1000, 3),
            "start_and_finish_within_1km_of_address": True,
            "distance_from_address_to_start_m": round(accommodation_distance_m, 1),
            "route_is_a_true_loop": True,
            "route_uses_a_road_tunnel": False,
        },
        "surface_and_safety": {
            "classification": "mixed-surface fell/trail loop, not a normal road run",
            "known_conditions": [
                "grass-covered village path with wet ground possible",
                "stony, steep and less visible ground near Fámjinsklovn/Øraskarð",
                "live roads on the return section",
                "Fámjinstunnilin and Hovstunnilin are excluded",
            ],
            "decision_rule": "Use the coastal road alternative when visibility, wind, rain or footing make the fell section unsuitable.",
        },
        "source_urls": {
            "official_hike": "https://visitfaroeislands.com/en/whatson/hiking/hike/oravik-famjin",
            "official_gpx": base.OFFICIAL_GPX_URL,
            "osm_extract": base.OSM_PBF_URL,
            "elevation": "https://api.open-meteo.com/v1/elevation",
        },
        "return_edges": chosen["return_edges"],
    }

    base.write_geojson(elevated, report)
    base.write_gpx(elevated, report)
    (out / "oravik-loop-audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    gpx_path = out / "oravik-fell-road-loop.gpx"
    tree = ET.parse(gpx_path)
    root = tree.getroot()
    ns = {"g": "http://www.topografix.com/GPX/1/1"}
    for name in root.findall("g:wpt/g:name", ns):
        if name.text and "Start / Finish" in name.text:
            name.text = "Bønhúsið — Start / Finish (about 112 m from Við á 7)"
    track_name = root.find("g:trk/g:name", ns)
    if track_name is not None:
        track_name.text = report["route_name"]
    tree.write(gpx_path, encoding="utf-8", xml_declaration=True)

    summary = (
        "# Øravík loop route audit\n\n"
        f"- Distance: **{report['distance_km']} km** ({report['distance_target_delta_m']:+.1f} m from 4 km)\n"
        f"- Start/finish: **Bønhúsið official path entrance**\n"
        f"- Walk from Við á 7: **{accommodation_distance_m:.0f} m**\n"
        f"- Official trail section: **{report['sections']['official_path_km']} km**\n"
        f"- Tunnel-free road return: **{report['sections']['tunnel_free_road_return_km']} km**\n"
        f"- Approximate ascent: **{report['elevation']['ascent_m']} m**\n"
        f"- Return: **{' → '.join(report['road_sequence'])}**\n"
        "- Shape: **true loop; no road tunnel**\n\n"
        "This is a mixed-surface fell/trail loop, not an ordinary road run.\n"
    )
    (out / "README.md").write_text(summary, encoding="utf-8")
    print(summary)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ROUTE BUILD FAILED: {exc}", file=sys.stderr)
        raise
