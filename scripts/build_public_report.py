"""Make a readable static public report from the final DOCX, with no external assets."""
from pathlib import Path
import html,re
from docx import Document
from docx.text.paragraph import Paragraph
from docx.table import Table
root=Path(__file__).resolve().parents[1];doc=Document(root/'docs/AIPI510_Module2_Statistical_Report.docx');assets=root/'docs/report_assets';assets.mkdir(exist_ok=True)
def esc(s):
 s=html.escape(s);return re.sub(r'(https?://[^\s<>]+)',lambda m:'<a href="'+m.group(0)+'">'+m.group(0)+'</a>',s).replace('\n','<br>')
parts=[];image_index=0
for item in doc.iter_inner_content():
 if isinstance(item,Paragraph):
  images=item._p.xpath('.//a:blip')
  if images:
   for b in images:
    image_index+=1;rid=b.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed');part=doc.part.related_parts[rid];name=f'figure-{image_index}.png';(assets/name).write_bytes(part.blob);parts.append(f'<img src="report_assets/{name}" alt="Study figure from the statistical report">')
  elif item.text:
   tag='h1' if item.style.name=='Title' else 'h2' if item.style.name.startswith('Heading') else 'p';parts.append(f'<{tag}>{esc(item.text)}</{tag}>')
 elif isinstance(item,Table):
  parts.append('<table>')
  for i,row in enumerate(item.rows):tag='th' if i==0 else 'td';parts.append('<tr>'+''.join(f'<{tag}>{esc(c.text)}</{tag}>' for c in row.cells)+'</tr>')
  parts.append('</table>')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Abbey Road pedestrian sampling study</title><style>body{max-width:900px;margin:50px auto;padding:0 24px;font:18px/1.6 system-ui,sans-serif;color:#203342}h1{font-size:36px;line-height:1.2;color:#132d41}h2{margin-top:36px;font-size:25px}a{color:#1265a4}img{display:block;max-width:100%;margin:20px auto}table{border-collapse:collapse;width:100%;font-size:16px}td,th{text-align:left;padding:10px;border-bottom:1px solid #dbe3e8}th{background:#eaf2f6}nav{font-size:15px;border-bottom:1px solid #dbe3e8;padding-bottom:15px}</style><nav><a href="AIPI510_Module2_Statistical_Report.pdf">Download report PDF</a> · <a href="https://github.com/AaryaDeshpande/aipi510-module2-abbeyroad-sampling">Data and code</a></nav><main>'''+''.join(parts)+'</main></html>'
(root/'docs/index.html').write_text(page);(root/'docs/.nojekyll').touch();print('Built static report')
