import type {CheckpointJson,RouteSketchJson} from './editor-json';
import {jsonText} from './editor-json';

export async function exportJsonFile(name:string,data:RouteSketchJson|CheckpointJson):Promise<void>{
 const blob=new Blob([jsonText(data)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;anchor.download=name;document.body.appendChild(anchor);
 anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
}
