# Analysis verification

The analysis was rerun from the preserved raw exports in an isolated Python 3.12 environment. Every full and sampled count was independently reconstructed using half-open video-time intervals.

- 36 predefined windows; each lasts 300 seconds. Each A sample lasts 60 seconds; each B sample consists of six 10-second blocks.
- Seeded selection and all interval offsets reproduce the frozen protocol exactly.
- 834 original event rows, six explicitly deleted entries and 828 active crossings.
- A sample total 159; B sample total 144. Every per-window exported count matches its active timestamps.
- Dated source mapping and continuous [0, 300] playback coverage are present for all 36 windows in the collection metadata audit.
- Original protocol, counts and event export SHA-256 hashes are unchanged.
- The separate observer confirmation retains all 36 windows. Blank raw form fields remain blank; no independent recount is claimed.
- Mean absolute errors 10.5277778 and 10.5000000; paired difference 0.0277778; t(35) 0.0125701; p 0.9900421; nominal 95% CI [−4.4583985, 4.5139540]; d_z 0.0020950.
- Wilcoxon asymptotic p 0.8935212, with zero pairs discarded and tied ranks retained. Exact paired and hourly sign-flip p-values are 1.000; these checks require symmetry assumptions.
- All 36 workbook input and calculated-count rows match the analysis CSV. The report and presentation use the same statistics.

The scripts include independent reconstruction tests and a CI workflow. The review branch must be checked and approved through the real team process. No reviews, Tanya-authored pull requests or video recording are inferred from these software checks.

The nominal 83.1% power assumes an independent paired effect of 0.5. It is a hypothetical calibration verified after collection, not a guaranteed or documented prospective power result. Variable viewing speeds, a single observer, ambiguous partial crossings, shared annotation and temporal dependence remain limitations.
