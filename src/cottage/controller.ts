import {adjacent,distance,furniture,pathfind,same,vectors,walkable,type Direction,type Point,type FurnitureId} from './map';
import {flowerScript,type Cottage} from './model';
import type {Action,State} from '../state';
type Actor=Cottage['player'];
type Motion={from:Actor;to:Actor;elapsed:number};
export type Target=FurnitureId|'penny';
export type Bridge={get:()=>State;act:(a:Action)=>boolean;interact:(t:Target)=>void;message:(s:string)=>void;locked:()=>boolean};
export class CottageController{
 player:Actor;penny:Actor;route:Point[]=[];npcRoute:Point[]=[];target:Target|null=null;held:Direction|null=null;motion:Motion|null=null;npcMotion:Motion|null=null;paused=false;failed=false;pose='idle';private idleMs=0;private actionMs=0;private roamIndex=0;
 constructor(public bridge:Bridge){const c=bridge.get().cottage;this.player={...c.player};this.penny={...c.penny}}
 get storyActive(){return !['available','done'].includes(this.bridge.get().cottage.story.step)}
 get locked(){return this.paused||this.failed||this.bridge.locked()||this.storyActive}
 cancel(){this.route=[];this.target=null;this.motion=null}
 manual(d:Direction){if(this.locked)return;this.cancel();this.held=d;const v=vectors[d],next={x:this.player.x+v.x,y:this.player.y+v.y};if(walkable(next,[this.penny,...(this.npcMotion?[this.npcMotion.to]:[])]))this.motion=this.makeMotion(this.player,next)}
 release(){this.held=null}
 suspend(){this.paused=true;this.release();this.cancel();this.npcMotion=null;this.npcRoute=[]}
 resume(){this.paused=false}
 moveTo(p:Point){if(this.locked)return;this.release();this.cancel();const route=pathfind(this.player,[p],[this.penny,...(this.npcMotion?[this.npcMotion.to]:[])]);if(route===null){this.bridge.message('这里走不到，试试空着的地板。');return}this.route=route;this.bridge.message('正在走过去…')}
 approach(target:Target){if(this.locked)return;this.release();this.cancel();if(target==='penny'){this.npcMotion=null;this.npcRoute=[]}const goals=target==='penny'?adjacent(this.penny):furniture.find(f=>f.id===target)!.spots;
 const route=pathfind(this.player,goals,[this.penny,...(this.npcMotion?[this.npcMotion.to]:[])]);if(route===null){this.bridge.message('通道暂时被挡住了，请换个位置再试。');return}this.target=target;this.route=route;this.bridge.message(target==='penny'?'走到潘妮身边…':'正在走到家具旁…');if(!route.length)this.arrive()}
 interactNearby(){if(this.locked)return;if(distance(this.player,this.penny)===1){this.arrival('penny');return}const f=furniture.find(f=>f.spots.some(p=>same(p,this.player)));if(f)this.arrival(f.id);else this.bridge.message('靠近潘妮或家具，或者点击它们自动走近。')}
 private arrival(t:Target){this.release();this.cancel();this.bridge.interact(t)}
 private arrive(){const t=this.target;this.target=null;if(t)this.arrival(t);else this.bridge.message('到了。')}
 private makeMotion(from:Actor,to:Point):Motion {const dx=to.x-from.x,dy=to.y-from.y;return {from:{...from},to:{...to,facing:dx>0?'right':dx<0?'left':dy>0?'down':'up'},elapsed:0}}
 private save(player:Actor,penny:Actor){if(!this.bridge.act({type:'positions',player,penny})){this.failed=true;this.cancel();this.npcMotion=null;this.release();return false}this.player=player;this.penny=penny;return true}
 private advance(actor:'player'|'penny',dt:number){const m=actor==='player'?this.motion:this.npcMotion;if(!m)return;m.elapsed+=dt;if(m.elapsed<180)return;
 if(this.save(actor==='player'?m.to:this.player,actor==='penny'?m.to:this.penny)){if(actor==='player'){this.motion=null;if(!this.route.length&&!this.held)this.arrive()}else this.npcMotion=null}}
 update(delta:number){const dt=Math.min(delta,50);if(this.paused||this.failed||this.bridge.locked())return;
 const step=this.bridge.get().cottage.story.step;
 if(this.storyActive){this.release();this.cancel();this.npcRoute=[];
 if(step==='walk'){
 this.pose='walking';if(this.npcMotion){this.advance('penny',dt);return}
 const goals=[flowerScript.walk.target,...furniture.find(f=>f.id==='window')!.spots];const route=pathfind(this.penny,goals,[this.player]);if(route===null){this.bridge.message('演出路线受阻，请退出小屋后重试。');return}if(!route.length){this.pose='idle';this.bridge.act({type:'story-next'});return}this.npcMotion=this.makeMotion(this.penny,route[0]);
 }else if(step==='arrange'){this.npcMotion=null;this.pose='arrange';this.actionMs+=dt;if(this.actionMs>=flowerScript.arrange.duration){this.actionMs=0;this.bridge.act({type:'story-next'})}}
 else{this.npcMotion=null;this.pose='idle'}return;
 }
 if(this.motion)this.advance('player',dt);
 if(!this.motion){let next:Point|undefined;if(this.held){const v=vectors[this.held];next={x:this.player.x+v.x,y:this.player.y+v.y}}else next=this.route.shift();if(next){if(walkable(next,[this.penny,...(this.npcMotion?[this.npcMotion.to]:[])]))this.motion=this.makeMotion(this.player,next);else{this.route=[];this.target=null;this.bridge.message('前面有障碍物。')}}}
 if(this.npcMotion){this.pose='walking';this.advance('penny',dt)}
 if(this.target==='penny')return;
 if(!this.npcMotion){if(this.npcRoute.length){const next=this.npcRoute.shift()!;if(walkable(next,[this.player,...(this.motion?[this.motion.to]:[])]))this.npcMotion=this.makeMotion(this.penny,next);else this.npcRoute=[]}else{this.idleMs+=dt;this.pose=this.idleMs<2500?'idle':'reading';if(this.idleMs>6000){this.idleMs=0;const spots=[{x:2,y:3},{x:7,y:3},{x:7,y:5}];this.npcRoute=pathfind(this.penny,[spots[this.roamIndex++%spots.length]],[this.player,...(this.motion?[this.motion.to]:[])])??[]}}}
 }
 visual(actor:'player'|'penny'){const m=actor==='player'?this.motion:this.npcMotion,p=this[actor];if(!m)return {...p,moving:false};const t=Math.min(m.elapsed/180,1);return {x:m.from.x+(m.to.x-m.from.x)*t,y:m.from.y+(m.to.y-m.from.y)*t,facing:m.to.facing,moving:true}}
}

