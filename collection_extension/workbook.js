/* Workbook layout authored with @oai/artifact-tool; counts filled from the same event-derived records. */
(function(root){
 'use strict';
 function xlsx(protocol,state,options={}){
  if(root.AbbeyCore.validate(protocol).length)throw new Error('Protocol validation failed; Excel export blocked.');
  const files={...root.AbbeyWorkbookTemplate};let xml=files['xl/worksheets/sheet1.xml'];
  protocol.observations.forEach((o,i)=>{
   const data=root.AbbeyCore.observationData(o,state.records[o.id]);
   ['full_count','A_count','B_count'].forEach((field,j)=>{
    const address='EFG'[j]+(i+2),re=new RegExp('<x:c r="'+address+'"[^>]*?(?:/>|>.*?</x:c>)','s');
    const old=xml.match(re)?.[0];if(!old)throw new Error('Excel template cell missing: '+address);
    const style=old.match(/\bs="([^"]+)"/)?.[1]||'11';
    const r=state.records[o.id]||{},partial=options.partial&&(r.startedAt||r.events?.length);
    const value=data.complete||partial?(data.counts[field]??null):null;
    xml=xml.replace(re,value===null?`<x:c r="${address}" s="${style}" />`:`<x:c r="${address}" s="${style}" t="n"><x:v>${value}</x:v></x:c>`);
   });
  });
  files['xl/worksheets/sheet1.xml']=xml;if(options.partial)files['xl/worksheets/sheet2.xml']=files['xl/worksheets/sheet2.xml'].replace(/Yellow count cells[^<]*/, 'LIVE snapshot: partial counts are provisional. Check live_pedestrian_counts.csv for completion and save_status.json for the last disk commit.');return root.AbbeyCore.zip(files);
 }
 root.AbbeyWorkbook={xlsx};
})(globalThis);
