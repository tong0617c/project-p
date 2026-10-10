import {chromium,browserOptions} from './browser.mjs';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const profile=await mkdtemp(join(tmpdir(),'project-p-qa-'));
const opts={...browserOptions,viewport:{width:390,height:844}};
let ctx=await chromium.launchPersistentContext(profile,opts);
try{
 let p=await ctx.newPage();await p.goto('http://127.0.0.1:4173');await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();
 await p.getByRole('button',{name:'手账',exact:true}).click();await p.getByRole('button',{name:/小屋信箱/}).click();await p.getByRole('button',{name:/TO YOU, WITH WARMTH/}).click();await p.getByRole('button',{name:'去制作纪念卡 →',exact:true}).click();await p.getByRole('button',{name:'✧ 完成并收藏纪念卡',exact:true}).click();await p.getByRole('button',{name:'去展示柜摆放 →',exact:true}).click();await p.getByRole('button',{name:'摆放《有你在的午后》',exact:true}).click();
 await p.getByRole('button',{name:'小屋',exact:true}).click();await p.locator('canvas').waitFor();await p.getByRole('button',{name:'小屋菜单',exact:true}).click();await p.getByRole('button',{name:'潘妮',exact:true}).click();await p.getByRole('button',{name:'好呀，继续',exact:true}).click();await p.getByRole('button',{name:'温暖的金色花',exact:true}).click();await p.getByRole('button',{name:'一起留下这份回忆',exact:true}).click();
 const before=await p.evaluate(()=>localStorage.getItem('project-p.save.v2'));await ctx.close();
 ctx=await chromium.launchPersistentContext(profile,opts);p=await ctx.newPage();await p.goto('http://127.0.0.1:4173');assert.equal(await p.evaluate(()=>localStorage.getItem('project-p.save.v2')),before);
 await p.evaluate(()=>navigator.serviceWorker.ready);await ctx.setOffline(true);await p.reload();await p.getByRole('button',{name:'纪念册',exact:true}).click();await p.getByRole('heading',{name:'有你在的午后',exact:true}).waitFor();await p.getByRole('button',{name:'到展示柜看看 →',exact:true}).click();await p.getByRole('button',{name:'查看潘妮的后续消息 →',exact:true}).click();assert.ok(await p.getByText(/我看到展示柜里的《有你在的午后》了/).isVisible());
 await p.getByRole('button',{name:'小屋',exact:true}).click();await p.locator('canvas').waitFor();assert.equal(await p.locator('.cottage-status').getAttribute('data-story'),'done');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('project-p.save.v2')).cottage.furniture.windowFlowers),'gold');
 console.log('PASS: production service worker, full browser-process restart persistence, offline reload and completed story');
}finally{await ctx.close()}
