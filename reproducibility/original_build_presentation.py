#!/usr/bin/env python3
"""Render a 16:9 8-slide story deck, speaker notes and rehearsal script."""
from pathlib import Path
import json, csv
from pptx import Presentation
from pptx.util import Inches,Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from docx import Document
from docx.shared import Inches as DI, Pt as DP, RGBColor as DColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'slides';OUT.mkdir(exist_ok=True)
summary=json.loads((ROOT/'data/processed/analysis_summary.json').read_text())
prs=Presentation();prs.slide_width=Inches(13.3333);prs.slide_height=Inches(7.5)
NAVY=RGBColor(18,42,60); TEAL=RGBColor(8,126,137); CYAN=RGBColor(168,218,220); CORAL=RGBColor(205,103,54);TEXT=RGBColor(24,46,65);GRAY=RGBColor(90,113,129); WHITE=RGBColor(255,255,255); BLUE=RGBColor(44,113,177);PALE=RGBColor(235,243,247)
SCRIPTS=[
('Aarya',50,"Picture the zebra crossing outside Abbey Road Studios. A group of tourists walks across together, and then the crossing stays empty for a while. Now imagine you have only one minute to count pedestrians, but your goal is to estimate the full five minutes. Do you watch one continuous minute, or spread your attention across several short moments? We tested that choice using recorded crossing footage. Our question was simple: does dividing the same one-minute observation budget change how accurate the estimate is?"),
('Aarya',52,"The practical reason is that counting every second of every camera recording takes time. A short sample is appealing, especially when the camera shows hours of activity. But pedestrians do not arrive like a metronome. In one of our actual five-minute windows, we counted forty-three crossings. A continuous sample estimated thirty-five, while the spread-out sample estimated ninety-five. That example shows what can happen when a sample catches a particularly busy moment. We needed all thirty-six windows to understand whether that was a pattern or one unusual case."),
('Aarya',56,"Here's the comparison. Each of our windows lasts five minutes. For Method A, we randomly pick one complete minute. For Method B, we divide those five minutes into six fifty-second sections and randomly pick ten seconds from each section. That gives us sixty seconds for both methods. We multiply each sampled count by five to estimate the full window. We also counted all five minutes as our reference. The outcome we compare is the absolute difference between the estimate and that full count. The random choices were fixed before counting anyone."),
('Aarya',60,"We sampled thirty-six nonoverlapping windows from one day of the Abbey Road archive, spread from eight in the morning to just before four in the afternoon London time. The schedule was generated with a saved random seed, and we used the same crossing rule for every clip: one person counted when they reached the midpoint of the nearer zebra crossing. All together, the raw log contains eight hundred twenty-eight active crossings. The five-minute window is our unit of analysis, so there are thirty-six paired observations. Our planning calculation suggested eighty-three percent power to detect a moderate standardized difference if the windows were independent. That's an assumption we'll return to."),
('Tanya',61,"Here are the main results. Method A had a mean absolute error of ten point five three pedestrians. Method B was ten point five zero. Those values are almost identical. The individual comparisons tell the same story: A was closer in fifteen windows, B was closer in fifteen, and six were ties. The spread matters. There were some windows where the distributed sample made a large error, and others where the continuous sample missed a busy stretch. Across this recorded set, neither method was consistently better. So we looked at how uncertain that tiny average difference is."),
('Tanya',59,"We calculated the paired difference in absolute error as A minus B. Its observed mean was about positive zero point zero three pedestrians. The ninety-five percent confidence interval ran from negative four point four six to positive four point five one. The paired t-test gave a p-value of zero point nine nine zero. The result does not provide evidence of a mean difference. It also does not establish that the methods are equivalent: the confidence interval includes differences that could matter for a real counting task. When we summarized differences within each of the eight hours, the direction still changed from hour to hour."),
('Tanya',59,"There are four limits worth keeping in mind. This was one camera on one day, and several windows came from the same hour. Those windows may be correlated, reducing the effective information in our sample. One observer clicked a button for each crossing, so timing and missed events can affect counts. The full-window reference was built from that same click stream, and we do not have an independent second annotator. Finally, the extension verified playback coverage and the archived clock, but the manual validity-review fields were left blank in the export. Our statistical results are therefore provisional until that visual review is signed off."),
('Tanya',48,"What would we recommend? With these data, we cannot justify choosing one sampling method on accuracy alone. The broader lesson is that the way observation time is spread can change the outcome for an individual window, even when the average errors look alike. A follow-up should include more days, more locations, and a second person checking some of the crossings. We would also define in advance how large an accuracy improvement would matter in practice. The main takeaway is that a short observation budget needs a tested sampling plan, and the uncertainty belongs in the decision.")
]

def rect(slide,x,y,w,h,color,r=0):
 sh=slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if r else MSO_SHAPE.RECTANGLE,Inches(x),Inches(y),Inches(w),Inches(h));sh.fill.solid();sh.fill.fore_color.rgb=color;sh.line.fill.background();return sh

def txt(slide,t,x,y,w,h,size=20,color=TEXT,bold=False,align='left',font='Aptos',valign=None):
 s=slide.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h));tf=s.text_frame;tf.word_wrap=True;tf.margin_left=Pt(0);tf.margin_right=Pt(0);tf.margin_top=Pt(0);tf.margin_bottom=Pt(0)
 if valign:tf.vertical_anchor=valign
 for n,line in enumerate(t.split('\n')):
  p=tf.paragraphs[0] if n==0 else tf.add_paragraph();p.text=line;p.font.name=font;p.font.size=Pt(size);p.font.bold=bold;p.font.color.rgb=color
  p.alignment={'left':PP_ALIGN.LEFT,'center':PP_ALIGN.CENTER,'right':PP_ALIGN.RIGHT}[align]
 return s

def add_slide(background=WHITE,title='',subtitle='',num=1):
 s=prs.slides.add_slide(prs.slide_layouts[6]);s.background.fill.solid();s.background.fill.fore_color.rgb=background
 if background==WHITE:
  txt(s,title,.55,.45,11.85,.55,28,TEXT,True,font='Aptos Display')
  if subtitle:txt(s,subtitle,.57,1.06,11.9,.4,15,GRAY)
  txt(s,f'{num} / 8',12.14,7.09,.65,.2,10,GRAY,align='right')
  rect(s,.54,7.00,11.85,.025,CYAN)
 return s

def note(s,idx):
 who,secs,narr=SCRIPTS[idx]
 try:s.notes_slide.notes_text_frame.text=f'{who} | Target {secs} seconds\n\n{narr}\n\nPresenter: pause for the visual and speak conversationally.'
 except Exception as e:print('note issue',e)

# Slide 1: narrative question
s=add_slide(NAVY)
txt(s,'AIPI 510  /  MODULE PROJECT 2',.72,.58,9,.35,14,CYAN,True)
txt(s,'Can one minute\nrepresent five?',.72,1.36,11.5,2.25,46,WHITE,True,font='Aptos Display')
txt(s,'Continuous vs distributed observation at Abbey Road',.75,4.34,11.0,.55,22,RGBColor(216,230,235))
txt(s,'Aarya Deshpande  •  Tanya Sharma',.75,6.18,10,.35,16,WHITE)
for j in range(6):rect(s,9.4+j*.43,5.68,.27,.42,CYAN if j%2==0 else TEAL)
note(s,0)
# Slide 2: episode example with tension
s=add_slide(title='A brief burst can reshape an estimate',subtitle='One observed five-minute window: 10:25–10:30 AM, November 3',num=2)
rect(s,.7,1.77,11.8,3.5,PALE,1)
txt(s,'43',.95,1.95,3.0,.96,62,NAVY,True);txt(s,'crossings during the full 5 minutes',.97,2.96,3.1,.72,17,GRAY)
rect(s,4.85,2.10,.018,2.7,RGBColor(187,208,218))
txt(s,'35',5.24,2.04,2.3,.82,48,BLUE,True);txt(s,'A estimate',5.25,2.92,2.4,.45,18,GRAY)
txt(s,'95',8.5,2.04,2.3,.82,48,TEAL,True);txt(s,'B estimate',8.51,2.92,2.6,.45,18,GRAY)
txt(s,'The sampling intervals can land on very different moments.',.95,5.72,11.5,.65,22,TEXT,True)
note(s,1)
# slide 3 method diagram
s=add_slide(title='Same observing budget. Different allocation.',subtitle='Both methods use 60 seconds out of a five-minute window.',num=3)
s.shapes.add_picture(str(ROOT/'figures'/'00_sampling_protocol.png'),Inches(1.1),Inches(1.65),width=Inches(11))
rect(s,.92,5.32,11.5,.85,PALE,1);txt(s,'Estimated total = sample count × 5   •   Error = |estimate − full count|',1.16,5.53,10.8,.45,20,NAVY,True)
note(s,2)
# slide 4 design
s=add_slide(title='36 windows, sampled before we counted',subtitle='One camera · one London day · eight hourly strata',num=4)
for x,n,label in [(.8,'36','five-minute windows'),(4.55,'828','recorded crossings'),(8.5,'60 s','observed by each method')]:
 rect(s,x,1.65,3.6,2.16,PALE,1);txt(s,n,x+.24,1.9,3.1,.95,49,NAVY,True);txt(s,label,x+.24,2.94,3.1,.4,17,GRAY)
rect(s,.83,4.5,11.5,1.35,NAVY,1);txt(s,'Randomized 5-minute slots and interval positions',1.13,4.78,10.6,.42,22,WHITE,True);txt(s,'seed = 20261103   •   planned power ≈ 83% for assumed d = 0.5',1.14,5.25,10.6,.32,15,CYAN)
notes='All three counts derive from the same timestamped crossing events; the 36 windows are the paired units.'
txt(s,notes,.91,6.18,11.2,.34,14,GRAY)
note(s,3)
# slide 5: large native bars, readable labels
s=add_slide(title='The average errors were almost identical',subtitle='Absolute estimation error in pedestrians per five-minute window',num=5)
rect(s,2.18,2.60,3.20,2.68,BLUE)
rect(s,7.67,2.60,3.20,2.67,TEAL)
txt(s,'10.53',2.15,1.95,3.3,.56,36,NAVY,True,align='center')
txt(s,'10.50',7.62,1.95,3.3,.56,36,NAVY,True,align='center')
txt(s,'A: one continuous minute',1.90,5.42,3.78,.47,19,TEXT,True,align='center')
txt(s,'B: six short intervals',7.33,5.42,3.90,.47,19,TEXT,True,align='center')
rect(s,1.38,6.18,10.54,.54,PALE,1)
txt(s,'15 windows favor A     •     15 favor B     •     6 ties',1.49,6.27,10.38,.32,19,NAVY,True,align='center')
note(s,4)
# slide 6: confidence interval drawn directly, with separated labels
s=add_slide(title='A tiny average gap, with substantial uncertainty',subtitle='Paired mean difference (A absolute error − B absolute error)',num=6)
txt(s,'95% confidence interval: −4.46 to +4.51 pedestrians',1.48,1.68,10.7,.5,22,TEXT,True,align='center')
# Scale from -5 to +5 across 10.2 inches, center at 6.65.
x_left=1.55;x_right=11.75; scale=(x_right-x_left)/10
ci_lo=x_left+(-4.458398473024048+5)*scale
ci_hi=x_left+(4.513954028579604+5)*scale
x_zero=x_left+5*scale
rect(s,x_left,3.40,x_right-x_left,.023,RGBColor(208,221,230))
rect(s,x_zero,2.67,.025,1.52,GRAY)
rect(s,ci_lo,3.29,ci_hi-ci_lo,.14,BLUE)
rect(s,ci_lo-.018,3.17,.04,.38,BLUE)
rect(s,ci_hi-.018,3.17,.04,.38,BLUE)
s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x_zero-.105),Inches(3.24),Inches(.21),Inches(.21)).fill.solid()
s.shapes[-1].fill.fore_color.rgb=BLUE;s.shapes[-1].line.fill.background()
for val,x in [(-5,x_left),(-2.5,x_left+2.5*scale),(0,x_zero),(2.5,x_left+7.5*scale),(5,x_right)]:
 txt(s, str(val).replace('.0',''),x-.45,3.72,.9,.30,15,GRAY,align='center')
rect(s,1.14,4.77,11.1,1.26,PALE,1)
for x,num,label in [(1.35,'+0.03','mean difference'),(5.16,'0.990','paired t-test p-value'),(9.05,'36','paired windows')]:
 txt(s,num,x,4.89,2.68,.54,29,NAVY,True,align='center')
 txt(s,label,x,5.46,2.68,.33,14,GRAY,align='center')
txt(s,'The interval allows advantages of several pedestrians for either method.',1.45,6.35,10.9,.35,16,TEXT,align='center')
note(s,5)
# slide 7 limits
s=add_slide(title='What could change the answer?',subtitle='These data describe the completed recordings, pending manual validity review.',num=7)
for x,y,n,label,body in [(.8,1.65,'01','One camera and one day','We sampled eight hours on one Tuesday.'),(6.8,1.65,'02','Nearby windows may correlate','There are 36 windows within eight hourly groups.'),(.8,4.13,'03','Human clicks have uncertainty','Timing, visibility and missed crossings can matter.'),(6.8,4.13,'04','Manual signoff is pending','Clocks verified; 36 validity flags left blank.')]:
 rect(s,x,y,5.6,1.83,PALE,1);txt(s,n,x+.2,y+.18,.55,.3,12,TEAL,True);txt(s,label,x+.82,y+.15,4.5,.38,18,NAVY,True);txt(s,body,x+.82,y+.65,4.45,.9,14,GRAY)
note(s,6)
# slide8: callback and recommendation
s=add_slide(NAVY)
txt(s,'THE TAKEAWAY',.78,.59,10,.34,14,CYAN,True)
txt(s,'One minute gave us\ntwo uncertain answers.',.78,1.37,11.7,2.0,42,WHITE,True,font='Aptos Display')
txt(s,'We could not identify a consistent accuracy advantage in this sample.',.8,4.07,11.3,.77,21,RGBColor(216,230,235))
rect(s,.8,5.23,11.7,.032,TEAL)
txt(s,'Next: more days, more sites, independent counting checks.',.8,5.58,11.5,.63,21,WHITE,True)
txt(s,'Source: abbeyroad.com/crossing   |   36 provisional clock-verified windows, Nov 3, 2026',.81,6.94,11.4,.19,10,CYAN)
note(s,7)
prs.save(OUT/'AIPI510_Module2_AbbeyRoad_Presentation.pptx')
# Script as editable document and plain text. Keep narrative naturally spoken, with handoff.
script=Document();sec=script.sections[0];sec.top_margin=DI(.78);sec.bottom_margin=DI(.75)
styles=script.styles;styles['Normal'].font.name='Aptos';styles['Normal'].font.size=DP(11);styles['Normal'].paragraph_format.space_after=DP(8)
script.add_heading('AIPI 510  |  Module 2 Presentation Script',0)
p=script.add_paragraph('Aarya Deshpande and Tanya Sharma · 8 slides · target 7:15–7:45 · maximum 8 minutes');p.style='Subtitle'
script.add_paragraph('Delivery: natural conversational pacing, one question at the start, reveal the comparison, slow down for the confidence interval, and finish with the original one-minute question. Both presenters should rehearse with the deck and adjust only the spoken wording, not the statistics.')
plain=['AIPI 510 MODULE PROJECT 2 — RECORDING SCRIPT\nAarya Deshpande & Tanya Sharma\n']
for idx,(who,secs,narr) in enumerate(SCRIPTS,1):
 title=['Can one minute represent five?','A brief burst can reshape an estimate','Same observing budget. Different allocation.','36 windows, sampled before we counted','The average errors were almost identical','A tiny average gap, with substantial uncertainty','What could change the answer?','One minute gave us two uncertain answers.'][idx-1]
 script.add_heading(f'Slide {idx} — {title}',level=1)
 pa=script.add_paragraph(f'{who}  |  Approx. {secs} seconds');pa.style='Subtitle'
 script.add_paragraph(narr)
 if idx==4:script.add_paragraph('Handoff: Aarya finishes, looks toward Tanya. Tanya begins with the result on Slide 5.').italic=True
 plain.append(f'\nSLIDE {idx}  —  {title}\nSPEAKER: {who} | TARGET: {secs} SECONDS\n{narr}\n')
plain.append('\nRECORDING NOTES\nThis script is a prepared draft. Confirm the 36 validity fields before claiming final quality approval. Host the recorded video in a location accessible to Dr. Bent; provide its URL with the report and repository links.\n')
script.save(OUT/'AIPI510_Presentation_Narration_Script.docx')
(OUT/'AIPI510_Presentation_Narration_Script.txt').write_text('\n'.join(plain))
print('Deck',len(prs.slides),'script words',sum(len(x[2].split()) for x in SCRIPTS),'target seconds',sum(x[1] for x in SCRIPTS))
