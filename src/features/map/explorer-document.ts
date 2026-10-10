import type {OsmCafe} from './cafes';
import type {LatLng} from './route-sketch';

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
#legend{position:absolute;z-index:900;left:10px;bottom:26px;max-width:185px;padding:10px 11px;
border-radius:12px;background:rgba(255,255,255,.96);color:#174c37;font:700 11px/1.5 system-ui,-apple-system,sans-serif;box-shadow:0 2px 8px #0002}
#legend small{font-size:10px;display:block;color:#526f5c;font-weight:500;margin-top:3px}
#feedback{position:absolute;z-index:1001;top:10px;left:10px;max-width:160px;padding:8px 10px;
background:rgba(255,255,255,.97);font:700 11px/1.4 system-ui,sans-serif;border-radius:10px;color:#174c37}
#feedback:empty{display:none}
.start-pin,.destination-pin,.cafe-pin{display:block;width:32px;height:32px}
.start-pin svg,.destination-pin svg,.cafe-pin svg{width:100%;height:100%;
filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
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
 <button type="button" id="draw" aria-label="Gambar konsep manual">Gambar konsep</button>
 <button type="button" id="undo" aria-label="Batalkan titik terakhir" disabled>Urung titik</button>
 <button type="button" id="reset" aria-label="Reset sketsa rute">Reset</button>
</div>
<div id="legend">
 <div id="sketch-status">Memuat rute</div>
 <small id="route-disclaimer">Data model OSM, belum diperiksa di lapangan.</small>
 <small id="cafe-status">Kafe OSM muncul setelah dicari.</small>
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
let drawing=false,layer=null,startMarker=null,endMarker=null;
let isRoadRoute=payload.roadAligned===true;
let pickingDestination=false;
const destinationButton=document.getElementById('destination');
const destinationIcon=pinIcon('#eb7427','destination-pin');
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
function emitDestination(latlng){
 const message=JSON.stringify({type:'explorstreet:destination',
  latitude:Number(latlng.lat.toFixed(6)),longitude:Number(latlng.lng.toFixed(6))});
 if(window.ReactNativeWebView&&window.ReactNativeWebView.postMessage){
  window.ReactNativeWebView.postMessage(message);
 }else if(window.parent!==window){
  window.parent.postMessage(message,'*');
 }
}
const drawButton=document.getElementById('draw'),undoButton=document.getElementById('undo'),sketchStatus=document.getElementById('sketch-status');
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
 }else{
  sketchStatus.textContent=points.length
   ?(isRoadRoute?'Garis hijau: rute dari jaringan jalan':'Garis jingga: konsep manual')
   :'Belum ada rute dipilih';
 }
 document.getElementById('route-disclaimer').textContent=isRoadRoute
  ?'OSRM foot/bike • belum disurvei, bukan panduan keselamatan.'
  :'Konsep manual tidak mengikuti jalan dan bukan navigasi.';
}
function toggle(){
 drawing=!drawing;
 if(drawing){points=[];isRoadRoute=false;}
 drawButton.textContent=drawing?'Selesai konsep':'Gambar konsep';
 drawButton.classList.toggle('active',drawing);
 map.getContainer().style.cursor=drawing?'crosshair':'grab';
 refresh();
}
drawButton.addEventListener('click',function(event){event.stopPropagation();toggle();});
undoButton.addEventListener('click',function(event){event.stopPropagation();if(drawing)points.pop();refresh();});
document.getElementById('reset').addEventListener('click',function(event){
 event.stopPropagation();drawing=false;points=initial.map(p=>p.slice());
 isRoadRoute=payload.roadAligned===true;
 drawButton.textContent='Gambar konsep';drawButton.classList.remove('active');refresh();
 if(layer)map.fitBounds(layer.getBounds().pad(.25),{maxZoom:16,animate:false});
});
map.on('click',function(event){
 if(payload.destinationMode&&pickingDestination){
  showDestination(event.latlng);
  pickingDestination=false;
  destinationButton.classList.remove('active');
  destinationButton.textContent='Ubah tujuan';
  emitDestination(event.latlng);
  return;
 }
 if(!drawing)return;
 if(points.length>=16)return;
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
