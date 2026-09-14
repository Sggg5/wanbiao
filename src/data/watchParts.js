const fallback = '/assets/atelier-watch-placeholder.png'
export const movements = [
  {id:'miyota-9015',type:'movement',brand:'Miyota',model:'9015',name:'Miyota 9015',price:1180,diameter:26,thickness:3.9,frequency:'28,800 VPH',tone:'warm',handSize:{hour:1.5,minute:.9,second:.17}},
  {id:'seiko-nh35',type:'movement',brand:'Seiko',model:'NH35',name:'Seiko NH35',price:1030,diameter:29.4,thickness:5.32,frequency:'21,600 VPH',tone:'steel',handSize:{hour:1.5,minute:.9,second:.2}},
  {id:'sellita-sw200',type:'movement',brand:'Sellita',model:'SW200',name:'Sellita SW200',price:1420,diameter:25.6,thickness:4.6,frequency:'28,800 VPH',tone:'dark',handSize:{hour:1.5,minute:.9,second:.17}},
]
export const cases = [
  {id:'case-classic-39',type:'case',name:'Classic 39',diameter:39,lugWidth:20,price:420,compatibleMovements:['miyota-9015','sellita-sw200'],previewLayer:fallback},
  {id:'case-slim-38',type:'case',name:'Slim 38',diameter:38,lugWidth:20,price:460,compatibleMovements:['sellita-sw200'],previewLayer:fallback},
  {id:'case-sport-40',type:'case',name:'Sport 40',diameter:40,lugWidth:22,price:510,compatibleMovements:['seiko-nh35'],previewLayer:fallback},
]
export const dials = [
  {id:'dial-midnight-blue',type:'dial',name:'Midnight Blue',sku:'D-001',price:168,compatibleMovements:['miyota-9015','sellita-sw200'],previewLayer:'/assets/parts/dials/midnight-blue.webp',color:'#102b46',glow:'#5f91c1'},
  {id:'dial-obsidian-black',type:'dial',name:'Obsidian Black',sku:'D-002',price:0,compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],previewLayer:'/assets/parts/dials/obsidian-black.webp',color:'#111416',glow:'#707576'},
  {id:'dial-silver-grain',type:'dial',name:'Silver Grain',sku:'D-003',price:120,compatibleMovements:['seiko-nh35','sellita-sw200'],previewLayer:'/assets/parts/dials/silver-grain.webp',color:'#bbb6ad',glow:'#f4eee2'},
]
export const hands = [
  {id:'hands-dauphine',type:'hands',name:'Dauphine',sku:'H-001',price:120,compatibleMovements:['miyota-9015','sellita-sw200'],previewLayer:fallback},
  {id:'hands-baton',type:'hands',name:'Baton',sku:'H-002',price:80,compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],previewLayer:fallback},
  {id:'hands-leaf',type:'hands',name:'Leaf',sku:'H-003',price:145,compatibleMovements:['seiko-nh35'],previewLayer:fallback},
]
export const straps = [
  {id:'strap-steel',type:'strap',name:'Steel Bracelet',sku:'S-001',price:590,compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],backLayer:fallback,frontLayer:fallback,material:'steel'},
  {id:'strap-black-leather',type:'strap',name:'Black Leather',sku:'S-002',price:260,compatibleMovements:['miyota-9015','sellita-sw200'],backLayer:fallback,frontLayer:fallback,material:'black-leather'},
  {id:'strap-brown-leather',type:'strap',name:'Brown Leather',sku:'S-003',price:240,compatibleMovements:['seiko-nh35','sellita-sw200'],backLayer:fallback,frontLayer:fallback,material:'brown-leather'},
]
export const casebacks = [
  {id:'caseback-solid',type:'caseback',name:'Solid Steel',sku:'B-001',price:110,compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],previewLayer:fallback},
  {id:'caseback-exhibition',type:'caseback',name:'Exhibition',sku:'B-002',price:202,compatibleMovements:['miyota-9015','sellita-sw200'],previewLayer:fallback},
]
export const partCatalog = { movement:movements,case:cases,dial:dials,hands,strap:straps,caseback:casebacks }
export const defaultBuild = { movement:'miyota-9015',case:'case-classic-39',dial:'dial-midnight-blue',hands:'hands-dauphine',strap:'strap-steel',caseback:'caseback-exhibition' }
