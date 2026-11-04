#!/usr/bin/env python3
"""Reproducible analysis: balanced five-minute paired A/B sampling-method experiment.
Run after clean_and_validate.py and power_analysis.py. Inputs are observed event counts.
"""
from __future__ import annotations
import csv,json, math, os
from pathlib import Path
os.environ.setdefault("MPLCONFIGDIR",str(Path(__file__).resolve().parents[1]/".cache/matplotlib"))
from collections import defaultdict
import numpy as np
from scipy import stats
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parents[1]
PROC=ROOT/'data'/'processed'
FIG=ROOT/'figures'

def read_rows():
    with (PROC/'analysis_dataset.csv').open(newline='',encoding='utf-8') as f:return list(csv.DictReader(f))

def main():
    FIG.mkdir(parents=True,exist_ok=True)
    all_rows=read_rows(); rows=[r for r in all_rows if r['confirmed_valid'].lower()=='true']; n=len(rows)
    if n<3: raise ValueError('At least three observer-confirmed windows are required; review eligibility before inference.')
    f=np.array([int(x['full_count']) for x in rows]); a=np.array([int(x['A_count']) for x in rows]); b=np.array([int(x['B_count']) for x in rows]);
    ea=5*a-f;eb=5*b-f;aa=np.abs(ea); bb=np.abs(eb); delta=aa-bb
    t=stats.ttest_rel(aa,bb)
    sem=stats.sem(delta)
    lo,hi=stats.t.interval(.95,df=n-1,loc=delta.mean(),scale=sem)
    shap=stats.shapiro(delta)
    wil=stats.wilcoxon(delta,zero_method='wilcox',alternative='two-sided',method='asymptotic',correction=False)
    # Exact paired sign-flip distribution for integer differences (dynamic programming).
    # A model-based sensitivity check requiring sign symmetry, not design-based randomization.
    distribution={0:1}
    for d in delta:
        updated=defaultdict(int)
        for value,count in distribution.items():
            updated[value+int(d)]+=count; updated[value-int(d)]+=count
        distribution=dict(updated)
    paired_signflip=sum(c for value,c in distribution.items() if abs(value)>=abs(int(delta.sum())))/2**n
    hours=sorted({int(r['hour']) for r in rows});group={h:np.array([d for r,d in zip(rows,delta) if int(r['hour'])==h]) for h in hours}
    hour_means=np.array([v.mean() for v in group.values()]); hour_test=stats.ttest_1samp(hour_means,0)
    hour_ci=stats.t.interval(.95,len(hours)-1,loc=hour_means.mean(),scale=stats.sem(hour_means))
    # 8-hour sign-flip sensitivity: all 2^8 clustered sign assignments, two-sided.
    import itertools
    ob=abs(sum(sum(v) for v in group.values()))
    flip=[abs(sum(s*sum(v) for s,v in zip(signs,group.values()))) for signs in itertools.product([-1,1],repeat=len(group))]
    cluster_perm=sum(x>=ob-1e-9 for x in flip)/len(flip)
    rng=np.random.default_rng(20261103)
    # Resample independent hour clusters and retain each cluster's within-hour observations.
    boot=[]
    for _ in range(15000):
        sample=rng.choice(hours,size=len(hours),replace=True)
        pooled=np.concatenate([group[h] for h in sample])
        boot.append(pooled.mean())
    c_lo,c_hi=np.quantile(boot,[.025,.975])
    # Equal-hour weighting is distinct from 36-window weighting because quotas differ.
    equalhour=float(np.mean(hour_means))
    out={'sample_status':f'{n} observer-confirmed usable and clock-verified windows; raw validity dropdowns preserved blank',
         'n_recorded':len(all_rows),'n_analyzed':n,'n_confirmed_valid':sum(r['confirmed_valid'].lower()=='true' for r in rows),
         'n_hour_clusters':len(hours),'total_crossings':int(f.sum()), 'full_mean':float(f.mean()), 'full_sd':float(f.std(ddof=1)),
         'A_sample_count':int(a.sum()),'B_sample_count':int(b.sum()),
         'A_mean_abs_error':float(aa.mean()),'B_mean_abs_error':float(bb.mean()),
         'A_sd_abs_error':float(aa.std(ddof=1)),'B_sd_abs_error':float(bb.std(ddof=1)),
         'A_median_abs_error':float(np.median(aa)),'B_median_abs_error':float(np.median(bb)),
         'A_RMSE':float(np.sqrt(np.mean(ea**2))),'B_RMSE':float(np.sqrt(np.mean(eb**2))),
         'A_signed_bias_mean':float(ea.mean()),'B_signed_bias_mean':float(eb.mean()),
         'mean_difference_AminusB':float(delta.mean()),'sd_difference':float(delta.std(ddof=1)),
         'paired_t':float(t.statistic),'paired_df':n-1,'paired_t_p':float(t.pvalue),
         'paired_t_ci_95':[float(lo),float(hi)],'paired_cohens_dz':float(delta.mean()/delta.std(ddof=1)),
         'A_better_windows':int(np.sum(aa<bb)),'B_better_windows':int(np.sum(aa>bb)),'ties':int(np.sum(aa==bb)),
         'shapiro_wilk_w':float(shap.statistic),'shapiro_wilk_p':float(shap.pvalue),
         'wilcoxon_w':float(wil.statistic),'wilcoxon_p':float(wil.pvalue),'wilcoxon_method':'asymptotic, zero_method=wilcox, no continuity correction; symmetry assumption',
         'paired_signflip_p':float(paired_signflip),'paired_signflip_method':'exact dynamic programming over all 2^n sign assignments; symmetry assumption',
         'hour_means_AminusB':{str(h):float(group[h].mean()) for h in hours},
         'equal_hour_weighted_delta':equalhour, 'hour_level_t_p':float(hour_test.pvalue),
         'hour_level_t_ci_95':[float(x) for x in hour_ci],
         'cluster_signflip_p':float(cluster_perm),'hour_cluster_bootstrap_ci_95':[float(c_lo),float(c_hi)],
         'analysis_note':'No equivalence claim. Single camera/day; nearby windows may be dependent. Observer-confirmed eligibility does not independently validate human counts. Sign-flip checks require symmetry; clustering sensitivities with only eight hourly strata are exploratory.'}
    (PROC/'analysis_summary.json').write_text(json.dumps(out,indent=2)+'\n')
    # Consistent, restrained styling; no decorative effects.
    NAVY='#173047';BLUE='#2B75B5';TEAL='#4B9A91';GRAY='#627487';LIGHT='#EEF3F6'
    plt.rcParams.update({'font.size':11,'axes.edgecolor':'#D8E2E8','axes.labelcolor':NAVY,'text.color':NAVY,'axes.spines.top':False,'axes.spines.right':False,'figure.facecolor':'white','axes.facecolor':'white'})
    fig,ax=plt.subplots(figsize=(7,4)); vals=[aa.mean(),bb.mean()];bar=ax.bar(['A: continuous 60 s','B: six spaced 10 s'],vals,color=[BLUE,TEAL],width=.55)
    ax.set_ylabel('Mean absolute error (pedestrians per 5 min)');ax.set_ylim(0,max(vals)*1.30)
    for b_,v in zip(bar,vals):ax.text(b_.get_x()+b_.get_width()/2,v+.22,f'{v:.2f}',ha='center',fontweight='bold',fontsize=13)
    ax.set_title('Average absolute errors were almost identical',loc='left',fontweight='bold');fig.tight_layout();fig.savefig(FIG/'01_mean_absolute_error.png',dpi=210);plt.close(fig)
    fig,ax=plt.subplots(figsize=(8.4,4.3));x=np.arange(1,n+1);ax.plot(x,aa,'o-',markersize=4,lw=1.2,color=BLUE,label='A: continuous 60 s');ax.plot(x,bb,'o-',markersize=4,lw=1.2,color=TEAL,label='B: spaced 10 s')
    ax.set_xlabel('Recorded five-minute window');ax.set_ylabel('Absolute error (pedestrians)');ax.set_title('Which method was closer varies across the 36 windows',loc='left',fontweight='bold');ax.legend(frameon=False,ncol=2,loc='upper right');fig.tight_layout();fig.savefig(FIG/'02_error_by_window.png',dpi=210);plt.close(fig)
    fig,ax=plt.subplots(figsize=(6.5,4.1));ax.scatter(aa,bb,color=BLUE,alpha=.8,s=54);M=max(max(aa),max(bb))+3;ax.plot([0,M],[0,M],linestyle='--',color=GRAY,lw=1);ax.set_xlabel('Method A absolute error');ax.set_ylabel('Method B absolute error');ax.set_title(f'{np.sum(aa<bb)} A wins · {np.sum(aa>bb)} B wins · {np.sum(aa==bb)} ties',loc='left',fontweight='bold');fig.tight_layout();fig.savefig(FIG/'03_paired_error_scatter.png',dpi=210);plt.close(fig)
    fig,ax=plt.subplots(figsize=(7,4));ax.bar([f'{h}:00' for h in hours],hour_means,color=[TEAL if v>=0 else BLUE for v in hour_means]);ax.axhline(0,color=GRAY,lw=1);ax.set_ylabel('Mean (A error − B error)');ax.set_title('Within-hour differences change direction',loc='left',fontweight='bold');fig.tight_layout();fig.savefig(FIG/'04_hour_cluster_differences.png',dpi=210);plt.close(fig)
    fig,ax=plt.subplots(figsize=(7,3.6));ax.errorbar(delta.mean(),0,xerr=[[delta.mean()-lo],[hi-delta.mean()]],fmt='o',capsize=6,color=BLUE,markersize=9,lw=2);ax.axvline(0,color=GRAY,linestyle='--');ax.set_xlim(min(lo-1,-5.5),max(hi+1,5.5));ax.set_yticks([]);ax.set_xlabel('Mean difference in absolute error (A − B; pedestrians)');ax.set_title('The confidence interval includes meaningful effects both ways',loc='left',fontweight='bold');fig.tight_layout();fig.savefig(FIG/'05_confidence_interval.png',dpi=210);plt.close(fig)
    fig,axs=plt.subplots(1,2,figsize=(8.4,3.5));axs[0].hist(delta,bins=12,color=BLUE,edgecolor='white');axs[0].set_xlabel('A − B absolute error');axs[0].set_ylabel('Windows');stats.probplot(delta,dist='norm',plot=axs[1]);axs[1].set_title('Normal Q–Q plot');fig.tight_layout();fig.savefig(FIG/'06_paired_difference_diagnostics.png',dpi=210);plt.close(fig)
    print(json.dumps({k:v for k,v in out.items() if k in {'n_recorded','n_confirmed_valid','total_crossings','A_mean_abs_error','B_mean_abs_error','mean_difference_AminusB','paired_t_p','paired_t_ci_95','cluster_signflip_p','hour_cluster_bootstrap_ci_95'}},indent=2))
    return out

if __name__=='__main__':main()
