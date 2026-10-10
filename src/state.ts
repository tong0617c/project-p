import { initialCottage, parseCottage, cottageReduce, FLOWER_EVENT, type Cottage, type CottageAction } from './cottage/model';
export const IDS = { invitation: 'letter.first-card.invitation', card: 'card.first-memory', invite: 'message.first-card.invite', followup: 'message.first-card.thanks', read: 'event.invitation.read', crafted: 'event.first-card.crafted', placed: 'event.first-card.displayed' } as const;
export type Card = { id: typeof IDS.card; title: string; note: string; color: 'rose' | 'sage' | 'honey'; createdAt: string };
export type State = { version: 2; cottage: Cottage; events: string[]; replies: Record<string,string>; cards: Card[]; display: string | null; settings: { sound: boolean; animation: boolean } };
export const initialState = (): State => ({version:2,cottage:initialCottage(),events:[],replies:{},cards:[],display:null,settings:{sound:false,animation:true}});
export type Action = CottageAction | {type:'read'} | {type:'craft'; title:string; note:string; color:Card['color']} | {type:'place'} | {type:'unplace'} | {type:'reply'; id:string; value:string} | {type:'settings'; key:'sound'|'animation'; value:boolean};
export function reduce(s:State,a:Action):State {
 const event=(id:string)=>s.events.includes(id)?s.events:[...s.events,id];
 if(['positions','story-start','story-next','story-choice'].includes(a.type)){const cottage=cottageReduce(s.cottage,a as CottageAction);if(cottage===s.cottage)return s;return {...s,cottage,events:cottage.story.step==='done'?event(FLOWER_EVENT):s.events};}
 switch(a.type){
 case 'read': return {...s,events:event(IDS.read)};
 case 'craft': if(!s.events.includes(IDS.read)||s.cards.length||!a.title.trim())return s; return {...s,events:event(IDS.crafted),cards:[{id:IDS.card,title:a.title.trim().slice(0,30),note:a.note.trim().slice(0,160),color:a.color,createdAt:new Date().toISOString()}]};
 case 'place': if(!s.cards.some(c=>c.id===IDS.card))return s; return {...s,display:IDS.card,events:event(IDS.placed)};
 case 'unplace': return {...s,display:null};
 case 'reply': if(![IDS.invite,IDS.followup].includes(a.id as typeof IDS.invite)||s.replies[a.id]||(a.id===IDS.followup&&!s.events.includes(IDS.placed)))return s; return {...s,replies:{...s.replies,[a.id]:a.value}};
 case 'settings':return {...s,settings:{...s.settings,[a.key]:a.value}};
 default:return s;
 }
}
export function parseSave(raw:string):State {
 if(raw.length>100000)throw new Error('存档过大。');
 const s=JSON.parse(raw);
 const allowed:string[]=[IDS.read,IDS.crafted,IDS.placed,...(s?.version===2?[FLOWER_EVENT]:[])];
 if(![1,2].includes(s?.version)||!Array.isArray(s.events)||s.events.some((e:unknown)=>!allowed.includes(e as typeof IDS.read))||new Set(s.events).size!==s.events.length||!Array.isArray(s.cards)||s.cards.length>1||typeof s.settings?.sound!=='boolean'||typeof s.settings?.animation!=='boolean'||!s.replies||typeof s.replies!=='object'||Array.isArray(s.replies))throw new Error('存档格式或版本不兼容。');
 for(const c of s.cards) if(c.id!==IDS.card||typeof c.title!=='string'||!c.title.trim()||c.title.length>30||typeof c.note!=='string'||c.note.length>160||!['rose','sage','honey'].includes(c.color)||typeof c.createdAt!=='string'||!Number.isFinite(Date.parse(c.createdAt)))throw new Error('纪念卡数据无效。');
 if(s.display!==null&&s.display!==IDS.card)throw new Error('展示数据无效。');
 if((s.cards.length===1)!==s.events.includes(IDS.crafted)||(s.events.includes(IDS.crafted)&&!s.events.includes(IDS.read))||(s.events.includes(IDS.placed)&&!s.cards.length)||(s.display&&!s.events.includes(IDS.placed)))throw new Error('剧情进度不一致。');
 for(const [id,value] of Object.entries(s.replies))if(![IDS.invite,IDS.followup].includes(id as typeof IDS.invite)||typeof value!=='string'||value.length>100||(id===IDS.followup&&!s.events.includes(IDS.placed)))throw new Error('消息数据无效。');
 return {version:2,cottage:s.version===1?initialCottage():parseCottage(s.cottage,s.events),events:s.events,replies:s.replies,cards:s.cards,display:s.display,settings:{sound:s.settings.sound,animation:s.settings.animation}};
}
export const LEGACY_KEY='project-p.save.v1';
export const SAVE_KEY='project-p.save.v2';
export function readStorage(storage:Pick<Storage,'getItem'>):State {const raw=storage.getItem(SAVE_KEY)??storage.getItem(LEGACY_KEY);return raw?parseSave(raw):initialState();}
export function writeStorage(storage:Pick<Storage,'setItem'>,s:State){storage.setItem(SAVE_KEY,JSON.stringify(s));}
