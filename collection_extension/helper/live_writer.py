#!/usr/bin/env python3
"""Firefox-only authenticated loopback snapshot writer; standard library only.
No video APIs, remote requests, uploads, or user account access.
"""
import argparse,base64,binascii,hashlib,hmac,json,os,re,tempfile
from datetime import datetime,timezone
from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path

SHA='6dee07a2710f2021d55d62e445ae15ab6ccbebdf01c085de91e140a8462e426d'
FILES={'pedestrian_counts.csv','crossing_events.csv','experiment_results.csv','experiment_protocol.json','experiment_metadata.json','live_pedestrian_counts.csv','Abbey_Road_Audited_Final_Counting_Sheet.xlsx'}
MOZ_ORIGIN=re.compile(r'^moz-extension://[0-9a-fA-F-]{36}$')

def atomic_write(path,data):
    fd,name=tempfile.mkstemp(prefix='.'+path.name+'.',dir=path.parent)
    try:
        with os.fdopen(fd,'wb') as stream:
            stream.write(data);stream.flush();os.fsync(stream.fileno())
        os.replace(name,path)
    finally:
        if os.path.exists(name):os.unlink(name)

class Writer:
    def __init__(self,config):
        self.config=config;self.target=Path(config['output']).expanduser().resolve();self.target.mkdir(parents=True,exist_ok=True)
        self.allowed_origin=config.get('extension_origin')
    def valid_origin(self,origin):
        # Privileged extension fetches may omit Origin. They still require the token.
        return origin is None or bool(MOZ_ORIGIN.fullmatch(origin)) and (self.allowed_origin is None or origin==self.allowed_origin)
    def commit(self,payload,origin=None):
        if payload.get('client')!='AbbeyRoadFirefox' or payload.get('protocolSha256')!=SHA:raise ValueError('Wrong client or protocol')
        revision=payload.get('revision')
        if type(revision) is not int or revision<1:raise ValueError('Invalid revision')
        files=payload.get('files')
        if not isinstance(files,dict) or set(files)!=FILES:raise ValueError('Unexpected filenames; refusing write')
        decoded={}
        for name,entry in files.items():
            if not isinstance(entry,dict):raise ValueError('Invalid file encoding')
            if set(entry)=={'text'} and isinstance(entry['text'],str):data=entry['text'].encode('utf-8')
            elif set(entry)=={'base64'} and isinstance(entry['base64'],str):data=base64.b64decode(entry['base64'],validate=True)
            else:raise ValueError('Invalid file encoding')
            if len(data)>4*1024*1024:raise ValueError('File too large')
            decoded[name]=data
        protocol=json.loads(decoded['experiment_protocol.json'])
        canonical=json.loads((Path(__file__).resolve().parents[1]/'protocol.json').read_text())
        if protocol!=canonical:raise ValueError('Audited protocol differs')
        meta=json.loads(decoded['experiment_metadata.json'])
        if meta.get('collection_client')!='Firefox' or meta.get('state',{}).get('revision')!=revision:raise ValueError('Metadata revision/client mismatch')
        marker=self.target/'save_status.json'
        if marker.exists() and json.loads(marker.read_text()).get('revision',0)>revision:raise ValueError('Older revision rejected; live files protected')
        # Every named file is replaced atomically. Marker is written LAST; it identifies
        # a complete bundle and SHA-256 hashes detect an interrupted mixed revision.
        hashes={}
        for name,data in decoded.items():atomic_write(self.target/name,data);hashes[name]=hashlib.sha256(data).hexdigest()
        status={'ok':True,'client':'Firefox','folder':str(self.target),'revision':revision,'savedAt':datetime.now(timezone.utc).isoformat(),'file_count':len(decoded),'sha256':hashes}
        atomic_write(marker,(json.dumps(status,indent=2)+'\n').encode())
        if origin and self.allowed_origin is None:self.allowed_origin=origin
        return status

def server(config):
    writer=Writer(config)
    class Handler(BaseHTTPRequestHandler):
        server_version='AbbeyRoadFirefoxLocal/1'
        def log_message(self,*args):pass
        def valid_host(self):return self.headers.get('Host')==f"127.0.0.1:{config['port']}"
        def send(self,status,data):
            body=json.dumps(data).encode();self.send_response(status);origin=self.headers.get('Origin')
            if origin and writer.valid_origin(origin):self.send_header('Access-Control-Allow-Origin',origin);self.send_header('Vary','Origin')
            self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
        def do_OPTIONS(self):
            origin=self.headers.get('Origin')
            if self.path!='/v1/sync' or not self.valid_host() or not origin or not writer.valid_origin(origin):return self.send(403,{'ok':False,'error':'Origin/host rejected'})
            self.send_response(204);self.send_header('Access-Control-Allow-Origin',origin);self.send_header('Access-Control-Allow-Methods','POST');self.send_header('Access-Control-Allow-Headers','authorization,content-type');self.send_header('Vary','Origin');self.send_header('Content-Length','0');self.end_headers()
        def do_POST(self):
            if self.path!='/v1/sync' or not self.valid_host() or not writer.valid_origin(self.headers.get('Origin')):return self.send(403,{'ok':False,'error':'Origin/host/path rejected'})
            supplied=self.headers.get('Authorization','')
            if not hmac.compare_digest(supplied,'Bearer '+config['token']):return self.send(401,{'ok':False,'error':'Authentication required'})
            try:
                length=int(self.headers.get('Content-Length','0'))
                if length<=0 or length>8*1024*1024:raise ValueError('Payload size rejected')
                payload=json.loads(self.rfile.read(length));result=writer.commit(payload,self.headers.get('Origin'));self.send(200,result)
            except (ValueError,KeyError,TypeError,binascii.Error) as e:self.send(400,{'ok':False,'error':str(e)})
            except Exception:self.send(500,{'ok':False,'error':'Local write failed. Firefox storage is preserved.'})
        def do_GET(self):self.send(405,{'ok':False,'error':'Authenticated POST only'})
    return HTTPServer(('127.0.0.1',config['port']),Handler)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--config',type=Path,default=Path(__file__).parent/'.local-helper.json');args=p.parse_args()
    config=json.loads(args.config.read_text())
    try:service=server(config)
    except OSError as error:raise SystemExit('Firefox live writer could not start (possibly already open): '+str(error))
    print('Firefox live saving is running at 127.0.0.1:'+str(config['port']),flush=True)
    print('Live files: '+config['output'],flush=True)
    print('Leave this Terminal window open. Ctrl+C stops only live file writing; Firefox retains observations.',flush=True)
    try:service.serve_forever()
    except KeyboardInterrupt:pass
    finally:service.server_close()
