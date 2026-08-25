(()=>{'use strict';
const C=window.CBL=window.CBL||{};
C.BASE='/binary-visualizer/';
C.QUICK=['binary','ip-address','dns','port-number','tcp-udp','http-https'];
C.$=(s,r=document)=>r.querySelector(s);C.$$=(s,r=document)=>[...r.querySelectorAll(s)];
C.key='cbl-progress-v4';
C.labels={'binary':'2進数','hexadecimal':'16進数','data-size':'bit・byte','text-encoding':'文字コード','bitwise':'AND・OR・XOR','ip-address':'IPアドレス','cidr':'CIDR','dhcp':'DHCP','arp':'ARP / MAC','dns':'DNS','port-number':'ポート番号','tcp-udp':'TCP / UDP','three-way-handshake':'3-way handshake','tcp-close':'TCP切断','http-https':'HTTP / HTTPS','tls':'TLS','http-methods':'HTTPメソッド','http-status':'HTTPステータス','cookie-cache':'Cookie / Cache','session':'Session'};
C.read=()=>{try{return JSON.parse(localStorage.getItem(C.key)||'{}')}catch{return {}}};
C.isDone=s=>!!C.read()[s];
C.setDone=(s,v)=>{const d=C.read();if(v)d[s]=true;else delete d[s];localStorage.setItem(C.key,JSON.stringify(d));C.updateHome()};
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
C.initQuiz=()=>C.$$('.quiz').forEach(box=>{const answer=box.dataset.answer,explain=box.dataset.explain||'';C.$$('.quiz-option',box).forEach(btn=>btn.addEventListener('click',()=>{const ok=btn.dataset.value===answer;C.$$('.quiz-option',box).forEach(b=>{b.disabled=true;if(b.dataset.value===answer)b.classList.add('correct')});if(!ok)btn.classList.add('wrong');const f=C.$('.quiz-feedback',box);f.textContent=(ok?'正解。':'ここはもう一度確認。')+' '+explain;f.className='quiz-feedback '+(ok?'ok':'ng')}))});
C.initProgress=()=>{const s=document.body.dataset.lesson,b=C.$('.complete-btn');if(!s||!b)return;const sync=()=>{const v=C.isDone(s);b.classList.toggle('done',v);b.textContent=v?'自分用チェック済み ✓':'自分用に「分かった」を記録'};sync();b.addEventListener('click',()=>{C.setDone(s,!C.isDone(s));sync()})};
C.initCopy=()=>C.$$('[data-copy-url]').forEach(b=>b.addEventListener('click',async()=>{const u=location.origin+location.pathname;try{await navigator.clipboard.writeText(u);b.textContent='URLをコピーしました ✓'}catch{prompt('このURLをコピーしてください',u)}}));
C.initUtility=()=>{const p=C.$('[data-present]');if(p)p.onclick=()=>{const u=new URL(location.href);u.searchParams.set('present','1');location.href=u};const x=C.$('[data-exit-present]');if(x)x.onclick=()=>{const u=new URL(location.href);u.searchParams.delete('present');location.href=u};C.$$('[data-print]').forEach(b=>b.onclick=()=>print());const r=C.$('[data-reset-progress]');if(r)r.onclick=()=>{if(confirm('このブラウザの自分用チェックをすべて消しますか？')){localStorage.removeItem(C.key);C.updateHome()}}};
C.initGlossary=()=>{const input=C.$('[data-glossary-search]');if(!input)return;const items=C.$$('.glossary-item'),run=()=>{const q=input.value.trim().toLowerCase();items.forEach(x=>x.hidden=q&&!x.textContent.toLowerCase().includes(q));C.$('[data-glossary-count]').textContent=items.filter(x=>!x.hidden).length+'語表示'};input.addEventListener('input',run);run()};
C.boot=()=>{C.updateHome();C.initModes();C.initQuiz();C.initProgress();C.initCopy();C.initUtility();C.initGlossary();if(C.initLab)C.initLab()};
const start=()=>C.boot();
if(document.readyState==='loading'||document.readyState==='interactive')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();