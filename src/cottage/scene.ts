import Phaser from 'phaser';
import {COLS,ROWS,TILE,furniture,furnitureAt,type Direction} from './map';
import {actorAssets,roomAsset,assetUrl} from './assets';
import {CottageController} from './controller';
const rows:Direction[]=['down','left','right','up'];
export class CottageScene extends Phaser.Scene{
 private actors!:Record<'player'|'penny',Phaser.GameObjects.Sprite>;private flowers!:Phaser.GameObjects.Container;private book!:Phaser.GameObjects.Text;private card!:Phaser.GameObjects.Text;private labels!:Record<'player'|'penny',Phaser.GameObjects.Text>;private flowerColor:string|null=null;
 constructor(public controller:CottageController){super('living-cottage')}
 preload(){for(const [key,a]of Object.entries(actorAssets))if(a.url)this.load.spritesheet(key,assetUrl(a.url),{frameWidth:a.frameWidth,frameHeight:a.frameHeight});if(roomAsset.url)this.load.image('room',assetUrl(roomAsset.url))}
 create(){
 const g=this.add.graphics();g.fillStyle(0xc6ae8d);g.fillRect(0,0,COLS*TILE,ROWS*TILE);g.fillStyle(0xe1dec5);g.fillRect(0,0,COLS*TILE,32);
 for(let y=1;y<ROWS;y++)for(let x=0;x<COLS;x++){g.fillStyle((x+y)%2?0xcdb693:0xc6ac86);g.fillRect(x*TILE,y*TILE,31,31)}
 g.lineStyle(12,0x80745b);g.strokeRect(10,10,300,332);g.fillStyle(0xb6ba91,.6);g.fillRoundedRect(80,213,125,95,25);
 if(this.textures.exists('room'))this.add.image(0,0,'room').setOrigin(0).setDisplaySize(320,352);
 for(const f of furniture){const x=f.x*TILE,y=f.y*TILE,w=f.w*TILE,h=f.h*TILE;g.fillStyle(0x5c4936,.2);g.fillRect(x+4,y+7,w,h);g.fillStyle(f.color);g.fillRoundedRect(x,y,w,h,3);g.lineStyle(3,0x755e43);g.strokeRoundedRect(x,y,w,h,3);
 if(f.id==='shelf'){for(let i=0;i<7;i++){g.fillStyle([0xd9bf82,0x7b9071,0xc58870][i%3]);g.fillRect(x+6+i*7,y+8,5,21)}g.fillStyle(0x6b553e);g.fillRect(x,y+32,w,4)}
 if(f.id==='window'){g.lineStyle(4,0xf7edcf);g.strokeRect(x+4,y+4,w-8,h-8);g.lineBetween(x+w/2,y,x+w/2,y+h);g.fillStyle(0xffedb2);g.fillCircle(x+20,y+13,7)}
 if(f.id==='desk'){g.fillStyle(0xeee4c6);g.fillRect(x+28,y+12,34,23);g.lineStyle(1,0xa9a889);g.lineBetween(x+45,y+12,x+45,y+35)}
 this.add.text(x+w/2,y+h/2+(f.id==='window'?0:10),f.name,{fontFamily:'Microsoft YaHei, sans-serif',fontSize:'11px',color:'#fff9e5',backgroundColor:'#655942'}).setOrigin(.5).setPadding(4,3);
 }
 for(const key of ['player','penny'] as const){if(!this.textures.exists(key)){const sheet=this.textures.createCanvas(key,72,128)!;const c=sheet.context;for(let r=0;r<4;r++)for(let frame=0;frame<3;frame++){const x=frame*24,y=r*32;c.fillStyle=key==='penny'?'#b87543':'#5d5749';c.fillRect(x+5,y+1,14,15);c.fillStyle='#efd5ad';c.fillRect(x+7,y+6,10,10);c.fillStyle=key==='penny'?'#d3b75e':'#6c8991';c.fillRect(x+5,y+17,14,8);c.fillStyle=key==='penny'?'#728969':'#556675';c.fillRect(x+5,y+24,14,4);c.fillStyle='#4e473a';c.fillRect(x+6,y+28,4,frame===1?2:4);c.fillRect(x+14,y+28,4,frame===2?2:4);if(r!==3){c.fillRect(x+(r===1?7:r===2?15:8),y+10,2,2);if(r===0)c.fillRect(x+14,y+10,2,2)}}sheet.refresh();for(let r=0;r<4;r++)for(let f=0;f<3;f++)sheet.add(r*3+f,0,f*24,r*32,24,32)} }
 this.actors={player:this.add.sprite(0,0,'player',0).setOrigin(.5,1),penny:this.add.sprite(0,0,'penny',0).setOrigin(.5,1)};
 this.labels={player:this.add.text(0,0,'你',{fontSize:'10px',color:'#fffef0',backgroundColor:'#52654f'}).setOrigin(.5,0),penny:this.add.text(0,0,'潘妮',{fontFamily:'sans-serif',fontSize:'10px',color:'#fffef0',backgroundColor:'#866649'}).setOrigin(.5,0)};
 this.book=this.add.text(0,0,'▤',{fontSize:'17px',color:'#f7e2b8',backgroundColor:'#6d7959'}).setOrigin(.5);
 this.card=this.add.text(258,233,'♡',{fontSize:'20px',color:'#f5e3b3'});
 this.flowers=this.add.container(207,43);const stems=this.add.graphics();stems.lineStyle(2,0x6d8957);stems.lineBetween(0,8,-5,-5);stems.lineBetween(0,8,6,-8);stems.fillStyle(0xb88061);stems.fillRect(-6,5,13,12);this.flowers.add(stems);for(const p of [{x:-5,y:-6},{x:7,y:-9},{x:0,y:-12}])this.flowers.add(this.add.circle(p.x,p.y,4,0xedc968));
 this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{const point={x:Math.floor(p.x/TILE),y:Math.floor(p.y/TILE)};const npc=this.controller.visual('penny');if(Math.abs(p.x-(npc.x*32+16))<17&&Math.abs(p.y-(npc.y*32+8))<24){this.controller.approach('penny');return}const f=furnitureAt(point);if(f)this.controller.approach(f.id);else this.controller.moveTo(point)});
 }
 update(time:number,delta:number){this.controller.update(delta);const state=this.controller.bridge.get();for(const key of ['player','penny']as const){const p=this.controller.visual(key),frame=rows.indexOf(p.facing)*3+(p.moving&&state.settings.animation?1+Math.floor(time/120)%2:0);this.actors[key].setPosition(p.x*32+16,p.y*32+27).setFrame(frame).setDepth(p.y*32+50);this.labels[key].setPosition(p.x*32+16,p.y*32+29).setDepth(500)}
 const p=this.controller.visual('penny');this.book.setPosition(p.x*32+16,p.y*32+15).setVisible(['reading','arrange'].includes(this.controller.pose)).setDepth(501);this.card.setVisible(!!state.display);const color=state.cottage.furniture.windowFlowers;this.flowers.setVisible(!!color);if(color!==this.flowerColor){this.flowerColor=color;this.flowers.list.slice(1).forEach(o=>(o as Phaser.GameObjects.Arc).setFillStyle(color==='pink'?0xdd94a0:0xedc968))}}
}

