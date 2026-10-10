import manifest from './presets/manifest.json';
import {validateRouteJson,validateCheckpointJson,type RouteSketchJson,type CheckpointJson,type StoreCheckpoint} from './editor-json';

export type DefaultPresets={
 routes:RouteSketchJson[];
 checkpointSets:CheckpointJson[];
 error?:string;
};
export function getDefaultPresets():DefaultPresets{
 try{
  const routes:RouteSketchJson[]=manifest.routes.map(entry=>validateRouteJson(entry));
  const checkpointSets:CheckpointJson[]=manifest.checkpointSets.map(entry=>validateCheckpointJson(entry));
  const ids=new Set(routes.map(route=>route.id));
  if(ids.size!==routes.length)throw Error('ID rute preset tidak boleh duplikat.');
  if(checkpointSets.some(set=>!ids.has(set.routeId)))
   throw Error('routeId checkpoint preset tidak ditemukan dalam daftar rute.');
  if(new Set(checkpointSets.map(set=>set.routeId)).size!==checkpointSets.length)
   throw Error('Hanya satu dokumen checkpoint per rute preset.');
  return {routes,checkpointSets};
 }catch(error){
  return {routes:[],checkpointSets:[],error:error instanceof Error?error.message:'Preset JSON tidak valid.'};
 }
}
export function getDefaultCheckpoints(area:string):StoreCheckpoint[]{
 const presets=getDefaultPresets();
 const selected=new Set(presets.routes.filter(r=>r.area===area).map(r=>r.id));
 return presets.checkpointSets.filter(set=>selected.has(set.routeId)).flatMap(set=>set.checkpoints);
}
