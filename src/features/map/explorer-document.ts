import type {OsmCafe} from './cafes';
import type {LatLng} from './route-sketch';
import type {GeoPoint,StoreCheckpoint} from './editor-json';

export type MapEditorEvent =
 | {type:'explorstreet:sketch';coordinates:GeoPoint[]}
 | {type:'explorstreet:checkpoint-point';coordinates:GeoPoint};

export interface ExplorerMapPayload {
 area:string;
 latitude:number;
 longitude:number;
 sketch:LatLng[];
 cafes:OsmCafe[];
 showSketch:boolean;
 roadAligned?:boolean;
 destinationMode?:boolean;
 destination?:LatLng|null;
 editorMode?:boolean;
 editorCheckpoints?:StoreCheckpoint[];
}

const documentTemplate = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes">
<title>ExplorStreet Map</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#map{width:100%;height:100%;padding:0;margin:0;background:#dfeae0;font-family:system-ui,-apple-system,sans-serif}
#map{z-index:0}
.leaflet-container{background:#e6eee6;font-family:system-ui,-apple-system,sans-serif}
.leaflet-control-attribution{font-size:10px!important;line-height:15px!important;background:rgba(255,255,255,.94)!important}
.map-control{position:absolute;z-index:1000;right:12px;top:12px;display:flex;flex-direction:column;gap:7px;max-width:132px}
.map-control button{border:1px solid #d5e8d7;background:white;color:#174c37;border-radius:12px;
padding:10px 12px;min-height:43px;font:700 12px system-ui,-apple-system,sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.13);cursor:pointer}
.map-control button.active{background:#174c37;color:#fff}
.map-control button:disabled{opacity:.5;cursor:default}
.map-control.editor-controls{left:10px;right:10px;max-width:none;
 display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.map-control.editor-controls button{padding:7px 9px;min-height:42px}
#legend{position:absolute;z-index:900;left:10px;bottom:26px;max-width:185px;padding:10px 11px;
border-radius:12px;background:rgba(255,255,255,.96);color:#174c37;font:700 11px/1.5 system-ui,-apple-system,sans-serif;box-shadow:0 2px 8px #0002}
#legend small{font-size:10px;display:block;color:#526f5c;font-weight:500;margin-top:3px}
#legend.editor-legend{left:8px;bottom:22px;padding:8px 9px;max-width:182px}
#feedback{position:absolute;z-index:1001;top:10px;left:10px;max-width:160px;padding:8px 10px;
background:rgba(255,255,255,.97);font:700 11px/1.4 system-ui,sans-serif;border-radius:10px;color:#174c37}
#feedback:empty{display:none}
.start-pin,.destination-pin,.cafe-pin{display:block;width:32px;height:32px}
.start-pin svg,.destination-pin svg,.cafe-pin svg{width:100%;height:100%;
filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
.checkpoint-pin{display:block;width:36px;height:43px}
.checkpoint-pin svg{display:block;width:100%;height:100%;overflow:visible;
filter:drop-shadow(0 2px 3px rgba(0,0,0,.30))}
.leaflet-popup-content{margin:11px!important;font:13px/1.5 system-ui,sans-serif;color:#20382d}
.leaflet-popup-content a{color:#236d4c;font-weight:700}
#fallback{display:none;position:absolute;inset:0;z-index:1200;background:#e7f1e6;color:#174c37;
padding:25px;align-items:center;justify-content:center;text-align:center;font:600 13px/1.5 system-ui,sans-serif}
</style>
</head>
<body>
<div id="map" aria-label="Peta interaktif OpenStreetMap"></div>
<div id="feedback" role="status"></div>
<div class="map-control" id="controls">
 <button type="button" id="destination" style="display:none" aria-label="Pilih titik tujuan pada peta">Pilih tujuan</button>
 <button type="button" id="add-stop" style="display:none" aria-label="Tambahkan checkpoint">Tandai checkpoint</button>
 <button type="button" id="draw" aria-label="Gambar konsep manual">Gambar konsep</button>
 <button type="button" id="undo" aria-label="Batalkan titik terakhir" disabled>Urung titik</button>
 <button type="button" id="reset" aria-label="Reset sketsa rute">Reset</button>
</div>
<div id="legend">
 <div id="sketch-status">Memuat rute</div>
 <small id="route-disclaimer">Data model OSM, belum diperiksa di lapangan.</small>
 <small id="cafe-status">Kafe OSM muncul setelah dicari.</small>
 <small id="checkpoint-status"></small>
</div>
<div id="fallback">Peta tidak tersedia. Periksa internet, lalu coba lagi.</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
"use strict";
const payload=__EXPLORER_MAP_PAYLOAD__;
const fallback=document.getElementById('fallback');
if(typeof L==='undefined'){
 fallback.style.display='flex';
 return;
}
const center=[payload.latitude,payload.longitude];
const map=L.map('map',{zoomControl:false,scrollWheelZoom:false,preferCanvas:true}).setView(center,15);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
 attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
 minZoom:10,maxZoom:18,maxNativeZoom:18,
}).addTo(map);
const sketchColor='#e59634';
const roadColor='#15794e';
// Material Icons "place" vector, rendered in a Leaflet marker rather than an oval.
function pinIcon(color,cssClass){
 const svg='<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'
  +'<path fill="'+color+'" stroke="white" stroke-width=".7" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
 return L.divIcon({html:'<span class="'+cssClass+'">'+svg+'</span>',className:'',
  iconSize:[32,32],iconAnchor:[16,30],popupAnchor:[0,-27]});
}
const startIcon=pinIcon('#15794e','start-pin');
let points=payload.showSketch?payload.sketch.map(p=>p.slice()):[];
const initial=points.map(p=>p.slice());
let drawing=payload.editorMode===true,layer=null,startMarker=null,endMarker=null;
let isRoadRoute=payload.roadAligned===true;
let pickingDestination=false;
let pickingCheckpoint=false,checkpointMarker=null;
let checkpointMarkers=[];
const destinationButton=document.getElementById('destination');
const destinationIcon=pinIcon('#eb7427','destination-pin');
// Material-style place pin containing a category glyph. Only "promoted"
// draft entries have an amber star badge; it is not a verification mark.
function checkpointIcon(kind,promoted){
 const kinds={
  store:{
   color:'#376187',
   label:'Toko',
   glyph:'M4 4h16l2 6v3h-2v7H4v-7H2v-3l2-6zm2 2-1.5 4h15L18 6H6zm1 7v5h5v-5H7zm7 0v5h4v-5h-4z'
  },
  cafe:{
   color:'#93613e',
   label:'Kafe',
   glyph:'M4 6h13v2h3a3 3 0 0 1 0 6h-3a6.5 6.5 0 0 1-6.5 6H10A6 6 0 0 1 4 14V6zm13 4v2h3a1 1 0 0 0 0-2h-3zM6 4h2v1H6zm4-2h2v3h-2zm4 2h2v1h-2z'
  },
  rest:{
   color:'#34745d',
   label:'Rehat',
   glyph:'M4 5h16v3H4V5zm2 4h12v2H6V9zm-2 3h16v3H4v-3zm3 4h2v4H7v-4zm8 0h2v4h-2v-4z'
  }
 };
 const item=kinds[kind]||kinds.rest;
 const badge=promoted
  ?'<circle class="promo-badge" cx="33" cy="8" r="7" fill="#f3c44e" stroke="white" stroke-width="2"/>'
   +'<path d="M33 3.7l1.15 2.55 2.8.31-2.1 1.92.58 2.76L33 9.89l-2.43 1.35.58-2.76-2.1-1.92 2.8-.31z" fill="#65450f"/>'
  :'';
 const svg='<svg viewBox="0 0 40 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'
  +'<path d="M20 2C10 2 3 9 3 18c0 11 17 27 17 27s17-16 17-27C37 9 30 2 20 2Z" fill="'+item.color+'" stroke="white" stroke-width="1.4"/>'
  +'<circle cx="20" cy="17" r="10" fill="white"/>'
  +'<g transform="translate(13.6 10.6) scale(.53)"><path d="'+item.glyph+'" fill="'+item.color+'"/></g>'
  +badge+'</svg>';
 return L.divIcon({
  html:'<span class="checkpoint-pin checkpoint-pin--'+kind+(promoted?' checkpoint-pin--promoted':'')+'">'+svg+'</span>',
  className:'',iconSize:[36,43],iconAnchor:[18,40],popupAnchor:[0,-35]
 });
}
const pendingCheckpointIcon=checkpointIcon('rest',false);
let destinationMarker=null;
function showDestination(latlng){
 if(destinationMarker)map.removeLayer(destinationMarker);
 destinationMarker=L.marker(latlng,{icon:destinationIcon,title:'Titik tujuan sementara'}).addTo(map);
}
if(payload.destination)showDestination(payload.destination);
if(payload.destinationMode){
 document.getElementById('draw').style.display='none';
 document.getElementById('undo').style.display='none';
 document.getElementById('reset').style.display='none';
 document.getElementById('legend').style.display='none';
 destinationButton.style.display='block';
 destinationButton.addEventListener('click',function(event){
  event.stopPropagation();
  pickingDestination=!pickingDestination;
  destinationButton.classList.toggle('active',pickingDestination);
  destinationButton.textContent=pickingDestination?'Ketuk peta':'Pilih tujuan';
 });
}
function emit(message){
 const serialized=JSON.stringify(message);
 if(window.ReactNativeWebView&&window.ReactNativeWebView.postMessage){
  window.ReactNativeWebView.postMessage(serialized);
 }else if(window.parent!==window){
  window.parent.postMessage(serialized,'*');
 }
}
function emitDestination(latlng){
 emit({type:'explorstreet:destination',latitude:Number(latlng.lat.toFixed(6)),
  longitude:Number(latlng.lng.toFixed(6))});
}
const drawButton=document.getElementById('draw'),undoButton=document.getElementById('undo'),sketchStatus=document.getElementById('sketch-status');
const stopsButton=document.getElementById('add-stop');
if(payload.editorMode){
 document.getElementById('controls').classList.add('editor-controls');
 document.getElementById('legend').classList.add('editor-legend');
 document.getElementById('cafe-status').style.display='none';
 drawButton.textContent='Selesai gambar';
 drawButton.classList.add('active');
 stopsButton.style.display='block';
 document.getElementById('reset').textContent='Kosongkan rute';
 document.getElementById('route-disclaimer').textContent='Jarak sketsa ≠ jarak jalan. Belum mengikuti ruas jalan.';
}
function distanceKm(coords){
 let km=0;
 for(let i=1;i<coords.length;i++)km+=map.distance(coords[i-1],coords[i])/1000;
 return Math.round(km*1000)/1000;
}
function emitSketch(){
 if(payload.editorMode)emit({type:'explorstreet:sketch',
  coordinates:points.map(([lat,lon])=>[lon,lat])});
}
function setCheckpoints(items){
 if(checkpointMarker){map.removeLayer(checkpointMarker);checkpointMarker=null;}
 for(const marker of checkpointMarkers)map.removeLayer(marker);
 checkpointMarkers=[];
 if(!Array.isArray(items))return;
 let promotedCount=0;
 for(const stop of items.slice(0,50)){
  if(!stop||!Array.isArray(stop.coordinates)||stop.coordinates.length!==2)continue;
  const [lon,lat]=stop.coordinates;
  if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
  const kind=['store','cafe','rest'].includes(stop.kind)?stop.kind:'rest';
  const promoted=stop.promoted===true;
  if(promoted)promotedCount++;
  const label={store:'Toko',cafe:'Kafe',rest:'Tempat rehat'}[kind];
  const marker=L.marker([lat,lon],{
   icon:checkpointIcon(kind,promoted),
   title:label+': '+String(stop.name||'Checkpoint')+(promoted?' — Promosi draft':'')
  });
  const content=document.createElement('div'),name=document.createElement('strong');
  name.textContent=String(stop.name||'Checkpoint');content.appendChild(name);
  const category=document.createElement('div');
  category.textContent=label+' • Lokasi belum diverifikasi';
  content.appendChild(category);
  if(promoted){
   const promo=document.createElement('div');
   promo.textContent='Promosi draft, belum diverifikasi'+(stop.promoText?' — '+String(stop.promoText):'');
   content.appendChild(promo);
  }
  if(stop.notes){
   const description=document.createElement('div');
   description.textContent=String(stop.notes);content.appendChild(description);
  }
  // The Studio map has two rows of editing controls at its top.
  // Reserve that space when Leaflet auto-pans an opened popup.
  marker.bindPopup(content,{
   autoPan:true,
   autoPanPaddingTopLeft:L.point(12,payload.editorMode?116:20),
   autoPanPaddingBottomRight:L.point(12,34)
  }).addTo(map);
  checkpointMarkers.push(marker);
 }
 document.getElementById('checkpoint-status').textContent=checkpointMarkers.length
  ?checkpointMarkers.length+' checkpoint'+(promotedCount?' • '+promotedCount+' promosi draft':''):'';
}
window.__explorstreetSetCheckpoints=setCheckpoints;
window.addEventListener('message',event=>{
 let msg=event.data;
 if(typeof msg==='string'){try{msg=JSON.parse(msg);}catch{return;}}
 if(msg?.type==='explorstreet:update-checkpoints')setCheckpoints(msg.checkpoints);
});
setCheckpoints(payload.editorCheckpoints||[]);
function refresh(){
 if(layer)map.removeLayer(layer);
 if(startMarker)map.removeLayer(startMarker);
 if(endMarker)map.removeLayer(endMarker);
 layer=null;startMarker=null;endMarker=null;
 if(points.length>1){
  layer=L.polyline(points,{color:isRoadRoute?roadColor:sketchColor,weight:5,
   dashArray:isRoadRoute?undefined:'10 9',opacity:.96,lineCap:'round',lineJoin:'round'}).addTo(map);
 }
 if(points.length){
  startMarker=L.marker(points[0],{icon:startIcon,
   title:isRoadRoute?'Titik awal/akhir rute model':'Titik awal konsep'}).addTo(map);
  if(points.length>1&&map.distance(points[0],points[points.length-1])>25){
   endMarker=L.marker(points[points.length-1],{icon:destinationIcon,title:'Titik akhir rute'}).addTo(map);
  }
 }
 undoButton.disabled=!drawing||points.length===0;
 if(drawing){
  sketchStatus.textContent='Ketuk peta untuk menambah titik ('+points.length+')';
 }else if(payload.editorMode){
  sketchStatus.textContent=points.length+' titik • estimasi '+distanceKm(points).toFixed(2)+' km';
 }else{
  sketchStatus.textContent=points.length
   ?(isRoadRoute?'Garis hijau: rute dari jaringan jalan':'Garis jingga: konsep manual')
   :'Belum ada rute dipilih';
 }
 document.getElementById('route-disclaimer').textContent=isRoadRoute
  ?'OSRM foot/bike • belum disurvei, bukan panduan keselamatan.'
  :'Sketsa garis lurus antar titik, bukan rute jalan atau navigasi.';
 if(payload.editorMode){
  document.getElementById('route-disclaimer').textContent='Estimasi '+distanceKm(points).toFixed(2)+' km • garis lurus per segmen.';
 }
 emitSketch();
}
function toggle(){
 drawing=!drawing;
 if(drawing&&!payload.editorMode){points=[];isRoadRoute=false;}
 pickingCheckpoint=false;stopsButton.classList.remove('active');
 stopsButton.textContent='Tandai checkpoint';
 drawButton.textContent=drawing?(payload.editorMode?'Selesai gambar':'Selesai konsep'):'Gambar konsep';
 drawButton.classList.toggle('active',drawing);
 map.getContainer().style.cursor=drawing?'crosshair':'grab';
 refresh();
}
drawButton.addEventListener('click',function(event){event.stopPropagation();toggle();});
undoButton.addEventListener('click',function(event){event.stopPropagation();if(drawing)points.pop();refresh();});
stopsButton.addEventListener('click',function(event){
 event.stopPropagation();
 pickingCheckpoint=!pickingCheckpoint;
 drawing=false;drawButton.classList.remove('active');drawButton.textContent='Gambar konsep';
 stopsButton.classList.toggle('active',pickingCheckpoint);
 stopsButton.textContent=pickingCheckpoint?'Ketuk peta':'Tandai checkpoint';
 refresh();
});
document.getElementById('reset').addEventListener('click',function(event){
 event.stopPropagation();drawing=payload.editorMode===true;
 points=payload.editorMode?[]:initial.map(p=>p.slice());
 isRoadRoute=payload.roadAligned===true&&!payload.editorMode;
 pickingCheckpoint=false;stopsButton.classList.remove('active');
 stopsButton.textContent='Tandai checkpoint';
 drawButton.textContent=drawing?'Selesai gambar':'Gambar konsep';
 drawButton.classList.toggle('active',drawing);refresh();
 if(layer)map.fitBounds(layer.getBounds().pad(.25),{maxZoom:16,animate:false});
});
map.on('click',function(event){
 if(payload.editorMode&&pickingCheckpoint){
  pickingCheckpoint=false;stopsButton.classList.remove('active');
  stopsButton.textContent='Tandai checkpoint';
  if(checkpointMarker)map.removeLayer(checkpointMarker);
  checkpointMarker=L.marker(event.latlng,{
   icon:pendingCheckpointIcon,title:'Checkpoint belum disimpan'
  }).addTo(map);
  emit({type:'explorstreet:checkpoint-point',coordinates:[
   Number(event.latlng.lng.toFixed(6)),Number(event.latlng.lat.toFixed(6))]});
  return;
 }
 if(payload.destinationMode&&pickingDestination){
  showDestination(event.latlng);
  pickingDestination=false;
  destinationButton.classList.remove('active');
  destinationButton.textContent='Ubah tujuan';
  emitDestination(event.latlng);
  return;
 }
 if(!drawing)return;
 if(points.length>=(payload.editorMode?120:16))return;
 points.push([Number(event.latlng.lat.toFixed(6)),Number(event.latlng.lng.toFixed(6))]);
 refresh();
});
refresh();
if(layer)map.fitBounds(layer.getBounds().pad(.3),{maxZoom:16,animate:false});
const cafeIcon=pinIcon('#935926','cafe-pin');
for(const cafe of payload.cafes){
 const marker=L.marker([cafe.latitude,cafe.longitude],{icon:cafeIcon,title:cafe.name});
 const content=document.createElement('div');
 const name=document.createElement('strong');name.textContent=cafe.name;content.appendChild(name);
 if(cafe.address){const address=document.createElement('div');address.textContent=cafe.address;content.appendChild(address);}
 const link=document.createElement('a');link.href=cafe.osmUrl;link.rel='noopener noreferrer';
 link.target='_blank';link.textContent='Lihat sumber OSM';content.appendChild(link);
 marker.bindPopup(content).addTo(map);
}
document.getElementById('cafe-status').textContent=payload.cafes.length
 ?payload.cafes.length+' kafe dari OpenStreetMap (pin coklat)'
 :'Belum ada titik kafe ditampilkan';
setTimeout(()=>map.invalidateSize(),300);
window.__explorstreetMapReady=true;
window.__explorstreetCafeCount=payload.cafes.length;
window.__explorstreetGeometrySource=payload.roadAligned?'osm-road-graph':'none';
})();
</script>
</body>
</html>`;

export function buildExplorerDocument(data:ExplorerMapPayload):string{
 const payload=JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
 return documentTemplate.replace('__EXPLORER_MAP_PAYLOAD__',payload);
}
