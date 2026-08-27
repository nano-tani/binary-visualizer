(()=>{'use strict';
const C=window.CBL=window.CBL||{};
C.BASE='/binary-visualizer/';
C.QUICK=['binary','ip-address','dns','port-number','tcp-udp','http-https'];
C.$=(s,r=document)=>r.querySelector(s);C.$$=(s,r=document)=>[...r.querySelectorAll(s)];
C.key='cbl-progress-v4';
C.analyticsConsentKey='cbl-ga-consent-v1';
C.pendingEvents=[];
C.labels={'binary':'2進数','hexadecimal':'16進数','data-size':'bit・byte','text-encoding':'文字コード','bitwise':'AND・OR・XOR','ip-address':'IPアドレス','cidr':'CIDR','dhcp':'DHCP','arp':'ARP / MAC','dns':'DNS','port-number':'ポート番号','tcp-udp':'TCP / UDP','three-way-handshake':'3-way handshake','tcp-close':'TCP切断','http-https':'HTTP / HTTPS','tls':'TLS','http-methods':'HTTPメソッド','http-status':'HTTPステータス','cookie-cache':'Cookie / Cache','session':'Session'};
C.read=()=>{try{return JSON.parse(localStorage.getItem(C.key)||'{}')}catch{return {}}};
C.isDone=s=>!!C.read()[s];
C.setDone=(s,v)=>{const d=C.read();if(v)d[s]=true;else delete d[s];localStorage.setItem(C.key,JSON.stringify(d));C.updateHome()};
C.analyticsConsent=()=>localStorage.getItem(C.analyticsConsentKey)||'';
C.track=(name,params={})=>{
 if(C.analyticsConsent()!=='granted')return;
 const payload=Object.assign({lesson:document.body.dataset.lesson||'home'},params);
 if(typeof window.gtag==='function')window.gtag('event',name,payload);else C.pendingEvents.push([name,payload]);
};
C.loadGA=id=>{
 if(C.gaLoaded||!/^G-[A-Z0-9]+$/i.test(id))return;
 C.gaLoaded=true;C.gaId=id;
 window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};
 window.gtag('js',new Date());window.gtag('config',id,{send_page_view:true});
 const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(s);
 C.pendingEvents.splice(0).forEach(([n,p])=>window.gtag('event',n,p));
 const mode=document.body.classList.contains('quick-mode')?'quick':document.body.classList.contains('present-mode')?'present':'full';
 if(document.body.dataset.lesson)C.track('lesson_view',{path_mode:mode});
};
C.clearGACookies=()=>{document.cookie.split(';').map(x=>x.split('=')[0].trim()).filter(n=>n==='_ga'||n.startsWith('_ga_')).forEach(n=>{document.cookie=n+'=; Max-Age=0; path=/';document.cookie=n+'=; Max-Age=0; path=/; domain=.'+location.hostname})};
C.renderConsent=id=>{
 if(C.$('.analytics-consent'))return;
 const d=document.createElement('div');d.className='analytics-consent';d.setAttribute('role','dialog');d.setAttribute('aria-label','アクセス解析の確認');
 d.innerHTML='<div class="analytics-consent-inner"><div><strong>アクセス解析について</strong><p>教材改善のためGoogle Analytics 4を利用します。同意すると、閲覧ページや教材操作などの匿名化された利用状況を計測します。教材に入力した文字列や数値そのものは送信しません。</p><a href="'+C.BASE+'privacy/">詳しく見る</a></div><div class="analytics-consent-actions"><button type="button" class="btn" data-ga-deny>同意しない</button><button type="button" class="btn primary" data-ga-allow>同意する</button></div></div>';
 document.body.appendChild(d);
 C.$('[data-ga-allow]',d).onclick=()=>{localStorage.setItem(C.analyticsConsentKey,'granted');d.remove();C.loadGA(id)};
 C.$('[data-ga-deny]',d).onclick=()=>{localStorage.setItem(C.analyticsConsentKey,'denied');C.clearGACookies();d.remove()};
};
C.initAnalytics=async()=>{
 try{
  const r=await fetch(C.BASE+'analytics.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)return;
  const j=await r.json(),id=String(j.measurementId||'').trim();if(!/^G-[A-Z0-9]+$/i.test(id))return;
  const c=C.analyticsConsent();if(c==='granted')C.loadGA(id);else if(c!=='denied')C.renderConsent(id);
 }catch{}
};
C.updateHome=()=>{
 const d=C.read(),all=C.$$('[data-lesson-link]');all.forEach(a=>a.classList.toggle('is-done',!!d[a.dataset.lessonLink]));
 const n=Object.keys(d).length,txt=C.$('[data-progress-text]'),bar=C.$('[data-progress-bar]');
 if(txt)txt.textContent=n+' / 20 自分用チェック済み';if(bar)bar.style.width=Math.min(100,n/20*100)+'%';
 const q=C.$('[data-quick-progress]');if(q)q.textContent=C.QUICK.filter(x=>d[x]).length+' / 6 完了'
};
C.initModes=()=>{
 const q=new URLSearchParams(location.search),lesson=document.body.dataset.lesson;
 if(q.get('path')==='quick'&&C.QUICK.includes(lesson))document.body.classList.add('quick-mode');
 if(q.get('present')==='1')document.body.classList.add('present-mode');
 if(q.get('teacher')==='1'){const t=C.$('.teacher');if(t)t.open=true}
 if(document.body.classList.contains('quick-mode')){
  const i=C.QUICK.indexOf(lesson),box=C.$('.quick-banner');
  if(box){C.$('[data-quick-count]',box).textContent=(i+1)+' / 6';C.$('[data-quick-name]',box).textContent='最短コース';C.$('[data-quick-dots]',box).innerHTML=C.QUICK.map((_,j)=>'<i class="'+(j<i?'done':j===i?'now':'')+'"></i>').join('')}
  const nav=C.$('.lesson-nav');if(nav){const prev=i>0?C.QUICK[i-1]:null,next=i<C.QUICK.length-1?C.QUICK[i+1]:null;
   nav.innerHTML=(prev?`<a href="${C.BASE}${prev}/?path=quick"><small>← 前</small><strong>${C.labels[prev]}</strong></a>`:`<a href="${C.BASE}"><small>← トップ</small><strong>コースを選び直す</strong></a>`)+(next?`<a class="next" href="${C.BASE}${next}/?path=quick"><small>次 →</small><strong>${C.labels[next]}</strong></a>`:`<a class="next" href="${C.BASE}"><small>最短コース完了</small><strong>次に学ぶ内容を選ぶ →</strong></a>`)
  }
 }
};
C.initQuiz=()=>C.$$('.quiz').forEach((box,qi)=>{const answer=box.dataset.answer,explain=box.dataset.explain||'';C.$$('.quiz-option',box).forEach(btn=>btn.addEventListener('click',()=>{const ok=btn.dataset.value===answer;C.$$('.quiz-option',box).forEach(b=>{b.disabled=true;if(b.dataset.value===answer)b.classList.add('correct')});if(!ok)btn.classList.add('wrong');const f=C.$('.quiz-feedback',box);f.textContent=(ok?'正解。':'ここはもう一度確認。')+' '+explain;f.className='quiz-feedback '+(ok?'ok':'ng');C.track('quiz_answer',{question_number:qi+1,result:ok?'correct':'incorrect',path_mode:document.body.classList.contains('quick-mode')?'quick':'full'})}))});
C.initProgress=()=>{const s=document.body.dataset.lesson,b=C.$('.complete-btn');if(!s||!b)return;const sync=()=>{const v=C.isDone(s);b.classList.toggle('done',v);b.textContent=v?'自分用チェック済み ✓':'自分用に「分かった」を記録'};sync();b.addEventListener('click',()=>{const next=!C.isDone(s);C.setDone(s,next);sync();C.track('progress_mark',{state:next?'marked':'unmarked',path_mode:document.body.classList.contains('quick-mode')?'quick':'full'})})};
C.initCopy=()=>C.$$('[data-copy-url]').forEach(b=>b.addEventListener('click',async()=>{const u=location.origin+location.pathname;try{await navigator.clipboard.writeText(u);b.textContent='URLをコピーしました ✓'}catch{prompt('このURLをコピーしてください',u)}C.track('share_url')}));
C.initUtility=()=>{const p=C.$('[data-present]');if(p)p.onclick=()=>{C.track('presentation_mode_open');const u=new URL(location.href);u.searchParams.set('present','1');location.href=u};const x=C.$('[data-exit-present]');if(x)x.onclick=()=>{const u=new URL(location.href);u.searchParams.delete('present');location.href=u};C.$$('[data-print]').forEach(b=>b.onclick=()=>{C.track('print_open');print()});const r=C.$('[data-reset-progress]');if(r)r.onclick=()=>{if(confirm('このブラウザの自分用チェックをすべて消しますか？')){localStorage.removeItem(C.key);C.updateHome();C.track('progress_reset')}}};
C.initGlossary=()=>{const input=C.$('[data-glossary-search]');if(!input)return;const items=C.$$('.glossary-item'),run=()=>{const q=input.value.trim().toLowerCase();items.forEach(x=>x.hidden=q&&!x.textContent.toLowerCase().includes(q));C.$('[data-glossary-count]').textContent=items.filter(x=>!x.hidden).length+'語表示'};input.addEventListener('input',run);run()};
C.initLabTracking=()=>{const lab=C.$('[data-lab]');if(!lab)return;let sent=false;const run=e=>{if(sent||!e.target.closest('button,input,select'))return;sent=true;C.track('lesson_interaction',{path_mode:document.body.classList.contains('quick-mode')?'quick':'full'})};lab.addEventListener('click',run,true);lab.addEventListener('change',run,true)};
C.initPrivacy=()=>{const f=C.$('.site-footer .wrap');if(f&&!C.$('a[href*="privacy"]',f)){f.insertAdjacentHTML('beforeend',' · <a href="'+C.BASE+'privacy/">プライバシー</a>')}const st=C.$('[data-ga-status]');if(st)st.textContent=C.analyticsConsent()==='granted'?'アクセス解析に同意中':C.analyticsConsent()==='denied'?'アクセス解析を拒否中':'未選択';C.$$('[data-ga-choice]').forEach(b=>b.onclick=()=>{const v=b.dataset.gaChoice;localStorage.setItem(C.analyticsConsentKey,v);if(v!=='granted')C.clearGACookies();location.reload()})};
C.initToolsNav=()=>{const nav=C.$('.header-nav');if(nav&&!C.$('[data-tools-nav]',nav))nav.insertAdjacentHTML('afterbegin','<a data-tools-nav href="'+C.BASE+'tools/">ツール</a>');const s=document.body.dataset.lesson,map={binary:'base-converter',hexadecimal:'base-converter',cidr:'cidr','text-encoding':'text-encoding','port-number':'port','http-https':'url-parser'},hero=C.$('.hero');if(s&&map[s]&&hero&&!C.$('.companion-tool',hero)){const box=document.createElement('div');box.className='companion-tool';box.style.marginTop='12px';box.innerHTML='<a class="btn soft" href="'+C.BASE+'tools/'+map[s]+'/">計算・確認ツールをすぐ使う →</a>';hero.appendChild(box)}};
C.boot=()=>{C.updateHome();C.initModes();C.initQuiz();C.initProgress();C.initCopy();C.initUtility();C.initGlossary();C.initLabTracking();C.initPrivacy();C.initToolsNav();C.initAnalytics();if(C.initLab)C.initLab()};
const start=()=>C.boot();
if(document.readyState==='loading'||document.readyState==='interactive')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();