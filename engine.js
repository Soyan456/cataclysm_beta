'use strict';
/* ====================== TRAINING ENGINE ====================== */
const allWorkouts=()=>S.active?S.workouts.concat([S.active]):S.workouts;

function muscleStats(now=Date.now()){
  const goal=S.profile?S.profile.goal:'maintain', base=GOALS[goal].weekly;
  const st={};
  MUSCLE_KEYS.forEach(m=>st[m]={sets:0,last:0,target:Math.max(4,Math.round(base*MUSCLES[m].w))});
  allWorkouts().forEach(w=>(w.ex||[]).forEach(x=>{
    const e=EX_MAP[x.id]; if(!e) return;
    (x.sets||[]).forEach(s=>{
      if(!s.done) return; const ts=s.ts||w.end||w.ts;
      if(ts>=now-7*DAY){e.p.forEach(m=>st[m].sets+=1);e.s.forEach(m=>st[m].sets+=.5)}
      e.p.forEach(m=>{if(ts>st[m].last) st[m].last=ts});
    });
  }));
  MUSCLE_KEYS.forEach(m=>{const s=st[m];s.deficit=Math.max(0,s.target-s.sets);s.hrs=s.last?(now-s.last)/36e5:Infinity;s.fresh=s.hrs>=48;s.ratio=s.deficit/s.target});
  return st;
}
function lastPerf(id){
  for(let i=S.workouts.length-1;i>=0;i--){
    const w=S.workouts[i], b=(w.ex||[]).find(x=>x.id===id);
    if(b){const sets=b.sets.filter(s=>s.done&&s.r>0);if(sets.length) return {ts:w.ts,sets}}
  }
  return null;
}
function loadStep(e){
  const I=imp();
  if(e.eq==='dumbbell') return fromDispW(I?5:2);
  return fromDispW(I?5:2.5);
}
function roundLoad(kg,e){
  if(kg==null) return null;
  const I=imp(), v=toDispW(kg); let step;
  if(e.eq==='dumbbell') step=I?(v<15?2.5:5):(v<10?1:2);
  else step=I?5:2.5;
  let r=Math.round(v/step)*step;
  if(e.eq==='barbell'&&r<(I?45:20)) r=I?45:20;
  if(r<step) r=step;
  return fromDispW(r);
}
function bwRepBase(e){
  const r=S.reps||{}, pu=r.pushups||0, pl=r.pullups||0;
  switch(e.id){
    case 'pullup': case 'chinup': return pl;
    case 'pushup': return pu;
    case 'pike': return Math.round(pu*.5);
    case 'benchdip': return Math.round(pu*.8);
    case 'dips': return Math.round(pu*.45);
    case 'invrow': return Math.round(Math.max(pl*2.5,pu*.6));
    default: return 0;
  }
}
const BIG_STEP=new Set(['squat','deadlift','rdl','hipthrust','legpress','frontsq']);
/* turn an exercise into a concrete prescription */
function prescribe(e,ctx){
  const tier=e.main?'main':(e.t==='C'?'acc':'iso'), pr=ctx.preset;
  let [lo,hi]=pr[tier];
  let sets=pr[tier+'Sets']+ctx.setAdj;
  if(tier!=='main'&&ctx.ratio<.25) sets-=1;
  sets=clamp(sets,2,6);
  const out={ex:e,tier,sets,lo,hi,w:null,est:false,note:'',last:null,warm:null,rest:tier==='main'?S.settings.restMain:tier==='acc'?S.settings.restAcc:S.settings.restIso};
  const lp=lastPerf(e.id); out.last=lp;
  if(e.bw){
    if(e.time){lo=30;hi=60}
    else{
      const mx=bwRepBase(e);
      if(mx){hi=clamp(Math.round(mx*.8),5,35);lo=clamp(Math.round(mx*.6),4,hi-1)}
      else if(tier==='iso'){lo=10;hi=20}else{lo=8;hi=15}
    }
    out.lo=lo;out.hi=hi;out.w=0;
    if(lp){
      const best=Math.max(...lp.sets.map(s=>s.r));
      if(best>=hi){out.note=e.time?'You held the top time last session. Add 10 seconds.':'You hit the top of the range last time. Slow the tempo or add a weight/harder variation.';out.hi=hi+(e.time?10:2);out.lo=hi}
      else out.note='Beat your last best of '+best+(e.time?' s.':' reps.');
    }
    return out;
  }
  const mid=Math.round((lo+hi)/2);
  if(lp){
    const top=Math.max(...lp.sets.map(s=>s.w)), atTop=lp.sets.filter(s=>s.w>=top-.01);
    const hit=atTop.length>=Math.min(sets,3)&&atTop.every(s=>s.r>=hi);
    const stale=(Date.now()-lp.ts)>42*DAY;
    let w=top;
    if(stale){w=roundLoad(top*.9,e);out.note='It has been a while: start 10% lighter and rebuild.'}
    else if(hit){w=roundLoad(top+loadStep(e)*(BIG_STEP.has(e.id)?2:1),e);if(w<=top)w=top+loadStep(e);out.note='You hit the top of the range last time, so the load goes up.'}
    else out.note='Same weight: add a rep or two before adding load.';
    out.w=w;
  }else{
    const ref=liftMax(e.ref);
    if(ref.kg){
      const w1=ref.kg*e.k/(1+(mid+2)/30);
      out.w=roundLoad(w1,e); out.est=ref.est||!e.main;
      out.note=out.est?'Estimated start. Pick a weight that leaves about 2 reps in reserve and log it; I will use your real numbers next time.':'Calculated from your max at roughly 2 reps in reserve.';
    }else out.note='Pick a weight that leaves about 2 reps in reserve.';
  }
  if(e.main&&out.w){out.warm=[[.4,8],[.6,5],[.8,3]].map(([p,r])=>({w:roundLoad(out.w*p,e),r}))}
  return out;
}
function readinessOf(dk=dayKey()){return S.ready[dk]||null}
function sessionsLast7(){return S.workouts.filter(w=>w.ts>=Date.now()-7*DAY).length}
function buildSession(opts={}){
  const now=Date.now(), dk=dayKey();
  const goal=S.profile?S.profile.goal:'maintain', preset=GOALS[goal];
  const stats=muscleStats(now), eq=EQUIP[S.settings.equip]||EQUIP.gym;
  const days=S.settings.days, mins=S.settings.mins;
  const todays=S.workouts.filter(w=>dayKey(new Date(w.ts))===dk);
  const rd=readinessOf(dk), rdScore=rd?rd.score:null;
  const types=days<=3?['Full Body']:days===4?['Upper','Lower']:['Push','Pull','Legs'];
  const prio=m=>{const s=stats[m];return s.ratio*(s.fresh?1:.35)+(s.hrs>96&&isFinite(s.hrs)?.08:0)+(s.last===0?.12:0)};
  const lastType=S.workouts.length?S.workouts[S.workouts.length-1].type:null;
  const scored=types.map(t=>{let sc=avg(GROUPS[t].map(prio));if(t===lastType)sc*=.85;return {t,sc}}).sort((a,b)=>b.sc-a.sc);
  const pick=opts.type?{t:opts.type,sc:1}:scored[0];
  if(!opts.force){
    if(todays.length) return {rest:true,done:true,reason:'You already trained today. Nice work. Eat, hydrate and sleep well.',next:buildSession({force:true,tomorrow:true})};
    if(rdScore!=null&&rdScore<35) return {rest:true,reason:'Your readiness check-in is low ('+rdScore+'/100). Take a recovery day: a walk, light mobility and an early night. You can still train if you feel good.'};
    if(sessionsLast7()>=days&&pick.sc<.2) return {rest:true,reason:'You have already done '+sessionsLast7()+' sessions in the last 7 days, which is your weekly plan, and your muscles are close to their volume targets. Recover today.'};
  }
  const type=pick.t, group=GROUPS[type];
  const N=mins<=45?4:mins<=60?5:mins<=75?6:7;
  const cap=m=>(m==='calves'||m==='core')?1:2;
  const cnt={}, slots=[];
  const tomorrowAdj=opts.tomorrow?1:0;
  const elig=group.filter(m=>m!=='core'||N>=5);
  if(type==='Full Body'){
    const must=[['quads','hams'],['chest','shoulders'],['back']].map(g=>g.slice().sort((a,b)=>prio(b)-prio(a))[0]);
    must.forEach(m=>{slots.push(m);cnt[m]=(cnt[m]||0)+1});
  }
  while(slots.length<N){
    let best=null,bs=-1;
    elig.forEach(m=>{
      const c=cnt[m]||0; if(c>=cap(m)) return;
      const sc=prio(m)/(1+c*.9)+(c===0?.3:0)+(c===0&&stats[m].last===0?.1:0)+tomorrowAdj*0;
      if(sc>bs){bs=sc;best=m}
    });
    if(!best) break;
    slots.push(best);cnt[best]=(cnt[best]||0)+1;
  }
  const sw=S.swaps[dk]||{}, rnd=seeded(dk+type+(opts.salt||'')), used=new Set(), idx={}, chosen=[];
  let heavy=0;
  slots.forEach(m=>{
    const i=idx[m]=(idx[m]||0); idx[m]++;
    const key=m+'#'+i, banned=sw[key]||[];
    let cands=EXERCISES.filter(e=>e.p.includes(m)&&eq.has(e.eq)&&!used.has(e.id)&&!(e.heavy&&heavy>=1)&&!banned.includes(e.id));
    if(!cands.length) cands=EXERCISES.filter(e=>(e.p.includes(m)||e.s.includes(m))&&eq.has(e.eq)&&!used.has(e.id)&&!banned.includes(e.id));
    if(!cands.length) return;
    let best=null,bs=-1e9;
    cands.forEach(e=>{
      let s=0;
      if(i===0){s+=e.t==='C'?3:0;s+=e.main?1.5:0}else s+=e.t==='I'?1.2:.4;
      if(e.p[0]===m) s+=.8;
      const lp=lastPerf(e.id);
      if(lp){const age=(now-lp.ts)/DAY;if(age<3)s-=4;else if(age<7)s-=1.5;if(e.id==='deadlift'&&age<5)s-=3}
      if(e.bw&&S.settings.equip==='gym'&&!['pullup','dips','hangleg','plank'].includes(e.id)) s-=1.2;
      if(e.ref&&S.lifts[e.ref]>0) s+=.5;
      if(i>0){const prev=chosen.filter(c=>c.m===m).map(c=>c.ex);if(prev.some(p=>p.eq===e.eq&&p.t===e.t))s-=1.5}
      s+=rnd()*1.4;
      if(s>bs){bs=s;best=e}
    });
    used.add(best.id); if(best.heavy) heavy++;
    chosen.push({m,i,key,ex:best});
  });
  const setAdj=(rdScore!=null&&rdScore<50)?-1:0;
  const items=chosen.map(c=>{
    const p=prescribe(c.ex,{preset,setAdj,ratio:stats[c.m].ratio});
    p.slotKey=c.key;p.slotMuscle=c.m;return p;
  });
  const tierRank={main:0,acc:1,iso:2};
  items.sort((a,b)=>tierRank[a.tier]-tierRank[b.tier]||MUSCLES[b.slotMuscle].w-MUSCLES[a.slotMuscle].w);
  const muscleSet=[...new Set(items.flatMap(it=>it.ex.p))];
  const est=Math.round(5+sum(items,it=>it.sets*((it.rest+45)/60)));
  const behind=group.slice().sort((a,b)=>stats[b].ratio-stats[a].ratio).filter(m=>stats[m].deficit>0).slice(0,2).map(m=>MUSCLES[m].n.toLowerCase());
  const why=behind.length?(behind.join(' and ')+' '+(behind.length>1?'are':'is')+' furthest below the weekly set target'+(stats[group[0]]&&opts.tomorrow?'':'')+'.'):'All muscles in this group are near their weekly targets, so this is a maintenance-volume day.';
  return {rest:false,type,name:type+' Day',items,muscles:muscleSet,mins:est,why,
    note:setAdj?'Readiness was low, so one set was trimmed from each exercise.':(rdScore!=null&&rdScore>=75?'Readiness is high. Push the top sets.':''),tomorrow:!!opts.tomorrow};
}
function swapExercise(slotKey,exId){
  const dk=dayKey(); S.swaps[dk]=S.swaps[dk]||{};
  const arr=S.swaps[dk][slotKey]=S.swaps[dk][slotKey]||[]; arr.push(exId); save();
}
function cardioStatus(){
  const goal=S.profile?S.profile.goal:'maintain', target=GOALS[goal].cardio;
  const done=sum(S.cardio.filter(c=>c.ts>=Date.now()-7*DAY),c=>c.min);
  return {target,done,left:Math.max(0,target-done)};
}
function startWorkoutFrom(session){
  S.active={id:uid(),ts:Date.now(),name:session.name,type:session.type,rec:true,ex:session.items.map(it=>({
    id:it.ex.id,plan:{sets:it.sets,lo:it.lo,hi:it.hi,w:it.w,note:it.note,rest:it.rest,est:it.est,warm:it.warm,tier:it.tier},
    sets:Array.from({length:it.sets},()=>({w:it.w||0,r:it.ex.bw&&it.ex.time?it.lo:Math.round((it.lo+it.hi)/2),done:false}))
  }))};
  save();
}
function workoutKcal(w){
  const mins=clamp(((w.end||Date.now())-w.ts)/60000,15,150);
  return Math.round(5*curWeight()*mins/60);
}

/* ====================== NUTRITION ENGINE ====================== */
function avoidTerms(){return (S.settings.avoid||'').toLowerCase().split(/[,\n]/).map(s=>s.trim()).filter(Boolean)}
function isAvoided(f){
  const n=f.n.toLowerCase(), t=avoidTerms();
  return t.some(x=>n.includes(x)||f.cat===x||(f.tg||[]).includes(x)||(x==='dairy'&&f.cat==='dairy')||(x==='meat'&&['chicken','beef90','sirloin','pork','turkey','bacon','jerky'].includes(f.id))||(x==='gluten'&&['bread','bagel','pasta','tortilla','granola'].includes(f.id))||(x==='nuts'&&['almonds','walnuts','pb'].includes(f.id))||(x==='fish'&&['salmon','tuna','cod','shrimp'].includes(f.id))||(x==='eggs'&&['egg','eggwhite'].includes(f.id)));
}
function remainingToday(dk=dayKey()){const t=targets(dk),e=totals(dk);return {kcal:t.kcal-e.kcal,p:t.p-e.p,c:t.c-e.c,f:t.f-e.f,t,e}}
function weekCounts(){
  const from=dayKey(addDays(new Date(),-6)), cnt={}, today={};
  S.food.forEach(e=>{if(e.d>=from&&e.fid){cnt[e.fid]=(cnt[e.fid]||0)+1}});
  dayEntries(dayKey()).forEach(e=>{if(e.fid)today[e.fid]=1});
  return {cnt,today};
}
function nicePortion(food,amt){
  const a=amt>=100?Math.round(amt/10)*10:amt>=30?Math.round(amt/5)*5:Math.max(1,Math.round(amt));
  return a;
}
function portionText(food,amt){
  let main=amt+' '+food.base, extra=[];
  if(food.base==='g'&&amt>=40&&imp()) extra.push(round(amt/28.3495,1)+' oz');
  if(food.base==='ml'&&imp()) extra.push(round(amt/29.5735,1)+' fl oz');
  if(food.base==='g'&&food.d&&food.d<.99&&/cup/.test(food.sl||'')&&amt/ (food.d*236.588)>=.25) extra.push(round(amt/(food.d*236.588)*4)/4+' cup');
  if(food.sv&&food.sl){const n=amt/food.sv; if(n>=.75&&n<=8) extra.push('≈ '+(Math.round(n*2)/2)+' × '+food.sl)}
  return main+(extra.length?' ('+extra.join(', ')+')':'');
}
const BF_P=['egg','eggwhite','gyogurt','cottage','whey','tofu'], BF_C=['oats','bread','bagel','banana','blueberry','strawberry','apple','orange'];
const SN_P=['gyogurt','cottage','whey','eggwhite','tuna','edamame','egg'], SN_C=['banana','apple','blueberry','strawberry','popcorn','grapes','orange'];
function suggestMeals(){
  const R=remainingToday(), goal=S.profile?S.profile.goal:'maintain';
  if(R.kcal<120) return {done:true,R,reason:R.kcal<-80?'You are over your calorie budget today. Water, tea, or black coffee are your friends.':'You are right at your budget. Nothing more to add today.'};
  const h=new Date().getHours(), slot=guessMeal(h);
  const mealsLeft=h<11?3:h<15?2:1;
  let mt={k:R.kcal/mealsLeft,p:Math.max(0,R.p)/mealsLeft,c:Math.max(0,R.c)/mealsLeft,f:Math.max(0,R.f)/mealsLeft};
  if(slot==='snacks'){const s=Math.min(1,320/mt.k);mt={k:mt.k*s,p:mt.p*s,c:mt.c*s,f:mt.f*s}}
  const {cnt,today}=weekCounts();
  const ok=f=>!isAvoided(f);
  let pP=FOODS.filter(f=>ok(f)&&((f.cat==='protein'||f.cat==='dairy')&&f.p*4/Math.max(1,f.k)>=.28&&!(f.tg.includes('proc')||f.tg.includes('dense'))&&f.id!=='whey'&&f.base==='g'));
  let cP=FOODS.filter(f=>ok(f)&&(f.cat==='carb'||f.cat==='fruit')&&!f.tg.includes('sugar')&&!f.tg.includes('dense')&&f.id!=='popcorn');
  const vP=FOODS.filter(f=>ok(f)&&f.cat==='veg'&&['broccoli','spinach','greenbeans','asparagus','bellpepper','cauliflower','zucchini','romaine','mushroom','tomato'].includes(f.id));
  const fP=FOODS.filter(f=>ok(f)&&['olive','avocado','almonds','walnuts','pb'].includes(f.id));
  if(slot==='breakfast'){pP=pP.filter(f=>BF_P.includes(f.id));cP=cP.filter(f=>BF_C.includes(f.id))}
  if(slot==='snacks'){pP=FOODS.filter(f=>ok(f)&&SN_P.includes(f.id));cP=FOODS.filter(f=>ok(f)&&SN_C.includes(f.id))}
  const lean=goal==='fatloss'||goal==='lose'||goal==='recomp';
  const pScore=f=>{
    let s=f.p*4/Math.max(1,f.k)*100;
    if(lean&&f.f<8) s+=8; if(!lean&&f.f>=8) s+=4;
    if(mt.f<10&&f.f>10) s-=18; if(R.f>25&&f.f>=5) s+=4;
    s-=(today[f.id]?30:0)+(cnt[f.id]||0)*3.5;
    return s;
  };
  const vScore=f=>-(today[f.id]?20:0)-(cnt[f.id]||0)*2.5;
  const cScore=f=>-(today[f.id]?25:0)-(cnt[f.id]||0)*3+(f.cat==='fruit'&&slot!=='breakfast'?-6:0);
  pP.sort((a,b)=>pScore(b)-pScore(a)); cP.sort((a,b)=>cScore(b)-cScore(a)); vP.sort((a,b)=>vScore(b)-vScore(a)); fP.sort((a,b)=>-(cnt[a.id]||0)+(cnt[b.id]||0));
  const ideas=[];
  for(let i=0;i<Math.min(3,pP.length);i++){
    const P=pP[i], items=[]; let budget=mt.k, pT=Math.min(Math.max(mt.p*.9,15),55);
    let gP=pT/(P.p/100);
    if(P.k*gP/100>budget*.62) gP=budget*.62/(P.k/100);
    gP=Math.max(P.sv?P.sv*.5:40,gP); gP=Math.min(gP,600);
    const aP=nicePortion(P,gP); const mP=macrosFor(P,aP); items.push({food:P,amt:aP,m:mP});
    budget-=mP.k; let cL=mt.c-mP.c, fL=mt.f-mP.f;
    if(slot!=='snacks'&&cP.length&&cL>=12&&budget>60){
      const C=cP[(i+(slot==='breakfast'?0:0))%cP.length]; let gC=Math.min(cL*.9/(C.c/100),C.sv?C.sv*2.6:400);
      if(C.k*gC/100>budget*.9) gC=budget*.9/(C.k/100);
      if(gC>=20){const aC=nicePortion(C,gC),mC=macrosFor(C,aC);items.push({food:C,amt:aC,m:mC});budget-=mC.k;cL-=mC.c;fL-=mC.f}
    }else if(slot==='snacks'&&cP.length&&budget>50){
      const C=cP[i%cP.length]; let gC=Math.min(budget*.8/(C.k/100),C.sv?C.sv*1.2:150);
      if(gC>=20){const aC=nicePortion(C,gC),mC=macrosFor(C,aC);items.push({food:C,amt:aC,m:mC});budget-=mC.k;fL-=mC.f}
    }
    if(slot!=='snacks'&&vP.length&&budget>45&&!(slot==='breakfast'&&i!==2)){
      const V=vP[i%vP.length], aV=nicePortion(V,Math.min(150,budget/(V.k/100)*.9)), mV=macrosFor(V,aV);
      if(aV>=40){items.push({food:V,amt:aV,m:mV});budget-=mV.k;fL-=mV.f}
    }
    if(slot!=='snacks'&&fP.length&&fL>=5&&budget>40){
      const F=fP[i%fP.length], capG=F.id==='olive'?14:F.id==='avocado'?100:F.id==='pb'?32:30;
      let gF=Math.min(fL/(F.f/100),capG,budget/(F.k/100));
      if(gF>=5){const aF=nicePortion(F,gF),mF=macrosFor(F,aF);items.push({food:F,amt:aF,m:mF});budget-=mF.k}
    }
    const tot=items.reduce((a,x)=>({k:a.k+x.m.k,p:a.p+x.m.p,c:a.c+x.m.c,f:a.f+x.m.f}),{k:0,p:0,c:0,f:0});
    ideas.push({title:items.map(x=>x.food.n.replace(/,.*$/,'').replace(/ \(.*\)/,'')).join(' + '),items:items.map(x=>({food:x.food,amt:x.amt,text:portionText(x.food,x.amt)})),tot});
  }
  return {done:false,R,slot,mealsLeft,ideas};
}
function quickProtein(){
  const R=remainingToday(); if(R.p<=8||R.kcal<=80) return [];
  const pool=FOODS.filter(f=>!isAvoided(f)&&f.p*4/Math.max(1,f.k)>=.45&&f.p>=10&&!f.tg.includes('proc'));
  const need=Math.min(R.p,35);
  return pool.map(f=>{const amt=nicePortion(f,Math.max(30,need/(f.p/100)));return {food:f,amt,m:macrosFor(f,amt)}})
    .filter(x=>x.m.k<=Math.max(120,R.kcal*.9)).sort((a,b)=>a.m.k/a.m.p-b.m.k/b.m.p).slice(0,4);
}
function avoidList(){
  const out=[], R=remainingToday(), g=S.profile?S.profile.goal:'maintain', h=new Date().getHours();
  const todayE=dayEntries(dayKey()), sugarCount=todayE.filter(e=>{const f=getFood(e.fid);return f&&f.tg&&f.tg.includes('sugar')}).length;
  const trainSoon=!!S.active||(!S.workouts.some(w=>dayKey(new Date(w.ts))===dayKey()));
  if(R.kcal<0) out.push({n:'Anything with calories',why:'You are '+fmt(-R.kcal)+' kcal over budget. Stick to water, tea, or black coffee.',sev:3});
  else if(R.kcal<250) out.push({n:'Calorie-dense extras: nuts, oils, cheese, chips, sweets',why:'Only '+fmt(R.kcal)+' kcal left. They eat the budget in a few bites.',sev:2});
  if(R.f<8&&R.t.f>0) out.push({n:'High-fat foods: bacon, cheese, fried food, nut butters',why:'You have used almost all of your fat target ('+Math.round(R.f)+' g left).',sev:2});
  if(R.c<20&&R.kcal>150) out.push({n:'Starchy and sugary carbs: bread, pasta, sweets, juice',why:'Your carb target is nearly used up. Spend the rest on protein and vegetables.',sev:2});
  if(g==='fatloss'||g==='lose'||g==='recomp') out.push({n:'Liquid calories: soda, juice, sweet coffee drinks, alcohol',why:'They add up fast and do not fill you up, which makes a deficit harder.',sev:2});
  if(g==='fatloss'||g==='lose') out.push({n:'Ultra-processed snacks: chips, donuts, cookies, ice cream',why:'Easy to overeat and low in protein for the calories.',sev:1});
  if(g==='muscle'||g==='gain') out.push({n:'Big salads of low-calorie filler and diet drinks as meals',why:'Fill-you-up foods can crowd out the calories you need to grow.',sev:1});
  if(g==='muscle'||g==='recomp') out.push({n:'Heavy drinking',why:'Alcohol blunts muscle protein synthesis and wrecks sleep quality.',sev:1});
  if(sugarCount>=2) out.push({n:'More added sugar today',why:'You already logged '+sugarCount+' sugary items. Swap the next snack for protein.',sev:2});
  if(h>=15) out.push({n:'Caffeine: coffee, energy drinks, pre-workout',why:'Caffeine stays in your system for 6+ hours and cuts into deep sleep.',sev:1});
  if(h>=21||h<4) out.push({n:'Large or greasy meals right before bed',why:'They can hurt sleep quality. A small protein snack is fine.',sev:1});
  if(trainSoon&&h>=6&&h<21) out.push({n:'Greasy, fried or very high-fiber meals within 2 hours of training',why:'Slow digestion can leave you sluggish or queasy mid-session.',sev:1});
  const mine=avoidTerms();
  if(mine.length) out.push({n:'Your list: '+mine.join(', '),why:'Excluded from every suggestion. Edit it in Profile.',sev:3});
  return out.sort((a,b)=>b.sev-a.sev);
}
function weeklyNutrition(){
  const days=[]; for(let i=6;i>=0;i--){const d=addDays(new Date(),-i),k=dayKey(d);days.push({k,d,t:totals(k),tg:targets(k)})}
  const logged=days.filter(x=>x.t.n>0);
  return {days,logged,avgK:avg(logged.map(x=>x.t.kcal)),avgP:avg(logged.map(x=>x.t.p)),
    onTarget:logged.filter(x=>Math.abs(x.t.kcal-x.tg.kcal)<=x.tg.kcal*.1).length,
    proteinHit:logged.filter(x=>x.t.p>=x.tg.p*.9).length};
}

/* ====================== TEST SCORING ====================== */
function interp(tb,v){
  const t=tb.slice().sort((a,b)=>a[0]-b[0]);
  if(v<=t[0][0]) return t[0][1];
  if(v>=t[t.length-1][0]) return t[t.length-1][1];
  for(let i=1;i<t.length;i++){if(v<=t[i][0]){const [x0,y0]=t[i-1],[x1,y1]=t[i];return y0+(y1-y0)*(v-x0)/(x1-x0)}}
  return 0;
}
function tbScore(t,v){
  const sex=S.profile?S.profile.sex:'other';
  if(!t.tb) return null;
  if(sex==='male') return interp(t.tb.m,v);
  if(sex==='female') return interp(t.tb.f,v);
  return (interp(t.tb.m,v)+interp(t.tb.f,v))/2;
}
const vo2Adj=(v)=>v*(1+Math.max(0,((S.profile&&S.profile.age)||25)-25)*.008);
function vo2From(method,val){
  if(method==='cooper') return (val-504.9)/44.73;       // val metres in 12 min
  if(method==='run15') return 483/(val/60)+3.5;          // val seconds for 2.4 km
  return val;
}
function scoreTest(id,val){
  const t=TEST_MAP[id]; let s;
  if(id==='vo2') s=tbScore(t,vo2Adj(val));
  else if(id==='stroop') s=interp([[500,100],[650,90],[800,75],[1000,50],[1300,25],[1800,0]],val.ms)*Math.pow(clamp(val.acc,0,100)/100,2);
  else if(id==='wellbeing') s=val;
  else s=tbScore(t,val);
  return clamp(Math.round(s),0,100);
}
function testResult(id){
  const t=TEST_MAP[id];
  if(t.auto==='lift'){
    const kg=S.lifts[id]; if(!(kg>0)||!S.profile) return null;
    const ratio=kg/curWeight(); return {v:ratio,s:clamp(Math.round(tbScore(t,ratio)),0,100),ts:null,auto:true};
  }
  const r=S.tests[id]; return r||null;
}
function catScore(cat){
  const tests=TESTS.filter(t=>t.cat===cat), res=tests.map(t=>({t,r:testResult(t.id)}));
  const have=res.filter(x=>x.r);
  return {cat,tests:res,s:have.length?Math.round(avg(have.map(x=>x.r.s))):null,n:have.length};
}
function overall(){
  const cs=CATS.map(c=>catScore(c.id)), have=cs.filter(c=>c.s!=null);
  return {cats:cs,s:have.length?Math.round(avg(have.map(c=>c.s))):null,n:have.length};
}
function rankOf(s){return s==null?null:s>=90?'S':s>=75?'A':s>=60?'B':s>=40?'C':'D'}
function saveTest(id,v,s,extra={}){
  const ts=Date.now(); S.tests[id]=Object.assign({v,s,ts},extra);
  S.testLog.push({id,ts,s}); S.rankHist=S.rankHist||[];
  const o=overall(); if(o.s!=null) S.rankHist.push({ts,s:o.s});
  save();
}
const WEAK_TIPS={
  strength:'Prioritise heavy compound lifts (3 to 6 reps) twice a week and eat enough protein.',
  power:'Add jump squats, box jumps or medicine-ball throws for 3 to 5 low-rep sets before lifting.',
  aerobic:'Build a base with 3 sessions a week of easy cardio (30 to 45 min) plus one interval session.',
  anaerobic:'Try 8 rounds of 30 seconds hard and 90 seconds easy on a bike or sled once a week.',
  endurance:'Add a high-rep finisher (15 to 25 reps) and practice planks and push-up ladders.',
  flex:'Spend 10 minutes daily on hip flexors, hamstrings and thoracic rotation. Hold each stretch 45 seconds.',
  focus:'Protect sleep (7 to 9 h), take short walking breaks and keep caffeine before 2 pm.',
  mind:'Daily daylight and a walk, steady sleep and time with people help. Talk to a professional if low mood lingers.'
};
