'use strict';
/* ====================== ROUTER ====================== */
function render(){
  const v=$v(), top=v.scrollTop;
  const fn={home:viewHome,food:viewFood,train:viewTrain,coach:viewCoach,rank:viewRank,me:viewMe}[UI.tab];
  v.innerHTML=fn();
  v.scrollTop=top;
  $('#nav').innerHTML=NAV.map(([k,n,i])=>`<button class="${UI.tab===k?'on':''}" data-act="goTab" data-tab="${k}" aria-label="${n}"><svg viewBox="0 0 24 24">${ICONS[i]}</svg>${n}</button>`).join('');
}
function go(tab){UI.tab=tab;render();$v().scrollTop=0}

/* ====================== REST TIMER ====================== */
const REST={end:0,total:0,t:null};
function startRest(sec){
  REST.end=Date.now()+sec*1000;REST.total=sec;
  const pill=$('#restpill');pill.hidden=false;tickRest();
  clearInterval(REST.t);REST.t=setInterval(tickRest,250);
}
function tickRest(){
  const left=Math.ceil((REST.end-Date.now())/1000), pill=$('#restpill');
  if(left<=0){stopRest();beep();if(navigator.vibrate)navigator.vibrate([200,100,200]);toast('Rest over. Next set.');return}
  pill.innerHTML=`${ic('timer')}<b>${fmtTime(left)}</b><button data-act="restAdd" data-s="30">+30</button><button data-act="restStop">Skip</button>`;
  const el=$('#elapsed');if(el&&S.active)el.textContent=fmtTime((Date.now()-S.active.ts)/1000);
}
function stopRest(){clearInterval(REST.t);REST.t=null;$('#restpill').hidden=true}
let _ac=null;
function beep(){
  if(!S.settings.sound) return;
  try{_ac=_ac||new (window.AudioContext||window.webkitAudioContext)();const o=_ac.createOscillator(),g=_ac.createGain();o.frequency.value=880;g.gain.value=.15;o.connect(g);g.connect(_ac.destination);o.start();o.stop(_ac.currentTime+.18)}catch(e){}
}
setInterval(()=>{const el=$('#elapsed');if(el&&S.active)el.textContent=fmtTime((Date.now()-S.active.ts)/1000)},1000);

/* ====================== MODALS ====================== */
function weightModal(){
  modal(`${mHead('Log weight')}<div class="field"><label>Body weight (${wUnit()})</label><input type="number" inputmode="decimal" id="wv" value="${numW(curWeight())}" step="0.1" style="font-size:24px;font-weight:800;text-align:center"></div>
  <div class="xs mut" style="margin-bottom:12px">Weigh in at the same time each day (morning, after the bathroom). The trend line smooths daily noise.</div><button class="btn pri block" data-act="saveWeight">Save</button>`);
}
function readyModal(){
  UI.rd=UI.rd||{sleep:7.5,energy:3,sore:2};
  const sl=(k,l,mn,mx,st)=>`<div class="field"><label>${l}: <b id="rv_${k}" style="color:var(--tx)">${UI.rd[k]}</b></label><input type="range" min="${mn}" max="${mx}" step="${st}" value="${UI.rd[k]}" data-in="rd" data-k="${k}"></div>`;
  modal(`${mHead('Morning check-in','Used to scale today\'s training volume')}${sl('sleep','Sleep (hours)',3,12,.5)}${sl('energy','Energy (1 low – 5 high)',1,5,1)}${sl('sore','Soreness (1 none – 5 severe)',1,5,1)}<button class="btn pri block" data-act="saveReady">Save check-in</button>`);
}
function cardioModal(){
  modal(`${mHead('Log cardio')}<div class="field"><label>Activity</label><select id="cd_t">${Object.entries(CARDIO).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('')}</select></div>
  <div class="field"><label>Minutes</label><input type="number" inputmode="numeric" id="cd_m" value="30"></div>
  <div class="field"><label>Calories burned (blank = estimate)</label><input type="number" inputmode="numeric" id="cd_k" placeholder="auto"></div><button class="btn pri block" data-act="saveCardio">Save</button>`);
}
function liftsModal(){
  modal(`${mHead('Your max lifts','Enter your best single, or a recent hard set to estimate it')}
  ${MAIN_LIFTS.map(l=>`<div class="field"><label>${l.n}</label><div class="grid2"><input type="number" inputmode="decimal" id="lm_${l.id}_w" value="${S.lifts[l.id]?numW(S.lifts[l.id]):''}" placeholder="weight (${wUnit()})"><input type="number" inputmode="numeric" id="lm_${l.id}_r" placeholder="reps (1 = max)"></div></div>`).join('')}
  <div class="grid2"><div class="field"><label>Max pull-ups</label><input type="number" inputmode="numeric" id="lm_pull" value="${S.reps.pullups||''}"></div><div class="field"><label>Max push-ups</label><input type="number" inputmode="numeric" id="lm_push" value="${S.reps.pushups||''}"></div></div>
  <div class="xs mut" style="margin-bottom:12px">If you enter reps above 1, I estimate your one-rep max with the Epley formula. Strength scores in Rank update automatically.</div>
  <button class="btn pri block" data-act="saveLifts">Save</button>`,true);
}
function avoidModal(){
  modal(`${mHead('Foods I avoid','Excluded from all meal suggestions')}
  <div class="field"><label>Comma-separated words</label><textarea id="av_t" placeholder="peanut, shellfish, dairy, gluten, pork...">${esc(S.settings.avoid)}</textarea></div>
  <div class="xs mut" style="margin-bottom:12px">Matches food names plus categories such as dairy, meat, fish, eggs, nuts, gluten, fried, sugar.</div><button class="btn pri block" data-act="saveAvoid">Save</button>`);
}
function platesModal(){
  const I=imp(); UI.plate=UI.plate||{target:I?225:100};
  modal(`${mHead('Plate calculator','Per side, with a standard bar')}
  <div class="field"><label>Target weight (${wUnit()})</label><input type="number" inputmode="decimal" id="pl_t" value="${UI.plate.target}" data-in="plate"></div>
  <div class="field"><label>Bar</label><select id="pl_b" data-ch="plate"><option value="${I?45:20}">${I?'45 lb':'20 kg'} bar</option><option value="${I?35:15}">${I?'35 lb':'15 kg'} bar</option></select></div>
  <div class="card flat" id="pl_out" style="padding:14px"></div>`);
  platesCalc();
}
function platesCalc(){
  const I=imp(), t=parseFloat($('#pl_t').value)||0, b=parseFloat($('#pl_b').value), plates=I?[45,35,25,10,5,2.5]:[25,20,15,10,5,2.5,1.25];
  UI.plate.target=t; let side=(t-b)/2; if(side<0) return $('#pl_out').innerHTML='<div class="mut">Target is below the bar weight.</div>';
  const out=[]; plates.forEach(p=>{const n=Math.floor(side/p+1e-6);if(n){out.push([p,n]);side-=n*p}});
  $('#pl_out').innerHTML=out.length?out.map(([p,n])=>`<div class="row sp item"><b>${p} ${wUnit()}</b><span>× ${n} per side</span></div>`).join('')+(side>.01?`<div class="xs mut" style="margin-top:8px">${round(side*2,2)} ${wUnit()} short of target with these plates.</div>`:''):'<div class="mut">Just the bar.</div>';
}
function restSetModal(){
  const f=(k,l)=>`<div class="field"><label>${l} (seconds)</label><input type="number" inputmode="numeric" id="rs_${k}" value="${S.settings[k]}"></div>`;
  modal(`${mHead('Rest timers')}${f('restMain','Main lifts')}${f('restAcc','Compound accessories')}${f('restIso','Isolation')}
  <div class="field"><label>Sound</label><div class="seg"><button class="${S.settings.sound?'on':''}" data-act="setSound" data-v="1">On</button><button class="${!S.settings.sound?'on':''}" data-act="setSound" data-v="0">Off</button></div></div><button class="btn pri block" data-act="saveRest">Save</button>`);
}
function exPickerModal(){
  modal(`${mHead('Add exercise')}<input type="search" id="exq" placeholder="Search exercises" data-in="exq" autocomplete="off"><div id="exl" style="margin-top:8px">${exListHtml('')}</div>`,true);
}
function exListHtml(q){
  q=q.toLowerCase().trim(); const list=EXERCISES.filter(e=>!q||e.n.toLowerCase().includes(q)||exMeta(e).includes(q)||e.eq.includes(q));
  return list.map(e=>`<div class="item tap" data-act="addExercise" data-id="${e.id}"><div class="grow"><div class="t">${esc(e.n)}</div><div class="s">${esc(exMeta(e))} · ${e.eq}</div></div>${ic('plus')}</div>`).join('')||'<div class="empty">No matches.</div>';
}
function workoutDetail(id){
  const w=S.workouts.find(x=>x.id===id); if(!w) return;
  modal(`${mHead(esc(w.name),new Date(w.ts).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}))}
  <div class="grid3" style="text-align:center;margin-bottom:10px"><div><b class="num" style="font-size:22px">${workoutSets(w)}</b><div class="xs mut">sets</div></div><div><b class="num" style="font-size:22px">${fmt(toDispW(workoutVolume(w)))}</b><div class="xs mut">${wUnit()}</div></div><div><b class="num" style="font-size:22px">${w.end?Math.round((w.end-w.ts)/60000):'–'}</b><div class="xs mut">min</div></div></div>
  ${(w.ex||[]).map(x=>{const e=EX_MAP[x.id];const ds=x.sets.filter(s=>s.done);return ds.length?`<div class="item"><div class="grow"><div class="t">${esc(e?e.n:x.id)}</div><div class="s">${ds.map(s=>(e&&e.bw&&!s.w?'BW':numW(s.w))+'×'+s.r).join(' · ')}</div></div></div>`:''}).join('')}
  <div class="gap"></div><button class="btn red block" data-act="delWorkout" data-id="${id}">Delete workout</button>`,true);
}

/* ---- tests ---- */
const TS={};
function openTest(id){
  const t=TEST_MAP[id]; TS.id=id;
  if(id==='reaction') return reactionModal();
  if(id==='stroop') return stroopModal();
  if(id==='digits') return digitsModal();
  if(id==='wellbeing') return wellbeingModal();
  if(id==='vo2') return vo2Modal();
  const unit=t.kind==='len'?lUnit():t.kind==='time'?'m:ss':t.kind==='reps'?'reps':(t.unit||'');
  const warn=['pushups','plank','pullups','burpee','run400','vjump','bjump'].includes(id)?'<div class="callout warn" style="margin-bottom:12px">Warm up first and stop if you feel pain, dizziness or chest discomfort.</div>':'';
  modal(`${mHead(esc(t.n))}${warn}<div class="sub" style="margin-bottom:14px">${esc(t.how||'')}</div>
  <div class="field"><label>Your result (${unit})</label><input type="${t.kind==='time'?'text':'number'}" inputmode="${t.kind==='time'?'text':'decimal'}" id="tv" placeholder="${t.kind==='time'?'1:30':''}" style="font-size:24px;font-weight:800;text-align:center"></div>
  <div class="err" id="te"></div><button class="btn pri block" data-act="saveTest">Score it</button>`);
}
function saveTestFromInput(){
  const t=TEST_MAP[TS.id]; let raw=$('#tv').value, v;
  if(t.kind==='time') v=parseTime(raw); else v=parseFloat(raw);
  if(isNaN(v)||(t.kind!=='len'&&v<0)||(raw||'').trim()===''){return $('#te').textContent='Enter a valid number.'}
  if(t.kind==='len') v=fromDispL(v);
  const s=scoreTest(t.id,v); saveTest(t.id,v,s); closeModal(); resultToast(t,s);
}
function resultToast(t,s){toast(`${t.n}: ${s}/100 · Rank ${rankOf(s)}`);render()}
function vo2Modal(){
  UI.vo2m=UI.vo2m||'cooper';
  const m=UI.vo2m;
  const body={cooper:`<div class="sub" style="margin:10px 0">Run or walk as far as you can in 12 minutes on a flat track. Enter the distance.</div><div class="field"><label>Distance (${imp()?'miles':'km'})</label><input type="number" inputmode="decimal" id="vv" step="0.01"></div>`,
    run15:`<div class="sub" style="margin:10px 0">Time a 1.5 mile (2.4 km) all-out run.</div><div class="field"><label>Time (m:ss)</label><input type="text" id="vv" placeholder="12:30"></div>`,
    direct:`<div class="sub" style="margin:10px 0">Enter a value from your watch or lab test.</div><div class="field"><label>VO₂ max (ml/kg/min)</label><input type="number" inputmode="decimal" id="vv"></div>`}[m];
  modal(`${mHead('VO₂ max estimate')}<div class="callout warn">Maximal running is demanding. Skip it if you are unwell or untrained, and stop if you feel faint or have chest pain.</div>
  <div class="seg" style="margin-top:12px"><button class="${m==='cooper'?'on':''}" data-act="vo2m" data-m="cooper">12-min run</button><button class="${m==='run15'?'on':''}" data-act="vo2m" data-m="run15">1.5 mi run</button><button class="${m==='direct'?'on':''}" data-act="vo2m" data-m="direct">I know it</button></div>${body}<div class="err" id="te"></div><button class="btn pri block" data-act="saveVo2">Score it</button>`);
}
function saveVo2(){
  const m=UI.vo2m, raw=$('#vv').value; let v,vo;
  if(m==='run15'){v=parseTime(raw);if(!(v>200)||v>2400)return $('#te').textContent='Enter a time like 12:30.';vo=vo2From(m,v)}
  else{v=parseFloat(raw);if(!(v>0))return $('#te').textContent='Enter a valid number.';if(m==='cooper')v=v*(imp()?1609.34:1000);vo=vo2From(m,v)}
  vo=clamp(vo,10,90); const s=scoreTest('vo2',vo); saveTest('vo2',round(vo,1),s,{m:m==='cooper'?'12-min':m==='run15'?'1.5 mi':'direct'}); closeModal(); resultToast(TEST_MAP.vo2,s);
}
function reactionModal(){
  TS.trials=[];TS.state='idle';
  modal(`${mHead('Reaction time','5 trials')}<div class="arena idle" id="arena" data-act="rxTap">Tap to start</div><div class="sub center" id="rxinfo" style="margin-top:12px">Wait for green, then tap as fast as you can. Tapping early restarts the trial.</div>`);
}
function rxTap(){
  const a=$('#arena'); if(!a) return;
  if(TS.state==='idle'||TS.state==='between'){
    TS.state='wait';a.className='arena wait';a.textContent='Wait for green...';
    TS.to=setTimeout(()=>{TS.state='go';TS.t0=performance.now();a.className='arena go';a.textContent='TAP!'},1200+Math.random()*2800);
  }else if(TS.state==='wait'){
    clearTimeout(TS.to);TS.state='idle';a.className='arena idle';a.textContent='Too soon. Tap to retry.';
  }else if(TS.state==='go'){
    const ms=performance.now()-TS.t0;TS.trials.push(ms);TS.state='between';
    $('#rxinfo').textContent=TS.trials.map(x=>Math.round(x)+' ms').join(' · ');
    if(TS.trials.length>=5){
      const sorted=TS.trials.slice().sort((x,y)=>x-y), v=avg(sorted.slice(0,4)), s=scoreTest('reaction',v);
      saveTest('reaction',v,s);TS.state='done';a.className='arena idle';a.innerHTML=`${Math.round(v)} ms<br><span style="font-size:15px;color:var(--mut)">${s}/100 · Rank ${rankOf(s)}</span>`;render();
    }else{a.className='arena idle';a.innerHTML=`${Math.round(ms)} ms<br><span style="font-size:15px;color:var(--mut)">Tap for trial ${TS.trials.length+1} of 5</span>`}
  }
}
function stroopModal(){
  TS.n=0;TS.ok=0;TS.times=[];
  modal(`${mHead('Stroop focus test','12 words')}<div class="sub">Tap the button that matches the <b>ink color</b> of the word, not what it says. Be fast and accurate.</div><div class="word" id="sw">Ready?</div><div class="grid2" id="sb"></div><div class="gap"></div><button class="btn pri block" data-act="stroopStart" id="ss">Start</button>`);
}
function stroopNext(){
  if(TS.n>=12){
    const acc=TS.ok/12*100, ms=avg(TS.times), v={acc,ms}, s=scoreTest('stroop',v);
    saveTest('stroop',v,s);$('#sw').textContent=`${s}/100`;$('#sw').style.color='var(--ember2)';$('#sb').innerHTML=`<div class="sub center" style="grid-column:1/3">${Math.round(acc)}% correct · ${Math.round(ms)} ms average · Rank ${rankOf(s)}</div>`;render();return;
  }
  let w=STROOP_COLORS[Math.floor(Math.random()*4)], c;
  do{c=STROOP_COLORS[Math.floor(Math.random()*4)]}while(TS.n%3!==2&&c===w&&Math.random()<.7);
  TS.cur=c;TS.t0=performance.now();
  $('#sw').textContent=w[0];$('#sw').style.color=c[1];
  $('#sb').innerHTML=STROOP_COLORS.map(x=>`<button class="btn" data-act="stroopAns" data-c="${x[0]}">${x[0]}</button>`).join('');
}
function digitsModal(){
  TS.len=3;TS.best=0;TS.fails=0;
  modal(`${mHead('Digit memory','Working memory span')}<div class="sub">Memorize the digits, then type them back in the same order. Each success adds a digit; two misses in a row ends the test.</div><div class="digits" id="dg">–</div><input type="text" inputmode="numeric" id="di" class="hide" placeholder="Type the digits" style="text-align:center;font-size:22px"><div class="gap"></div><button class="btn pri block" data-act="digStart" id="ds">Start</button>`);
}
function digitsShow(){
  TS.seq=Array.from({length:TS.len},()=>Math.floor(Math.random()*10)).join('');
  $('#di').classList.add('hide');$('#di').value='';$('#ds').classList.add('hide');
  $('#dg').textContent=TS.seq;
  setTimeout(()=>{if(!$('#dg'))return;$('#dg').textContent='?';$('#di').classList.remove('hide');$('#di').focus();$('#ds').classList.remove('hide');$('#ds').dataset.act='digSubmit';$('#ds').textContent='Submit'},600+TS.len*500);
}
function digitsSubmit(){
  const ok=$('#di').value.trim()===TS.seq;
  if(ok){TS.best=Math.max(TS.best,TS.len);TS.len++;TS.fails=0;digitsShow();return}
  TS.fails++;
  if(TS.fails>=2){const v=TS.best,s=scoreTest('digits',v);saveTest('digits',v,s);$('#di').classList.add('hide');$('#dg').innerHTML=`<span style="font-size:36px">${v} digits</span>`;$('#ds').classList.add('hide');toast(`Digit memory: ${s}/100 · Rank ${rankOf(s)}`);render();return}
  toast('Not quite. One more try.');digitsShow();
}
function wellbeingModal(){
  TS.wb=new Array(WELLBEING_ITEMS.length).fill(null);
  modal(`${mHead('Wellbeing check-in','Over the last two weeks...')}${WELLBEING_ITEMS.map((q,i)=>`<div class="field"><label style="text-transform:none;letter-spacing:0;font-size:14px;color:var(--tx)">${esc(q)}</label><div class="seg">${['Never','Rarely','Some','Often','Always'].map((n,v)=>`<button data-act="wbPick" data-i="${i}" data-v="${v}" style="font-size:11.5px;padding:9px 2px">${n}</button>`).join('')}</div></div>`).join('')}
  <div class="err" id="te"></div><button class="btn pri block" data-act="saveWb">See result</button>
  <div class="callout" style="margin-top:12px">This is a self-reflection tool, not a diagnosis. If you are struggling, please reach out to a doctor, a counselor, or someone you trust. In the US you can call or text 988 any time.</div>`,true);
}
