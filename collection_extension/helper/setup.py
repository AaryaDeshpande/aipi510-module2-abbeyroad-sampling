#!/usr/bin/env python3
"""Create a private per-install helper token; never edits Chrome files."""
import argparse,json,os,secrets
from pathlib import Path

def setup(root, output=None):
    root=Path(root).resolve(); config_path=root/'helper'/'.local-helper.json'
    if config_path.exists():
        config=json.loads(config_path.read_text())
    else:
        config={'token':secrets.token_urlsafe(48),'port':8766,'output':str(output or Path.home()/'Downloads'/'AbbeyRoad_Firefox_LiveData')}
        config_path.write_text(json.dumps(config,indent=2)+'\n');os.chmod(config_path,0o600)
    target=Path(config['output']).expanduser().resolve()
    if target.name!='AbbeyRoad_Firefox_LiveData' and output is None:
        raise ValueError('Unexpected Firefox output directory; refusing to write')
    target.mkdir(parents=True,exist_ok=True)
    js='/* PRIVATE Firefox helper connection. Not exposed to website scripts. */\n'
    js+='globalThis.AbbeyFirefoxHelper='+json.dumps({'url':f"http://127.0.0.1:{config['port']}/v1/sync",'token':config['token']})+';\n'
    (root/'firefox-helper-config.js').write_text(js);os.chmod(root/'firefox-helper-config.js',0o600)
    return config_path, target

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output',type=Path);args=p.parse_args()
    path,target=setup(Path(__file__).resolve().parents[1],args.output)
    print('Firefox helper configured. Live folder:',target)
