#!/usr/bin/env python3
"""Build the report from the audited analysis outputs; never changes observations."""
import json
from pathlib import Path
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
ROOT=Path(__file__).resolve().parents[1]
s=json.loads((ROOT/'data/processed/analysis_summary.json').read_text());power=json.loads((ROOT/'data/processed/power_analysis.json').read_text())
doc=Document();sec=doc.sections[0]
sec.top_margin=Inches(.75);sec.bottom_margin=Inches(.72);sec.left_margin=sec.right_margin=Inches(.85)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2']:
 st=doc.styles[name];st.font.name='Aptos';st.font.color.rgb=RGBColor(25,38,48)
normal=doc.styles['Normal'];normal.font.size=Pt(10.5);normal.paragraph_format.space_after=Pt(4);normal.paragraph_format.line_spacing=1.08
for name,size in [('Title',23),('Heading 1',14),('Heading 2',11.5)]:
 st=doc.styles[name];st.font.size=Pt(size);st.font.bold=True;st.paragraph_format.space_before=Pt(10);st.paragraph_format.space_after=Pt(5)
doc.styles['Title'].font.color.rgb=RGBColor(0,0,0)
for st in doc.styles:
    if st._element.pPr is not None:
        for border in list(st._element.pPr.findall(qn('w:pBdr'))):st._element.pPr.remove(border)
doc.core_properties.title='Pedestrian crossing estimates from continuous and distributed video samples'
doc.core_properties.author='Aarya Deshpande and Tanya Sharma'
doc.core_properties.subject='Duke AIPI 510 Module Project 2'
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
run=footer.add_run('AIPI 510  |  November 3, 2026  |  ');run.font.size=Pt(8)
fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');footer._p.append(fld)
def p(text):return doc.add_paragraph(text)
def h(text):return doc.add_heading(text,1)
def figure(name,caption,width=5.8):
 pp=doc.add_paragraph();pp.alignment=WD_ALIGN_PARAGRAPH.CENTER;pp.paragraph_format.keep_with_next=True
 pp.add_run().add_picture(str(ROOT/'figures'/name),width=Inches(width))
 cc=p(caption);cc.alignment=WD_ALIGN_PARAGRAPH.CENTER
 for r in cc.runs:r.font.size=Pt(8.5);r.font.color.rgb=RGBColor(70,85,95)
def table(headers,rows):
 t=doc.add_table(rows=1,cols=len(headers));t.style='Light Shading Accent 1'
 for i,x in enumerate(headers):t.rows[0].cells[i].text=x
 trpr=t.rows[0]._tr.get_or_add_trPr();repeat=OxmlElement('w:tblHeader');trpr.append(repeat)
 for row in rows:
  cells=t.add_row().cells
  for c,v in zip(cells,row):c.text=str(v)
 for row in t.rows:
  for c in row.cells:
   for pp in c.paragraphs:
    pp.paragraph_format.space_after=Pt(3)
    for r in pp.runs:r.font.size=Pt(9)
 return t
n=s['n_analyzed'];lo,hi=s['paired_t_ci_95']
doc.add_heading(doc.core_properties.title,0)
p('Aarya Deshpande and Tanya Sharma\nDuke University  |  AIPI 510 Module Project 2  |  November 3, 2026')
h('Abstract')
p(f'We compared two ways of estimating a five-minute pedestrian crossing count from 60 seconds of fixed-camera footage: one continuous minute and six distributed ten-second intervals. A frozen random protocol selected {n} nonoverlapping windows from the Abbey Road archive on November 3, 2026. A single observer recorded {s["total_crossings"]} crossing events while viewing the full windows; both sample counts were derived from the same event timestamps. Mean absolute error was {s["A_mean_abs_error"]:.2f} pedestrians for Method A and {s["B_mean_abs_error"]:.2f} for Method B. The paired mean difference, A minus B, was {s["mean_difference_AminusB"]:.3f} pedestrians (nominal 95% CI {lo:.2f} to {hi:.2f}; paired t({s["paired_df"]}) = {s["paired_t"]:.4f}, p = {s["paired_t_p"]:.4f}; Cohen’s d_z = {s["paired_cohens_dz"]:.4f}). Neither method showed a clear accuracy advantage. This result does not demonstrate equivalence. One site, one day, correlated windows and unverified human counting accuracy limit the inference.')
h('Background and motivation')
p('Pedestrians often arrive in groups, so an estimate based on one short stretch of video may depend strongly on the selected time. Spreading the same observation budget across a recording could capture more of this variation, but short intervals can also land on unusually busy bursts. We tested that allocation decision using the official Abbey Road Crossing Cam in London [1]. The study concerns crossings of the nearer zebra crossing, not all activity at the junction or the number of unique people in the area.')
h('Research question and hypotheses')
p('Which sampling method produces smaller absolute error when estimating the total number of pedestrian crossings during five minutes? For window i, F_i is the full-window reference count. A_i and B_i are the two sampled counts. Estimates are 5A_i and 5B_i; absolute errors are E_Ai = |5A_i − F_i| and E_Bi = |5B_i − F_i|. Let D_i = E_Ai − E_Bi. Positive values favor B.')
p('H₀: μ_D = 0, meaning equal mean absolute estimation error. H₁: μ_D ≠ 0. The comparison is two-sided; either sampling method could be more accurate.')
h('Experimental design')
p('The independent variable was the sampling method. The primary dependent variable was absolute estimation error, measured in pedestrians per five-minute window. Each window supplied a paired comparison. Method A served as the continuous-sampling comparator; the full 300-second tally was the common reference. Pedestrian behavior was observed rather than experimentally manipulated.')
p('The eligible frame covered 08:00–15:59 GMT on November 3, 2026, partitioned into five-minute slots. The 09:00–09:10 period was excluded before counting because the archive is split at 09:06. This left 94 eligible slots. Python random.Random(20261103) selected five slots from each of the first four hourly strata and four from each of the last four, for 36 nonoverlapping windows. Some selected windows were adjacent. The schedule and interval offsets were fixed before counting and were not changed in response to pedestrian activity.')
p('Within a window, A selected one of five nonoverlapping 60-second blocks uniformly. B selected one of five ten-second blocks uniformly within each of six consecutive 50-second strata. Each method therefore observes 60 video seconds and gives each second a 20% inclusion probability. All counting intervals are half-open: include their start and exclude their end. The hourly selection fractions differ, so the unweighted analysis estimates a contrast for these selected windows rather than a representative full-day traffic total.')
figure('00_sampling_protocol.png','Figure 1. A and B allocate the same 60-second observation budget within a 300-second window. The illustrated intervals come from the frozen protocol.',5.5)
h('Sample size and assumption based power')
p(f'The schedule fixed 36 windows before collection. For sample-size calibration, a two-sided paired t-test with α = 0.05 and assumed standardized paired effect d_z = 0.50 gives nominal power {100*power["nominal_power_independent_windows"]:.1f}%. The corresponding 80% target is {power["minimum_pairs_for_80pct_under_assumptions"]:.2f} pairs, rounded up to 34, using statsmodels TTestPower [2, 4]. The effect assumption was hypothetical, not estimated from these observations. This calculation was verified after collection, when the 36-window sample size was already fixed. It provides a planning scenario rather than a documented prospective justification.')
p('The 83% figure assumes independent pairs and does not guarantee adequate power here. With mean cluster size 4.5, the rough design-effect approximation 1 + (m − 1)ρ gives effective pair counts of 26.7 for ρ = 0.10 and 17.6 for ρ = 0.30, with nominal t-test power about 70% and 51%. These are illustrations, not estimates of the actual correlation or corrected power. Eight unequal hourly strata on one day offer limited independent information. The study was not designed to establish equivalence.')
h('Data collection and cleaning')
p('Aarya counted each individual once on reaching the midpoint of the nearer zebra crossing, in either direction. Vehicles, cyclists, sidewalk walkers and the distant crossing were excluded. He watched each full window and pressed a counter button. The local Firefox extension logged actual video playback time and automatically derived A and B counts. Varying playback speeds changed viewing pace, while all observation intervals remained defined in video seconds. People who moved partway and returned required observer judgment.')
p('The export contains 834 event rows, including six undone events. Cleaning removes only those marked deleted and retains every original row in the raw file. Recomputing counts from the remaining 828 events and the frozen intervals exactly reproduces all 36 Full/A/B export rows. The source metadata confirms dated archives, complete [0, 300] playback coverage and an automatic endpoint for every window. This checks timing and software consistency; it does not independently verify whether every pedestrian was labeled correctly.')
p('The original validity dropdowns were blank. After collection, Aarya confirmed that the crossings had been clearly visible during counting and that all 36 windows were usable; no windows were excluded. That statement is saved separately in data/review/observer_confirmation.json. The raw exports and their original analysis-inclusion flags remain unchanged. The analysis uses the observer confirmation as its eligibility record. No independent second annotation or recount was performed, and no numerical annotation-accuracy rate is claimed.')
h('Statistical methods and assumptions')
p('The main comparison is a two-sided paired t-test on D_i, with its nominal 95% t confidence interval and Cohen’s d_z = mean(D)/SD(D). The paired structure controls for the full count and arrival pattern within each window. Valid population inference assumes approximately independent window differences and a suitable sampling distribution of their mean; the hourly clustering weakens that assumption. Shapiro–Wilk and a Q–Q plot describe the differences but cannot establish independence or prove normality.')
p('Sensitivity analyses include Wilcoxon signed-rank using the asymptotic method, discarding the six zero differences and accounting for tied ranks; an exact paired sign-flip test of the mean using integer dynamic programming; and an exact sign flip of the eight hourly totals. The sign-flip and signed-rank checks require symmetry or exchangeability beyond equality of means [3, 5]. They are model-based sensitivity checks, not tests justified solely by random assignment of sampling labels. A and B are distinct designs and were not interchangeable treatment labels.')
p('We also calculated an equally weighted mean of the eight hourly means and a percentile bootstrap resampling eight entire hours 15,000 times with seed 20261103. Equal-hour and equal-window weighting target different summaries because hourly quotas differ. These exploratory checks do not eliminate dependence, and only eight distinct hours limit cluster inference. No multiplicity-adjusted post hoc comparisons were needed for the single A/B contrast; sensitivity tests are not separate confirmatory discoveries.')
h('Results')
table(['Outcome','A continuous minute','B six ten-second intervals'],[
 ['Sample crossings',s['A_sample_count'],s['B_sample_count']],['Mean absolute error',f'{s["A_mean_abs_error"]:.2f}',f'{s["B_mean_abs_error"]:.2f}'],['Median absolute error',f'{s["A_median_abs_error"]:.1f}',f'{s["B_median_abs_error"]:.1f}'],['SD absolute error',f'{s["A_sd_abs_error"]:.2f}',f'{s["B_sd_abs_error"]:.2f}'],['Root mean squared error',f'{s["A_RMSE"]:.2f}',f'{s["B_RMSE"]:.2f}'],['Mean signed error',f'{s["A_signed_bias_mean"]:.2f}',f'{s["B_signed_bias_mean"]:.2f}']])
p(f'The full reference averaged {s["full_mean"]:.1f} crossings per window (SD {s["full_sd"]:.2f}). A was closer in {s["A_better_windows"]} windows, B in {s["B_better_windows"]}, and {s["ties"]} were tied. The mean paired absolute-error difference was +{s["mean_difference_AminusB"]:.3f} pedestrians, with SD {s["sd_difference"]:.2f}. The nominal paired t-test gave p = {s["paired_t_p"]:.4f} and 95% CI [{lo:.2f}, {hi:.2f}], with d_z = {s["paired_cohens_dz"]:.4f}.')
figure('01_mean_absolute_error.png','Figure 2. Average absolute estimation errors across the 36 paired windows.',5.1)
p(f'Shapiro–Wilk gave p = {s["shapiro_wilk_p"]:.3f}; the diagnostic does not reject normality at 0.05, but that is not proof of a normal distribution. Wilcoxon gave p = {s["wilcoxon_p"]:.3f}. The exact paired sign-flip p-value was {s["paired_signflip_p"]:.3f}. The hourly means ranged from −6.75 to +4.80 pedestrians. Their equal-hour mean was {s["equal_hour_weighted_delta"]:.2f}, with t-test p = {s["hour_level_t_p"]:.3f} and CI [{s["hour_level_t_ci_95"][0]:.2f}, {s["hour_level_t_ci_95"][1]:.2f}]. The hour-cluster sign-flip p-value was {s["cluster_signflip_p"]:.3f}; the hour-resampling percentile interval was [{s["hour_cluster_bootstrap_ci_95"][0]:.2f}, {s["hour_cluster_bootstrap_ci_95"][1]:.2f}]. These checks show no clear direction while retaining their stated assumptions.')
figure('05_confidence_interval.png','Figure 3. Nominal paired-t 95% interval for A minus B absolute error. Negative favors A; positive favors B.',5.1)
h('Interpretation and limitations')
p('The observed average gap is small relative to variability between windows. It does not justify choosing either sampling method on accuracy alone. A nonsignificant test does not establish equal accuracy: the nominal confidence interval allows advantages of several pedestrians in either direction. RMSE is descriptively lower for A, while the prespecified primary metric was absolute error; this secondary difference is not evidence of a general winner.')
p('One illustrative window, 10:25–10:30, contained 43 recorded crossings. A estimated 35 and B estimated 95. Its absolute errors were 8 and 52, showing that short sampled intervals can overlap an unusually dense burst. It was retained with the other predefined windows rather than excluded because B performed poorly.')
p('All windows came from one camera and one day. Adjacent windows and shared hourly travel patterns may create dependence, and the random interval positions were realized only once. Single-observer counting at varying playback speeds may miss pedestrians in groups, introduce reaction delay near interval boundaries or classify partial crossings inconsistently. Buffering was mentioned by the observer; the software uses media time, so a pause does not add observation seconds, but attention can still be affected. Consistent use of one counting rule does not prove equal or negligible measurement error.')
p('The full tally is a manually labeled reference rather than independently established ground truth. Because Full, A and B share the same event log, any annotation mistake can affect all three counts. Internal agreement therefore cannot establish human accuracy. Future work should add independent annotation of a prespecified subset, multiple days and sites, and a prespecified practically important effect for a new sample-size plan. Footage may expire from the rolling archive; no recordings or identifying images are distributed.')
h('Conclusion')
p('For these 36 observer-confirmed Abbey Road windows, continuous and distributed one-minute sampling had mean absolute errors of 10.53 and 10.50 pedestrians. The paired estimate and sensitivity checks did not identify a clear accuracy advantage. Wider collection across independent days and locations, together with independent count verification, is needed before recommending one method or claiming equivalence.')
h('Paired difference diagnostics').paragraph_format.page_break_before=True
figure('06_paired_difference_diagnostics.png','Figure 4. Distribution and normal Q–Q plot of the 36 paired absolute-error differences.',5.8)
p('These diagnostics describe shape and potential tail departures. They do not establish independence, verify the human reference counts or justify interpreting a nonsignificant result as equivalence.')
h('References')
refs=[
 '[1] Abbey Road Studios. Abbey Road Crossing Cam. https://www.abbeyroad.com/crossing (viewed November 3, 2026).',
 '[2] Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.',
 '[3] SciPy. ttest_rel, wilcoxon and shapiro documentation. https://docs.scipy.org/doc/scipy/reference/stats.html',
 '[4] statsmodels. TTestPower documentation. https://www.statsmodels.org/stable/generated/statsmodels.stats.power.TTestPower.html',
 '[5] SciPy. permutation_test documentation, paired sample permutations. https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.permutation_test.html',
 '[6] Deshpande, A., and Sharma, T. (2026). Abbey Road pedestrian sampling experiment. Frozen protocol, manual event log and analysis code. https://github.com/AaryaDeshpande/aipi510-module2-abbeyroad-sampling']
for x in refs:
 pp=p(x)
 for rr in pp.runs:rr.font.size=Pt(8.7)
(ROOT/'docs').mkdir(exist_ok=True);doc.save(ROOT/'docs/AIPI510_Module2_Statistical_Report.docx')
print('Built report from verified analysis')
