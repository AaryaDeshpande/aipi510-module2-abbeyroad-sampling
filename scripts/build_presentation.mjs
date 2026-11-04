/* Edit the supplied eight-slide deck; preserve its design and observed values. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,'reproducibility/source_presentation.pptx')));
const info=await p.inspect({kind:'textbox,shape',maxChars:80000});
const edits=[
 ['We could not identify a consistent accuracy advantage in this sample.','Similar averages do not establish equivalent accuracy.'],
 ['A brief burst can reshape an estimate','One window shows how estimates can differ'],
 ['Same observing budget. Different allocation.','Two sampling methods'],
 ['seed = 20261103   •   planned power ≈ 83% for assumed d = 0.5','Seed 20261103 · assumed d_z = 0.5 · nominal independent-pair power ≈ 83%'],
 ['All three counts derive from the same timestamped crossing events; the 36 windows are the paired units.','H₀: μ_D = 0     H₁: μ_D ≠ 0     D = absolute error A − absolute error B'],
 ['A tiny average gap, with substantial uncertainty','The mean difference remains uncertain'],
 ['The interval allows advantages of several pedestrians for either method.','Cohen’s d_z = 0.002   ·   paired and hour-cluster sign-flip p = 1.000'],
 ['What could change the answer?','Limitations'],
 ['These data describe the completed recordings, pending manual validity review.','All 36 retained after the observer confirmed visibility during counting.'],
 ['Human clicks have uncertainty','Varying playback speeds'],
 ['Timing, visibility and missed crossings can matter.','Groups and reaction delay can affect timed counts.'],
 ['Manual signoff is pending','One observer and one event log'],
 ['Clocks verified; 36 validity flags left blank.','No independent recount; reference and samples share annotations.'],
 ['One minute gave us\ntwo uncertain answers.','Neither method showed\na clear accuracy advantage'],
 ['Source: abbeyroad.com/crossing   |   36 provisional clock-verified windows, Nov 3, 2026','Source: abbeyroad.com/crossing   |   36 observer-confirmed windows, Nov 3, 2026']
];
for(const [old,replacement] of edits){
 const record=info.records.find(r=>r.text===old);if(!record)throw Error('Missing source text: '+old);
 const target=p.resolve(record.id);target.text.replace(old,replacement);
 if(old.startsWith('All three counts')){target.position={left:87,top:593,width:1095,height:44};target.text.style={fontSize:22.67};}
}
// Give the title slide a location photograph without covering evidence slides.
const cover=p.slides.items[0];
const coverElements=(await p.inspect({kind:'textbox,shape',maxChars:80000})).records.filter(r=>r.slideIndex===0);
const coverTitle=p.resolve(coverElements.find(r=>r.text==='Can one minute\nrepresent five?').id);
coverTitle.position={left:69.12,top:142,width:540,height:216};
const subtitle=p.resolve(coverElements.find(r=>r.text==='Continuous vs distributed observation at Abbey Road').id);
subtitle.text='Continuous vs distributed\nobservation at Abbey Road';
subtitle.position={left:72,top:390,width:520,height:100};
p.delete(coverElements.filter(r=>/^Rectangle (5|6|7|8|9|10)$/.test(r.name)).map(r=>r.id));
cover.images.add({
 blob:new Uint8Array(await fs.readFile(path.join(root,'slides/assets/abbey-road-crossing.png'))),
 contentType:'image/png',
 alt:'People on the Abbey Road zebra crossing. Historical context photograph supplied by the presenter, not an experimental observation.',
 fit:'contain',
 position:{left:660,top:148,width:550,height:550*574/860}
});
const credit=cover.shapes.add({geometry:'textbox',name:'Crossing photo source',position:{left:660,top:535,width:550,height:54},fill:'none',line:{fill:'none',width:0}});
credit.text='Abbey Road crossing, context photograph\nSource: Abbey Road Studios (2019)';
credit.text.style={typeface:'Aptos',fontSize:17.33,color:'#A8DADC',alignment:'left'};
credit.text.insets=0;
const scripts=JSON.parse(await fs.readFile(path.join(root,'slides/narration.json'),'utf8'));
for(let i=0;i<p.slides.items.length;i++){
 const e=scripts[i];p.slides.items[i].speakerNotes.text=`${e.speaker} | target ${e.target_seconds} seconds\n\n${e.narration}\n\nSources: data/raw/experiment_protocol.json; data/raw/crossing_events.csv; data/processed/analysis_summary.json; data/review/observer_confirmation.json. Official footage viewed only at https://www.abbeyroad.com/crossing. Statistical assumptions: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.permutation_test.html . Speaker assignments are proposed; rehearse before recording.`;
}
cover.speakerNotes.text+='\n\nTitle photograph: user-supplied image from Abbey Road Studios, Celebrating 50 Years of the Iconic Crossing, June 18, 2019. https://www.abbeyroad.com/news/celebrating-50-years-of-the-iconic-crossing-2567 . Historical location context only, not footage from the November 3, 2026 experiment. No AI-generated images.';
const qa=path.join(root,'.cache/deck');await fs.mkdir(qa,{recursive:true});
for(let i=0;i<p.slides.items.length;i++){const b=await p.slides.items[i].export({format:'png',scale:1});await fs.writeFile(path.join(qa,`slide-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));}
await (await PresentationFile.exportPptx(p)).save(path.join(qa,'candidate.pptx'));
console.log('Updated eight-slide candidate:',path.join(qa,'candidate.pptx'));
