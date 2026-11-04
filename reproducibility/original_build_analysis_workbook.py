#!/usr/bin/env python3
"""Editable, formula-driven workbook created with artifact_tool."""
import csv,json
from pathlib import Path
from artifact_tool import Workbook,SpreadsheetFile
ROOT=Path(__file__).resolve().parents[1]
rows=list(csv.DictReader(open(ROOT/'data/processed/analysis_dataset.csv')))
S=json.loads((ROOT/'data/processed/analysis_summary.json').read_text())
wb=Workbook.create()
navy='#173047';teal='#087E89';gray='#627487';pale='#EAF2F5'; yellow='#FFF2C4'; white='#FFFFFF'
s=wb.worksheets.add('Overview')
s.get_range('A1:H2').merge();s.get_range('A1').values=[['AIPI 510 | Abbey Road sampling experiment']]
s.get_range('A1:H2').format={'fill':navy,'font':{'color':white,'bold':True,'size':18},'row_height':27}
s.get_range('A4:D4').values=[['Design','A = one continuous 60 sec','B = six distributed 10 sec','Reference = all 5 minutes']]
s.get_range('A4:D4').format={'fill':pale,'font':{'color':navy,'bold':True},'row_height':30}
s.get_range('A6:B13').values=[
 ['Outcome','Value'],['Total sampled recordings',36],['Reference crossings',828],
 ['Mean absolute error A',None],['Mean absolute error B',None],['Mean difference A − B',None],
 ['Paired t-test p-value',round(S['paired_t_p'],6)],['95% CI for A−B','−4.46 to +4.51']]
s.get_range('B9').formulas=[['=AVERAGE(Windows!I2:I37)']]
s.get_range('B10').formulas=[['=AVERAGE(Windows!J2:J37)']]
s.get_range('B11').formulas=[['=B9-B10']]
s.get_range('A6:B6').format={'fill':navy,'font':{'color':white,'bold':True}}
s.get_range('A15:H15').merge();s.get_range('A15').values=[['DATA STATUS: All 36 recordings are complete and clock-verified; manual visibility flags are blank. Results are provisional until reviewed.']]
s.get_range('A15:H15').format={'fill':'#FCECCF','font':{'color':'#7A4900','bold':True},'row_height':36,'wrap_text':True}
s.get_range('A17:H18').merge();s.get_range('A17').values=[['Interpretation: the observed mean errors are almost identical (10.53 vs 10.50). The 95% CI includes meaningful differences in either direction. A nonsignificant result does not prove the two protocols are equivalent.']]
s.get_range('A17:H18').format={'fill':pale,'font':{'color':navy,'size':12},'wrap_text':True}
s.get_range('A20:B23').values=[['Study facts','Value'],['Study date','2026-11-03 London GMT'],['Window sample','36 x 300 seconds'],['Protocol seed','20261103']]
s.get_range('A20:B20').format={'fill':navy,'font':{'color':white,'bold':True}}
s.get_range('A1:H25').format.column_width=17;s.get_range('A1:A25').format.column_width=31;s.get_range('B1:B25').format.column_width=28;s.get_range('D1:D25').format.column_width=32
s.freeze_panes.freeze_rows(2)
w=wb.worksheets.add('Windows')
heads=['Clip','Hour','Start GMT','Full count','A count','B count','A estimate','B estimate','Abs error A','Abs error B','A−B error','Signed A error','Signed B error','Review status']
w.get_range('A1:N1').values=[heads]
records=[]
for r in rows:
 records.append([r['clip_id'],int(r['hour']),r['start_GMT'],int(r['full_count']),int(r['A_count']),int(r['B_count']),None,None,None,None,None,None,None,r['review_status']])
w.get_range('A2:N37').values=records
for target,form in [('G','=E2*5'),('H','=F2*5'),('I','=ABS(G2-D2)'),('J','=ABS(H2-D2)'),('K','=I2-J2'),('L','=G2-D2'),('M','=H2-D2')]:
 w.get_range(f'{target}2').formulas=[[form]];w.get_range(f'{target}2:{target}37').fill_down()
w.get_range('A1:N1').format={'fill':navy,'font':{'color':white,'bold':True},'row_height':33,'wrap_text':True}
w.get_range('D2:F37').format.fill=yellow
w.get_range('A1:N37').format.column_width=15;w.get_range('C1:C37').format.column_width=17;w.get_range('N1:N37').format.column_width=18
w.get_range('A1:N37').format.row_height=23
w.freeze_panes.freeze_rows(1)
f=wb.worksheets.add('Protocol & Notes')
f.get_range('A1:F2').merge();f.get_range('A1').values=[['Methodology & data quality']]
f.get_range('A1:F2').format={'fill':navy,'font':{'color':white,'bold':True,'size':17}}
items=[
 ['Design','A: one randomly chosen complete minute; B: 6 x 10 sec selected from separate 50 sec strata.'],
 ['Reference','Manually count each person crossing nearest zebra crossing across all 300 sec.'],
 ['Estimator','Each sample count multiplied by 5; absolute difference from reference count.'],
 ['Date / frame','November 3, 2026, 8:00–15:59 London GMT; 36 selected five-minute windows.'],
 ['Sampling','Python random.Random(20261103), 5/5/5/5/4/4/4/4 per-hour quota.'],
 ['Event audit','828 active events, 6 deleted; all export counts independently reconciled.'],
 ['Status','All 36 recordings have blank manual validity review flags; no approved rows.'],
 ['Statistics','Paired t-test p = 0.990; CI [−4.46, +4.51]; not an equivalence test.'],
 ['Limitations','One camera/day; possible within-hour dependence; single observer, no independent label audit.'],
 ['Source','https://www.abbeyroad.com/crossing']]
f.get_range('A4:B13').values=items
f.get_range('A4:A13').format={'fill':pale,'font':{'color':navy,'bold':True}}
f.get_range('A1:A20').format.column_width=26;f.get_range('B1:B20').format.column_width=98;f.get_range('A4:B13').format.row_height=30;f.get_range('B4:B13').format.wrap_text=True
OUT=ROOT/'docs'/'AIPI510_AbbeyRoad_Analysis_Workbook.xlsx'
SpreadsheetFile.export_xlsx(wb).save(str(OUT))
try:
 print('WORKBOOK_INSPECT',wb.inspect({'kind':'table','range':'Windows!A1:N4','include':'values,formulas','table_max_rows':4,'table_max_cols':14}).ndjson[:2200])
except Exception as exc:print('Inspect failed',str(exc)[:200])
print('SAVED',OUT)
