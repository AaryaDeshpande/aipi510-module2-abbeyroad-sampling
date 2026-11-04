#!/usr/bin/env python3
"""Assumption-based sample-size calibration. Timing of this calculation is not established as prospective."""
import json
from pathlib import Path
from statsmodels.stats.power import TTestPower
ROOT=Path(__file__).resolve().parents[1]
calc=TTestPower()
result={'design':'two-sided one-sample t test of paired within-window absolute-error differences',
 'alpha':0.05,'assumed_standardized_paired_effect_dz':0.5,'planned_number_of_windows':36,
 'nominal_power_independent_windows':calc.power(effect_size=.5,nobs=36,alpha=.05,alternative='two-sided'),
 'minimum_pairs_for_80pct_under_assumptions':calc.solve_power(effect_size=.5,alpha=.05,power=.8,alternative='two-sided'),
 'provenance':'The 36-window schedule was fixed before counting. No evidence supplied that this power calculation determined the sample size before collection; this is a planning scenario, not a documented prospective justification.',
 'cluster_scenarios':[{'intraclass_correlation':rho,'approx_design_effect':1+(36/8-1)*rho,'approx_effective_pairs':36/(1+(36/8-1)*rho),'nominal_t_power_at_effective_pairs':calc.power(effect_size=.5,nobs=36/(1+(36/8-1)*rho),alpha=.05,alternative='two-sided')} for rho in [0,.1,.3,.5]],
 'warning':'Purely theoretical. True effect unknown. 36 windows clustered in eight hourly strata on one day, so independence may fail and realized effective power may be lower. Do not claim equivalence based on a nonsignificant result.'}
(ROOT/'data'/'processed'/'power_analysis.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
