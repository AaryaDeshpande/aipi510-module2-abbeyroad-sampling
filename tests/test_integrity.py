#!/usr/bin/env python3
"""Unit tests for the archived protocol and derived counts."""
import csv,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class TestObservations(unittest.TestCase):
 def test_recording_and_sampling_durations(self):
  obs=json.loads((ROOT/'data/raw/experiment_protocol.json').read_text())['observations']
  self.assertEqual(len(obs),36)
  for o in obs:
   self.assertIn(o['A_start_offset_seconds'],[0,60,120,180,240])
   self.assertEqual(len(o['B_start_offsets_seconds']),6)
   for i,off in enumerate(o['B_start_offsets_seconds']):self.assertIn(off,[50*i+10*j for j in range(5)])
 def test_processed_counts(self):
  with (ROOT/'data/processed/analysis_dataset.csv').open() as f:rows=list(csv.DictReader(f))
  self.assertEqual(len(rows),36)
  self.assertEqual(sum(int(r['full_count']) for r in rows),828)
  self.assertEqual(sum(int(r['A_count']) for r in rows),159)
  self.assertEqual(sum(int(r['B_count']) for r in rows),144)
  for r in rows:
   f=int(r['full_count']);a=int(r['A_count']);b=int(r['B_count'])
   self.assertEqual(int(r['A_error_absolute']),abs(5*a-f))
   self.assertEqual(int(r['B_error_absolute']),abs(5*b-f))
if __name__=='__main__':unittest.main()
