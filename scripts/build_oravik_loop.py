#!/usr/bin/env python3
"""Build and audit the Øravík mixed-surface loop.

The route is deliberately assembled from three grounded sources:
1. The exact Við á 7 placemark supplied by the traveller.
2. Visit Faroe Islands' official Øravík–Fámjin GPX for the village path.
3. Current OpenStreetMap road geometry from Geofabrik for the approach and return.

The script downloads source data, identifies the first genuine crossing of the
official village path with the old Fámjin road, routes back to Øravík while
excluding tunnels, validates the result, enriches it with approximate elevation,
and writes GPX/GeoJSON plus an audit report.
"""

from __future__ import annotations

import json
import math
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

import gpxpy
import gpxpy.gpx
import networkx as nx
import osmium
import requests
from pyproj import Transformer
from shapely.geometry import LineString, Point

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "route-output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OFFICIAL_GPX_URL = "https://vfibackend.com/uploads/1999.gpx"
OSM_PBF_URL = "https://download.geofabrik.de/europe/faroe-islands-latest.osm.pbf"

# Exact placemark shown for Við á 7 in Google Earth.
START = (-6.81211389, 61.53326111)  # lon, lat

# Keep the working data tightly scoped to central Suðuroy.
BBOX = (-6.89, 61.50, -6.77, 61.56)  # min lon, min lat, max lon, max lat

# UTM zone 29N covers Suðuroy and lets us compare distances in metres.
TO_METRES = Transformer.from_crs("EPSG:4326", "EPSG:32629", always_xy=True)

USER_AGENT = "FAROES-route-audit/1.0 (+https://github.com/DeclanD2025/FAROES)"

DRIVABLE_HIGHWAYS = {
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
    "residential",
    "living_street",
    "service",
    "track",
}

APPROACH_HIGHWAYS = DRIVABLE_HIGHWAYS | {"pedestrian"}


def haversine_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    lon1, lat1 = map(math.radians, a)
    lon2, lat2 = map(math.radians, b)
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6_371_008.8 * math.asin(math.sqrt(h))


def cumulative_m(coords: Sequence[tuple[float, float]]) -> list[float]:
    result = [0.0]
    for a, b in zip(coords, coords[1:]):
        result.append(result[-1] + haversine_m(a, b))
    return result


def route_length_m(coords: Sequence[tuple[float, float]]) -> float:
    return cumulative_m(coords)[-1] if len(coords) > 1 else 0.0


def dedupe(coords: Iterable[tuple[float, float]], tolerance_m: float = 0.4) -> list[tuple[float, float]]:
    result: list[tuple[float, float]] = []
    for coord in coords:
        if not result or haversine_m(result[-1], coord) > tolerance_m:
            result.append(coord)
    return result


def download(url: str, destination: Path) -> None:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=120)
    response.raise_for_status()
    destination.write_bytes(response.content)
    if destination.stat().st_size < 100:
        raise RuntimeError(f"Downloaded file from {url} is unexpectedly small")


def load_official_gpx(path: Path) -> list[tuple[float, float, float | None]]:
    gpx = gpxpy.parse(path.read_text(encoding="utf-8"))
    points: list[tuple[float, float, float | None]] = []
    for track in gpx.tracks:
        for segment in track.segments:
            for p in segment.points:
                points.append((p.longitude, p.latitude, p.elevation))
    if len(points) < 10:
        raise RuntimeError("Official GPX did not contain a usable track")

    # Ensure the Øravík end is first.
    first = (points[0][0], points[0][1])
    last = (points[-1][0], points[-1][1])
    if haversine_m(last, START) < haversine_m(first, START):
        points.reverse()
    return points


@dataclass
class WayRecord:
    osm_id: int
    highway: str
    name: str | None
    ref: str | None
    tunnel: bool
    access: str | None
    coords: list[tuple[float, float]]


class HighwayHandler(osmium.SimpleHandler):
    def __init__(self) -> None:
        super().__init__()
        self.ways: list[WayRecord] = []

    def way(self, way: osmium.osm.Way) -> None:
        highway = way.tags.get("highway")
        if not highway:
            return
        coords: list[tuple[float, float]] = []
        for node in way.nodes:
            if not node.location.valid():
                return
            lon, lat = node.location.lon, node.location.lat
            if BBOX[0] - 0.02 <= lon <= BBOX[2] + 0.02 and BBOX[1] - 0.02 <= lat <= BBOX[3] + 0.02:
                coords.append((lon, lat))
            else:
                # Keep complete ways only when all relevant nodes are near the study area.
                coords.append((lon, lat))
        if len(coords) < 2:
            return
        if not any(BBOX[0] <= lon <= BBOX[2] and BBOX[1] <= lat <= BBOX[3] for lon, lat in coords):
            return
        self.ways.append(
            WayRecord(
                osm_id=way.id,
                highway=highway,
                name=way.tags.get("name"),
                ref=way.tags.get("ref"),
                tunnel=way.tags.get("tunnel") in {"yes", "true", "1"},
                access=way.tags.get("access"),
                coords=coords,
            )
        )


def load_osm_ways(pbf_path: Path) -> list[WayRecord]:
    handler = HighwayHandler()
    handler.apply_file(str(pbf_path), locations=True)
    if not handler.ways:
        raise RuntimeError("No OSM highway data found in the study area")
    return handler.ways


def usable_way(way: WayRecord, allowed_highways: set[str]) -> bool:
    if way.highway not in allowed_highways:
        return False
    if way.tunnel:
        return False
    if way.access in {"private", "no"}:
        return False
    return True


def node_key(coord: tuple[float, float]) -> tuple[int, int]:
    # OSM node coordinates are precise; quantisation prevents floating representation mismatches.
    return (round(coord[0] * 10_000_000), round(coord[1] * 10_000_000))


def build_graph(ways: Sequence[WayRecord], allowed_highways: set[str]) -> tuple[nx.Graph, dict[tuple[int, int], tuple[float, float]]]:
    graph = nx.Graph()
    positions: dict[tuple[int, int], tuple[float, float]] = {}
    for way in ways:
        if not usable_way(way, allowed_highways):
            continue
        for a, b in zip(way.coords, way.coords[1:]):
            ka, kb = node_key(a), node_key(b)
            positions[ka] = a
            positions[kb] = b
            graph.add_edge(
                ka,
                kb,
                weight=haversine_m(a, b),
                osm_id=way.osm_id,
                highway=way.highway,
                name=way.name,
                ref=way.ref,
            )
    return graph, positions


def nearest_node(coord: tuple[float, float], positions: dict[tuple[int, int], tuple[float, float]], max_m: float = 250.0) -> tuple[int, int]:
    best_key: tuple[int, int] | None = None
    best_distance = float("inf")
    for key, candidate in positions.items():
        distance = haversine_m(coord, candidate)
        if distance < best_distance:
            best_key = key
            best_distance = distance
    if best_key is None or best_distance > max_m:
        raise RuntimeError(f"No OSM network node within {max_m:.0f} m of {coord}; nearest was {best_distance:.1f} m")
    return best_key


def graph_route(
    graph: nx.Graph,
    positions: dict[tuple[int, int], tuple[float, float]],
    start: tuple[float, float],
    finish: tuple[float, float],
) -> tuple[list[tuple[float, float]], list[dict[str, object]]]:
    start_node = nearest_node(start, positions)
    finish_node = nearest_node(finish, positions)
    path = nx.shortest_path(graph, start_node, finish_node, weight="weight")
    coords = [positions[node] for node in path]
    edges: list[dict[str, object]] = []
    for a, b in zip(path, path[1:]):
        data = graph.get_edge_data(a, b) or {}
        edges.append({
            "osm_id": data.get("osm_id"),
            "highway": data.get("highway"),
            "name": data.get("name"),
            "ref": data.get("ref"),
            "distance_m": round(float(data.get("weight", 0.0)), 1),
        })
    return [start, *coords, finish], edges


def projected_line(coords: Sequence[tuple[float, float]]) -> LineString:
    return LineString([TO_METRES.transform(lon, lat) for lon, lat in coords])


def find_trail_road_crossing(
    official: Sequence[tuple[float, float, float | None]],
    ways: Sequence[WayRecord],
) -> tuple[int, tuple[float, float], WayRecord, float]:
    trail_2d = [(lon, lat) for lon, lat, _ in official]
    dists = cumulative_m(trail_2d)

    candidates: list[tuple[WayRecord, LineString]] = []
    for way in ways:
        if not usable_way(way, DRIVABLE_HIGHWAYS):
            continue
        # Ignore tiny building access stubs as a crossing candidate.
        if route_length_m(way.coords) < 80:
            continue
        candidates.append((way, projected_line(way.coords)))

    consecutive = 0
    best_sequence: list[tuple[int, float, WayRecord]] = []
    for index, coord in enumerate(trail_2d):
        # Official description places the road encounter after the initial waterfall section.
        if dists[index] < 300:
            continue
        if dists[index] > 2_100:
            break
        point = Point(TO_METRES.transform(*coord))
        nearest_distance = float("inf")
        nearest_way: WayRecord | None = None
        for way, line in candidates:
            distance = point.distance(line)
            if distance < nearest_distance:
                nearest_distance = distance
                nearest_way = way
        if nearest_way is not None and nearest_distance <= 18:
            consecutive += 1
            best_sequence.append((index, nearest_distance, nearest_way))
            if consecutive >= 3:
                chosen = best_sequence[-consecutive]
                chosen_index, distance, way = chosen
                return chosen_index, trail_2d[chosen_index], way, distance
        else:
            consecutive = 0
            best_sequence.clear()

    # Diagnostic fallback: report the globally nearest post-300m approach.
    diagnostics: list[tuple[float, int, WayRecord]] = []
    for index, coord in enumerate(trail_2d):
        if not 300 <= dists[index] <= 2_100:
            continue
        point = Point(TO_METRES.transform(*coord))
        for way, line in candidates:
            diagnostics.append((point.distance(line), index, way))
    diagnostics.sort(key=lambda item: item[0])
    if diagnostics:
        distance, index, way = diagnostics[0]
        raise RuntimeError(
            f"No sustained trail/road crossing found. Nearest approach was {distance:.1f} m "
            f"at {dists[index]:.0f} m on OSM way {way.osm_id} ({way.name or way.ref or way.highway})."
        )
    raise RuntimeError("No candidate roads were available for the trail crossing audit")


def enrich_elevation(coords: Sequence[tuple[float, float]]) -> list[tuple[float, float, float | None]]:
    elevations: list[float | None] = []
    batch_size = 80
    for start_index in range(0, len(coords), batch_size):
        batch = coords[start_index : start_index + batch_size]
        params = {
            "latitude": ",".join(f"{lat:.7f}" for _, lat in batch),
            "longitude": ",".join(f"{lon:.7f}" for lon, _ in batch),
        }
        response = requests.get(
            "https://api.open-meteo.com/v1/elevation",
            params=params,
            headers={"User-Agent": USER_AGENT},
            timeout=60,
        )
        response.raise_for_status()
        values = response.json().get("elevation")
        if not isinstance(values, list) or len(values) != len(batch):
            raise RuntimeError("Open-Meteo elevation response did not match route coordinates")
        elevations.extend(float(value) if value is not None else None for value in values)
    return [(lon, lat, ele) for (lon, lat), ele in zip(coords, elevations)]


def write_geojson(coords: Sequence[tuple[float, float, float | None]], report: dict[str, object]) -> None:
    feature = {
        "type": "Feature",
        "properties": {
            "name": "Øravík fell-and-road loop",
            "route_type": "mixed-surface loop",
            "distance_km": report["distance_km"],
            "surface_note": "Village road, grass village path, stony/steep trail near the old road, then old and new road back to Øravík.",
            "data_sources": [
                "Visit Faroe Islands official Øravík–Fámjin GPX",
                "OpenStreetMap / Geofabrik road geometry",
                "Open-Meteo approximate elevation",
            ],
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [[lon, lat, ele] if ele is not None else [lon, lat] for lon, lat, ele in coords],
        },
    }
    (OUTPUT_DIR / "oravik-fell-road-loop.geojson").write_text(
        json.dumps({"type": "FeatureCollection", "features": [feature]}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def write_gpx(coords: Sequence[tuple[float, float, float | None]], report: dict[str, object]) -> None:
    gpx = gpxpy.gpx.GPX()
    gpx.name = "Øravík fell-and-road loop"
    gpx.description = (
        "Mixed-surface loop from Við á 7 using the opening of the official Øravík–Fámjin village path, "
        "then the old Fámjin road back to Øravík. Not an all-road run; use only in suitable visibility and ground conditions."
    )
    gpx.creator = "FAROES route audit"

    track = gpxpy.gpx.GPXTrack(name="Øravík fell-and-road loop")
    segment = gpxpy.gpx.GPXTrackSegment()
    track.segments.append(segment)
    gpx.tracks.append(track)
    for lon, lat, ele in coords:
        segment.points.append(gpxpy.gpx.GPXTrackPoint(latitude=lat, longitude=lon, elevation=ele))

    start_lon, start_lat, start_ele = coords[0]
    gpx.waypoints.append(gpxpy.gpx.GPXWaypoint(latitude=start_lat, longitude=start_lon, elevation=start_ele, name="Við á 7 — Start / Finish"))

    crossing = report["crossing"]
    gpx.waypoints.append(
        gpxpy.gpx.GPXWaypoint(
            latitude=float(crossing["lat"]),
            longitude=float(crossing["lon"]),
            name="Leave village path — turn onto old Fámjin road",
        )
    )

    (OUTPUT_DIR / "oravik-fell-road-loop.gpx").write_text(gpx.to_xml(), encoding="utf-8")


def main() -> None:
    official_path = OUTPUT_DIR / "source-official-oravik-famjin.gpx"
    pbf_path = OUTPUT_DIR / "source-faroe-islands.osm.pbf"
    download(OFFICIAL_GPX_URL, official_path)
    download(OSM_PBF_URL, pbf_path)

    official = load_official_gpx(official_path)
    ways = load_osm_ways(pbf_path)

    gate = (official[0][0], official[0][1])
    crossing_index, crossing, crossing_way, crossing_distance = find_trail_road_crossing(official, ways)

    approach_graph, approach_positions = build_graph(ways, APPROACH_HIGHWAYS)
    road_graph, road_positions = build_graph(ways, DRIVABLE_HIGHWAYS)

    approach_coords, approach_edges = graph_route(approach_graph, approach_positions, START, gate)
    return_coords, return_edges = graph_route(road_graph, road_positions, crossing, START)

    trail_coords = [(lon, lat) for lon, lat, _ in official[: crossing_index + 1]]
    combined_2d = dedupe([*approach_coords, *trail_coords, *return_coords])

    total_m = route_length_m(combined_2d)
    if not 3_400 <= total_m <= 4_800:
        raise RuntimeError(
            f"The grounded loop measured {total_m / 1000:.2f} km, outside the 3.4–4.8 km audit window. "
            "Do not publish it as a 4 km route without manual review."
        )

    elevated = enrich_elevation(combined_2d)
    elevations = [ele for _, _, ele in elevated if ele is not None]
    ascent = 0.0
    descent = 0.0
    for a, b in zip(elevations, elevations[1:]):
        delta = b - a
        if delta > 0:
            ascent += delta
        else:
            descent += abs(delta)

    approach_m = route_length_m(approach_coords)
    trail_m = route_length_m(trail_coords)
    return_m = route_length_m(return_coords)

    report: dict[str, object] = {
        "route_name": "Øravík fell-and-road loop",
        "status": "geometry generated — requires on-the-ground conditions check before running",
        "distance_km": round(total_m / 1000, 3),
        "distance_target_delta_m": round(total_m - 4_000, 1),
        "start": {"lon": START[0], "lat": START[1], "label": "Við á 7"},
        "gate": {"lon": gate[0], "lat": gate[1], "official_gpx_distance_from_start_m": 0},
        "crossing": {
            "lon": crossing[0],
            "lat": crossing[1],
            "official_trail_distance_from_gate_m": round(cumulative_m([(lon, lat) for lon, lat, _ in official])[crossing_index], 1),
            "distance_to_osm_road_m": round(crossing_distance, 1),
            "osm_way_id": crossing_way.osm_id,
            "road_name": crossing_way.name,
            "road_ref": crossing_way.ref,
            "highway": crossing_way.highway,
        },
        "sections": {
            "accommodation_to_gate_km": round(approach_m / 1000, 3),
            "official_village_path_to_old_road_km": round(trail_m / 1000, 3),
            "old_and_new_road_return_km": round(return_m / 1000, 3),
        },
        "elevation": {
            "source": "Open-Meteo elevation API; approximate raster elevation",
            "min_m": round(min(elevations), 1) if elevations else None,
            "max_m": round(max(elevations), 1) if elevations else None,
            "ascent_m": round(ascent, 1),
            "descent_m": round(descent, 1),
        },
        "surface_and_safety": {
            "classification": "mixed-surface fell/trail loop, not a normal road run",
            "official_difficulty": "Medium for the full Øravík–Fámjin hike",
            "known_conditions": [
                "grass-covered for most of the village path",
                "wet ground is possible",
                "the area near Fámjinsklovn/Øraskarð is stony, steep and less visible",
                "do not enter Fámjinstunnilin",
            ],
            "decision_rule": "Use the separate coastal road run when visibility, wind, rain or footing make the fell section unsuitable.",
        },
        "source_urls": {
            "official_hike": "https://visitfaroeislands.com/en/whatson/hiking/hike/oravik-famjin",
            "official_gpx": OFFICIAL_GPX_URL,
            "osm_extract": OSM_PBF_URL,
            "elevation": "https://api.open-meteo.com/v1/elevation",
        },
        "approach_edges": approach_edges,
        "return_edges": return_edges,
    }

    write_geojson(elevated, report)
    write_gpx(elevated, report)
    (OUTPUT_DIR / "oravik-loop-audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Lightweight human-readable CI summary.
    summary = [
        "# Øravík loop route audit",
        "",
        f"- Distance: **{report['distance_km']} km** ({report['distance_target_delta_m']:+.1f} m from 4 km)",
        f"- Approach to gate: **{report['sections']['accommodation_to_gate_km']} km**",
        f"- Official village path segment: **{report['sections']['official_village_path_to_old_road_km']} km**",
        f"- Road return: **{report['sections']['old_and_new_road_return_km']} km**",
        f"- Approximate ascent: **{report['elevation']['ascent_m']} m**",
        f"- Crossing OSM way: **{crossing_way.name or crossing_way.ref or crossing_way.osm_id}**",
        "",
        "This is a mixed-surface fell/trail loop. It must not be presented as an ordinary all-road 4 km run.",
    ]
    (OUTPUT_DIR / "README.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print("\n".join(summary))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001 - CI needs a clear diagnostic
        print(f"ROUTE BUILD FAILED: {exc}", file=sys.stderr)
        raise
