
#!/usr/bin/env python3
"""Pre-observation protocol for Duke AIPI 510 Abbey Road sampling-method study.
Python 3 standard-library only. Run before collecting counts. Source: official Abbey Road Crossing Cam.
Never change schedule as a function of observed pedestrian counts.
"""
import csv, random, json, hashlib
from pathlib import Path
from datetime import datetime, timedelta
SEED=20261103
DATE="2026-11-03"
TZ="Europe/London"  # GMT (UTC+0) on Nov 3, 2026
# Equal allocation across 08:00..15:59: 20 in first 4 hours, 16 in last 4.
HOUR_QUOTAS={8:5,9:5,10:5,11:5,12:4,13:4,14:4,15:4}
RNG=random.Random(SEED)
BASE=datetime(2026,11,3)
def iso(t): return t.strftime("%H:%M:%S")
rows=[]
for hour, quota in HOUR_QUOTAS.items():
    # Every candidate is a 5-min aligned slot. 9 AM has a split archive,
    # so use only 09:10 onward via the 9:06 AM button.
    candidate_bins=list(range(2 if hour==9 else 0,12))
    selected=sorted(RNG.sample(candidate_bins,quota))
    for slot in selected:
        start=BASE+timedelta(hours=hour,minutes=5*slot)
        end=start+timedelta(minutes=5)
        # A randomly selects one of five disjoint 60-second blocks:
        # each second has exactly 1/5 inclusion probability.
        a_idx=RNG.randrange(5)
        aoff=60*a_idx
        # B selects one 10-second block uniformly within each 50-second stratum:
        # each second has exactly 1/5 inclusion probability.
        b_offsets=[50*k + 10*RNG.randrange(5) for k in range(6)]
        rows.append({
         "clip_id":f"{len(rows)+1:02d}",
         "date_london":DATE,
         "archive_button":("9:06 AM" if hour==9 else (f"{hour if hour<=12 else hour-12}:00 {'AM' if hour<12 else 'PM'}")),
         "full_start_GMT":iso(start),"full_end_GMT":iso(end),
         "A_interval_GMT":f"{iso(start+timedelta(seconds=aoff))}–{iso(start+timedelta(seconds=aoff+60))}",
         "B_intervals_GMT":" | ".join(f"{iso(start+timedelta(seconds=b))}–{iso(start+timedelta(seconds=b+10))}" for b in b_offsets),
         "A_offset_seconds":aoff,
         "B_offsets_seconds":";".join(str(b) for b in b_offsets),
         "hour_cluster":hour,
         "full_count":"","A_count":"","B_count":"","notes":"",
        })
fieldnames=list(rows[0])
path=Path(__file__).resolve().parent
csv_path=path/"Abbey_Road_USE_THIS_Counting_Schedule.csv"
# Safety: never erase actual counts if this generator is run after observation.
if csv_path.exists():
    with open(csv_path, newline="", encoding="utf-8") as existing:
        for prior in csv.DictReader(existing):
            if any(str(prior.get(col, "")).strip() for col in ("full_count","A_count","B_count","notes")):
                raise SystemExit("REFUSING TO OVERWRITE COUNTED OBSERVATIONS. Use a new output directory.")
with open(csv_path,"w",newline="",encoding="utf-8") as f:
    writer=csv.DictWriter(f,fieldnames); writer.writeheader(); writer.writerows(rows)
guide=path/"Abbey_Road_USE_THIS_Counting_Guide.txt"
with open(guide,"w",encoding="utf-8") as f:
 f.write("AIPI 510: FINAL BEFORE OBSERVATIONS | London GMT, November 3, 2026\n")
 f.write("RESEARCH: Compare errors of one randomly selected 60-sec contiguous sample (A) versus six randomly selected 10-sec intervals, one per 50-sec stratum (B), for estimating five-minute pedestrian zebra crossings.\n")
 f.write("COUNT: Only people actually crossing nearer Abbey Road zebra crossing, at the midpoint of the road. Count people, not groups; both directions; do not count sidewalk traffic, cars, distant crossing. Each crossing counts once; crossings right on interval boundaries belong to the interval starting there, not the ending one.\n")
 f.write("FOR EACH CLIP: Watch full 5 min -> count all crossing events (full_count). Watch A 1-min interval -> A_count. Watch six 10-sec B intervals -> add B_count. Enter 0 if none. If archive missing/corrupt/date uncertain, mark invalid (notes), no substitution based on crowd size. Video archive labels and playback media times must be verified.\n")
 f.write("Source: https://www.abbeyroad.com/crossing (archive, not downloadable without permission). No identifying footage published. Nov 3, 2026 is GMT (UTC+0).\n")
 f.write("Randomization: Python random.Random(20261103). First choose 5-minute aligned slots from each prespecified hourly stratum using uniform sampling without replacement. 09:00–09:10 is excluded due to split archive; see code. 5,5,5,5,4,4,4,4 windows per hour. Then select one of five 1-min slots uniformly for A and one of five 10-sec slots in each 50-sec stratum for B. All windows >=5 min nonoverlap. Both methods include each second with probability 20 percent. Full window = population truth for each clip.\n")
 f.write("LIMITATIONS: This experiment randomizes measurement protocols, not pedestrian traffic. A single location/day; adjacent windows may correlate and lower effective sample size. 36-window theoretical t-test power ~83% only for independent paired standardized effect 0.5; no evidence that that effect obtains. Course acceptance must be confirmed with instructor.\n\n")
 for row in rows:
  f.write(f"CLIP {row['clip_id']} | Click archive {row['archive_button']} | FULL {row['full_start_GMT']}–{row['full_end_GMT']}\n")
  f.write(f"    A  {row['A_interval_GMT']}\n")
  f.write(f"    B  {row['B_intervals_GMT']}\n")
  f.write("    DICTATE: Clip __, full __, A __, B __.\n")
manifest=path/"Abbey_Road_FINAL_Protocol_Manifest.json"
manifest.write_text(json.dumps({
 "dataset_id":"abbey-road-2026-11-03-36win-preobs",
 "random_seed":SEED,
 "rng":"Python random.Random() Mersenne Twister",
 "code":"generate_abbey_road_protocol.py",
 "candidate_5min_slots":{str(hour):[5*i for i in range(2 if hour==9 else 0,12)] for hour in HOUR_QUOTAS},
 "hour_quotas":HOUR_QUOTAS,
 "selected_windows":len(rows),
 "source":"https://www.abbeyroad.com/crossing",
 "outcomes":"full count, method A count, method B count; corresponding abs errors",
 "schedule_sha256":hashlib.sha256(csv_path.read_bytes()).hexdigest(),
 "note":"No counts collected by this script; ensure source video availability and date before using any listed window."
},indent=2)+"\n")
print("Created",len(rows),"five-minute windows with RNG",SEED)
print("csv",csv_path,"guide",guide,"manifest",manifest)
