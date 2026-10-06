window.TKGM={
  async request(url){
    const r=await fetch(url,{headers:{Accept:'application/json'}});
    if(!r.ok) throw new Error('TKGM HTTP '+r.status);
    return r.json();
  },
  list(d){
    const a=Array.isArray(d)?d:(d?.features||d?.data||d?.result||d?.items||[]);
    return a.map(x=>{
      const p=x?.properties||x;
      return {id:p.id??p.Id??p.mahalleId??p.ilceId??p.ilId,text:p.text??p.ad??p.Ad??p.name??p.ilAdi??p.ilceAdi??p.mahalleAdi,geometry:x?.geometry||null};
    }).filter(x=>x.id!=null&&x.text);
  },
  async ils(){
    try{return await this.request(APP_CONFIG.IL_LIST)}
    catch(e){return this.request(APP_CONFIG.API+'/idariYapi/ilListe')}
  },
  ilceler(id){return this.request(APP_CONFIG.API+'/idariYapi/ilceListe/'+encodeURIComponent(id))},
  mahalleler(id){return this.request(APP_CONFIG.API+'/idariYapi/mahalleListe/'+encodeURIComponent(id))},
  parsel(m,a,p){return this.request(APP_CONFIG.API+'/parsel/'+encodeURIComponent(m)+'/'+encodeURIComponent(a)+'/'+encodeURIComponent(p))},
  nokta(lat,lng){return this.request(APP_CONFIG.API+'/parsel/'+lat+'/'+lng+'/')}
};