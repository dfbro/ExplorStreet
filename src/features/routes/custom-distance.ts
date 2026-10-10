export type CustomDistanceResult =
 | {ok:true;minKm:number|null;maxKm:number|null}
 | {ok:false;error:string};

function parseKm(value:string):number|null|undefined{
 const cleaned=value.trim().replace(',','.');
 if(!cleaned)return null;
 if(!/^\d+(\.\d{1,2})?$/.test(cleaned))return undefined;
 const parsed=Number(cleaned);
 return Number.isFinite(parsed)&&parsed>=0&&parsed<=100?parsed:undefined;
}

export function parseCustomDistance(minText:string,maxText:string):CustomDistanceResult{
 const minKm=parseKm(minText);
 const maxKm=parseKm(maxText);
 if(minKm===undefined||maxKm===undefined){
  return {ok:false,error:'Gunakan angka 0–100 km, maksimal dua desimal.'};
 }
 if(minKm===null&&maxKm===null){
  return {ok:false,error:'Isi setidaknya batas minimum atau maksimum.'};
 }
 if(minKm!==null&&maxKm!==null&&minKm>maxKm){
  return {ok:false,error:'Minimum tidak boleh melebihi maksimum.'};
 }
 return {ok:true,minKm,maxKm};
}
