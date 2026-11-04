import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
ROOT=Path(__file__).resolve().parents[1]
o=json.loads((ROOT/'data/raw/experiment_protocol.json').read_text())['observations'][12]
fig,ax=plt.subplots(figsize=(9.3,2.85)); c=['#B6CCD8','#2B75B5','#4B9A91']
for i,label in enumerate(['Full: 300 seconds','A: one 60-second block','B: six 10-second blocks']):
 y=2-i;ax.add_patch(Rectangle((0,y-.28),300,.55,facecolor='#EBF0F4',edgecolor='#D4DEE5',linewidth=.6))
 if i==0:ax.add_patch(Rectangle((0,y-.28),300,.55,facecolor=c[i],edgecolor='none'))
 if i==1:ax.add_patch(Rectangle((o['A_start_offset_seconds'],y-.28),60,.55,facecolor=c[i],edgecolor='none'))
 if i==2:
  for s in o['B_start_offsets_seconds']:ax.add_patch(Rectangle((s,y-.28),10,.55,facecolor=c[i],edgecolor='none'))
 ax.text(-5,y,label,ha='right',va='center',fontsize=11,color='#173047',fontweight='medium')
ax.set_xlim(0,300);ax.set_ylim(-.6,2.7);ax.set_yticks([]);ax.set_xticks([0,60,120,180,240,300]);ax.set_xticklabels(['0','1','2','3','4','5 min']);ax.spines[['top','left','right']].set_visible(False);ax.spines['bottom'].set_color('#D4DEE5');ax.tick_params(axis='x',length=0,pad=7,labelcolor='#596B7A');fig.tight_layout(pad=1.1);fig.savefig(ROOT/'figures/00_sampling_protocol.png',dpi=220,bbox_inches='tight');plt.close(fig)
