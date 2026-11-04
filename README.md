# Abbey Road pedestrian sampling experiment

Duke AIPI 510 Module Project 2 · Aarya Deshpande and Tanya Sharma · November 3, 2026

This study compares two ways to estimate a five-minute pedestrian crossing count using 60 seconds of video. The same 36 windows are evaluated by both methods, so the analysis is paired.

- **A:** one randomly selected complete 60-second block.
- **B:** six randomly selected 10-second blocks, one in each consecutive 50-second stratum.
- **Reference:** the manually labeled crossings during all 300 seconds.
- **Estimate:** sampled count × 5. **Primary outcome:** absolute estimation error.
- **Contrast:** A absolute error − B absolute error; positive values favor B.

## Results

| Measure | A | B |
|---|---:|---:|
| Mean absolute error | 10.53 | 10.50 |
| Median absolute error | 8.5 | 8.5 |
| RMSE | 12.81 | 14.46 |
| Windows with lower error | 15 | 15 |

There were six ties and 828 active reference crossings. Mean paired absolute-error difference was 0.0278 pedestrians, with nominal paired-t 95% CI [−4.4584, 4.5140], t(35) = 0.01257, p = 0.99004, and Cohen’s d_z = 0.00210. Exact paired and eight-hour sign-flip sensitivity p-values were both 1.000. These results do not identify a clear accuracy advantage or establish equivalence. Dependence and shared human annotation limit inference.

The original exports have blank validity dropdowns. After collection, the observer confirmed that the crossings were visible and all 36 windows were usable. `data/review/observer_confirmation.json` records that confirmation separately, including variable playback speeds and possible occasional missed or ambiguous crossings. **The raw exports were not changed.** This is observer assessment during collection, not an independent recount or a measured annotation-accuracy percentage.

## Report and presentation

[Public report](https://aaryadeshpande.github.io/aipi510-module2-abbeyroad-sampling/) · [Repository](https://github.com/AaryaDeshpande/aipi510-module2-abbeyroad-sampling)

- [Written report](docs/AIPI510_Module2_Statistical_Report.pdf)
- [Editable report](docs/AIPI510_Module2_Statistical_Report.docx)
- [Eight-slide presentation](slides/AIPI510_Module2_AbbeyRoad_Presentation.pptx)
- [Presentation PDF](slides/AIPI510_Module2_AbbeyRoad_Presentation.pdf)
- [Rehearsal script](slides/AIPI510_Presentation_Narration_Script.txt)

The narration proposes a two-person speaking split and targets 7 minutes 25 seconds. A finished presentation video is not included; actual duration must be timed and its accessible link added after recording.

## Reproduce the analysis

Python 3.12 was used for verification. No notebooks or video access are required.

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/reproduce_all.py
python -m unittest discover -s tests -v
```

This validates the preserved exports, reconstructs every count from the raw timestamps, applies the separate observer eligibility record, and regenerates processed data, power scenarios and statistical figures. `requirements.txt` pins the verified scientific packages. Generated caches are ignored. The analysis never rerandomizes the schedule.

`data/raw/RAW_SHA256.json` records hashes of the three original exports. Cleaning removes only six entries explicitly flagged as deleted; all 834 original event rows remain in the raw log. The cleaned analysis has 36 windows and 828 active events. `data/provenance/collection_audit.json` contains a reduced audit of dated source mapping, complete video-clock coverage and stop events; the private recovery state and local connection credentials are excluded.

## Frozen design

The 36 windows cover eight hourly strata from 08:00 to 15:59 GMT on November 3, 2026. Hourly quotas are 5, 5, 5, 5, 4, 4, 4, 4. The split archive at 09:06 led to an advance exclusion of 09:00–09:10, leaving 94 eligible slots. Some selected windows are adjacent. Selection fractions differ by hour, so these results are not a weighted full-day pedestrian estimate.

Seed: `20261103`. Protocol SHA-256: `6dee07a2710f2021d55d62e445ae15ab6ccbebdf01c085de91e140a8462e426d`.

Method A selects among five disjoint one-minute blocks. Method B selects among five disjoint ten-second blocks in each of six strata. Both include each video second with probability 0.20. All intervals include their start and exclude their end. The exact schedule and offsets were fixed before counting and were not changed based on traffic volume. The original generator is retained for provenance; do not rerun it over collected data.

## Collection code and privacy

`collection_extension/` contains the actual Firefox 1.3.3 runtime used on the collection Mac, with source hashes and installation instructions. Each manual click used actual HTML video playback time. Full, A and B were derived from one event log; no people detection, recordings or identifying pedestrian images were collected or distributed. The source footage stays on [Abbey Road’s official website](https://www.abbeyroad.com/crossing).

The local writer uses a per-install private token generated by `helper/setup.py`; its configuration is ignored by Git. Do not commit helper tokens, browser profiles, private recovery exports or footage. The rolling archive may expire, limiting a later independent recount.

## Statistical assumptions and power

The paired t-test concerns the mean difference and assumes suitably independent pairs. Shapiro–Wilk and Q–Q diagnostics assess shape, not independence. Wilcoxon uses the asymptotic method with zero differences discarded and no continuity correction. Signed-rank and sign-flip checks require symmetry/exchangeability; random interval selection does not itself justify swapping the two distinct sampling designs. Eight-hour summaries and cluster resampling are exploratory sensitivities, with few clusters and one day.

At α = 0.05 and hypothetical paired effect d_z = 0.50, 36 independent pairs give approximately 83.1% power; the 80% target rounds up to 34 pairs. This is assumption-based calibration verified after collection, not documented evidence that power determined the original sample size. Illustrative clustering scenarios reduce nominal power; no observed or post hoc power is reported. A nonsignificant result does not prove equivalence.

## Regenerate document files

The scientific analysis above is the portable reproduction path. To rebuild the report and narration, install `requirements-documents.txt` and run `scripts/build_report.py` and `scripts/build_narration.py`; PDF rendering additionally needs LibreOffice. The presentation and workbook edit scripts use the Artifact Tool JavaScript runtime, available in the authoring environment, with preserved source templates under `reproducibility/`. Final editable Office files are supplied for use without that runtime. To rebuild the slide 2 evidence, run `python scripts/build_slide2_evidence.py` before the presentation builder. Its timelines use the actual recording 13 event log; the eight AI raster assets under `slides/assets/ai/` are labeled illustrations, with their prompts and hashes included. Original supplied builders are retained in that directory as historical source.

## Collaboration

Each student must make a genuine contribution through a branch and pull request, with review by the other student. A prepared review branch or repository access alone does not establish that this requirement has been met. Do not record an approval or contribution until it actually occurs. See `TEAM_ACTIONS.md` for the remaining recording and collaboration steps.

## References

Abbey Road Studios, [Crossing Cam](https://www.abbeyroad.com/crossing); Cohen (1988), *Statistical Power Analysis for the Behavioral Sciences*; [SciPy statistics](https://docs.scipy.org/doc/scipy/reference/stats.html), including [paired permutations](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.permutation_test.html); statsmodels [TTestPower](https://www.statsmodels.org/stable/generated/statsmodels.stats.power.TTestPower.html). Full references and assumptions appear in the report.
