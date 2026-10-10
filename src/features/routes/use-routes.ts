import {useEffect,useState} from 'react';
import type {RouteInfo} from './model';
import {routeRepository} from './repository';

export function useRoutes() {
 const [routes,setRoutes]=useState<readonly RouteInfo[]>([]);
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 useEffect(()=>{
  let active=true;
  routeRepository.list().then(list=>{if(active){setRoutes(list);setStatus('ready');}})
   .catch(()=>{if(active)setStatus('error');});
  return()=>{active=false;};
 },[]);
 return {routes,status};
}
