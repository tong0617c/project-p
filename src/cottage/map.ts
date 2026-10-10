export type Point = {x:number;y:number};
export type Direction = 'up'|'down'|'left'|'right';
export const TILE=32, COLS=10, ROWS=11;
export const vectors:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
export const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;
export const distance=(a:Point,b:Point)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export type FurnitureId='desk'|'shelf'|'mail'|'cabinet'|'window';
export type Furniture={id:FurnitureId;name:string;x:number;y:number;w:number;h:number;spots:Point[];color:number};
export const furniture:Furniture[]=[
 {id:'shelf',name:'书架',x:1,y:1,w:2,h:2,spots:[{x:1,y:3},{x:2,y:3}],color:0x8b7356},
 {id:'window',name:'窗边',x:5,y:1,w:3,h:1,spots:[{x:6,y:2},{x:7,y:2},{x:5,y:2}],color:0xa9c9b9},
 {id:'desk',name:'写字桌',x:4,y:4,w:3,h:2,spots:[{x:4,y:6},{x:5,y:6},{x:6,y:6},{x:3,y:4}],color:0xb48e64},
 {id:'mail',name:'邮箱',x:1,y:6,w:1,h:1,spots:[{x:2,y:6},{x:1,y:7}],color:0xa87559},
 {id:'cabinet',name:'展示柜',x:7,y:7,w:2,h:2,spots:[{x:6,y:7},{x:7,y:6},{x:8,y:6}],color:0x967952},
];
export function furnitureAt(p:Point){return furniture.find(f=>p.x>=f.x&&p.x<f.x+f.w&&p.y>=f.y&&p.y<f.y+f.h)}
export function walkable(p:Point,occupied:Point[]=[]){return Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<COLS-1&&p.y>=1&&p.y<ROWS-1&&!furnitureAt(p)&&!occupied.some(q=>same(p,q))}
// Breadth-first search is optimal for this small, equally weighted four-way grid.
export function pathfind(start:Point,goals:Point[],occupied:Point[]=[]):Point[]|null{
 const targets=goals.filter(g=>walkable(g,occupied));if(targets.some(g=>same(g,start)))return [];
 const key=(p:Point)=>`${p.x},${p.y}`,queue:Point[]=[start],parents=new Map<string,Point|null>([[key(start),null]]);
 for(let i=0;i<queue.length;i++){const p=queue[i];for(const v of Object.values(vectors)){const n={x:p.x+v.x,y:p.y+v.y};if(!walkable(n,occupied)||parents.has(key(n)))continue;parents.set(key(n),p);if(targets.some(g=>same(g,n))){const path:Point[]=[];let c:Point|null=n;while(c&&!same(c,start)){path.unshift(c);c=parents.get(key(c))??null}return path}queue.push(n)}}return null;
}
export const adjacent=(p:Point)=>Object.values(vectors).map(v=>({x:p.x+v.x,y:p.y+v.y})).filter(q=>walkable(q));
