// Replace these URLs with 24×32 frame sprite sheets. Rows: down,left,right,up;
// columns: idle, step A, step B. Empty URLs use generated placeholder textures.
export const actorAssets={player:{url:'',frameWidth:24,frameHeight:32},penny:{url:'',frameWidth:24,frameHeight:32}};
// Optional 320×352 background; collision and interaction metadata stay in map.ts.
export const roomAsset={url:''};

// Asset paths are relative to public/, including when hosted below a repository path.
export const assetUrl=(path:string)=>path ? import.meta.env.BASE_URL+path.replace(/^\/+/, '') : '';
