'use strict';
/* ====================== ACTIONS ====================== */
const val=id=>{const el=document.getElementById(id);return el?el.value:''};
const num=id=>{const v=parseFloat(val(id));return isNaN(v)?null:v};

function openProfile(first){
  const base=S.profile?JSON.parse(JSON.stringify(S.profile)):{sex:'male',activity:'moderate',goal:'fatloss',age:'',weightKg:null,heightCm:null};
  base.equip=S.settings.equip;
  UI.pf=base; profileModal(!S.profile);
}
function collectPf(){
  const p=UI.pf, I=imp();
  p.name=val('pf_name').trim();
  p.age=num('pf_age'); const w=num('pf_wt'); p.weightKg=w?fromDispW(w):null;
  if(I){const ft=num('pf_ft'),inch=num('pf_in');p.heightCm=(ft||inch)?((ft||0)*12+(inch||0))*2.54:null}
  else{const cm=num('pf_cm');p.heightCm=cm||null}
  p.bf=num('pf_bf')||null; const gw=num('pf_gw'); p.goalWeightKg=gw?fromDispW(gw):null;
  p.goalBf=num('pf_gbf')||null; p.weeks=num('pf_weeks')||null;
  p._days=parseInt(val('pf_days'))||S.settings.days; p._mins=parseInt(val('pf_mins'))||S.settings.mins;
  p._lifts={}; MAIN_LIFTS.forEach(l=>{const v=num('pf_l_'+l.id);if(v>0)p._lifts[l.id]=fromDispW(v)});
  p._reps={pullups:num('pf_pull')||0,pushups:num('pf_push')||0};
}
function saveProfile(){
  collectPf(); const p=UI.pf, err=m=>{$('#pf_err').textContent=m;return false};
  if(!p.sex) return err('Choose a sex option.');
  if(!(p.age>=14&&p.age<=90)) return err('Enter an age between 14 and 90.');
  if(!(p.weightKg>=30&&p.weightKg<=300)) return err('Enter your body weight.');
  if(!(p.heightCm>=120&&p.heightCm<=230)) return err('Enter your height.');
  if(p.bf&&(p.bf<3||p.bf>60)) return err('Body fat should be between 3 and 60%.');
  if(p.goalWeightKg&&(p.goalWeightKg<30||p.goalWeightKg>300)) return err('Check your goal weight.');
  if(p.weeks&&(p.weeks<2||p.weeks>156)) return err('Timeframe should be 2 to 156 weeks.');
  const prevCur=S.profile?curWeight():null;
  S.profile={name:p.name,sex:p.sex,age:p.age,weightKg:p.weightKg,heightCm:p.heightCm,bf:p.bf,activity:p.activity,goal:p.goal,goalWeightKg:p.goalWeightKg,goalBf:p.goalBf,weeks:p.weeks};
  if(prevCur==null||Math.abs(prevCur-p.weightKg)>.05) addWeight(p.weightKg);
  S.settings.days=p._days;S.settings.mins=p._mins;S.settings.equip=p.equip||'gym';
  S.lifts=Object.assign({},p._lifts); S.reps=p._reps;
  UI.pf=null; save(); closeModal(); render(); toast('Plan updated');
}

function addToLog(food,qty,unit,meal,d){return addEntry({food,qty,unit,meal,d})}
function saveAmount(){
  const a=UI.amt, qty=parseFloat(val('aq')), unit=val('au'), meal=val('am');
  if(!(qty>0)) return toast('Enter an amount');
  if(a.entry){
    const e=a.entry, amt=a.base!=null?a.base:toBase(a.food,qty,unit), m=macrosFor(a.food,amt);
    Object.assign(e,{qty,unit,meal,amt,k:m.k,p:m.p,c:m.c,f:m.f}); save(); toast('Entry updated');
  }else{addEntry({food:a.food,qty,unit,meal,d:a.date,amt:a.base});toast('Added '+a.food.n)}
  UI.amt=null; closeModal(); render();
}
function saveQuick(){
  const k=num('qk'); if(!(k>=0)||val('qk')==='') return $('#qe').textContent='Enter calories.';
  const d=UI.pick?UI.pick.date:(UI.tab==='food'?UI.foodDate:dayKey());
  S.food.push({id:uid(),d,ts:Date.now(),meal:val('qm'),fid:null,n:val('qn').trim()||'Quick add',qty:1,unit:'srv',sl:'entry',k,p:num('qp')||0,c:num('qc')||0,f:num('qf')||0});
  save(); closeModal(); render(); toast('Added');
}
function saveNewFood(){
  const n=val('nn').trim(), size=num('ns'), k=num('nk'), er=m=>{$('#ne').textContent=m};
  if(!n) return er('Give the food a name.'); if(!(size>0)) return er('Serving size must be above 0.'); if(k==null||k<0) return er('Enter calories per serving.');
  const f100=100/size, unit=val('nu');
  const food={id:'c_'+uid(),n,cat:'custom',base:unit,k:k*f100,p:(num('np')||0)*f100,c:(num('nc')||0)*f100,f:(num('nf')||0)*f100,d:1,sv:size,sl:val('nl').trim()||'serving',tg:[],std:false};
  S.custom.push(food); save();
  if(UI.pick) amountModal(food,{meal:UI.pick.meal,date:UI.pick.date}); else{closeModal();toast('Food saved')}
}
function saveWeight(){
  const v=num('wv'); if(!(v>0)) return toast('Enter a weight');
  const kg=fromDispW(v); if(kg<30||kg>300) return toast('That weight looks off');
  addWeight(kg); closeModal(); render(); toast('Weight logged');
}
function saveReady(){
  const r=UI.rd, sc=clamp((r.sleep-4)/4*100,0,100)*.4+(r.energy-1)/4*100*.35+(5-r.sore)/4*100*.25;
  S.ready[dayKey()]={sleep:r.sleep,energy:r.energy,sore:r.sore,score:Math.round(sc)}; UI.rd=null; save(); closeModal(); render(); toast('Check-in saved');
}
function saveCardio(){
  const type=val('cd_t'), min=num('cd_m'); if(!(min>0)) return toast('Enter minutes');
  const kcal=num('cd_k')!=null&&val('cd_k')!==''?Math.round(num('cd_k')):Math.round(CARDIO[type].met*curWeight()*min/60);
  S.cardio.push({id:uid(),ts:Date.now(),d:dayKey(),type,min,kcal}); save(); closeModal(); render(); toast('Cardio logged · '+kcal+' kcal');
}
function saveLifts(){
  MAIN_LIFTS.forEach(l=>{
    const w=num('lm_'+l.id+'_w'), r=num('lm_'+l.id+'_r')||1;
    if(w>0){S.lifts[l.id]=fromDispW(r>1?e1rm(w,r):w)}
  });
  S.reps={pullups:num('lm_pull')||0,pushups:num('lm_push')||0}; save(); closeModal(); render(); toast('Lifts saved');
}

/* ---- active workout ---- */
function newBlock(e){
  const p=prescribe(e,{preset:GOALS[S.profile?S.profile.goal:'maintain'],setAdj:0,ratio:1});
  return {id:e.id,plan:{sets:p.sets,lo:p.lo,hi:p.hi,w:p.w,note:p.note,rest:p.rest,est:p.est,warm:p.warm,tier:p.tier},
    sets:Array.from({length:p.sets},()=>({w:p.w||0,r:e.bw&&e.time?p.lo:Math.round((p.lo+p.hi)/2),done:false}))};
}
function finishWorkout(){
  const w=S.active; if(!w) return;
  if(!w.ex.some(b=>b.sets.some(s=>s.done))){
    if(confirm('No sets were completed. Discard this workout?')){S.active=null;stopRest();save();render()}
    return;
  }
  w.ex.forEach(b=>b.sets=b.sets.filter(s=>s.done));
  w.ex=w.ex.filter(b=>b.sets.length);
  w.end=Date.now(); w.kcal=workoutKcal(w);
  const prs=[];
  w.ex.forEach(b=>{
    const e=EX_MAP[b.id]; if(!e||!e.main||e.ref!==e.id) return;
    const best=Math.max(0,...b.sets.filter(s=>s.r>0&&s.r<=10).map(s=>e1rm(s.w,s.r)));
    const prev=S.lifts[e.id]||0;
    if(best>prev*1.005){S.lifts[e.id]=best; if(prev>0) prs.push(e.n+' → '+fmtW(best,1))}
  });
  S.workouts.push(w); S.active=null; stopRest(); save();
  const mins=Math.round((w.end-w.ts)/60000);
  modal(`${mHead('Workout complete')}<div class="center" style="padding:6px 0 14px"><div class="rk S lg" style="margin:0 auto 12px">✓</div><div class="grid3"><div><b class="num" style="font-size:24px">${workoutSets(w)}</b><div class="xs mut">sets</div></div><div><b class="num" style="font-size:24px">${fmt(toDispW(workoutVolume(w)))}</b><div class="xs mut">${wUnit()}</div></div><div><b class="num" style="font-size:24px">${mins}</b><div class="xs mut">min</div></div></div></div>
  ${prs.length?`<div class="callout ok" style="margin-bottom:10px"><b>New estimated max${prs.length>1?'es':''}</b><br>${prs.map(esc).join('<br>')}</div>`:''}
  <div class="callout">+60 XP. Eat protein, drink water and sleep well. Your next session adjusts automatically from what you just logged.</div><div class="gap"></div><button class="btn pri block" data-act="closeModal">Done</button>`);
  render();
}
function exMenuModal(i){
  const b=S.active.ex[i], e=EX_MAP[b.id];
  const eq=EQUIP[S.settings.equip]||EQUIP.gym, used=new Set(S.active.ex.map(x=>x.id));
  const alts=EXERCISES.filter(x=>x.id!==e.id&&!used.has(x.id)&&eq.has(x.eq)&&x.p.some(m=>e.p.includes(m))).slice(0,8);
  modal(`${mHead(esc(e.n),'Options')}<div class="up" style="margin-bottom:6px">Replace with</div>${alts.map(a=>`<div class="item tap" data-act="exReplace" data-i="${i}" data-id="${a.id}"><div class="grow"><div class="t">${esc(a.n)}</div><div class="s">${a.eq}</div></div>${ic('swap')}</div>`).join('')||'<div class="empty">No alternatives for your equipment.</div>'}
  <div class="gap"></div><button class="btn red block" data-act="exRemove" data-i="${i}">Remove from workout</button>`);
}
function toggleSet(i,j){
  const b=S.active.ex[i], s=b.sets[j]; s.done=!s.done;
  if(s.done){
    s.ts=Date.now(); const e=EX_MAP[b.id];
    if(!s.r) s.r=b.plan?Math.round((b.plan.lo+b.plan.hi)/2):8;
    const rest=(b.plan&&b.plan.rest)||S.settings.restAcc;
    if(j<b.sets.length-1||S.active.ex[i+1]) startRest(rest);
  }
  save(); render();
}

/* ---- data io ---- */
function exportData(){
  flush(); const json=JSON.stringify(S,null,1), name='cataclyzm-backup-'+dayKey()+'.json';
  try{
    const file=new File([json],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})) return navigator.share({files:[file],title:'Cataclyzm backup'}).catch(()=>{});
  }catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}
function importData(){
  const inp=document.createElement('input');inp.type='file';inp.accept='application/json,.json';
  inp.onchange=()=>{const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{
    try{const o=JSON.parse(r.result);if(!o||typeof o!=='object'||!('food' in o))throw 0;if(!confirm('Replace all current data with this backup?'))return;
      const d=DEFAULTS();S=Object.assign(d,o,{settings:Object.assign(d.settings,o.settings||{})});flush();render();toast('Backup restored')}
    catch(e){toast('That file is not a Cataclyzm backup')}};r.readAsText(f)};
  inp.click();
}

/* ====================== EVENT DISPATCH ====================== */
const A={
  closeModal:()=>{closeModal();UI.amt=null},
  goTab:el=>go(el.dataset.tab),
  goCoach:el=>{UI.coach=el.dataset.c;go('coach')},
  coachTab:el=>{UI.coach=el.dataset.c;render()},
  openProfile:()=>openProfile(),
  hideInstall:()=>{S.settings.hideInstall=true;save();render()},
  water:el=>{const k=dayKey();S.water[k]=Math.max(0,waterOf(k)+parseInt(el.dataset.ml));save();render()},
  openWeight:weightModal, openReady:readyModal, openCardio:cardioModal, openLifts:liftsModal, openAvoid:avoidModal, openPlates:platesModal, openRestSet:restSetModal,
  saveWeight, saveReady, saveCardio, saveLifts, saveProfile, saveAmount, saveQuick, saveNewFood,
  saveAvoid:()=>{S.settings.avoid=val('av_t').trim();save();closeModal();render();toast('Avoid list saved')},
  saveRest:()=>{['restMain','restAcc','restIso'].forEach(k=>{const v=num('rs_'+k);if(v>=10&&v<=900)S.settings[k]=Math.round(v)});save();closeModal();toast('Saved')},
  setSound:el=>{S.settings.sound=el.dataset.v==='1';save();restSetModal()},
  setUnits:el=>{S.settings.units=el.dataset.u;save();render()},
  setBurn:el=>{S.settings.burnCredit=parseFloat(el.dataset.v);save();render()},
  pfPick:el=>{UI.pf[el.dataset.k]=el.dataset.v;$$(`[data-act="pfPick"][data-k="${el.dataset.k}"]`).forEach(b=>b.classList.toggle('on',b===el))},
  pfUnits:el=>{collectPf();S.settings.units=el.dataset.u;save();profileModal(!S.profile);render()},
  exportData, importData,
  resetAll:()=>{if(confirm('Erase ALL Cataclyzm data on this device? This cannot be undone.')&&confirm('Really erase everything?')){try{localStorage.removeItem(KEY)}catch(e){}S=DEFAULTS();UI.tab='home';render();toast('All data erased')}},
  applyAdaptive:el=>{S.tdeeOverride=parseInt(el.dataset.v);save();render();toast('Maintenance updated')},
  clearAdaptive:()=>{S.tdeeOverride=null;save();render()},
  /* food */
  openFood:el=>{UI.pick={meal:el.dataset.meal||guessMeal(),date:UI.tab==='food'?UI.foodDate:dayKey()};UI.foodTab='all';UI.foodQ='';foodPickerModal()},
  foodTab:el=>{UI.foodTab=el.dataset.t;foodPickerModal()},
  pickFood:el=>{const f=getFood(el.dataset.id);if(f)amountModal(f,{meal:UI.pick.meal,date:UI.pick.date})},
  foodShift:el=>{UI.foodDate=dayKey(addDays(fromKey(UI.foodDate),parseInt(el.dataset.n)));render()},
  editEntry:el=>{const e=S.food.find(x=>x.id===el.dataset.id);if(!e)return;const f=e.fid&&getFood(e.fid);
    if(f)amountModal(f,{entry:e});else modal(`${mHead(esc(e.n),'Quick entry · '+fmt(e.k)+' kcal')}<div class="sub" style="margin-bottom:12px">P ${round(e.p)} · C ${round(e.c)} · F ${round(e.f)}</div><button class="btn red block" data-act="delEntry" data-id="${e.id}">${ic('trash')}Delete entry</button>`)},
  delEntry:el=>{S.food=S.food.filter(x=>x.id!==el.dataset.id);save();closeModal();render();toast('Removed')},
  quickAdd:quickAddModal, newFood:newFoodModal,
  amtStep:el=>{const u=val('au'),inp=$('#aq'),st=STEP[u]||1;inp.value=qtyStr(Math.max(0,round((parseFloat(inp.value)||0)+st*parseInt(el.dataset.d),3)));updateAmount()},
  copyPrev:()=>{const prev=dayKey(addDays(fromKey(UI.foodDate),-1)),es=dayEntries(prev);if(!es.length)return toast('Nothing logged the day before');
    es.forEach(e=>S.food.push(Object.assign({},e,{id:uid(),d:UI.foodDate,ts:Date.now()})));save();render();toast('Copied '+es.length+' entries')},
  logIdea:el=>{const m=(UI.ideas||[])[parseInt(el.dataset.i)];if(!m)return;const meal=guessMeal(),d=dayKey();
    m.items.forEach(it=>addToLog(it.food,it.amt,it.food.base,meal,d));render();toast('Meal logged')},
  /* train */
  startRec:()=>{if(S.active)return go('train');const ses=buildSession();if(ses.rest)return;startWorkoutFrom(ses);UI.tab='train';render()},
  startRecForce:()=>{const ses=buildSession({force:true});startWorkoutFrom(ses);UI.tab='train';render()},
  startEmpty:()=>{S.active={id:uid(),ts:Date.now(),name:'Custom Workout',type:'Custom',ex:[]};save();render();exPickerModal()},
  openExPicker:exPickerModal,
  addExercise:el=>{const e=EX_MAP[el.dataset.id];if(!e||!S.active)return;S.active.ex.push(newBlock(e));save();closeModal();render()},
  exMenu:el=>exMenuModal(parseInt(el.dataset.i)),
  exReplace:el=>{const i=parseInt(el.dataset.i),e=EX_MAP[el.dataset.id];S.active.ex[i]=newBlock(e);save();closeModal();render()},
  exRemove:el=>{S.active.ex.splice(parseInt(el.dataset.i),1);save();closeModal();render()},
  toggleSet:el=>toggleSet(parseInt(el.dataset.i),parseInt(el.dataset.j)),
  addSet:el=>{const b=S.active.ex[parseInt(el.dataset.i)],l=b.sets[b.sets.length-1]||{w:0,r:8};b.sets.push({w:l.w,r:l.r,done:false});save();render()},
  delSet:el=>{const b=S.active.ex[parseInt(el.dataset.i)];if(b.sets.length>1)b.sets.pop();save();render()},
  finishWorkout, discardWorkout:()=>{if(confirm('Discard this workout? Logged sets will be lost.')){S.active=null;stopRest();save();render()}},
  viewWorkout:el=>workoutDetail(el.dataset.id),
  delWorkout:el=>{if(!confirm('Delete this workout?'))return;S.workouts=S.workouts.filter(w=>w.id!==el.dataset.id);save();closeModal();render()},
  delCardio:el=>{S.cardio=S.cardio.filter(c=>c.id!==el.dataset.id);save();render()},
  swapEx:el=>{swapExercise(el.dataset.k,el.dataset.id);render();toast('Swapped')},
  restAdd:el=>{REST.end+=parseInt(el.dataset.s)*1000;tickRest()}, restStop:stopRest,
  /* tests */
  openTest:el=>openTest(el.dataset.id), saveTest:saveTestFromInput, saveVo2,
  vo2m:el=>{UI.vo2m=el.dataset.m;vo2Modal()},
  rxTap:()=>{},
  stroopStart:()=>{$('#ss').classList.add('hide');TS.n=0;TS.ok=0;TS.times=[];stroopNext()},
  stroopAns:el=>{TS.times.push(performance.now()-TS.t0);if(el.dataset.c===TS.cur[0])TS.ok++;TS.n++;stroopNext()},
  digStart:digitsShow, digSubmit:digitsSubmit,
  wbPick:el=>{TS.wb[parseInt(el.dataset.i)]=parseInt(el.dataset.v);$$(`[data-act="wbPick"][data-i="${el.dataset.i}"]`).forEach(b=>b.classList.toggle('on',b===el))},
  saveWb:()=>{if(TS.wb.some(x=>x==null))return $('#te').textContent='Please answer every question.';
    const s=Math.round(sum(TS.wb)/(TS.wb.length*4)*100);saveTest('wellbeing',s,s);closeModal();resultToast(TEST_MAP.wellbeing,s)},
};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]'); if(!el) return;
  const fn=A[el.dataset.act]; if(!fn) return;
  if(el.dataset.act==='rxTap') return;
  try{fn(el,e)}catch(err){console.error(err);toast('Something went wrong')}
});
document.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-act="rxTap"]');if(el){e.preventDefault();rxTap()}});
document.addEventListener('input',e=>{
  const el=e.target, k=el.dataset&&el.dataset.in; if(!k) return;
  if(k==='foodq'){UI.foodQ=el.value;const l=$('#flist');if(l)l.innerHTML=foodRows()}
  else if(k==='amount') updateAmount();
  else if(k==='setw'||k==='setr'){
    const b=S.active&&S.active.ex[+el.dataset.i]; if(!b) return; const s=b.sets[+el.dataset.j], v=parseFloat(el.value);
    if(k==='setw') s.w=isNaN(v)?0:fromDispW(v); else s.r=isNaN(v)?0:v; save();
  }
  else if(k==='rd'){UI.rd[el.dataset.k]=parseFloat(el.value);const o=$('#rv_'+el.dataset.k);if(o)o.textContent=el.value}
  else if(k==='plate') platesCalc();
  else if(k==='exq'){$('#exl').innerHTML=exListHtml(el.value)}
});
document.addEventListener('change',e=>{
  const el=e.target, k=el.dataset&&el.dataset.ch; if(!k) return;
  if(k==='amtUnit'){
    const a=UI.amt, nq=fromBase(a.food,a.base,el.value);
    $('#aq').value=qtyStr(nq); a.unit=el.value; updateAmount(true);
  }
  else if(k==='waterGoal'){const v=parseInt(el.value);if(v>=500&&v<=10000){S.settings.waterGoalMl=v;save()}}
  else if(k==='plate') platesCalc();
});

/* ====================== BOOT ====================== */
function boot(){
  render();
  if(!S.profile) setTimeout(()=>{if(!S.profile&&!$('#modal-root').firstChild)openProfile()},350);
  if('serviceWorker' in navigator && /^https?:/.test(location.protocol)){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden') flush();
  else{const today=dayKey();if(UI._day&&UI._day!==today&&UI.foodDate===UI._day)UI.foodDate=today;UI._day=today;if(!$('#modal-root').firstChild)render()}
});
window.addEventListener('pagehide',flush);
UI._day=dayKey();
boot();
