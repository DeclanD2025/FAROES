#!/usr/bin/env python3
"""Generate the validated near-4 km Øravík true loop and publish app assets."""
from __future__ import annotations
import json, shutil, sys, xml.etree.ElementTree as ET
import networkx as nx
import build_oravik_loop as base
from build_oravik_loop_v2 import candidate_crossings, road_names
TARGET_M=4000.0
ACCOMMODATION=base.START

def main():
    out=base.OUTPUT_DIR; out.mkdir(parents=True,exist_ok=True)
    official_path=out/'source-official-oravik-famjin.gpx'; pbf_path=out/'source-faroe-islands.osm.pbf'
    base.download(base.OFFICIAL_GPX_URL,official_path); base.download(base.OSM_PBF_URL,pbf_path)
    official=base.load_official_gpx(official_path); ways=base.load_osm_ways(pbf_path)
    trail=[(lon,lat) for lon,lat,_ in official]; gate=trail[0]
    walk_m=base.haversine_m(ACCOMMODATION,gate)
    if walk_m>1000: raise RuntimeError('Official path entrance is outside the requested 1 km radius')
    graph,positions=base.build_graph(ways,base.DRIVABLE_HIGHWAYS)
    evaluated=[]
    for index,trail_m,crossing,proximity_m,way in candidate_crossings(official,ways):
        try: return_coords,return_edges=base.graph_route(graph,positions,crossing,gate)
        except (nx.NetworkXNoPath,RuntimeError): continue
        combined=base.dedupe([*trail[:index+1],*return_coords]); total_m=base.route_length_m(combined)
        evaluated.append({'trail_distance_m':trail_m,'crossing':crossing,'proximity_m':proximity_m,'way':way,'return_coords':return_coords,'return_edges':return_edges,'combined':combined,'total_m':total_m})
    if not evaluated: raise RuntimeError('No tunnel-free road return was available')
    chosen=min(evaluated,key=lambda x:abs(x['total_m']-TARGET_M)); total_m=chosen['total_m']
    if not 3850<=total_m<=4250: raise RuntimeError(f'Closest grounded loop is {total_m/1000:.3f} km')
    elevated=base.enrich_elevation(chosen['combined']); elevations=[e for _,_,e in elevated if e is not None]
    ascent=descent=0.0
    for a,b in zip(elevations,elevations[1:]):
        d=b-a; ascent+=max(d,0); descent+=max(-d,0)
    way=chosen['way']; crossing=chosen['crossing']
    report={'route_name':'Øravík village-path and old-road loop','status':'validated geometry; check weather, visibility and footing before use','distance_km':round(total_m/1000,3),'distance_target_delta_m':round(total_m-TARGET_M,1),'start':{'lon':gate[0],'lat':gate[1],'label':'Bønhúsið / official village-path entrance','distance_from_vid_a_7_m':round(walk_m,1)},'accommodation':{'lon':ACCOMMODATION[0],'lat':ACCOMMODATION[1],'label':'Við á 7'},'crossing':{'lon':crossing[0],'lat':crossing[1],'official_trail_distance_from_start_m':round(chosen['trail_distance_m'],1),'distance_to_osm_road_m':round(chosen['proximity_m'],1),'osm_way_id':way.osm_id,'road_name':way.name,'road_ref':way.ref,'highway':way.highway},'sections':{'official_path_km':round(chosen['trail_distance_m']/1000,3),'tunnel_free_road_return_km':round(base.route_length_m(chosen['return_coords'])/1000,3),'walk_from_accommodation_to_start_km':round(walk_m/1000,3)},'road_sequence':road_names(chosen['return_edges']),'elevation':{'source':'Open-Meteo approximate raster elevation','min_m':round(min(elevations),1),'max_m':round(max(elevations),1),'ascent_m':round(ascent,1),'descent_m':round(descent,1)},'brief_compliance':{'requested_distance_km':4.0,'actual_distance_km':round(total_m/1000,3),'start_and_finish_within_1km_of_address':True,'distance_from_address_to_start_m':round(walk_m,1),'route_is_a_true_loop':True,'route_uses_a_road_tunnel':False},'surface_and_safety':{'classification':'mixed-surface fell/trail loop, not a normal road run','known_conditions':['grass-covered village path with wet ground possible','stony, steep and less visible ground near Fámjinsklovn/Øraskarð','live roads on the return section','Fámjinstunnilin and Hovstunnilin are excluded'],'decision_rule':'Use the coastal road alternative when visibility, wind, rain or footing make the fell section unsuitable.'},'source_urls':{'official_hike':'https://visitfaroeislands.com/en/whatson/hiking/hike/oravik-famjin','official_gpx':base.OFFICIAL_GPX_URL,'osm_extract':base.OSM_PBF_URL,'elevation':'https://api.open-meteo.com/v1/elevation'}}
    base.write_geojson(elevated,report); base.write_gpx(elevated,report)
    audit=out/'oravik-loop-audit.json'; audit.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    gpx_path=out/'oravik-fell-road-loop.gpx'; tree=ET.parse(gpx_path); root=tree.getroot(); ns={'g':'http://www.topografix.com/GPX/1/1'}
    for name in root.findall('g:wpt/g:name',ns):
        if name.text and 'Start / Finish' in name.text: name.text='Bønhúsið — Start / Finish (112 m from Við á 7)'
    trk_name=root.find('g:trk/g:name',ns)
    if trk_name is not None: trk_name.text=report['route_name']
    tree.write(gpx_path,encoding='utf-8',xml_declaration=True)
    public_routes=base.ROOT/'public'/'routes'; public_routes.mkdir(parents=True,exist_ok=True)
    shutil.copy2(gpx_path,public_routes/'oravik-4km-scenic-run.gpx')
    shutil.copy2(audit,public_routes/'oravik-loop-audit.json')
    summary=f"# Øravík loop route audit\n\n- Distance: **{report['distance_km']} km**\n- Start: **Bønhúsið**, {walk_m:.0f} m from Við á 7\n- Trail: **{report['sections']['official_path_km']} km**\n- Tunnel-free road return: **{report['sections']['tunnel_free_road_return_km']} km**\n- Approximate ascent: **{report['elevation']['ascent_m']} m**\n- True loop; no tunnel.\n\nMixed-surface fell/trail route, not an ordinary road run.\n"
    (out/'README.md').write_text(summary,encoding='utf-8'); print(summary)
if __name__=='__main__':
    try: main()
    except Exception as exc: print(f'ROUTE BUILD FAILED: {exc}',file=sys.stderr); raise
