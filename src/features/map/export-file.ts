import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type {CheckpointJson,RouteSketchJson} from './editor-json';
import {jsonText} from './editor-json';

export async function exportJsonFile(name:string,data:RouteSketchJson|CheckpointJson):Promise<void>{
 const file=new File(Paths.cache,name);
 file.create({overwrite:true});
 file.write(jsonText(data));
 if(!(await Sharing.isAvailableAsync())){
  throw new Error('Berbagi berkas belum tersedia di perangkat ini.');
 }
 await Sharing.shareAsync(file.uri,{mimeType:'application/json',dialogTitle:'Ekspor ExplorStreet JSON'});
}
