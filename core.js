'use strict';
/* ====================== UTILS ====================== */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const round=(x,d=0)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const DAY=864e5;
const dayKey=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const fromKey=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const fmt=n=>Math.round(n||0).toLocaleString('en-US');
const sum=(a,f=x=>x)=>a.reduce((s,x)=>s+f(x),0);
const avg=a=>a.length?sum(a)/a.length:0;
function fmtTime(s){s=Math.max(0,Math.round(s));const m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0')}
function parseTime(str){
  if(str==null) return NaN; str=String(str).trim(); if(!str) return NaN;
  if(str.includes(':')){const p=str.split(':').map(Number);if(p.some(isNaN))return NaN;return p.reduce((a,b)=>a*60+b,0)}
  return Number(str);
}
function qtyStr(x){ if(!isFinite(x)) return ''; if(x>=100) return String(Math.round(x)); return String(Math.round(x*100)/100) }
function seeded(str){ // deterministic 0..1 generator
  let h=1779033703^str.length; for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return (h>>>0)/4294967296}
}

/* ====================== STATE ====================== */
const KEY='cataclyzm.v1';
const DEFAULTS=()=>({
  v:1, profile:null,
  settings:{units:'imperial',burnCredit:0,restMain:180,restAcc:90,restIso:60,avoid:'',equip:'gym',days:4,mins:60,waterGoalMl:2800,sound:true,hideInstall:false},
  lifts:{}, reps:{}, food:[], custom:[], recent:[], water:{}, weights:[], workouts:[], cardio:[], ready:{},
  tests:{}, testLog:[], active:null, swaps:{}, tdeeOverride:null, created:Date.now()
});
let S=load();
function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){const o=JSON.parse(raw);const d=DEFAULTS();return Object.assign(d,o,{settings:Object.assign(d.settings,o.settings||{})})}
  }catch(e){console.warn('load failed',e)}
  return DEFAULTS();
}
let _saveT=null;
function save(){clearTimeout(_saveT);_saveT=setTimeout(flush,200)}
function flush(){clearTimeout(_saveT);try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){console.warn('save failed',e)}}

/* ====================== UNITS ====================== */
const imp=()=>S.settings.units==='imperial';
const wUnit=()=>imp()?'lb':'kg';
const toDispW=kg=>imp()?kg*KG_LB:kg;
const fromDispW=v=>imp()?v/KG_LB:v;
const fmtW=(kg,d=1)=>(kg==null||isNaN(kg))?'–':(round(toDispW(kg),d))+' '+wUnit();
const numW=(kg,d=1)=>(kg==null||isNaN(kg))?'':String(round(toDispW(kg),d));
const lUnit=()=>imp()?'in':'cm';
const toDispL=cm=>imp()?cm/2.54:cm;
const fromDispL=v=>imp()?v*2.54:v;
function fmtH(cm){if(!cm)return '–';if(!imp())return Math.round(cm)+' cm';const i=Math.round(cm/2.54);return Math.floor(i/12)+"'"+(i%12)+'"'}

/* ====================== FOOD ====================== */
let _fm=null,_fmN=-1;
function foodMap(){ if(_fm&&_fmN===S.custom.length) return _fm; _fm=new Map(); FOODS.forEach(f=>_fm.set(f.id,f)); S.custom.forEach(f=>_fm.set(f.id,f)); _fmN=S.custom.length; return _fm }
const allFoods=()=>FOODS.concat(S.custom);
const getFood=id=>foodMap().get(id);
function toBase(food,qty,unit){
  const d=food.d||1;
  if(unit==='srv') return qty*(food.sv||100);
  if(MASS[unit]!=null){const g=qty*MASS[unit];return food.base==='g'?g:g/d}
  if(VOL[unit]!=null){const ml=qty*VOL[unit];return food.base==='ml'?ml:ml*d}
  return qty;
}
function fromBase(food,amt,unit){
  const d=food.d||1;
  if(unit==='srv') return amt/(food.sv||100);
  if(MASS[unit]!=null){const g=food.base==='g'?amt:amt*d;return g/MASS[unit]}
  if(VOL[unit]!=null){const ml=food.base==='ml'?amt:amt/d;return ml/VOL[unit]}
  return amt;
}
function macrosFor(food,amt){const k=amt/100;return {k:food.k*k,p:food.p*k,c:food.c*k,f:food.f*k}}
function entryDesc(e){
  const u=e.unit==='srv'?(e.sl||'serving'):e.unit;
  return qtyStr(e.qty)+' '+(e.unit==='srv'&&e.qty!==1&&!/^\d/.test(u)?u+'s':u);
}
const dayEntries=dk=>S.food.filter(e=>e.d===dk);
function totals(dk){
  const es=dayEntries(dk);
  return {kcal:sum(es,e=>e.k),p:sum(es,e=>e.p),c:sum(es,e=>e.c),f:sum(es,e=>e.f),n:es.length};
}
function searchFoods(q){
  q=q.trim().toLowerCase(); const list=allFoods();
  if(!q) return list;
  const toks=q.split(/\s+/);
  return list.filter(f=>{const n=f.n.toLowerCase();return toks.every(t=>n.includes(t))})
    .sort((a,b)=>{const an=a.n.toLowerCase().startsWith(toks[0])?0:1,bn=b.n.toLowerCase().startsWith(toks[0])?0:1;return an-bn||a.n.length-b.n.length});
}
function guessMeal(h=new Date().getHours()){return h<11?'breakfast':h<15?'lunch':h<21?'dinner':'snacks'}
const MEALS=[['breakfast','Breakfast'],['lunch','Lunch'],['dinner','Dinner'],['snacks','Snacks']];
function addEntry({food,qty,unit,meal,d,name,amt:amtIn}){
  let e;
  if(food){
    const amt=amtIn!=null?amtIn:toBase(food,qty,unit), m=macrosFor(food,amt);
    e={id:uid(),d,ts:Date.now(),meal,fid:food.id,n:food.n,qty,unit,sl:food.sl,base:food.base,amt,k:m.k,p:m.p,c:m.c,f:m.f};
    S.recent=[food.id].concat(S.recent.filter(x=>x!==food.id)).slice(0,25);
  }
  S.food.push(e); save(); return e;
}

/* ====================== BODY / PLAN ====================== */
function curWeight(){const w=S.weights;if(w.length)return w[w.length-1].kg;return S.profile?S.profile.weightKg:70}
function addWeight(kg,ts=Date.now()){
  const dk=dayKey(new Date(ts));
  S.weights=S.weights.filter(w=>dayKey(new Date(w.ts))!==dk);
  S.weights.push({ts,kg}); S.weights.sort((a,b)=>a.ts-b.ts); save();
}
function bmrOf(p,w){
  if(p.bf){const lbm=w*(1-p.bf/100);return 370+21.6*lbm}
  return 10*w+6.25*p.heightCm-5*p.age+(p.sex==='male'?5:p.sex==='female'?-161:-78);
}
function calcPlan(){
  const p=S.profile; if(!p) return null;
  const w=curWeight(), g=p.goal, notes=[];
  const bmr=Math.round(bmrOf(p,w));
  const maint=Math.round(bmr*ACTIVITY[p.activity].m);
  const tdee=S.tdeeOverride||maint;
  const lbm=p.bf?w*(1-p.bf/100):null;
  let goalW=p.goalWeightKg||w;
  if(g==='fatloss'&&p.bf&&p.goalBf&&p.goalBf<p.bf) goalW=lbm/(1-p.goalBf/100);
  const weeks=p.weeks>0?p.weeks:0;
  const lowBf=p.bf&&((p.sex==='male'&&p.bf<12)||(p.sex!=='male'&&p.bf<20));
  const maxLoss=w*(lowBf?.005:.01), maxGain=w*(g==='muscle'?.004:.006);
  let delta=0, requested=0, diff=0, capped=false;
  if(g==='lose'||g==='fatloss'){
    diff=Math.max(0,w-goalW);
    requested=(weeks&&diff>.05)?diff/weeks:w*.0065;
    const rate=Math.min(requested,maxLoss); capped=requested>maxLoss+1e-9;
    delta=-rate*7700/7;
    if(diff<=.05&&!(g==='fatloss'&&p.goalBf)) notes.push('No goal weight set below your current weight, so a gentle default pace (≈0.65% bodyweight per week) is used.');
  }else if(g==='gain'||g==='muscle'){
    diff=Math.max(0,goalW-w);
    requested=(weeks&&diff>.05)?diff/weeks:w*(g==='muscle'?.0025:.004);
    const rate=Math.min(requested,maxGain); capped=requested>maxGain+1e-9;
    delta=rate*7700/7;
    if(diff<=.05) notes.push('No goal weight set above your current weight, so a gentle default surplus is used.');
  }else if(g==='recomp'){
    const high=p.bf&&((p.sex==='male'&&p.bf>=18)||(p.sex!=='male'&&p.bf>=27));
    delta=high?-.08*tdee:0;
    notes.push(high?'Recomp with a small (~8%) deficit because body fat is on the higher side. Keep protein high and lift heavy.':'Recomp at maintenance calories. Progress is slow and shows up in strength, measurements and the mirror before the scale.');
  }
  if(delta<-.25*tdee){delta=-.25*tdee;capped=true}
  let kcal=Math.round((tdee+delta)/10)*10;
  const floor=p.sex==='male'?1500:p.sex==='female'?1200:1350;
  let floorHit=false;
  if(kcal<floor){kcal=floor;floorHit=true;notes.push('Calories were raised to a safe minimum of '+floor+' kcal. A slower pace or longer timeframe is the better route.')}
  const realDelta=kcal-tdee;
  const rate=realDelta*7/7700; // kg/week (negative = loss)
  const ref=lbm!=null?lbm:w*.85;
  let pr=GOALS[g].protein*ref; pr=Math.max(pr,1.4*w); pr=Math.min(pr,.4*kcal/4);
  pr=Math.round(pr);
  let f=Math.max(.25*kcal/9,.6*w); let c;
  if(4*pr+9*f>kcal){f=Math.max(.4*w,(kcal-4*pr)/9)}
  f=Math.round(f); c=Math.max(0,Math.round((kcal-4*pr-9*f)/4));
  let weeksNeeded=0,finishTs=null;
  if(diff>.05&&Math.abs(rate)>.01){weeksNeeded=diff/Math.abs(rate);finishTs=Date.now()+weeksNeeded*7*DAY}
  if(capped&&weeks&&diff>.05){
    notes.push('Your '+weeks+'-week timeframe would need '+fmtW(Math.abs(requested),2)+'/week, which is faster than is safe or realistic. Calories are paced at about '+fmtW(Math.abs(rate),2)+'/week, so expect roughly '+Math.ceil(weeksNeeded)+' weeks.');
  }else if(weeks&&weeksNeeded&&weeksNeeded>weeks*1.05){
    notes.push('At this pace you would arrive in about '+Math.ceil(weeksNeeded)+' weeks, a little later than your '+weeks+'-week target.');
  }
  return {bmr,maint,tdee,kcal,p:pr,c,f,rate,delta:realDelta,goalW,diff,weeksNeeded,finishTs,notes,floorHit,capped,lbm,usingOverride:!!S.tdeeOverride};
}
/* observed maintenance from weight trend + logged intake */
function adaptive(){
  const ws=S.weights.filter(x=>x.ts>=Date.now()-56*DAY);
  if(ws.length<4) return null;
  const span=(ws[ws.length-1].ts-ws[0].ts)/DAY; if(span<14) return null;
  const t0=ws[0].ts, xs=ws.map(w=>(w.ts-t0)/DAY), ys=ws.map(w=>w.kg);
  const mx=avg(xs), my=avg(ys); let num=0,den=0;
  xs.forEach((x,i)=>{num+=(x-mx)*(ys[i]-my);den+=(x-mx)*(x-mx)});
  const slope=den?num/den:0;
  const byDay={}; S.food.forEach(e=>{if(fromKey(e.d).getTime()>=new Date(t0).setHours(0,0,0,0)&&fromKey(e.d).getTime()<=ws[ws.length-1].ts) byDay[e.d]=(byDay[e.d]||0)+e.k});
  const vals=Object.values(byDay).filter(v=>v>=800);
  if(vals.length<10) return null;
  const a=avg(vals);
  return {est:Math.round((a-slope*7700)/10)*10,avg:Math.round(a),slope:slope*7,n:vals.length,span:Math.round(span)};
}
function burnOn(dk){
  let k=sum(S.cardio.filter(c=>c.d===dk),c=>c.kcal||0);
  S.workouts.forEach(w=>{if(dayKey(new Date(w.ts))===dk) k+=w.kcal||0});
  return k;
}
function targets(dk){
  const pl=calcPlan();
  if(!pl) return {kcal:2000,base:2000,credit:0,p:150,c:200,f:65,none:true};
  const credit=Math.round(S.settings.burnCredit*burnOn(dk));
  return {kcal:pl.kcal+credit,base:pl.kcal,credit,p:pl.p,c:pl.c+Math.round(credit*.8/4),f:pl.f+Math.round(credit*.2/9),none:false};
}
const waterOf=dk=>S.water[dk]||0;

/* ====================== LIFTS ====================== */
const e1rm=(w,r)=>(!w||!r)?0:r===1?w:w*(1+Math.min(r,20)/30);
function liftMax(ref){
  const own=S.lifts[ref]; if(own>0) return {kg:own,est:false};
  const known=Object.keys(LIFT_RATIO).filter(k=>S.lifts[k]>0);
  if(known.length){return {kg:avg(known.map(k=>S.lifts[k]/LIFT_RATIO[k]))*LIFT_RATIO[ref],est:true}}
  if(S.profile){
    const w=curWeight(), b=(S.profile.sex==='female'?.45:.75)*w; // conservative beginner-ish bench
    return {kg:b*LIFT_RATIO[ref],est:true,guess:true};
  }
  return {kg:null,est:true};
}

/* ====================== PROGRESSION / GAMIFICATION ====================== */
function activeDays(){
  const s=new Set(S.food.map(e=>e.d));
  S.workouts.forEach(w=>s.add(dayKey(new Date(w.ts))));
  S.cardio.forEach(c=>s.add(c.d));
  return s;
}
function streak(){
  const s=activeDays(); let d=new Date(), n=0;
  if(!s.has(dayKey(d))) d=addDays(d,-1);
  while(s.has(dayKey(d))){n++;d=addDays(d,-1)}
  return n;
}
function xpTotal(){
  let xp=new Set(S.food.map(e=>e.d)).size*10;
  xp+=S.workouts.length*60+S.cardio.length*15+S.testLog.length*25+S.weights.length*5+Object.keys(S.ready).length*8;
  xp+=Object.values(S.water).filter(v=>v>=S.settings.waterGoalMl).length*5;
  return xp;
}
function levelInfo(){
  const xp=xpTotal(), lvl=Math.floor(Math.sqrt(xp/50))+1;
  const lo=50*(lvl-1)*(lvl-1), hi=50*lvl*lvl;
  return {xp,lvl,pct:(xp-lo)/(hi-lo),toNext:hi-xp};
}
