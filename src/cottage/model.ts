import { type Direction,type Point,walkable,same } from './map';
export const FLOWER_EVENT='event.cottage.window-flowers';
export type StoryStep='available'|'invite'|'choice'|'walk'|'arrange'|'thanks'|'done';
export type Cottage={player:Point & {facing:Direction};penny:Point & {facing:Direction};story:{step:StoryStep;choice:'gold'|'pink'|null};furniture:{windowFlowers:'gold'|'pink'|null}};
export const initialCottage=():Cottage=>({player:{x:4,y:8,facing:'up'},penny:{x:3,y:3,facing:'down'},story:{step:'available',choice:null},furniture:{windowFlowers:null}});
export function parseCottage(c:Cottage,events:string[]):Cottage{
 const actor=(p:Cottage['player'])=>p&&walkable(p)&&['up','down','left','right'].includes(p.facing);
 if(!c||!actor(c.player)||!actor(c.penny)||same(c.player,c.penny)||!c.story||!['available','invite','choice','walk','arrange','thanks','done'].includes(c.story.step)||![null,'gold','pink'].includes(c.story.choice)||!c.furniture||![null,'gold','pink'].includes(c.furniture.windowFlowers))throw new Error('小屋存档无效。');
 const chosen=['walk','arrange','thanks','done'].includes(c.story.step);
 if(chosen!==!!c.story.choice||(c.story.step==='done')!==events.includes(FLOWER_EVENT)||(c.story.step==='done'?c.furniture.windowFlowers!==c.story.choice:c.furniture.windowFlowers!==null))throw new Error('小屋剧情与家具状态不一致。');
 return {player:{...c.player},penny:{...c.penny},story:{...c.story},furniture:{...c.furniture}};
}
export type CottageAction={type:'positions';player:Cottage['player'];penny:Cottage['penny']}|{type:'story-start'}|{type:'story-next'}|{type:'story-choice';choice:'gold'|'pink'};
export function cottageReduce(c:Cottage,a:CottageAction):Cottage{
 switch(a.type){
 case 'positions':if(!walkable(a.player)||!walkable(a.penny)||same(a.player,a.penny))return c;return {...c,player:a.player,penny:a.penny};
 case 'story-start':return c.story.step==='available'?{...c,story:{step:'invite',choice:null}}:c;
 case 'story-choice':return c.story.step==='choice'?{...c,story:{step:'walk',choice:a.choice}}:c;
 case 'story-next':{const next:Partial<Record<StoryStep,StoryStep>>={invite:'choice',walk:'arrange',arrange:'thanks',thanks:'done'};const step=next[c.story.step];if(!step)return c;return {...c,story:{...c.story,step},furniture:step==='done'?{windowFlowers:c.story.choice}:c.furniture};}
 }
}
// Declarative scene commands: actor movement, action, dialogue and choices.
export const flowerScript={
 invite:{kind:'dialogue',speaker:'潘妮',text:'我找到了一小束花。可以陪我把它放到窗边吗？这样每次回来，都能看见一点颜色。'},
 choice:{kind:'choice',speaker:'潘妮',text:'你觉得哪一种颜色更适合这间小屋？'},
 walk:{kind:'move',actor:'penny',target:{x:6,y:2}},
 arrange:{kind:'action',actor:'penny',action:'arrange',duration:1000},
 thanks:{kind:'dialogue',speaker:'潘妮',text:'好了。谢谢你陪我一起，让这里变得更像我们的家。'},
} as const;
