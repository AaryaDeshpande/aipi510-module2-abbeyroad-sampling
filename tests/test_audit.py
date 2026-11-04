"""Independent checks of preserved exports, protocol randomization, and analysis."""
import csv,json,hashlib,random,unittest,math
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
def csvrows(path):
 with path.open(newline='',encoding='utf-8-sig') as f:return list(csv.DictReader(f))
class AuditTests(unittest.TestCase):
 def test_raw_files_unchanged(self):
  manifest=json.loads((ROOT/'data/raw/RAW_SHA256.json').read_text())
  for name,h in manifest.items():self.assertEqual(hashlib.sha256((ROOT/'data/raw'/name).read_bytes()).hexdigest(),h,name)
 def test_randomized_protocol_reconstruction(self):
  protocol=json.loads((ROOT/'data/raw/experiment_protocol.json').read_text());rng=random.Random(20261103);i=0
  for hour,quota in [(8,5),(9,5),(10,5),(11,5),(12,4),(13,4),(14,4),(15,4)]:
   for slot in sorted(rng.sample(list(range(2 if hour==9 else 0,12)),quota)):
    o=protocol['observations'][i];self.assertEqual(o['start_GMT'],f'{hour:02d}:{5*slot:02d}:00');self.assertEqual(o['A_start_offset_seconds'],60*rng.randrange(5));self.assertEqual(o['B_start_offsets_seconds'],[50*k+10*rng.randrange(5) for k in range(6)]);i+=1
  self.assertEqual(i,36)
 def test_event_reconstruction_and_formulas(self):
  protocol=json.loads((ROOT/'data/raw/experiment_protocol.json').read_text());events=csvrows(ROOT/'data/raw/crossing_events.csv');counts={r['clip_id']:r for r in csvrows(ROOT/'data/raw/pedestrian_counts.csv')};deltas=[]
  self.assertEqual(len({e['event_id'] for e in events}),834);self.assertEqual(sum(e['deleted']=='true' for e in events),6)
  for o in protocol['observations']:
   times=[float(e['effective_relative_seconds']) for e in events if e['clip_id']==o['id'] and e['deleted']!='true'];a=o['A_start_offset_seconds'];bs=o['B_start_offsets_seconds'];actual=(len(times),sum(a<=t<a+60 for t in times),sum(any(b<=t<b+10 for b in bs) for t in times));r=counts[o['id']]
   self.assertTrue(all(0<=t<300 for t in times));self.assertEqual(actual,tuple(int(r[k]) for k in ['full_count','A_count','B_count']));f,a,b=actual;deltas.append(abs(5*a-f)-abs(5*b-f))
  summary=json.loads((ROOT/'data/processed/analysis_summary.json').read_text());mean=sum(deltas)/36;var=sum((v-mean)**2 for v in deltas)/35
  self.assertAlmostEqual(summary['mean_difference_AminusB'],mean,12);self.assertAlmostEqual(summary['paired_t'],mean/math.sqrt(var/36),12);self.assertAlmostEqual(summary['paired_cohens_dz'],mean/math.sqrt(var),12);self.assertEqual(summary['paired_signflip_p'],1.0)
 def test_observer_confirmation_preserves_raw_flags(self):
  confirmation=json.loads((ROOT/'data/review/observer_confirmation.json').read_text());self.assertFalse(confirmation['independent_recount']);self.assertEqual(confirmation['excluded_clip_ids'],[])
  rows=csvrows(ROOT/'data/raw/pedestrian_counts.csv');self.assertTrue(all(not r['validity'] for r in rows))
  clean=csvrows(ROOT/'data/processed/analysis_dataset.csv');self.assertTrue(all(r['confirmed_valid']=='True' for r in clean));self.assertEqual(len(clean),36)
 def test_source_coverage_and_collection_code(self):
  audit=json.loads((ROOT/'data/provenance/collection_audit.json').read_text())
  for r in audit['clips']:
   self.assertTrue(r['clock_verified']);self.assertEqual(r['coverage'],[[0,300]]);self.assertEqual(r['source']['date'],'2026-11-03');self.assertEqual(r['source']['mediaEnd']-r['source']['mediaStart'],300)
  self.assertEqual((ROOT/'collection_extension/protocol.json').read_bytes(),(ROOT/'data/raw/experiment_protocol.json').read_bytes())
if __name__=='__main__':unittest.main()
