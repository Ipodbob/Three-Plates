const {test}=require('node:test'),assert=require('node:assert/strict');
test('relay accepts only allowed origins, valid codes and its fixed lookup route',async()=>{const {handle}=await import('../relay/upc-worker.mjs');const env={ALLOWED_ORIGINS:'https://ipodbob.github.io'};for(const [url,origin,status] of [['https://relay/lookup?barcode=3017620422003','https://evil.example',403],['https://relay/lookup?barcode=123','https://ipodbob.github.io',400],['https://relay/arbitrary?barcode=3017620422003','https://ipodbob.github.io',400]])assert.equal((await handle(new Request(url,{headers:{Origin:origin}}),env)).status,status);});
test('relay enforces free-tier global limits before calling UPC',async()=>{const {reserve,handle}=await import('../relay/upc-worker.mjs');const now=Date.parse('2026-09-28T12:00:00Z');assert.equal(reserve({day:'2026-09-28',count:100,last:0},now),null);assert.equal(reserve({day:'2026-09-28',count:2,last:now-1000},now),null);assert.equal(reserve({day:'2026-09-27',count:100,last:0},now).count,1);let calls=0;const env={ALLOWED_ORIGINS:'https://ipodbob.github.io',QUOTA:{idFromName:()=>'',get:()=>({fetch:async()=>new Response(null,{status:429})})}};const r=await handle(new Request('https://relay/lookup?barcode=3017620422003',{headers:{Origin:'https://ipodbob.github.io'}}),env,()=>{calls++});assert.equal(r.status,429);assert.equal(calls,0);});
test('relay returns a small product response with CORS and never proxies arbitrary URLs',async()=>{const {handle}=await import('../relay/upc-worker.mjs');let target;const env={ALLOWED_ORIGINS:'https://ipodbob.github.io',QUOTA:{idFromName:()=>'',get:()=>({fetch:async()=>new Response(null,{status:204})})}};const r=await handle(new Request('https://relay/lookup?barcode=3017620422003&url=https://evil.example',{headers:{Origin:'https://ipodbob.github.io'}}),env,async url=>{target=url;return new Response(JSON.stringify({items:[{ean:'3017620422003',title:'Spread',offers:[1,2,3]}]}));});assert.match(target,/^https:\/\/api.upcitemdb.com\/prod\/trial\/lookup\?upc=3017620422003$/);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://ipodbob.github.io');assert.equal((await r.json()).items[0].offers,undefined);});
test('relay uses Workers-compatible manual redirects and rejects upstream redirects',async()=>{
  const {handle}=await import('../relay/upc-worker.mjs');
  const env={ALLOWED_ORIGINS:'https://ipodbob.github.io',QUOTA:{idFromName:()=>'',get:()=>({fetch:async()=>new Response(null,{status:204})})}};
  let calls=0;
  const response=await handle(new Request('https://relay/lookup?barcode=3017620422003',{headers:{Origin:'https://ipodbob.github.io'}}),env,async(url,options)=>{
    calls++;
    assert.equal(options.redirect,'manual');
    return new Response(null,{status:302,headers:{Location:'https://example.com'}});
  });
  assert.equal(calls,1);
  assert.equal(response.status,502);
  assert.deepEqual(await response.json(),{error:'Backup unavailable'});
});
