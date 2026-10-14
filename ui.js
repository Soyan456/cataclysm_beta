'use strict';
/* ====================== UI STATE ====================== */
const UI={tab:'home',foodDate:dayKey(),coach:'eat',foodTab:'all',foodQ:'',pick:null,pf:null,exFilter:'all',exQ:''};
const NAV=[['home','Today','home'],['food','Food','food'],['train','Train','train'],['coach','Coach','coach'],['rank','Rank','rank'],['me','Profile','me']];
const ICONS={
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  food:'<path d="M12 7.5c-2-2-6-1.2-6 3.8 0 5 3 8.7 6 8.7s6-3.700 6-8.700c0-5-4-5.800-6-3.800z"/><path d="M12 7.500c0-2 1-3.500 3-4.500"/>',
  train:'<path d="M6.5 6.500v11M17.500 6.500v11M3.500 9v6M20.500 9v6M6.500 12h11"/>',
  coach:'<path d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1 5.900-5.200-2.800-5.200 2.800 1-5.900L3.500 9.700l5.900-.8z"/>',
  rank:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6"/>',
  me:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
  check:'<path d="M5 12.500l4.500 4.500L19 7.500"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  flame:'<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  drop:'<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
  scale:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.500 9a5 5 0 0 1 7 0M12 12l2-2"/>',
  left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',
  swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',more:'<circle cx="5" cy="12" r="1.500"/><circle cx="12" cy="12" r="1.500"/><circle cx="19" cy="12" r="1.500"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.500 2M9 3h6"/>',play:'<path d="M7 4.500l12 7.500-12 7.500z"/>',
  bolt:'<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',alert:'<path d="M12 4l9 16H3zM12 10v4M12 17.500v.01"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13.500 6.500l4 4"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  heart:'<path d="M12 20s-7-4.500-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.500-7 10-7 10z"/>',
};
const ic=(n,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||''}</svg>`;
const $v=()=>$('#view');

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2300)}
function modal(html,tall=false){
  $('#modal-root').innerHTML=`<div class="scrim" data-act="closeModal"></div><div class="sheet${tall?' tall':''}" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  document.body.classList.add('noscroll');
}
function closeModal(){$('#modal-root').innerHTML='';document.body.classList.remove('noscroll')}
const mHead=(t,sub='')=>`<div class="hd"><div><h2>${t}</h2>${sub?`<div class="sub">${sub}</div>`:''}</div><button class="ibtn" data-act="closeModal" aria-label="Close">${ic('x')}</button></div>`;

/* ====================== SMALL COMPONENTS ====================== */
const rankBadge=(s,cls='')=>{const r=rankOf(s);return r?`<span class="rk ${r} ${cls}">${r}</span>`:`<span class="rk na ${cls}">–</span>`};
const bar=(v,max,color,tall)=>`<div class="bar${tall?' tall':''}"><i style="width:${clamp(max?v/max*100:0,0,100)}%;background:${color}"></i></div>`;
function ring(eaten,allowed){
  const R=94,C=2*Math.PI*R,over=eaten>allowed,pct=allowed?clamp(eaten/allowed,0,1):0;
  return `<svg viewBox="0 0 220 220"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${over?'#ff4d5e':'#ff5a36'}"/><stop offset="1" stop-color="${over?'#ff8a5e':'#ffb13a'}"/></linearGradient></defs>
  <circle cx="110" cy="110" r="${R}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="15"/>
  <circle cx="110" cy="110" r="${R}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="15" stroke-dasharray="1.2 7.5" opacity=".55"/>
  <circle class="arc" cx="110" cy="110" r="${R}" fill="none" stroke="url(#rg)" stroke-width="15" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg>`;
}
function lineChart(pts,goal){
  if(pts.length<2) return `<div class="empty">Log at least two weigh-ins to see your trend.</div>`;
  const W=320,H=150,P={l:38,r:10,t:10,b:22};
  const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y).concat(goal!=null?[goal]:[]);
  let y0=Math.min(...ys),y1=Math.max(...ys); if(y1-y0<1){y0-=.5;y1+=.5}
  const pad=(y1-y0)*.15;y0-=pad;y1+=pad;
  const x0=Math.min(...xs),x1=Math.max(...xs);
  const X=x=>P.l+(x-x0)/(x1-x0||1)*(W-P.l-P.r), Y=y=>P.t+(1-(y-y0)/(y1-y0))*(H-P.t-P.b);
  let ema=pts[0].y; const tr=pts.map(p=>{ema=ema+(p.y-ema)*.3;return {x:p.x,y:ema}});
  const path=tr.map((p,i)=>(i?'L':'M')+X(p.x).toFixed(1)+' '+Y(p.y).toFixed(1)).join(' ');
  const grid=[0,.5,1].map(f=>{const y=y0+(y1-y0)*f;return `<line x1="${P.l}" x2="${W-P.r}" y1="${Y(y)}" y2="${Y(y)}" stroke="rgba(255,255,255,.07)"/><text x="${P.l-6}" y="${Y(y)+4}" fill="#8d95a9" font-size="10" text-anchor="end">${round(toDispW(y),1)}</text>`}).join('');
  const dots=pts.map(p=>`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.6" fill="#ffa43a" opacity=".55"/>`).join('');
  const gl=goal!=null?`<line x1="${P.l}" x2="${W-P.r}" y1="${Y(goal)}" y2="${Y(goal)}" stroke="#3be08f" stroke-dasharray="4 4" opacity=".7"/><text x="${W-P.r}" y="${Y(goal)-4}" fill="#3be08f" font-size="10" text-anchor="end">goal</text>`:'';
  const fd=d=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${grid}${gl}<path d="${path}" fill="none" stroke="#ff7a3a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>${dots}
  <text x="${P.l}" y="${H-5}" fill="#8d95a9" font-size="10">${fd(x0)}</text><text x="${W-P.r}" y="${H-5}" fill="#8d95a9" font-size="10" text-anchor="end">${fd(x1)}</text></svg>`;
}
function radar(vals,labels){
  const cx=160,cy=150,R=98,n=vals.length;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r]};
  const rings=[.25,.5,.75,1].map(f=>`<polygon points="${Array.from({length:n},(_,i)=>pt(i,R*f).map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,${f===1?.16:.07})"/>`).join('');
  const spokes=Array.from({length:n},(_,i)=>{const [x,y]=pt(i,R);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.07)"/>`}).join('');
  const poly=vals.map((v,i)=>pt(i,R*Math.max(.03,(v||0)/100)).map(x=>x.toFixed(1)).join(',')).join(' ');
  const dots=vals.map((v,i)=>{if(v==null)return '';const [x,y]=pt(i,R*Math.max(.03,v/100));return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#ffb13a"/>`}).join('');
  const lbl=labels.map((l,i)=>{const [x,y]=pt(i,R+17);const a=x<cx-8?'end':x>cx+8?'start':'middle';return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" fill="${vals[i]==null?'#5d6579':'#c9cfdd'}" font-size="10.5" font-weight="700" text-anchor="${a}" letter-spacing=".05em">${l}</text>`}).join('');
  return `<svg class="chart" viewBox="0 0 320 300"><defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a36" stop-opacity=".55"/><stop offset="1" stop-color="#ffb13a" stop-opacity=".35"/></linearGradient></defs>
  ${rings}${spokes}<polygon points="${poly}" fill="url(#rd)" stroke="#ff8a3a" stroke-width="2" stroke-linejoin="round"/>${dots}${lbl}</svg>`;
}
function sparkline(vals,color='#ffa43a'){
  if(vals.length<2) return '';
  const W=120,H=34,mn=Math.min(...vals),mx=Math.max(...vals),rng=(mx-mn)||1;
  const d=vals.map((v,i)=>(i?'L':'M')+(i/(vals.length-1)*W).toFixed(1)+' '+(H-4-(v-mn)/rng*(H-8)).toFixed(1)).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function muscleBars(){
  const st=muscleStats();
  return MUSCLE_KEYS.slice().sort((a,b)=>st[b].ratio-st[a].ratio).map(m=>{
    const s=st[m], col=s.sets>=s.target?'var(--green)':s.sets>=s.target*.6?'var(--amber)':'var(--ember)';
    const tag=!isFinite(s.hrs)?'':s.hrs<48?`<span class="chip amb" style="padding:1px 7px;font-size:10.5px">recovering</span>`:'';
    return `<div class="mbar"><div>${MUSCLES[m].n}</div>${bar(s.sets,s.target,col)}<div class="v">${round(s.sets,1)}/${s.target}</div></div>${tag?`<div style="margin:-6px 0 4px 96px">${tag}</div>`:''}`;
  }).join('');
}
const dayLabel=dk=>{const t=dayKey(),y=dayKey(addDays(new Date(),-1)),tm=dayKey(addDays(new Date(),1));return dk===t?'Today':dk===y?'Yesterday':dk===tm?'Tomorrow':fromKey(dk).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})};
const greet=()=>{const h=new Date().getHours();return h<5?'Still up?':h<12?'Good morning':h<18?'Good afternoon':'Good evening'};
const isStandalone=()=>{try{return !!(window.navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches))}catch(e){return false}};

/* ====================== HOME ====================== */
function viewHome(){
  const p=S.profile, dk=dayKey(), lv=levelInfo(), st=streak();
  let h=`<div class="top"><div><div class="brand">CATACLYZM</div><div class="title">${greet()}${p&&p.name?', '+esc(p.name):''}</div></div>
    <div class="chip" title="Day streak · level">${ic('flame','')}${st} day${st===1?'':'s'} · LV ${lv.lvl}</div></div>`;
  if(!p) return h+`<div class="card center"><h3 style="justify-content:center">Welcome to Cataclyzm</h3><p class="mut">Tell me about your body and goal. I will build your calorie and macro budget, training program and fitness ranking.</p><button class="btn pri block" data-act="openProfile">Build my plan</button></div>`+installTip();
  const t=targets(dk), e=totals(dk), left=t.kcal-e.kcal;
  h+=`<div class="card hero"><div class="ringwrap">${ring(e.kcal,t.kcal)}<div class="ringc"><div class="k">CALORIES</div><div class="big">${fmt(e.kcal)}</div><div class="of">/ ${fmt(t.kcal)}</div><div class="left ${left<0?'over':''}">${left>=0?fmt(left)+' kcal left':fmt(-left)+' kcal over'}</div></div></div>
    <div class="macros">${[['PROTEIN','p','var(--p)'],['CARBS','c','var(--c)'],['FAT','f','var(--f)']].map(([n,k,c])=>`<div class="mac"><div class="ml" style="color:${c}">${n}</div><div class="mv"><b>${fmt(e[k])}</b>/ ${fmt(t[k])} g</div>${bar(e[k],t[k],c)}</div>`).join('')}</div>
    ${t.credit>0?`<div class="xs mut" style="margin-top:10px">Includes +${fmt(t.credit)} kcal earned from exercise</div>`:''}</div>`;
  const w=waterOf(dk), wg=S.settings.waterGoalMl;
  h+=`<div class="grid4" style="margin-bottom:12px">
    <button class="btn" data-act="openFood" data-meal="${guessMeal()}" style="flex-direction:column;gap:4px;padding:12px 4px">${ic('plus')}<span class="xs">Food</span></button>
    <button class="btn" data-act="water" data-ml="250" style="flex-direction:column;gap:4px;padding:12px 4px">${ic('drop')}<span class="xs">+Water</span></button>
    <button class="btn" data-act="openWeight" style="flex-direction:column;gap:4px;padding:12px 4px">${ic('scale')}<span class="xs">Weigh-in</span></button>
    <button class="btn" data-act="goTab" data-tab="train" style="flex-direction:column;gap:4px;padding:12px 4px">${ic('train')}<span class="xs">Train</span></button></div>`;
  const rd=readinessOf(dk);
  if(!rd) h+=`<div class="card"><h3>Morning check-in <span class="chip amb">+8 XP</span></h3><div class="sub" style="margin-bottom:10px">Sleep, energy and soreness tune today's training volume.</div><button class="btn block" data-act="openReady">Check in</button></div>`;
  else h+=`<div class="card row sp tap" data-act="openReady"><div><div class="up">Readiness</div><div class="sub">${rd.sleep} h sleep · energy ${rd.energy}/5 · soreness ${rd.sore}/5</div></div><div class="row"><b class="score" style="font-size:30px;color:${rd.score>=75?'var(--green)':rd.score>=50?'var(--amber)':'var(--red)'}">${rd.score}</b></div></div>`;
  const ses=buildSession();
  if(ses.rest) h+=`<div class="card"><h3>Training today</h3><div class="callout ${ses.done?'ok':''}">${esc(ses.reason)}</div></div>`;
  else h+=`<div class="card"><h3>Training today <span class="chip">${esc(ses.name)}</span></h3><div class="chips" style="margin-bottom:10px">${ses.items.slice(0,5).map(i=>`<span class="chip">${esc(i.ex.n)}</span>`).join('')}</div><div class="sub" style="margin-bottom:12px">${ses.items.length} exercises · about ${ses.mins} min. ${esc(ses.why)}</div><div class="row"><button class="btn pri grow" data-act="startRec">${ic('play')}Start</button><button class="btn" data-act="goCoach" data-c="train">Details</button></div></div>`;
  const av=avoidList().slice(0,3);
  if(av.length) h+=`<div class="card avoid"><h3>Avoid right now <button class="chip link" data-act="goCoach" data-c="eat" style="border:0">See all</button></h3>${av.map(a=>`<div class="ai"><span class="x">✕</span><div><b>${esc(a.n)}</b><span>${esc(a.why)}</span></div></div>`).join('')}</div>`;
  h+=`<div class="card"><h3>Hydration <span class="sm mut num">${fmt(w)} / ${fmt(wg)} ml</span></h3>${bar(w,wg,'var(--cyan)',true)}<div class="row" style="margin-top:12px"><button class="btn sm grow" data-act="water" data-ml="250">+250 ml</button><button class="btn sm grow" data-act="water" data-ml="500">+500 ml</button><button class="btn sm ghost" data-act="water" data-ml="-250">−250</button></div></div>`;
  const wk=weeklyNutrition(), mx=Math.max(...wk.days.map(d=>d.t.kcal),t.kcal*1.15);
  h+=`<div class="card"><h3>Last 7 days <span class="sm mut">${wk.logged.length?'avg '+fmt(wk.avgK)+' kcal':''}</span></h3><div class="wk"><div class="tl" style="bottom:calc(${t.base/mx*100}% * .8 + 21px)"></div>${wk.days.map(d=>`<div class="col"><i class="${d.t.n?'':'dim'}" style="height:${Math.max(3,d.t.kcal/mx*80)}%"></i><span>${d.d.toLocaleDateString('en-US',{weekday:'narrow'})}</span></div>`).join('')}</div></div>`;
  const ov=overall();
  h+=`<div class="card row tap" data-act="goTab" data-tab="rank">${rankBadge(ov.s)}<div class="grow"><div class="up">Fitness rank</div><div class="sub">${ov.s==null?'Take your first test to get ranked':ov.s+'/100 across '+ov.n+' of '+CATS.length+' areas'}</div></div>${ic('right')}</div>`;
  h+=`<div class="card"><div class="row sp"><div class="up">Level ${lv.lvl}</div><div class="xs mut num">${fmt(lv.toNext)} XP to next</div></div><div class="gap"></div>${bar(lv.pct,1,'linear-gradient(90deg,var(--ember),var(--ember2))')}</div>`;
  return h+installTip();
}
function installTip(){
  if(isStandalone()||S.settings.hideInstall) return '';
  return `<div class="card"><h3>Install on your iPhone <button class="ibtn" style="width:30px;height:30px" data-act="hideInstall">${ic('x')}</button></h3><div class="sub">In Safari tap the <b>Share</b> button, then <b>Add to Home Screen</b>. Cataclyzm then opens full screen and works offline.</div></div>`;
}

/* ====================== FOOD ====================== */
function viewFood(){
  const dk=UI.foodDate, t=targets(dk), e=totals(dk);
  let h=`<div class="top"><div><div class="brand">FOOD LOG</div></div><div class="row"><button class="ibtn" data-act="foodShift" data-n="-1">${ic('left')}</button><button class="ibtn" data-act="foodShift" data-n="1">${ic('right')}</button></div></div>
  <div class="title" style="margin:-6px 0 14px">${dayLabel(dk)}</div>
  <div class="card"><div class="row sp"><div><b class="num" style="font-size:26px">${fmt(e.kcal)}</b> <span class="mut">/ ${fmt(t.kcal)} kcal</span></div><div class="sm ${t.kcal-e.kcal<0?'x':'mut'}">${t.kcal-e.kcal>=0?fmt(t.kcal-e.kcal)+' left':fmt(e.kcal-t.kcal)+' over'}</div></div><div class="gap"></div>${bar(e.kcal,t.kcal,'linear-gradient(90deg,var(--ember),var(--ember2))',true)}
  <div class="macros" style="margin-top:14px">${[['PROTEIN','p','var(--p)'],['CARBS','c','var(--c)'],['FAT','f','var(--f)']].map(([n,k,c])=>`<div class="mac"><div class="ml" style="color:${c}">${n}</div><div class="mv"><b>${fmt(e[k])}</b>/ ${fmt(t[k])} g</div>${bar(e[k],t[k],c)}</div>`).join('')}</div></div>`;
  MEALS.forEach(([k,n])=>{
    const es=dayEntries(dk).filter(x=>x.meal===k), kc=sum(es,x=>x.k);
    h+=`<div class="card meal"><div class="mhead"><h3>${n} <span class="sm mut num">${kc?fmt(kc)+' kcal':''}</span></h3><button class="btn sm" data-act="openFood" data-meal="${k}">${ic('plus')}Add</button></div>
    ${es.length?es.map(x=>`<div class="item tap" data-act="editEntry" data-id="${x.id}"><div class="grow"><div class="t">${esc(x.n)}</div><div class="s">${esc(entryDesc(x))} · P ${round(x.p)} · C ${round(x.c)} · F ${round(x.f)}</div></div><div class="r"><b>${fmt(x.k)}</b><div class="xs mut">kcal</div></div></div>`).join(''):`<div class="empty">Nothing logged yet.</div>`}</div>`;
  });
  h+=`<div class="row" style="flex-wrap:wrap"><button class="btn sm" data-act="copyPrev">${ic('copy')}Copy previous day</button><button class="btn sm" data-act="quickAdd">${ic('bolt')}Quick add kcal</button><button class="btn sm" data-act="newFood">${ic('plus')}Create food</button></div>`;
  return h;
}
function foodRows(){
  const q=UI.foodQ; let list;
  if(UI.foodTab==='recent') list=S.recent.map(getFood).filter(Boolean);
  else if(UI.foodTab==='mine') list=S.custom;
  else list=searchFoods(q);
  if((UI.foodTab==='recent'||UI.foodTab==='mine')&&q) list=list.filter(f=>f.n.toLowerCase().includes(q.toLowerCase()));
  list=list.slice(0,80);
  if(!list.length) return `<div class="empty">${UI.foodTab==='mine'?'No custom foods yet. Tap “Create food”.':UI.foodTab==='recent'?'Foods you log will show up here.':'No matches. Try a different word or create the food.'}</div>`;
  return list.map(f=>{const sv=f.sv||100,m=macrosFor(f,sv);return `<div class="item tap" data-act="pickFood" data-id="${f.id}"><div class="grow"><div class="t">${esc(f.n)}</div><div class="s">${f.sl?esc(f.sl)+' · ':''}${round(sv)} ${f.base} · P ${round(m.p)} C ${round(m.c)} F ${round(m.f)}</div></div><div class="r"><b>${fmt(m.k)}</b><div class="xs mut">kcal</div></div></div>`}).join('');
}
function foodPickerModal(){
  modal(`${mHead('Add food',esc((MEALS.find(m=>m[0]===UI.pick.meal)||[])[1]||'')+' · '+dayLabel(UI.pick.date))}
  <input type="search" id="fq" placeholder="Search foods (chicken, rice, oats...)" value="${esc(UI.foodQ)}" data-in="foodq" autocomplete="off" autocapitalize="off">
  <div class="seg" style="margin:10px 0"><button class="${UI.foodTab==='all'?'on':''}" data-act="foodTab" data-t="all">All</button><button class="${UI.foodTab==='recent'?'on':''}" data-act="foodTab" data-t="recent">Recent</button><button class="${UI.foodTab==='mine'?'on':''}" data-act="foodTab" data-t="mine">My foods</button></div>
  <div class="row" style="margin-bottom:6px"><button class="btn sm" data-act="quickAdd">${ic('bolt')}Quick add</button><button class="btn sm" data-act="newFood">${ic('plus')}Create food</button></div>
  <div id="flist">${foodRows()}</div>`,true);
}
const UNIT_GROUPS=[['Weight',['g','kg','oz','lb']],['Volume',['ml','fl oz','cup','tbsp','tsp','L']]];
function amountModal(food,{entry=null,meal,date}={}){
  const unit=entry?entry.unit:(food.sv&&food.sl?'srv':food.base==='ml'?'ml':'g');
  const qty=entry?entry.qty:(unit==='srv'?1:(food.sv||100));
  UI.amt={food,entry,meal:meal||(entry&&entry.meal)||guessMeal(),date:date||(entry&&entry.d)||dayKey(),unit,qty};
  const opts=(food.sv&&food.sl?`<optgroup label="Serving"><option value="srv">${esc(food.sl)} (${round(food.sv)} ${food.base})</option></optgroup>`:'')
    +UNIT_GROUPS.map(([g,us])=>`<optgroup label="${g}">${us.map(u=>`<option value="${u}">${u}</option>`).join('')}</optgroup>`).join('');
  modal(`${mHead(esc(food.n),entry?'Edit entry':'How much?')}
  <div class="row" style="margin-bottom:12px"><button class="ibtn" data-act="amtStep" data-d="-1" style="width:48px;height:48px">${ic('minus')}</button>
    <input type="number" inputmode="decimal" id="aq" value="${qtyStr(qty)}" min="0" step="any" data-in="amount" style="text-align:center;font-size:22px;font-weight:800" class="grow">
    <button class="ibtn" data-act="amtStep" data-d="1" style="width:48px;height:48px">${ic('plus')}</button></div>
  <div class="field"><label>Unit</label><select id="au" data-ch="amtUnit">${opts}</select></div>
  <div class="card flat" style="padding:14px"><div class="row sp"><div><b class="num" id="ak" style="font-size:30px">0</b> <span class="mut">kcal</span></div><div class="xs mut" id="aeq"></div></div>
    <div class="grid3" style="margin-top:12px">${[['PROTEIN','ap','var(--p)'],['CARBS','ac','var(--c)'],['FAT','af','var(--f)']].map(([n,id,c])=>`<div><div class="ml up" style="color:${c}">${n}</div><div><b class="num" id="${id}" style="font-size:19px">0</b> g</div></div>`).join('')}</div></div>
  <div class="field" style="margin-top:12px"><label>Meal</label><select id="am">${MEALS.map(([k,n])=>`<option value="${k}" ${k===UI.amt.meal?'selected':''}>${n}</option>`).join('')}</select></div>
  <div class="row"><button class="btn pri grow" data-act="saveAmount">${entry?'Save changes':'Add to log'}</button>${entry?`<button class="btn red" data-act="delEntry" data-id="${entry.id}">${ic('trash')}</button>`:''}</div>`);
  $('#au').value=unit; updateAmount();
}
function updateAmount(keep){
  const a=UI.amt; if(!a) return;
  const qty=parseFloat($('#aq').value)||0, unit=$('#au').value, f=a.food;
  const amt=keep&&a.base!=null?a.base:toBase(f,qty,unit); a.base=amt; const m=macrosFor(f,amt);
  $('#ak').textContent=fmt(m.k); $('#ap').textContent=round(m.p,1); $('#ac').textContent=round(m.c,1); $('#af').textContent=round(m.f,1);
  const g=f.base==='g'?amt:amt*(f.d||1);
  $('#aeq').textContent=`${f.base==='g'?'':round(amt)+' ml · '}${round(g)} g · ${round(g/28.3495,1)} oz`;
}
function quickAddModal(){
  modal(`${mHead('Quick add','Log calories and macros without picking a food')}
  <div class="field"><label>Name</label><input type="text" id="qn" placeholder="Restaurant meal" autocapitalize="sentences"></div>
  <div class="field"><label>Calories</label><input type="number" inputmode="decimal" id="qk" placeholder="kcal"></div>
  <div class="grid3"><div class="field"><label>Protein g</label><input type="number" inputmode="decimal" id="qp"></div><div class="field"><label>Carbs g</label><input type="number" inputmode="decimal" id="qc"></div><div class="field"><label>Fat g</label><input type="number" inputmode="decimal" id="qf"></div></div>
  <div class="field"><label>Meal</label><select id="qm">${MEALS.map(([k,n])=>`<option value="${k}" ${k===(UI.pick?UI.pick.meal:guessMeal())?'selected':''}>${n}</option>`).join('')}</select></div>
  <div class="err" id="qe"></div><button class="btn pri block" data-act="saveQuick">Add</button>`);
}
function newFoodModal(){
  modal(`${mHead('Create food','Enter the label values for one serving')}
  <div class="field"><label>Name</label><input type="text" id="nn" placeholder="Protein cookie" autocapitalize="sentences"></div>
  <div class="grid2"><div class="field"><label>Serving size</label><input type="number" inputmode="decimal" id="ns" value="100"></div><div class="field"><label>Unit</label><select id="nu"><option value="g">grams</option><option value="ml">milliliters</option></select></div></div>
  <div class="field"><label>Calories per serving</label><input type="number" inputmode="decimal" id="nk"></div>
  <div class="grid3"><div class="field"><label>Protein g</label><input type="number" inputmode="decimal" id="np"></div><div class="field"><label>Carbs g</label><input type="number" inputmode="decimal" id="nc"></div><div class="field"><label>Fat g</label><input type="number" inputmode="decimal" id="nf"></div></div>
  <div class="field"><label>Serving name (optional)</label><input type="text" id="nl" placeholder="cookie, scoop, bar..."></div>
  <div class="err" id="ne"></div><button class="btn pri block" data-act="saveNewFood">Save food</button>`,true);
}

/* ====================== TRAIN ====================== */
const exMeta=e=>[...new Set(e.p.concat(e.s))].map(m=>MUSCLES[m].n.toLowerCase()).slice(0,3).join(' · ');
function setHeaders(e){return `<div class="setrow hd"><span>Set</span><span>Previous</span><span>${e.bw?'+'+wUnit():wUnit()}</span><span>${e.time?'Sec':'Reps'}</span><span></span></div>`}
function targetText(pl,e){
  if(!pl) return '';
  const rr=pl.lo===pl.hi?pl.lo:pl.lo+'–'+pl.hi;
  const wt=e.bw?'bodyweight':(pl.w?fmtW(pl.w)+(pl.est?' (est.)':''):'choose weight');
  return `${pl.sets} × ${rr}${e.time?' s':''} · ${wt}`;
}
function viewTrain(){
  if(S.active) return viewActive();
  const ses=buildSession();
  let h=`<div class="top"><div><div class="brand">TRAIN</div><div class="title">Lift. Log. Level up.</div></div></div>`;
  if(ses.rest) h+=`<div class="card"><h3>Recommended</h3><div class="callout ${ses.done?'ok':'warn'}">${esc(ses.reason)}</div>${ses.done?'':`<div class="gap"></div><button class="btn block" data-act="startRecForce">Train anyway</button>`}</div>`;
  else h+=`<div class="card"><h3>Recommended: ${esc(ses.name)} <span class="chip">${ses.items.length} lifts · ~${ses.mins} min</span></h3><div class="sub" style="margin-bottom:12px">${esc(ses.why)} ${esc(ses.note)}</div>${ses.items.map(i=>`<div class="item"><div class="grow"><div class="t">${esc(i.ex.n)}</div><div class="s">${esc(targetText(i,i.ex))}</div></div></div>`).join('')}<div class="gap"></div><button class="btn pri block" data-act="startRec">${ic('play')}Start this workout</button></div>`;
  h+=`<div class="grid2" style="margin-bottom:12px"><button class="btn" data-act="startEmpty">${ic('plus')}Empty workout</button><button class="btn" data-act="openCardio">${ic('flame')}Log cardio</button></div>`;
  h+=`<div class="card"><h3>Weekly muscle volume <span class="sm mut">sets, last 7 days</span></h3>${muscleBars()}</div>`;
  h+=liftsCard();
  h+=`<div class="card"><h3>Tools</h3><div class="grid2"><button class="btn" data-act="openPlates">Plate calculator</button><button class="btn" data-act="openRestSet">Rest timers</button></div></div>`;
  const hist=S.workouts.slice(-8).reverse();
  h+=`<div class="hdr"><h2>History</h2><span class="sm mut">${S.workouts.length} workouts</span></div>`;
  h+=hist.length?hist.map(w=>`<div class="card row tap" data-act="viewWorkout" data-id="${w.id}"><div class="grow"><div class="t" style="font-weight:700">${esc(w.name)}</div><div class="sub">${new Date(w.ts).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · ${workoutSets(w)} sets · ${fmt(toDispW(workoutVolume(w)))} ${wUnit()}</div></div>${ic('right')}</div>`).join(''):`<div class="card"><div class="empty">No workouts yet. Start the recommended one above.</div></div>`;
  const cardio=S.cardio.slice(-3).reverse();
  if(cardio.length) h+=`<div class="hdr"><h2>Cardio</h2></div>`+cardio.map(c=>`<div class="card row"><div class="grow"><div class="t" style="font-weight:700">${esc((CARDIO[c.type]||{}).n||c.type)}</div><div class="sub">${new Date(c.ts).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · ${c.min} min</div></div><div class="r"><b>${c.kcal}</b><div class="xs mut">kcal</div></div><button class="ibtn" data-act="delCardio" data-id="${c.id}">${ic('trash')}</button></div>`).join('');
  return h;
}
function liftsCard(){
  return `<div class="card"><h3>Your max lifts <button class="btn sm" data-act="openLifts">${ic('edit')}Edit</button></h3>${MAIN_LIFTS.map(l=>{const m=liftMax(l.id);return `<div class="item"><div class="grow t">${l.n}</div><div class="r">${m.kg?`<b>${fmtW(m.kg,1)}</b>${m.est?' <span class="chip amb" style="font-size:10.5px;padding:1px 7px">est.</span>':''}`:'<span class="mut">–</span>'}</div></div>`}).join('')}
  <div class="xs mut" style="margin-top:8px">Sets and reps are calculated from these. Missing lifts are estimated from the ones you enter.</div></div>`;
}
const workoutSets=w=>sum(w.ex||[],x=>x.sets.filter(s=>s.done).length);
const workoutVolume=w=>sum(w.ex||[],x=>sum(x.sets.filter(s=>s.done),s=>(s.w||0)*(s.r||0)));
function viewActive(){
  const w=S.active;
  let h=`<div class="top"><div><div class="brand">WORKOUT</div><div class="title">${esc(w.name)}</div><div class="sub"><span id="elapsed">${fmtTime((Date.now()-w.ts)/1000)}</span> · ${workoutSets(w)} sets done</div></div><div class="row"><button class="btn pri sm" data-act="finishWorkout">Finish</button></div></div>`;
  w.ex.forEach((b,i)=>{
    const e=EX_MAP[b.id]; if(!e) return;
    const lp=lastPerf(b.id), pl=b.plan;
    h+=`<div class="exblk"><div class="row sp"><div class="grow"><h4>${esc(e.n)}</h4><div class="xs mut">${esc(exMeta(e))}</div></div><button class="ibtn" data-act="exMenu" data-i="${i}" aria-label="Exercise options">${ic('more')}</button></div>
    ${pl?`<div class="target">Target: ${esc(targetText({...pl},e))}</div>${pl.note?`<div class="xs mut">${esc(pl.note)}</div>`:''}`:''}
    ${pl&&pl.warm?`<div class="xs dim" style="margin-top:3px">Warm-up: ${pl.warm.map(x=>fmtW(x.w,0).replace(' '+wUnit(),'')+'×'+x.r).join(' · ')} ${wUnit()}</div>`:''}
    ${setHeaders(e)}${b.sets.map((s,j)=>{const pv=lp&&lp.sets[j];return `<div class="setrow ${s.done?'done':''}"><span class="n">${j+1}</span><span class="pv">${pv?(e.bw&&!pv.w?'BW':numW(pv.w))+'×'+pv.r:'–'}</span>
      <input type="number" inputmode="decimal" step="any" value="${s.w?numW(s.w):''}" placeholder="${e.bw?'BW':'0'}" data-in="setw" data-i="${i}" data-j="${j}" aria-label="Weight">
      <input type="number" inputmode="numeric" value="${s.r||''}" placeholder="0" data-in="setr" data-i="${i}" data-j="${j}" aria-label="Reps">
      <button class="chk" data-act="toggleSet" data-i="${i}" data-j="${j}" aria-label="Complete set">${ic('check')}</button></div>`}).join('')}
    <div class="row" style="margin-top:10px"><button class="btn sm ghost" data-act="addSet" data-i="${i}">${ic('plus')}Add set</button>${b.sets.length>1?`<button class="btn sm ghost" data-act="delSet" data-i="${i}">Remove last</button>`:''}</div></div>`;
  });
  h+=`<button class="btn block" data-act="openExPicker">${ic('plus')}Add exercise</button><div class="gap"></div><button class="btn red block" data-act="discardWorkout">Discard workout</button>`;
  return h;
}

/* ====================== COACH ====================== */
function viewCoach(){
  let h=`<div class="top"><div><div class="brand">COACH</div><div class="title">What now?</div></div></div>
  <div class="seg" style="margin-bottom:14px"><button class="${UI.coach==='eat'?'on':''}" data-act="coachTab" data-c="eat">Eat</button><button class="${UI.coach==='train'?'on':''}" data-act="coachTab" data-c="train">Train</button><button class="${UI.coach==='week'?'on':''}" data-act="coachTab" data-c="week">Week</button></div>`;
  if(!S.profile) return h+`<div class="card"><div class="callout warn">Set up your profile first so recommendations match your goal.</div><div class="gap"></div><button class="btn pri block" data-act="openProfile">Set up profile</button></div>`;
  if(UI.coach==='eat') h+=coachEat();else if(UI.coach==='train') h+=coachTrain();else h+=coachWeek();
  return h;
}
function coachEat(){
  const r=suggestMeals(), R=r.R, slot=r.slot;
  let h=`<div class="card"><h3>Left today</h3><div class="grid4" style="gap:6px;text-align:center">${[['kcal',R.kcal,'var(--ember2)'],['P g',R.p,'var(--p)'],['C g',R.c,'var(--c)'],['F g',R.f,'var(--f)']].map(([n,v,c])=>`<div><b class="num" style="font-size:22px;color:${v<0?'var(--red)':c}">${fmt(v)}</b><div class="xs mut">${n}</div></div>`).join('')}</div></div>`;
  if(r.done) h+=`<div class="card"><div class="callout ok">${esc(r.reason)}</div></div>`;
  else{
    h+=`<div class="hdr"><h2>Next ${slot==='snacks'?'snack':slot==='breakfast'?'meal: breakfast':'meal'}</h2><span class="sm mut">${r.mealsLeft} meal${r.mealsLeft>1?'s':''} left</span></div>`;
    h+=r.ideas.map((m,i)=>`<div class="card"><h3>${esc(m.title)}</h3>${m.items.map(it=>`<div class="item" style="padding:8px 0"><div class="grow"><div class="t" style="font-size:14.5px">${esc(it.food.n)}</div><div class="s">${esc(it.text)}</div></div></div>`).join('')}
      <div class="row sp" style="margin-top:10px"><div class="chips"><span class="chip">${fmt(m.tot.k)} kcal</span><span class="chip" style="color:var(--p)">P ${round(m.tot.p)}</span><span class="chip" style="color:var(--c)">C ${round(m.tot.c)}</span><span class="chip" style="color:var(--f)">F ${round(m.tot.f)}</span></div></div>
      <button class="btn block sm" style="margin-top:12px" data-act="logIdea" data-i="${i}">Log this meal</button></div>`).join('');
    UI.ideas=r.ideas;
  }
  const qp=quickProtein();
  if(qp.length) h+=`<div class="card"><h3>Close the protein gap <span class="sm mut">${Math.max(0,round(R.p))} g to go</span></h3>${qp.map(x=>`<div class="item" style="padding:9px 0"><div class="grow"><div class="t" style="font-size:14.5px">${esc(x.food.n)}</div><div class="s">${esc(portionText(x.food,x.amt))}</div></div><div class="r"><b>${round(x.m.p)} g</b><div class="xs mut">${fmt(x.m.k)} kcal</div></div></div>`).join('')}</div>`;
  const av=avoidList();
  h+=`<div class="card avoid"><h3>Foods to avoid right now</h3>${av.length?av.map(a=>`<div class="ai"><span class="x">✕</span><div><b>${esc(a.n)}</b><span>${esc(a.why)}</span></div></div>`).join(''):`<div class="empty">Nothing to flag. You are on track.</div>`}<div class="gap"></div><button class="btn sm" data-act="openAvoid">${ic('edit')}Edit my avoid list</button></div>`;
  return h;
}
function coachTrain(){
  const ses=buildSession();
  let h='';
  if(ses.rest){
    h+=`<div class="card"><h3>${ses.done?'Session complete':'Recovery day'}</h3><div class="callout ${ses.done?'ok':'warn'}">${esc(ses.reason)}</div>${ses.done?'':`<div class="gap"></div><button class="btn block" data-act="startRecForce">Train anyway</button>`}</div>`;
    if(ses.next&&!ses.next.rest) h+=`<div class="card"><h3>Up next: ${esc(ses.next.name)}</h3><div class="sub" style="margin-bottom:8px">${esc(ses.next.why)}</div><div class="chips">${ses.next.items.map(i=>`<span class="chip">${esc(i.ex.n)}</span>`).join('')}</div></div>`;
  }else{
    h+=`<div class="card"><h3>${esc(ses.name)} <span class="chip">~${ses.mins} min</span></h3><div class="sub">${esc(ses.why)} ${esc(ses.note)}</div></div>`;
    h+=ses.items.map((it,i)=>{const e=it.ex;return `<div class="card"><div class="row sp"><div class="grow"><div class="t" style="font-weight:750;font-size:16px">${i+1}. ${esc(e.n)}</div><div class="xs mut">${esc(exMeta(e))} · ${e.eq}</div></div><button class="ibtn" data-act="swapEx" data-k="${esc(it.slotKey)}" data-id="${e.id}" aria-label="Swap exercise">${ic('swap')}</button></div>
      <div class="target" style="font-size:14px">${esc(targetText(it,e))}</div><div class="xs mut" style="margin-top:2px">Rest ${fmtTime(it.rest)}${it.note?' · '+esc(it.note):''}</div>
      ${it.last?`<div class="xs dim" style="margin-top:3px">Last: ${it.last.sets.map(s=>(e.bw&&!s.w?'BW':numW(s.w))+'×'+s.r).join(', ')}</div>`:''}
      ${it.warm?`<div class="xs dim">Warm-up: ${it.warm.map(x=>fmtW(x.w,0).replace(' '+wUnit(),'')+'×'+x.r).join(' · ')} ${wUnit()}</div>`:''}</div>`}).join('');
    h+=`<button class="btn pri block" data-act="startRec">${ic('play')}Start this workout</button><div class="gap"></div>`;
  }
  const cs=cardioStatus();
  h+=`<div class="card"><h3>Cardio this week <span class="sm mut num">${cs.done} / ${cs.target} min</span></h3>${bar(cs.done,cs.target,'var(--green)',true)}<div class="sub" style="margin-top:10px">${cs.left>0?`${cs.left} min to go. ${S.profile.goal==='fatloss'||S.profile.goal==='lose'?'Easy zone-2 work (a brisk incline walk) burns calories without stealing recovery from lifting.':'Keep it easy and conversational so it does not eat into recovery.'}`:'Weekly cardio target hit. Nice.'}</div></div>`;
  h+=`<div class="card"><h3>Muscle volume <span class="sm mut">last 7 days</span></h3>${muscleBars()}</div>`;
  return h;
}
function coachWeek(){
  const w=weeklyNutrition(), ov=overall(), ws=S.workouts.filter(x=>x.ts>=Date.now()-7*DAY);
  let h=`<div class="card"><h3>Nutrition, last 7 days</h3>${w.logged.length?`<div class="grid3" style="text-align:center"><div><b class="num" style="font-size:24px">${fmt(w.avgK)}</b><div class="xs mut">avg kcal</div></div><div><b class="num" style="font-size:24px">${fmt(w.avgP)}</b><div class="xs mut">avg protein g</div></div><div><b class="num" style="font-size:24px">${w.onTarget}/${w.logged.length}</b><div class="xs mut">days on target</div></div></div>
  <div class="sub" style="margin-top:12px">${w.proteinHit>=Math.ceil(w.logged.length*.7)?'Protein is consistent. Keep it up.':'Protein hit your target on only '+w.proteinHit+' of '+w.logged.length+' logged days. Anchor each meal around a protein source.'}</div>`:'<div class="empty">Log food to see weekly insights.</div>'}</div>`;
  h+=`<div class="card"><h3>Training, last 7 days</h3><div class="grid3" style="text-align:center"><div><b class="num" style="font-size:24px">${ws.length}</b><div class="xs mut">workouts</div></div><div><b class="num" style="font-size:24px">${sum(ws,workoutSets)}</b><div class="xs mut">sets</div></div><div><b class="num" style="font-size:24px">${fmt(toDispW(sum(ws,workoutVolume)))}</b><div class="xs mut">${wUnit()} lifted</div></div></div></div>`;
  const ad=adaptive(), pl=calcPlan();
  if(ad&&pl) h+=`<div class="card"><h3>Adaptive calories</h3><div class="sub">Based on ${ad.n} logged days and your weight trend (${ad.slope>0?'+':''}${round(toDispW(ad.slope),2)} ${wUnit()}/week), your real maintenance looks like <b>${fmt(ad.est)} kcal</b>. The formula estimated ${fmt(pl.maint)}.</div><div class="gap"></div><button class="btn block" data-act="applyAdaptive" data-v="${ad.est}">Use ${fmt(ad.est)} kcal as my maintenance</button></div>`;
  else h+=`<div class="card"><h3>Adaptive calories</h3><div class="sub">After two weeks of weigh-ins plus food logging, Cataclyzm compares your real results with the formula and fine-tunes your calories.</div></div>`;
  const weak=ov.cats.filter(c=>c.s!=null).sort((a,b)=>a.s-b.s)[0];
  h+=`<div class="card"><h3>Weakest link</h3>${weak&&weak.s<75?`<div class="row">${rankBadge(weak.s,'mini')}<div class="grow"><b>${CATS.find(c=>c.id===weak.cat).n}</b> · ${weak.s}/100</div></div><div class="sub" style="margin-top:8px">${esc(WEAK_TIPS[weak.cat])}</div>`:`<div class="sub">${ov.n?'No glaring weakness. Retest in a month to keep the ranking fresh.':'Take a few fitness tests to find your weak points.'}</div>`}</div>`;
  return h;
}

/* ====================== RANK ====================== */
function fmtTest(t,r){
  if(!r) return '';
  if(t.auto==='lift') return round(r.v,2)+'× bodyweight';
  switch(t.kind){
    case 'len': return round(toDispL(r.v),1)+' '+lUnit();
    case 'time': return fmtTime(r.v);
    case 'reps': return r.v+' reps';
    case 'vo2': return round(r.v,1)+' ml/kg/min'+(r.m?' ('+r.m+')':'');
    case 'num': return r.v+' '+(t.unit||'');
    default:
      if(t.id==='reaction') return Math.round(r.v)+' ms avg';
      if(t.id==='stroop') return Math.round(r.v.acc)+'% · '+Math.round(r.v.ms)+' ms';
      if(t.id==='digits') return r.v+' digits';
      if(t.id==='wellbeing') return Math.round(r.v)+'%';
  }
  return String(r.v);
}
function viewRank(){
  const ov=overall(), hist=(S.rankHist||[]).slice(-12).map(x=>x.s);
  let h=`<div class="top"><div><div class="brand">RANK</div><div class="title">Fitness exam</div></div></div>
  <div class="card"><div class="row" style="gap:16px">${rankBadge(ov.s,'lg')}<div class="grow"><div class="up">Overall</div><div><b class="score" style="font-size:44px">${ov.s==null?'–':ov.s}</b><span class="mut"> / 100</span></div><div class="xs mut">${ov.n} of ${CATS.length} areas tested</div></div></div>
  <div style="margin-top:6px">${radar(ov.cats.map(c=>c.s),['STR','PWR','AER','ANA','END','FLX','FOC','MND'])}</div>${hist.length>1?`<div class="row sp"><span class="xs mut">Overall trend</span>${sparkline(hist)}</div>`:''}
  <div class="xs dim" style="margin-top:10px">Ranks: S 90+ · A 75–89 · B 60–74 · C 40–59 · D below 40</div></div>`;
  const next=nextTest();
  if(next) h+=`<button class="btn pri block" data-act="openTest" data-id="${next.id}" style="margin-bottom:12px">${ic('bolt')}Next suggested: ${esc(next.n)}</button>`;
  ov.cats.forEach(c=>{
    const meta=CATS.find(x=>x.id===c.cat);
    h+=`<div class="card"><div class="row" style="margin-bottom:6px">${rankBadge(c.s,'mini')}<div class="grow"><div style="font-weight:800">${meta.n}</div><div class="xs mut">${meta.d}</div></div><b class="score" style="font-size:22px">${c.s==null?'–':c.s}</b></div>
    ${c.tests.map(({t,r})=>{const stale=r&&r.ts&&Date.now()-r.ts>90*DAY;return `<div class="test"><div class="grow"><div class="t" style="font-weight:650">${esc(t.n)}</div><div class="xs mut">${r?esc(fmtTest(t,r))+(r.ts?' · '+new Date(r.ts).toLocaleDateString('en-US',{month:'short',day:'numeric'}):' · from your max lifts'):'Not tested'}${stale?' · <span style="color:var(--amber)">stale</span>':''}</div></div>
      ${r?`<span class="rk mini ${rankOf(r.s)}">${rankOf(r.s)}</span>`:''}${t.auto?`<button class="btn sm" data-act="openLifts">Edit max</button>`:`<button class="btn sm" data-act="openTest" data-id="${t.id}">${r?'Retest':'Test'}</button>`}</div>`}).join('')}</div>`;
  });
  h+=`<div class="callout">Scores are estimates from general population norms, not a medical assessment. Check with a doctor before hard testing if you have a health condition. The mental wellbeing check-in is a self-reflection tool, not a diagnosis.</div>`;
  return h;
}
function nextTest(){
  const cand=TESTS.filter(t=>!t.auto).map(t=>{const r=S.tests[t.id];return {t,age:r?Date.now()-r.ts:Infinity}}).sort((a,b)=>b.age-a.age);
  const c=cand[0]; return c&&c.age>14*DAY?c.t:null;
}

/* ====================== PROFILE ====================== */
function viewMe(){
  const p=S.profile, pl=calcPlan();
  let h=`<div class="top"><div><div class="brand">PROFILE</div><div class="title">${p&&p.name?esc(p.name):'You'}</div></div><button class="btn sm" data-act="openProfile">${ic('edit')}Edit</button></div>`;
  if(!p) return h+`<div class="card"><button class="btn pri block" data-act="openProfile">Set up profile</button></div>`+settingsCard();
  h+=`<div class="card"><h3>Your plan <span class="chip">${GOALS[p.goal].n}</span></h3>
    <div class="row sp" style="align-items:flex-end"><div><b class="num" style="font-size:40px">${fmt(pl.kcal)}</b><span class="mut"> kcal/day</span></div><div class="sm mut center">${pl.delta===0?'maintenance':(pl.delta>0?'+':'')+fmt(pl.delta)+' vs maintenance'}</div></div>
    <div class="grid3" style="margin:14px 0">${[['Protein',pl.p,'var(--p)'],['Carbs',pl.c,'var(--c)'],['Fat',pl.f,'var(--f)']].map(([n,v,c])=>`<div><div class="up" style="color:${c}">${n}</div><b class="num" style="font-size:22px">${v}</b> g</div>`).join('')}</div>
    <div class="grid2 sm mut"><div>BMR <b style="color:var(--tx)">${fmt(pl.bmr)}</b></div><div>Maintenance <b style="color:var(--tx)">${fmt(pl.tdee)}</b>${pl.usingOverride?' (adaptive)':''}</div>
    <div>Pace <b style="color:var(--tx)">${Math.abs(pl.rate)<.01?'steady':(pl.rate>0?'+':'−')+fmtW(Math.abs(pl.rate),2)+'/wk'}</b></div><div>Goal <b style="color:var(--tx)">${pl.diff>.05?fmtW(pl.goalW,1):'—'}</b></div></div>
    ${pl.finishTs?`<div class="sub" style="margin-top:10px">Estimated finish: <b>${new Date(pl.finishTs).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</b></div>`:''}
    ${pl.notes.map(n=>`<div class="callout warn" style="margin-top:10px">${esc(n)}</div>`).join('')}
    ${pl.usingOverride?`<div class="gap"></div><button class="btn sm ghost" data-act="clearAdaptive">Reset to formula maintenance</button>`:''}</div>`;
  const wp=S.weights.slice(-40).map(w=>({x:w.ts,y:w.kg})), cw=curWeight();
  h+=`<div class="card"><h3>Weight <span class="row"><b class="num">${fmtW(cw)}</b><button class="btn sm" data-act="openWeight">${ic('plus')}Log</button></span></h3>${lineChart(wp,pl.diff>.05?pl.goalW:null)}${p.bf?`<div class="xs mut">Body fat ${p.bf}% · lean mass ${fmtW(pl.lbm)}</div>`:''}</div>`;
  h+=liftsCard();
  h+=`<div class="card"><h3>Training setup</h3><div class="grid2 sm"><div class="mut">Days per week <b style="color:var(--tx)">${S.settings.days}</b></div><div class="mut">Session <b style="color:var(--tx)">${S.settings.mins} min</b></div><div class="mut">Equipment <b style="color:var(--tx)">${({gym:'Full gym',dumbbells:'Dumbbells',bodyweight:'Bodyweight'})[S.settings.equip]}</b></div><div class="mut">Max reps <b style="color:var(--tx)">${S.reps.pullups||'–'} pull / ${S.reps.pushups||'–'} push</b></div></div></div>`;
  return h+settingsCard();
}
function settingsCard(){
  return `<div class="card"><h3>Settings</h3>
  <div class="field"><label>Units</label><div class="seg"><button class="${imp()?'on':''}" data-act="setUnits" data-u="imperial">lb · ft/in</button><button class="${!imp()?'on':''}" data-act="setUnits" data-u="metric">kg · cm</button></div></div>
  <div class="field"><label>Eat back exercise calories</label><div class="seg">${[[0,'Off'],[.5,'50%'],[1,'100%']].map(([v,n])=>`<button class="${S.settings.burnCredit===v?'on':''}" data-act="setBurn" data-v="${v}">${n}</button>`).join('')}</div><div class="xs mut" style="margin-top:6px">Your activity level already counts planned training, so Off is the safest default.</div></div>
  <div class="field"><label>Water goal (ml)</label><input type="number" inputmode="numeric" value="${S.settings.waterGoalMl}" data-ch="waterGoal"></div>
  <div class="field"><label>Foods I avoid or cannot eat</label><button class="btn block sm" data-act="openAvoid">${esc(S.settings.avoid)||'Add allergies and dislikes'}</button></div>
  <div class="grid2"><button class="btn sm" data-act="exportData">Export backup</button><button class="btn sm" data-act="importData">Import backup</button></div>
  <button class="btn sm red block" style="margin-top:10px" data-act="resetAll">Erase all data</button>
  <div class="xs dim" style="margin-top:12px">Cataclyzm stores everything on this device only. Not medical advice: consult a doctor or dietitian before major diet or training changes, especially with a medical condition, pregnancy, or a history of disordered eating.</div></div>`;
}
function profileModal(first){
  const p=UI.pf, I=imp(), ft=Math.floor(Math.round((p.heightCm||0)/2.54)/12), inch=Math.round((p.heightCm||0)/2.54)%12;
  const pick=(k,opts)=>`<div class="pickgrid">${opts.map(([v,n,d])=>`<button type="button" class="pick ${p[k]===v?'on':''}" data-act="pfPick" data-k="${k}" data-v="${v}"><b>${n}</b>${d?`<span>${d}</span>`:''}</button>`).join('')}</div>`;
  const lf=id=>`<div class="field"><label>${MAIN_LIFTS.find(l=>l.id===id).n} 1RM (${wUnit()})</label><input type="number" inputmode="decimal" id="pf_l_${id}" value="${(p._lifts||S.lifts)[id]?numW((p._lifts||S.lifts)[id]):''}" placeholder="optional"></div>`;
  modal(`${mHead(first?'Set up Cataclyzm':'Edit profile',first?'A few details so I can build your plan':'')}
  <div class="field"><label>Units</label><div class="seg"><button data-act="pfUnits" data-u="imperial" class="${I?'on':''}">lb · ft/in</button><button data-act="pfUnits" data-u="metric" class="${!I?'on':''}">kg · cm</button></div></div>
  <div class="field"><label>Name (optional)</label><input type="text" id="pf_name" value="${esc(p.name||'')}" autocapitalize="words"></div>
  <div class="field"><label>Sex (for calorie and score formulas)</label>${pick('sex',[['male','Male',''],['female','Female',''],['other','Other','averaged']])}</div>
  <div class="grid2"><div class="field"><label>Age</label><input type="number" inputmode="numeric" id="pf_age" value="${p.age||''}"></div>
  <div class="field"><label>Body weight (${wUnit()})</label><input type="number" inputmode="decimal" id="pf_wt" value="${p.weightKg?numW(p.weightKg):''}"></div></div>
  <div class="grid2"><div class="field"><label>Height ${I?'(ft)':'(cm)'}</label>${I?`<input type="number" inputmode="numeric" id="pf_ft" value="${p.heightCm?ft:''}">`:`<input type="number" inputmode="numeric" id="pf_cm" value="${p.heightCm?Math.round(p.heightCm):''}">`}</div>
  <div class="field"><label>${I?'Height (in)':'Body fat % (optional)'}</label>${I?`<input type="number" inputmode="numeric" id="pf_in" value="${p.heightCm?inch:''}">`:`<input type="number" inputmode="decimal" id="pf_bf" value="${p.bf||''}">`}</div></div>
  ${I?`<div class="field"><label>Body fat % (optional, improves accuracy)</label><input type="number" inputmode="decimal" id="pf_bf" value="${p.bf||''}"></div>`:''}
  <div class="field"><label>Activity level</label>${pick('activity',Object.entries(ACTIVITY).map(([k,v])=>[k,v.n,v.d]))}</div>
  <div class="field"><label>Goal</label>${pick('goal',Object.entries(GOALS).map(([k,v])=>[k,v.n,v.d]))}</div>
  <div class="grid2"><div class="field"><label>Goal weight (${wUnit()})</label><input type="number" inputmode="decimal" id="pf_gw" value="${p.goalWeightKg?numW(p.goalWeightKg):''}" placeholder="for loss / gain"></div>
  <div class="field"><label>Goal body fat %</label><input type="number" inputmode="decimal" id="pf_gbf" value="${p.goalBf||''}" placeholder="fat loss"></div></div>
  <div class="field"><label>Timeframe (weeks)</label><input type="number" inputmode="numeric" id="pf_weeks" value="${p.weeks||''}" placeholder="e.g. 12 (optional)"></div>
  <hr><div class="up" style="margin-bottom:10px">Training</div>
  <div class="grid2"><div class="field"><label>Days / week</label><select id="pf_days">${[2,3,4,5,6].map(d=>`<option ${S.settings.days===d?'selected':''}>${d}</option>`).join('')}</select></div>
  <div class="field"><label>Minutes / session</label><select id="pf_mins">${[45,60,75,90].map(d=>`<option ${S.settings.mins===d?'selected':''}>${d}</option>`).join('')}</select></div></div>
  <div class="field"><label>Equipment</label>${pick('equip',[['gym','Full gym',''],['dumbbells','Dumbbells',''],['bodyweight','Bodyweight','']])}</div>
  <div class="up" style="margin:14px 0 10px">Your max lifts (1 rep max, leave blank if unknown)</div>
  <div class="grid2">${MAIN_LIFTS.map(l=>lf(l.id)).join('')}</div>
  <div class="grid2"><div class="field"><label>Max pull-ups</label><input type="number" inputmode="numeric" id="pf_pull" value="${(p._reps||S.reps).pullups||''}"></div><div class="field"><label>Max push-ups</label><input type="number" inputmode="numeric" id="pf_push" value="${(p._reps||S.reps).pushups||''}"></div></div>
  <div class="err" id="pf_err"></div><button class="btn pri block" data-act="saveProfile">${first?'Build my plan':'Save'}</button>`,true);
}
