const API='https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api';
const map=L.map('map',{zoomControl:false}).setView([38.65,32.92],9);
L.control.zoom({position:'bottomright'}).addTo(map);
const osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
const sat=L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{maxZoom:21,attribution:'Google'});
sat.addTo(map);
let currentBase=sat, parcelLayer=null, pickMode=false;

const $=id=>document.getElementById(id);
const setStatus=t=>$('status').textContent=t;
const fill=(el,items,placeholder)=>{
  el.innerHTML='<option value="">'+placeholder+'</option>'+items.map(x=>'<option value="'+(x.id??x.Id??x.mahalleId??x.ilceId??x.ilId)+'">'+(x.ad??x.Ad??x.name??x.ilAdi??x.ilceAdi??x.mahalleAdi)+'</option>').join('');
  el.disabled=false;
};
async function getJSON(url){const r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}
function normalizeList(d){if(Array.isArray(d))return d;for(const k of ['features','data','result','items']) if(Array.isArray(d?.[k])) return d[k].map(x=>x.properties?{...x.properties,id:x.id}:x);return[];}
async function loadIls(){try{setStatus('İller yükleniyor...');const d=await getJSON(API+'/idariYapi/ilListe');fill($('il'),normalizeList(d),'İl seçiniz');setStatus('Hazır');}catch(e){setStatus('İl listesi alınamadı: '+e.message);}}
$('il').onchange=async e=>{const id=e.target.value;$('ilce').disabled=true;$('mahalle').disabled=true;if(!id)return;try{setStatus('İlçeler yükleniyor...');fill($('ilce'),normalizeList(await getJSON(API+'/idariYapi/ilceListe/'+id)),'İlçe seçiniz');setStatus('Hazır');}catch(err){setStatus('İlçeler alınamadı: '+err.message)}};
$('ilce').onchange=async e=>{const id=e.target.value;$('mahalle').disabled=true;if(!id)return;try{setStatus('Mahalleler yükleniyor...');fill($('mahalle'),normalizeList(await getJSON(API+'/idariYapi/mahalleListe/'+id)),'Mahalle / Köy seçiniz');setStatus('Hazır');}catch(err){setStatus('Mahalleler alınamadı: '+err.message)}};

function showFeature(f){
  if(parcelLayer)map.removeLayer(parcelLayer);
  parcelLayer=L.geoJSON(f,{style:{color:'#ffd34d',weight:4,fillColor:'#ffd34d',fillOpacity:.14}}).addTo(map);
  map.fitBounds(parcelLayer.getBounds(),{padding:[30,30],maxZoom:19});
  const p=f.properties||{};
  $('infoCard').classList.remove('hidden');
  $('infoCard').innerHTML='<h3>'+(p.adaNo??p.ada??'-')+' / '+(p.parselNo??p.parsel??'-')+'</h3>'+
    [['Alan',p.alan],['Nitelik',p.nitelik],['Pafta',p.pafta],['Mevkii',p.mevkii],['İlçe',p.ilceAdi],['Mahalle',p.mahalleAdi]].filter(x=>x[1]!=null).map(x=>'<div class="row"><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');
}
async function searchParcelByAddress(){
  const m=$('mahalle').value,a=$('ada').value.trim(),p=$('parsel').value.trim();
  if(!m||!a||!p){setStatus('Mahalle, ada ve parsel giriniz.');return}
  try{setStatus('Parsel sorgulanıyor...');showFeature(await getJSON(API+'/parsel/'+encodeURIComponent(m)+'/'+encodeURIComponent(a)+'/'+encodeURIComponent(p)));setStatus('Parsel bulundu.');}
  catch(e){setStatus('Parsel alınamadı: '+e.message)}
}
async function searchParcelByPoint(lat,lng){
  try{setStatus('Koordinattan parsel aranıyor...');showFeature(await getJSON(API+'/parsel/'+lat+'/'+lng+'/'));setStatus('Parsel bulundu.');}
  catch(e){setStatus('Bu noktada parsel alınamadı: '+e.message)}
}
$('searchBtn').onclick=searchParcelByAddress;
$('pickBtn').onclick=()=>{pickMode=!pickMode;$('pickBtn').textContent=pickMode?'Haritada Bir Noktaya Tıkla':'Haritadan Parsel Seç';map.getContainer().style.cursor=pickMode?'crosshair':'';setStatus(pickMode?'Seçim modu açık.':'Seçim modu kapalı.');};
map.on('click',e=>{if(pickMode){searchParcelByPoint(e.latlng.lat,e.latlng.lng);pickMode=false;$('pickBtn').textContent='Haritadan Parsel Seç';map.getContainer().style.cursor='';}});
map.on('mousemove',e=>$('coord').textContent=e.latlng.lat.toFixed(6)+' , '+e.latlng.lng.toFixed(6)+'  •  Z'+map.getZoom());
$('panelToggle').onclick=()=>$('panel').classList.toggle('open');
$('panelClose').onclick=()=>$('panel').classList.remove('open');
$('basemapToggle').onclick=()=>{map.removeLayer(currentBase);currentBase=currentBase===sat?osm:sat;currentBase.addTo(map);$('basemapToggle').textContent=currentBase===sat?'Uydu':'Harita';};
loadIls();