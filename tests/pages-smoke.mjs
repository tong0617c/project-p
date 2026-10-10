import {createServer} from 'node:http';
import {readFile,readdir,mkdtemp} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
import {chromium,browserOptions} from './browser.mjs';
import {pagesBase} from '../scripts/pages-base.mjs';
const base=pagesBase(),root=resolve('dist');
const manifest=JSON.parse(await readFile(join(root,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.start_url,base);assert.equal(manifest.scope,base);assert.equal(manifest.id,base);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
async function audit(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await audit(p);else assert.ok(types[extname(e.name)],`Unexpected publish artifact: ${p}`)}}await audit(root);
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;if(!path.startsWith(base)){res.writeHead(404).end();return}const relative=decodeURIComponent(path.slice(base.length))||'index.html';const file=resolve(root,relative);if(!file.startsWith(root+sep)){res.writeHead(403).end();return}res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(await readFile(file))}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,url=origin+base;
const profile=await mkdtemp(join(tmpdir(),'project-p-pages-'));let ctx;const errors=[],badResponses=[],offScopeRequests=[];
function observe(page){page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)});page.on('request',r=>{if(r.url().startsWith(origin)&&!new URL(r.url()).pathname.startsWith(base))offScopeRequests.push(r.url())})}
try{
 ctx=await chromium.launchPersistentContext(profile,{...browserOptions,viewport:{width:390,height:844},isMobile:true,hasTouch:true});let p=await ctx.newPage();observe(p);await p.goto(url);await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();
 const scope=await p.evaluate(()=>navigator.serviceWorker.ready.then(r=>r.scope));assert.equal(scope,url);assert.equal(await p.locator('link[rel="apple-touch-icon"]').getAttribute('href'),`${base}icon-180.png`);
 for(const asset of ['icon-180.png',...manifest.icons.map(i=>i.src.slice(base.length)),'registerSW.js','sw.js'])assert.equal((await fetch(url+asset)).status,200);
 await p.getByRole('button',{name:'手账',exact:true}).click();await p.getByRole('button',{name:/小屋信箱/}).click();await p.getByRole('button',{name:/TO YOU, WITH WARMTH/}).click();await p.getByRole('button',{name:'去制作纪念卡 →',exact:true}).click();await p.getByRole('button',{name:'✧ 完成并收藏纪念卡',exact:true}).click();await p.getByRole('button',{name:'去展示柜摆放 →',exact:true}).click();await p.getByRole('button',{name:'摆放《有你在的午后》',exact:true}).click();
 await p.getByRole('button',{name:'小屋',exact:true}).click();await p.locator('canvas').waitFor();await p.getByRole('button',{name:'小屋菜单',exact:true}).click();await p.getByRole('button',{name:'潘妮',exact:true}).click();await p.getByRole('button',{name:'好呀，继续',exact:true}).click();await p.getByRole('button',{name:'温暖的金色花',exact:true}).click();await p.getByRole('button',{name:'一起留下这份回忆',exact:true}).click();
 await p.getByRole('button',{name:'手账',exact:true}).click(); // Stop NPC before snapshot.
 const snapshot=await p.evaluate(()=>localStorage.getItem('project-p.save.v2'));assert.ok(snapshot);await ctx.close();
 ctx=await chromium.launchPersistentContext(profile,{...browserOptions,viewport:{width:390,height:844}});p=await ctx.newPage();observe(p);await p.goto(url);assert.equal(await p.evaluate(()=>localStorage.getItem('project-p.save.v2')),snapshot);await p.evaluate(()=>navigator.serviceWorker.ready);await ctx.setOffline(true);await p.reload();
 await p.getByRole('button',{name:'纪念册',exact:true}).click();await p.getByRole('heading',{name:'有你在的午后',exact:true}).waitFor();await p.getByRole('button',{name:'小屋',exact:true}).click();await p.locator('canvas').waitFor();assert.equal(await p.locator('.cottage-status').getAttribute('data-story'),'done');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('project-p.save.v2')).cottage.furniture.windowFlowers),'gold');
 assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);assert.deepEqual(offScopeRequests,[]);console.log(`PASS Pages ${base}: resource URLs, manifest, SW scope, both stories, browser restart, offline React + Phaser + saves; artifact allowlist clean`);
}finally{if(ctx)await ctx.close();await new Promise(r=>server.close(r))}
