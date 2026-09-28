const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const name=pathname==='/Three-Plates/'?'index.html':pathname.startsWith('/Three-Plates/')?pathname.slice(14):'';
  if(!/^[a-zA-Z0-9.-]+$/.test(name)||!types[path.extname(name)]) {res.writeHead(404);res.end('Not found');return;}
  fs.readFile(path.join(root,name),(err,data)=>{
    res.writeHead(err?404:200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store'});
    res.end(err?'Not found':data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Three Plates: http://127.0.0.1:4173/Three-Plates/'));
