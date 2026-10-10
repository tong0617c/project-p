import {useEffect,useRef,useState} from 'react';
import Phaser from 'phaser';
import type {State,Action} from '../state';
import {CottageController,type Target} from './controller';
import {CottageScene} from './scene';
import {flowerScript} from './model';
import {furniture,type Direction} from './map';
import './cottage.css';
type Props={state:State;getState:()=>State;act:(a:Action)=>boolean;blocked:boolean;open:(p:'journal'|'mail'|'display'|'workshop')=>void};
export default function CottageRoom(props:Props){
 const host=useRef<HTMLDivElement>(null),controller=useRef<CottageController|null>(null),latest=useRef(props);latest.current=props;
 const [message,setMessage]=useState('点地板走过去，点家具自动走近。'),[menu,setMenu]=useState(false),[ready,setReady]=useState(false),[loadError,setLoadError]=useState('');
 const menuRef=useRef(false);const c=props.state.cottage,active=!['available','done'].includes(c.story.step);
 function interact(t:Target){if(t==='penny'){if(latest.current.getState().cottage.story.step==='done')setMessage('潘妮：窗边的花还在呢，每次看见都会想起你。');else latest.current.act({type:'story-start'});return}if(t==='shelf'){if(controller.current)controller.current.pose='reading';setMessage('书架上放着潘妮读到一半的书。')}else if(t==='window')setMessage(latest.current.getState().cottage.furniture.windowFlowers?'我们一起放好的花，把阳光也染上了颜色。':'窗台还空着。也许潘妮有个小小的主意。');else latest.current.open(t==='desk'?'workshop':t==='mail'?'mail':'display')}
 useEffect(()=>{
 let disposed=false;const motor=new CottageController({get:()=>latest.current.getState(),act:a=>latest.current.act(a),interact:t=>interact(t),message:s=>{if(!disposed)setMessage(s)},locked:()=>menuRef.current||latest.current.blocked});controller.current=motor;
 const scene=new CottageScene(motor);let game:Phaser.Game|null=null;const bootTimer=window.setTimeout(()=>{if(disposed)return;try{game=new Phaser.Game({type:Phaser.CANVAS,parent:host.current!,width:320,height:352,pixelArt:true,antialias:false,backgroundColor:'#d4c4a4',scene,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},callbacks:{postBoot:()=>{if(!disposed)setReady(true)}}});}catch{setLoadError('场景加载失败，请返回手账后重试。')}},0);
 const keyMap:Record<string,Direction>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
 const down=(e:KeyboardEvent)=>{const d=keyMap[e.key];if(d){e.preventDefault();if(!e.repeat)motor.manual(d)}if(e.key===' '&&!e.repeat){e.preventDefault();motor.interactNearby()}};
 const up=(e:KeyboardEvent)=>{if(keyMap[e.key]===motor.held)motor.release()};
 const blur=()=>motor.suspend(),focus=()=>{if(!document.hidden)motor.resume()},visibility=()=>document.hidden?blur():focus();
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',visibility);

 return()=>{disposed=true;window.clearTimeout(bootTimer);motor.suspend();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',visibility);game?.destroy(true);controller.current=null};
 },[]);
 function toggleMenu(value:boolean){menuRef.current=value;setMenu(value);if(value)controller.current?.suspend();else controller.current?.resume()}
 function approach(t:Target){toggleMenu(false);controller.current?.approach(t)}
 const locked=menu||active||props.blocked||!ready;
 return <section className={"living-cottage "+(active?"in-story":"")} aria-label="可探索的小屋"><div className="cottage-topline"><span>午后 · 单间小屋</span><span>{c.furniture.windowFlowers?'✿ 窗边已有鲜花':'第 02 章 · 窗边的一束花'}</span></div>
 <div className="game-host" ref={host} role="img" aria-label="小屋地图：点击地板移动，点击家具自动走近"/>
 <div className="cottage-status" role="status" data-player={`${c.player.x},${c.player.y}`} data-penny={`${c.penny.x},${c.penny.y}`} data-story={c.story.step}>{loadError||message}</div>
 <div className="cottage-controls"><div className="direction-pad" aria-label="触摸方向键">{(['up','left','down','right'] as const).map((d,i)=><button key={d} className={d} aria-label={['向上移动','向左移动','向下移动','向右移动'][i]} disabled={locked} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controller.current?.manual(d)}} onPointerUp={()=>controller.current?.release()} onPointerCancel={()=>controller.current?.release()} onLostPointerCapture={()=>controller.current?.release()} onContextMenu={e=>e.preventDefault()}>{['↑','←','↓','→'][i]}</button>)}</div><div className="cottage-actions"><button className="primary" disabled={locked} onClick={()=>controller.current?.interactNearby()}>互动</button><button className="secondary" onClick={()=>toggleMenu(true)}>小屋菜单</button></div></div>
 <p className="cottage-help">方向键 / WASD · 手动操作取消寻路 · 空格互动</p>
 {active&&!menu&&<div className="story-panel" role="dialog" aria-label="窗边的一束花" aria-modal="false"><small>窗边的一束花 · {c.story.step==='walk'?'正在走向窗边':c.story.step==='arrange'?'正在整理花束':'潘妮'}</small><p>{c.story.step==='walk'?'跟我来，我们把花放在有阳光的地方。':c.story.step==='arrange'?'潘妮轻轻整理着花瓣……':c.story.step==='invite'?flowerScript.invite.text:c.story.step==='choice'?flowerScript.choice.text:flowerScript.thanks.text}</p>{c.story.step==='choice'?<div className="story-choices"><button onClick={()=>props.act({type:'story-choice',choice:'gold'})}>温暖的金色花</button><button onClick={()=>props.act({type:'story-choice',choice:'pink'})}>柔和的粉色花</button></div>:['invite','thanks'].includes(c.story.step)?<button className="primary" onClick={()=>props.act({type:'story-next'})}>{c.story.step==='thanks'?'一起留下这份回忆':'好呀，继续'}</button>:<span className="muted">演出中 · 角色输入已暂停</span>}<button className="story-menu-button" onClick={()=>toggleMenu(true)}>小屋菜单</button><small className="checkpoint">已保存剧情检查点，可安全离开后继续</small></div>}
 {menu&&<div className="cottage-menu" role="dialog" aria-label="小屋菜单"><div className="menu-title"><h2>小屋菜单</h2><button onClick={()=>toggleMenu(false)}>继续探索</button></div><p>场景已暂停，位置和剧情已自动保存。</p><button className="primary" onClick={()=>props.open('journal')}>打开随身手账</button><h3>自动走近</h3><div className="destination-list">{furniture.map(f=><button key={f.id} disabled={active||props.blocked} onClick={()=>approach(f.id)}>{f.name}</button>)}<button disabled={active||props.blocked} onClick={()=>approach('penny')}>潘妮</button></div>{active&&<p>演出尚未结束；继续探索可恢复剧情。</p>}</div>}
 </section>
}

