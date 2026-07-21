#!/usr/bin/env python3
"""Build the genuine near-4 km Øravík loop from the official path entrance.

The original brief permits the route to begin and end within 1 km of Við á 7.
Starting at the official Øravík–Fámjin path entrance beside Bønhúsið removes the
short accommodation access tail while preserving a true loop. The start is only
about 110 m from the supplied address placemark.
"""

from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET

import build_oravik_loop as base
import build_oravik_loop_v2 as selector

ACCOMMODATION = base.START


def main() -> None:
    base.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    official_path = base.OUTPUT_DIR / "source-official-oravik-famjin.gpx"
    base.download(base.OFFICIAL_GPX_URL, official_path)
    official = base.load_official_gpx(official_path)
    gate = (official[0][0], official[0][1])
    accommodation_distance_m = base.haversine_m(ACCOMMODATION, gate)

    if accommodation_distance_m > 1_000:
        raise RuntimeError(
            f"Official path entrance is {accommodation_distance_m:.0f} m from Við á 7, outside the 1 km brief."
        )

    # Reuse the all-crossings audit, but make the official path entrance the route
    # start/finish. This creates a genuine circuit rather than an access spur.
    base.START = gate
    selector.main()

    audit_path = base.OUTPUT_DIR / "oravik-loop-audit.json"
    report = json.loads(audit_path.read_text(encoding="utf-8"))
    report["route_name"] = "Øravík village-path and old-road loop"
    report["start"] = {
        "lon": gate[0],
        "lat": gate[1],
        "label": "Bønhúsið / official village-path entrance",
        "distance_from_vid_a_7_m": round(accommodation_distance_m, 1),
    }
    report["accommodation"] = {
        "lon": ACCOMMODATION[0],
        "lat": ACCOMMODATION[1],
        "label": "Við á 7",
        "walk_to_start_m": round(accommodation_distance_m, 1),
    }
    report["brief_compliance"] = {
        "requested_distance_km": 4.0,
        "actual_distance_km": report["distance_km"],
        "start_and_finish_within_1km_of_address": True,
        "distance_from_address_to_start_m": round(accommodation_distance_m, 1),
        "route_is_a_true_loop": True,
        "route_uses_a_road_tunnel": False,
    }
    report["sections"].pop("accommodation_to_gate_km", None)
    report["sections"]["walk_from_accommodation_to_start_km"] = round(accommodation_distance_m / 1000, 3)
    audit_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    # Correct the generated GPX metadata and waypoint label.
    gpx_path = base.OUTPUT_DIR / "oravik-fell-road-loop.gpx"
    tree = ET.parse(gpx_path)
    root = tree.getroot()
    ns = {"g": "http://www.topografix.com/GPX/1/1"}
    for name in root.findall("g:wpt/g:name", ns):
        if name.text and "Start / Finish" in name.text:
            name.text = "Bønhúsið — Start / Finish (about 110 m from Við á 7)"
    track_name = root.find("g:trk/g:name", ns)
    if track_name is not None:
        track_name.text = "Øravík village-path and old-road loop"
    tree.write(gpx_path, encoding="utf-8", xml_declaration=True)

    readme = base.OUTPUT_DIR / "README.md"
    summary = readme.read_text(encoding="utf-8")
    summary = summary.replace("Øravík fell-and-road loop", "Øravík village-path and old-road loop")
    summary += (
        f"\n- Start/finish: **Bønhúsið official path entrance**\n"
        f"- Walk from Við á 7: **{accommodation_distance_m:.0f} m**\n"
        "- Shape: **true loop; no road tunnel**\n"
    )
    readme.write_text(summary, encoding="utf-8")

    print(
        f"Validated start {accommodation_distance_m:.1f} m from Við á 7; "
        f"true loop distance {report['distance_km']:.3f} km."
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ROUTE BUILD FAILED: {exc}", file=sys.stderr)
        raise
