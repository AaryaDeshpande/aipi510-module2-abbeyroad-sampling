/* Retain the supplied workbook and update its review status from audited data. */
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const w=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'reproducibility/source_analysis_workbook.xlsx')));
const s=JSON.parse(await fs.readFile(path.join(root,'data/processed/analysis_summary.json'),'utf8'));
const overview=w.worksheets.getItem('Overview');overview.getRange('A4:D4').values=[['Methods','A: continuous 60 s','B: six × 10 s','Reference: 300 s']];overview.getRange('B9:B11').setNumberFormat('0.00');overview.getRange('B12').setNumberFormat('0.0000');overview.getRange('A15').values=[['DATA STATUS: All 36 retained after observer confirmation of visibility during counting. Raw dropdowns remain blank; no independent recount.']];overview.getRange('B12').values=[[s.paired_t_p]];overview.getRange('B13').values=[[s.paired_t_ci_95.map(v=>v.toFixed(2)).join(' to ')]];
w.worksheets.getItem('Windows').getRange('N2:N37').values=Array.from({length:36},()=>['Observer-confirmed']);
const notes=w.worksheets.getItem('Protocol & Notes');notes.getRange('B10').values=[['All 36 retained after observer confirmation during collection; raw review fields unchanged. No independent recount.']];notes.getRange('B12').values=[['One camera/day; within-hour dependence; variable playback speeds; single observer; shared event log.']];
console.log((await w.inspect({kind:'region',sheetId:'Protocol & Notes',range:'A1:B15',maxChars:2500,tableMaxRows:15,tableMaxCols:2})).ndjson);
notes.getRange('B10:B12').format.wrapText=true;notes.getRange('A10:B12').format.rowHeight=42;
await w.recalculate();
const qa=path.join(root,'.cache/workbook');await fs.mkdir(qa,{recursive:true});
const img=await w.render({sheetName:'Overview',range:'A1:H25',scale:1.5,format:'png'});await fs.writeFile(path.join(qa,'overview.png'),new Uint8Array(await img.arrayBuffer()));
await(await SpreadsheetFile.exportXlsx(w)).save(path.join(root,'docs/AIPI510_AbbeyRoad_Analysis_Workbook.xlsx'));
console.log((await w.inspect({kind:'region',sheetId:'Overview',range:'A6:B13',maxChars:2500})).ndjson);
