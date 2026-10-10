import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const profile=mkdtempSync(join(tmpdir(),'explorstreet-qa-'));
const browser=spawn('/usr/bin/microsoft-edge-beta',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9482','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws,id=0;const pending=new Map(),errors=[],checks=[];
async function endpoint(){for(let i=0;i<60;i++){try{const pages=await(await fetch('http://127.0.0.1:9482/json/list')).json();const p=pages.find(x=>x.type==='page');if(p)return p.webSocketDebuggerUrl;}catch{}await sleep(200);}throw Error('CDP unavailable');}
function cmd(method,params={}){return new Promise((resolve,reject)=>{const rid=++id;pending.set(rid,{resolve,reject});ws.send(JSON.stringify({id:rid,method,params}));});}
async function js(expression){const r=await cmd('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)throw Error(JSON.stringify(r.result.exceptionDetails));return r.result?.result?.value;}
function add(name,actual,expected){checks.push({name,pass:JSON.stringify(actual)===JSON.stringify(expected),actual,expected});}
async function check(name,expression,expected){add(name,await js(expression),expected);}
async function click(label){const q=JSON.stringify(label);return js("(()=>{const all=Array.from(document.querySelectorAll('[role=button]'));const el=all.find(x=>x.getAttribute('aria-label')==="+q+"||x.innerText?.trim().endsWith("+q+"));if(!el)return 'MISSING';el.click();return true;})()");}
async function clickTest(label){add('click '+label,await click(label),true);}
async function go(path){await cmd('Page.navigate',{url:'http://localhost:8084'+path});await sleep(1350);}
async function size(w,h=844){await cmd('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<1080});await sleep(100);}
try{
 ws=new WebSocket(await endpoint());await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 ws.addEventListener('message',ev=>{const data=JSON.parse(ev.data);if(data.id&&pending.has(data.id)){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(Error(data.error.message)):p.resolve(data);}if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails?.exception?.description||data.params.exceptionDetails?.text);});
 await cmd('Runtime.enable');await cmd('Page.enable');await size(390);await go('/');
 await check('home title',"document.body.innerText.includes('Atur perjalananmu')",true);
 await check('five tabs',"document.querySelectorAll('[role=tab]').length",5);
 await check('home demo data',"document.body.innerText.includes('Ijen Morning Loop')",true);
 await check('home OpenStreetMap iframe',"!!document.querySelector('iframe[src*=\"openstreetmap.org/export/embed.html\"]')",true);
 await check('home OSM area marker',"document.querySelector('iframe[src*=\"openstreetmap.org/export/embed.html\"]')?.src.includes('marker=')",true);
 await check('no screenshot map',"!Array.from(document.querySelectorAll('img')).some(img=>img.naturalWidth===1430 && img.naturalHeight===821)",true);
 await check('Material Icons loaded',"document.fonts.check('18px MaterialIcons')",true);
 await check('home partner control',"document.body.innerText.includes('Mitra')",true);
 await go('/nav');
 await check('nav heading',"document.body.innerText.includes('Navigasi & laporan')",true);
 await check('OSM iframe in navigation',"!!document.querySelector('iframe[src*=\"openstreetmap.org/export/embed.html\"]')",true);
 await check('checkpoint initial',"document.body.innerText.includes('Orientasi area')",true);
 await clickTest('Checkpoint lanjut');
 await check('progress updated',"document.body.innerText.includes('25%')",true);
 await clickTest('Buat laporan contoh');
 await check('report form visible',"document.body.innerText.includes('Catatan opsional')",true);
 await clickTest('Simpan laporan lokal');
 await check('report shown',"document.body.innerText.includes('Draf lokal')",true);
 await clickTest('Akhiri dan buat rekap');await sleep(500);
 await check('recap navigation',"location.pathname==='/feed'",true);
 await check('recap generated',"document.body.innerText.includes('25%')&&document.body.innerText.includes('Rekap terakhir')",true);
 await check('feed text input',"document.querySelector('textarea')!==null",true);
 await check('post input fill',"(()=>{const el=document.querySelector('textarea');if(!el)return false;const set=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;set.call(el,'Catatan lokal setelah sesi');el.dispatchEvent(new Event('input',{bubbles:true}));return true})()",true);
 await sleep(150);await clickTest('Simpan catatan lokal');await sleep(260);
 await check('feed private post saved',"document.body.innerText.includes('Catatan lokal setelah sesi')",true);
 await go('/buddy');
 await check('buddy title',"document.body.innerText.includes('Pace Buddy')",true);
 await check('buddy sample',"document.body.innerText.includes('Sunday Easy Run')",true);
 await clickTest('Saya tertarik');
 await check('interest updated',"document.body.innerText.includes('Batalkan minat')",true);
 await go('/stops');
 await check('stops sample',"document.body.innerText.includes('Kedai Pagi Contoh')",true);
 await clickTest('Lihat voucher demo');
 await check('voucher validity warning',"document.body.innerText.includes('DEMO-ONLY')",true);
 await clickTest('Tutup voucher');
 await go('/partner');
 await check('partner header',"document.body.innerText.includes('Dashboard mitra')",true);
 await check('voucher metric',"document.body.innerText.includes('Voucher dilihat')",true);
 await check('promo input fill',"(()=>{const els=Array.from(document.querySelectorAll('input'));let a=els.find(e=>e.placeholder.includes('Kedai Pagi'));let b=els.find(e=>e.placeholder.includes('Diskon minuman'));if(!a||!b)return false;const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;for(const [el,value] of [[a,'Kedai Alpha Demo'],[b,'Minuman hangat latihan']]){set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));}return true})()",true);
 await sleep(150);await clickTest('Buat promo');await sleep(350);
 await go('/stops');
 await check('custom promo in stops',"document.body.innerText.includes('Kedai Alpha Demo')",true);
 await go('/routes/ijen-run');
 await check('OSM iframe in detail',"!!document.querySelector('iframe[src*=\"openstreetmap.org/export/embed.html\"]')",true);
 await clickTest('Coba simulator navigasi');await sleep(300);
 await check('simulator deep link',"location.pathname==='/nav'",true);
 await go('/');
 for(const w of [320,360,390,428,768,1024,1440]){await size(w);await check('no overflow '+w,'document.documentElement.scrollWidth<=innerWidth',true);}
 console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass),errors},null,2));
 if(errors.length||checks.some(c=>!c.pass))process.exitCode=1;
}catch(e){console.error(e);process.exitCode=1;}finally{ws?.close();browser.kill('SIGTERM');await sleep(150);rmSync(profile,{recursive:true,force:true});}
