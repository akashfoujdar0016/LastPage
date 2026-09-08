import {Activity,Notification} from '../models/index.js';
export async function activity(userId,type,contentId,targetId,metadata){return Activity.create({userId,type,contentId,targetId,metadata});}
export async function notify(userId,actorId,type,targetId){if(String(userId)===String(actorId))return;return Notification.create({userId,actorId,type,targetId});}
