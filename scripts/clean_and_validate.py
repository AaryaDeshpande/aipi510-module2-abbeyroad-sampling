#!/usr/bin/env python3
"""Audit archived, user-entered pedestrian crossings; no footage is downloaded or analyzed.

The generated 36-window protocol was fixed before observations. Validity-review status
is intentionally retained: a 'recorded' status does not mean a person approved visibility.
"""
from __future__ import annotations
import csv, json, hashlib, argparse
from collections import defaultdict, Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW=ROOT/'data'/'raw'
OUT=ROOT/'data'/'processed'

def read_csv(p):
    with open(p, newline='', encoding='utf-8-sig') as f: return list(csv.DictReader(f))

def main():
    OUT.mkdir(exist_ok=True,parents=True)
    proto=json.loads((RAW/'experiment_protocol.json').read_text())
    observations=proto['observations']; assert len(observations)==36, '36 windows required'
    assert len({x['id'] for x in observations})==36
    confirmation_path=ROOT/'data/review/observer_confirmation.json'
    confirmation=json.loads(confirmation_path.read_text()) if confirmation_path.exists() else {}
    accepted=set(confirmation.get('applies_to_clip_ids',[])) if confirmation.get('status')=='observer_confirmed_usable' else set()
    excluded=set(confirmation.get('excluded_clip_ids',[]))
    counts=read_csv(RAW/'pedestrian_counts.csv')
    events=read_csv(RAW/'crossing_events.csv')
    assert len(counts)==36
    assert len({r['clip_id'] for r in counts})==36
    byid={r['clip_id']:r for r in counts}
    egroup=defaultdict(list)
    for e in events:
        assert e['clip_id'] in byid
        egroup[e['clip_id']].append(e)
    seen=[]; report=[]; result=[]
    for o in observations:
        id=o['id']; r=byid[id]
        assert r['date']==o['date'] and r['start_GMT']==o['start_GMT'] and r['end_GMT']==o['end_GMT'],f'schedule mismatch {id}'
        assert r['clock_verified'].lower()=='true',f'clock not verified {id}'
        assert r['collection_status']=='recorded',f'not recorded {id}'
        a=int(o['A_start_offset_seconds']); b=[int(x) for x in o['B_start_offsets_seconds']]
        assert a in [0,60,120,180,240], f'A offset invalid {id}'
        assert len(b)==6 and all(x in [50*i+10*j for j in range(5)] for i,x in enumerate(b)), f'B offsets invalid {id}'
        active=[]
        for e in egroup[id]:
            assert e['event_id'] not in seen, f'duplicate event ID {e["event_id"]}'
            seen.append(e['event_id'])
            if e['deleted'].lower()=='true':continue
            t=float(e['effective_relative_seconds'])
            assert 0<=t<300, f'active event out of range: {id} {t}'
            active.append(t)
        computed=(len(active),sum(a<=t<a+60 for t in active),sum(any(q<=t<q+10 for q in b) for t in active))
        exported=tuple(int(r[k]) for k in ('full_count','A_count','B_count'))
        assert computed==exported, f'event mismatch {id}: {computed} vs {exported}'
        validity=(r['validity'] or '').strip().lower()
        eligible=(validity in {'valid','yes','approved','pass','true'} or id in accepted) and id not in excluded
        quality='observer_confirmed_usable' if eligible and id in accepted else ('approved' if eligible else ('excluded' if id in excluded else ('unreviewed' if not validity else validity)))
        F,A,B=exported
        rr={ 'clip_id':id,'date':r['date'],'hour':int(o['hour_cluster']),'start_GMT':r['start_GMT'],'end_GMT':r['end_GMT'],
             'full_count':F,'A_count':A,'B_count':B,'A_estimate':5*A,'B_estimate':5*B,
             'A_error_signed':5*A-F,'B_error_signed':5*B-F,'A_error_absolute':abs(5*A-F),'B_error_absolute':abs(5*B-F),
             'difference_AminusB':abs(5*A-F)-abs(5*B-F),'clock_verified':True,
             'collection_status':'recorded','review_status':quality,'confirmed_valid':eligible}
        result.append(rr)
        report.append({'clip_id':id,'active_events':len(active),'deleted_events':len(egroup[id])-len(active),
          'matches_export':True,'clock_verified':True,'review_status':quality})
    assert len(result)==36
    headers=list(result[0].keys())
    with (OUT/'analysis_dataset.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=headers);w.writeheader();w.writerows(result)
    audit={
      'source_files':{fn:hashlib.sha256((RAW/fn).read_bytes()).hexdigest() for fn in ['experiment_protocol.json','pedestrian_counts.csv','crossing_events.csv']},
      'windows':len(result),'active_events':sum(int(x['full_count']) for x in result),
      'deleted_events':sum(x['deleted_events'] for x in report),
      'recorded_complete':sum(r['collection_status']=='recorded' for r in counts),
      'manually_approved':sum(r['confirmed_valid'] for r in result),
      'unreviewed':sum(r['review_status']=='unreviewed' for r in result),
      'all_clock_verified':True,
      'all_export_counts_reconciled':True,
      'primary_inference_note':'Eligibility uses the separate observer confirmation; raw dropdowns remain unchanged. This is observer assessment during collection, not an independent recount.',
      'raw_dropdown_valid_count':sum((r['validity'] or '').strip().lower()=='valid' for r in counts),
      'observer_confirmation_source':'data/review/observer_confirmation.json',
      'by_clip':report
    }
    (OUT/'data_quality_audit.json').write_text(json.dumps(audit,indent=2)+'\n')
    print(f"PASS: {audit['windows']} windows; {audit['active_events']} active events; {audit['deleted_events']} deleted; {audit['unreviewed']} unreviewed")
    return result

if __name__=='__main__':main()
