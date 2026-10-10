import {chromium,browserOptions} from './browser.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch(browserOptions);const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const legacy={version:1,events:['event.invitation.read','event.first-card.crafted','event.first-card.displayed'],replies:{'message.first-card.invite':'好呀，我现在就去看看。'},cards:[{id:'card.first-memory',title:'0.1 的纪念',note:'请保留这份回忆',color:'sage',createdAt:'2026-10-09T10:00:00.000Z'}],display:'card.first-memory',settings:{sound:false,animation:true}};
await ctx.addInitScript(raw=>{if(!localStorage.getItem('project-p.save.v1'))localStorage.setItem('project-p.save.v1',raw)},JSON.stringify(legacy));
const click=name=>page.getByRole('button',{name,exact:true}).click();
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('project-p.save.v2')));
const status=page.locator('.cottage-status');
async function waitStory(step){await page.waitForFunction(step=>document.querySelector('.cottage-status')?.getAttribute('data-story')===step,step)}
async function canvasTile(x,y){const b=await page.locator('canvas').boundingBox();assert.ok(b);await page.touchscreen.tap(b.x+(x+.5)*b.width/10,b.y+(y+.5)*b.height/11)}
try{
 await page.goto('http://127.0.0.1:5173');await click('小屋');await page.locator('canvas').waitFor();await page.getByRole('button',{name:'向左移动',exact:true}).waitFor();
 await page.getByRole('button',{name:'向左移动',exact:true}).tap();await page.waitForFunction(()=>document.querySelector('.cottage-status')?.getAttribute('data-player')==='3,8');
 await canvasTile(8,9);await page.getByRole('button',{name:'向上移动',exact:true}).tap();await page.waitForTimeout(700);assert.notEqual((await saved()).cottage.player.x,8);
 await click('小屋菜单');const paused=JSON.stringify((await saved()).cottage);await page.keyboard.press('ArrowRight');await page.waitForTimeout(400);assert.equal(JSON.stringify((await saved()).cottage),paused);
 await click('继续探索');await canvasTile(4,4);await page.getByRole('heading',{name:'共同工坊',exact:true}).waitFor();assert.ok(await page.getByRole('heading',{name:'0.1 的纪念',exact:true}).isVisible());
 await click('小屋');await page.locator('canvas').waitFor();await click('小屋菜单');await click('潘妮');await waitStory('invite');
 const locked=JSON.stringify((await saved()).cottage);await page.keyboard.press('ArrowLeft');await canvasTile(8,9);await page.waitForTimeout(300);assert.equal(JSON.stringify((await saved()).cottage),locked);
 assert.equal(await page.getByRole('button',{name:'向上移动',exact:true,includeHidden:true}).isDisabled(),true);
 await click('好呀，继续');await click('柔和的粉色花');await waitStory('walk');
 await page.reload();await click('小屋');await waitStory('thanks');await page.screenshot({path:'tests/living-story-mobile.png',fullPage:true});await click('一起留下这份回忆');await waitStory('done');
 let s=await saved();assert.equal(s.cottage.furniture.windowFlowers,'pink');assert.equal(s.events.filter(x=>x==='event.cottage.window-flowers').length,1);assert.deepEqual(s.cards,legacy.cards);assert.equal(await page.evaluate(()=>localStorage.getItem('project-p.save.v1')),JSON.stringify(legacy));
 await page.reload();await click('小屋');await waitStory('done');assert.equal((await saved()).cottage.furniture.windowFlowers,'pink');
 await click('小屋菜单');await click('潘妮');await page.getByRole('status').filter({hasText:'窗边的花还在呢'}).waitFor();assert.equal((await saved()).events.filter(x=>x==='event.cottage.window-flowers').length,1);
 await page.screenshot({path:'tests/living-room-mobile.png',fullPage:true});
 const box=await page.locator('canvas').boundingBox(),pad=await page.locator('.direction-pad').boundingBox();assert.ok(pad.y>=box.y+box.height);
 for(const width of [320,390,1024]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
 assert.deepEqual(errors,[]);console.log('PASS: legacy preserved, touch tap movement, manual cancellation, menu/dialog locks, canvas furniture path, old card UI, story checkpoint reload, permanent furniture, no duplicate reward, separate touch controls and responsive layout');
}finally{await browser.close()}

