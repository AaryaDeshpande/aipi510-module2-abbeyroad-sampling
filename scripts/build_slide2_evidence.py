#!/usr/bin/env python3
"""Reconstruct slide 2's example from preserved event timestamps and protocol."""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
raw = ROOT / "data/raw"
protocol = json.loads((raw / "experiment_protocol.json").read_text())
observation = next(o for o in protocol["observations"] if o["id"] == "13")
with (raw / "crossing_events.csv").open(newline="", encoding="utf-8-sig") as f:
    events = [e for e in csv.DictReader(f)
              if e["clip_id"] == "13" and e["deleted"] != "true"]
times = sorted(float(e["effective_relative_seconds"]) for e in events)
assert all(0 <= t < 300 for t in times)
a = observation["A_start_offset_seconds"]
intervals_a = [[a, a + 60]]
intervals_b = [[b, b + 10] for b in observation["B_start_offsets_seconds"]]
def count(intervals):
    return sum(any(start <= t < end for start, end in intervals) for t in times)
full, count_a, count_b = len(times), count(intervals_a), count(intervals_b)
with (raw / "pedestrian_counts.csv").open(newline="", encoding="utf-8-sig") as f:
    row = next(r for r in csv.DictReader(f) if r["clip_id"] == "13")
assert (full, count_a, count_b) == tuple(int(row[k]) for k in ("full_count", "A_count", "B_count"))
assert (full, count_a, count_b) == (43, 7, 19)
result = {
    "clip_id": "13",
    "date": observation["date"],
    "start_GMT": observation["start_GMT"],
    "end_GMT": observation["end_GMT"],
    "duration_seconds": 300,
    "full_count": full,
    "A_count": count_a,
    "B_count": count_b,
    "A_estimate": 5 * count_a,
    "B_estimate": 5 * count_b,
    "A_absolute_error": abs(5 * count_a - full),
    "B_absolute_error": abs(5 * count_b - full),
    "A_intervals": intervals_a,
    "B_intervals": intervals_b,
    "ten_second_counts": [sum(k * 10 <= t < (k + 1) * 10 for t in times) for k in range(30)],
    "relative_event_seconds": times,
    "source_sha256": {name: hashlib.sha256((raw / name).read_bytes()).hexdigest()
                      for name in ("experiment_protocol.json", "crossing_events.csv", "pedestrian_counts.csv")},
}
assert sum(result["ten_second_counts"]) == full
out = ROOT / "slides/assets/slide02_actual_timeline.json"
out.write_text(json.dumps(result, indent=2) + "\n")
print(f"Slide 2: full {full}, A {count_a} × 5 = {5*count_a}, B {count_b} × 5 = {5*count_b}")
