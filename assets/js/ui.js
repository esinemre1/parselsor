window.UI={
  $:id=>document.getElementById(id),
  status(t){this.$('status').textContent=t},
  coord(p,z){this.$('coord').textContent=p.lat.toFixed(6)+' , '+p.lng.toFixed(6)+' • Z'+z},
  fill(el,items,label){
    el.innerHTML='<option value="">'+label+'</option>'+items.map(x=>'<option value="'+x.id+'">'+x.text+'</option>').join('');
    el.disabled=false;
  },
  show(f){
    MapApp.show(f); const p=f.properties||{};
    const rows=[['İl',p.ilAd],['İlçe',p.ilceAd],['Mahalle',p.mahalleAd],['Ada',p.adaNo],['Parsel',p.parselNo],['Alan',p.alan],['Nitelik',p.nitelik],['Pafta',p.pafta],['Mevkii',p.mevkii]].filter(x=>x[1]!=null);
    this.$('infoCard').classList.remove('hidden');
    this.$('infoCard').innerHTML='<h3>'+(p.adaNo??'-')+' / '+(p.parselNo??'-')+'</h3>'+rows.map(x=>'<div class="row"><span>'+x[0]+'</span><span>'+x[1]+'</span></div>').join('');
    this.status('Parsel bulundu.');
  },
  async pickPoint(p){
    MapApp.setPick(false);this.$('pickBtn').textContent='Haritadan Parsel Seç';
    try{this.status('Parsel aranıyor...');this.show(await TKGM.nokta(p.lat,p.lng))}
    catch(e){this.status('TKGM bağlantısı reddedildi: '+e.message)}
  },
  async init(){
    MapApp.init();
    this.$('panelToggle').onclick=()=>this.$('panel').classList.toggle('open');
    this.$('panelClose').onclick=()=>this.$('panel').classList.remove('open');
    this.$('basemapToggle').onclick=()=>this.$('basemapToggle').textContent=MapApp.toggle();
    this.$('pickBtn').onclick=()=>{MapApp.setPick(!MapApp.pick);this.$('pickBtn').textContent=MapApp.pick?'Haritada Bir Noktaya Tıkla':'Haritadan Parsel Seç'};
    this.$('searchBtn').onclick=async()=>{const m=this.$('mahalle').value,a=this.$('ada').value.trim(),p=this.$('parsel').value.trim();if(!m||!a||!p)return this.status('Mahalle, ada ve parsel gerekli.');try{this.status('Parsel sorgulanıyor...');this.show(await TKGM.parsel(m,a,p))}catch(e){this.status('TKGM bağlantısı reddedildi: '+e.message)}};
    this.$('il').onchange=async e=>{this.$('ilce').disabled=true;this.$('mahalle').disabled=true;if(!e.target.value)return;try{this.status('İlçeler yükleniyor...');this.fill(this.$('ilce'),TKGM.list(await TKGM.ilceler(e.target.value)),'İlçe seçiniz');this.status('Hazır')}catch(e){this.status('İlçe servisi erişim hatası: '+e.message)}};
    this.$('ilce').onchange=async e=>{this.$('mahalle').disabled=true;if(!e.target.value)return;try{this.status('Mahalleler yükleniyor...');this.fill(this.$('mahalle'),TKGM.list(await TKGM.mahalleler(e.target.value)),'Mahalle / Köy seçiniz');this.status('Hazır')}catch(e){this.status('Mahalle servisi erişim hatası: '+e.message)}};
    try{this.status('İller yükleniyor...');this.fill(this.$('il'),TKGM.list(await TKGM.ils()),'İl seçiniz');this.status('Hazır')}catch(e){this.status('TKGM il listesi alınamadı: '+e.message)}
  }
};document.addEventListener('DOMContentLoaded',()=>UI.init());