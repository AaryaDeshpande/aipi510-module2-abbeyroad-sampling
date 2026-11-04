/* Editable event timelines use actual counts; raster street scenes are AI illustrations. */
import fs from 'node:fs/promises';
import path from 'node:path';

const C={navy:'#17374B',blue:'#2D77B8',teal:'#07818C',muted:'#557084',gray:'#D4DFE7',track:'#E5ECF1'};
function box(slide,name,x,y,w,h,fill){
 return slide.shapes.add({name,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});
}
function text(slide,name,value,x,y,w,h,size=22,color=C.navy,bold=false,align='left'){
 const t=box(slide,name,x,y,w,h,'none');t.text=value;
 t.text.style={typeface:'Aptos',fontSize:size,color,bold,alignment:align,verticalAlignment:'top',wrap:'none'};
 t.text.insets=0;return t;
}
function selected(t,intervals){return intervals.some(([s,e])=>s<=t&&t<e);}

export async function enhanceEvidenceSlides(p,root){
 const d=JSON.parse(await fs.readFile(path.join(root,'slides/assets/slide02_actual_timeline.json'),'utf8'));
 if(d.full_count!==43||d.A_count!==7||d.B_count!==19||d.ten_second_counts.reduce((a,b)=>a+b,0)!==43)throw Error('Slide 2 evidence mismatch');
 const old=(await p.inspect({kind:'textbox,shape,image,chart,table',maxChars:150000})).records
  .filter(r=>r.slideIndex===1&&['textbox','shape','image','chart','table'].includes(r.kind));
 p.delete([...new Set(old.map(r=>r.id))]);
 const bgFiles=[
  'slide_02_bursts_background_AI.png','slide_03_observation_background_AI.png',
  'slide_04_study_setting_background_AI.png','slide_05_equal_time_background_AI.png',
  'slide_06_uncertainty_background_AI.png','slide_07_limitations_background_AI.png'
 ];
 for(let i=0;i<6;i++){
  const s=p.slides.items[i+1];
  const bg=s.images.add({blob:new Uint8Array(await fs.readFile(path.join(root,'slides/assets/ai',bgFiles[i]))),
   contentType:'image/png',alt:'AI-generated fictional London-inspired background illustration, not study footage.',
   fit:'cover',position:{left:0,top:0,width:1280,height:720}});
  bg.sendToBack();
  const wash=box(s,'Pale wash behind evidence',0,0,1280,720,'#FFFFFF/55');
  wash.sendToBack();bg.sendToBack();
  if(i>0)text(s,'AI background credit','AI-generated background illustration',54,698,750,16,12,C.muted);
  s.speakerNotes.text+='\n\nBackground: AI-generated fictional London-inspired illustration, selected by the presenters. It is not footage of the actual study, its conditions, or exact Abbey Road geography. Asset and prompt provenance: slides/assets/ai/prompts.json and SHA256.json.';
 }
 const s=p.slides.items[1];
 text(s,'Example title','Same window, different moments',54,35,950,56,40,C.navy,true);
 text(s,'Example window','10:25–10:30 GMT, November 3',54,102,780,30,21,C.muted);
 text(s,'Reference label','Full count\n5 minutes',992,48,137,57,21,C.muted,false,'right');
 text(s,'Reference 43','43',1144,36,90,83,65,C.navy,true);
 const max=Math.max(...d.ten_second_counts),plotWidth=532,baseY=493;
 const methods=[
  {key:'A',x:54,color:C.blue,label:'A  One continuous 60-second block',photo:'slide_02_quiet_AI.png',intervals:d.A_intervals,count:d.A_count,estimate:d.A_estimate,error:d.A_absolute_error},
  {key:'B',x:674,color:C.teal,label:'B  Six distributed 10-second blocks',photo:'slide_02_busy_AI.png',intervals:d.B_intervals,count:d.B_count,estimate:d.B_estimate,error:d.B_absolute_error}
 ];
 for(const m of methods){
  text(s,m.key+' heading',m.label,m.x,147,552,35,25.33,m.color,true);
  s.images.add({blob:new Uint8Array(await fs.readFile(path.join(root,'slides/assets/ai',m.photo))),
   contentType:'image/png',fit:'cover',position:{left:m.x,top:191,width:552,height:215},
   alt:'AI-generated '+(m.key==='A'?'quiet':'busy')+' street moment, a conceptual illustration rather than actual sample footage.'});
  const x=m.x+10;
  text(s,m.key+' timeline label','Actual crossings in 10-second blocks',x,419,532,25,17.33,C.muted);
  text(s,m.key+' sample color key','Color = sampled',x+355,421,177,22,14.67,m.color,false,'right');
  for(let k=0;k<30;k++){
   const count=d.ten_second_counts[k];if(!count)continue;
   const h=count/max*44;
   box(s,m.key+' actual bin '+k,x+k*plotWidth/30+2,baseY-h,plotWidth/30-4,h,selected(k*10,m.intervals)?m.color:C.gray);
  }
  box(s,m.key+' timeline baseline',x,baseY,plotWidth,1,C.gray);
  box(s,m.key+' full time track',x,504,plotWidth,12,C.track);
  for(const [start,end] of m.intervals)box(s,m.key+' selected '+start,x+start/300*plotWidth,504,(end-start)/300*plotWidth,12,m.color);
  for(let minute=0;minute<=5;minute++){
   const w=40;const labelX=x+minute/5*plotWidth-w/2;
   text(s,m.key+' minute '+minute,minute+':00',labelX,522,w,20,14.67,C.muted,false,'center');
  }
  text(s,m.key+' sample calculation',m.count+' observed × 5',x,557,340,38,27,C.navy,true);
  text(s,m.key+' absolute error','Absolute error: '+m.error,x,600,340,29,21.33,C.muted);
  text(s,m.key+' estimate',String(m.estimate),m.x+417,548,125,76,65,m.color,true,'right');
  text(s,m.key+' estimate label','estimate',m.x+417,617,125,25,17.33,m.color,false,'right');
 }
 text(s,'Example takeaway','The sampling intervals can land on very different moments.',54,649,1170,37,24,C.navy,true);
 text(s,'AI and evidence credit','Street scenes: AI illustrations. Timelines and counts: actual logged events from recording 13.',54,698,1120,18,12.67,C.muted);
 text(s,'Page number','2 / 8',1200,698,45,18,12.67,C.muted,false,'right');
 s.speakerNotes.text+='\n\nSlide 2 evidence: clip 13, November 3, 2026, 10:25–10:30 GMT. Full count 43. A samples relative [120,180), counts 7, estimates 35, absolute error 8. B samples [30,40), [50,60), [120,130), [170,180), [220,230), [290,300), counts 19, estimates 95, absolute error 52. Every bar shows the true event total in a consecutive ten-second bin. Gray bars are outside the sample, colored bars are inside. Each colored time track totals 60 seconds. The two AI street scenes are conceptual quiet/busy illustrations; they are not the actual sample frames and do not encode the observed counts. Source reconstruction: scripts/build_slide2_evidence.py and slides/assets/slide02_actual_timeline.json.';
}
