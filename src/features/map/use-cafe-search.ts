import {useCallback,useRef,useState} from 'react';
import {cafeErrorMessage,queryCafes,type CafeLookup} from './cafes';

const empty:{status:'idle';cafes:[]}={status:'idle',cafes:[]};

export function useCafeSearch(area:string){
 const [result,setResult]=useState<{area:string;lookup:CafeLookup}|null>(null);
 const token=useRef(0);
 const lookup=result?.area===area?result.lookup:empty;
 const load=useCallback(async()=>{
  const current=++token.current;
  setResult({area,lookup:{status:'loading',cafes:[]}});
  try{
   const response=await queryCafes(area);
   if(current===token.current){
    setResult({area,lookup:{status:'ready',cafes:response.cafes,fromCache:response.fromCache}});
   }
  }catch{
   if(current===token.current){
    setResult({area,lookup:{status:'error',cafes:[],message:cafeErrorMessage()}});
   }
  }
 },[area]);
 return {lookup,load};
}
