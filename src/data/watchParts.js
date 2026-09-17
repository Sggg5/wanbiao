export const movements = [
  {id:'miyota-9015',type:'movement',brand:'Miyota',model:'9015',name:'美优达 9015',price:1180,diameter:26,thickness:3.9,frequency:'28,800 次/小时',tone:'warm',handSize:{hour:1.5,minute:.9,second:.17}},
  {id:'seiko-nh35',type:'movement',brand:'Seiko',model:'NH35',name:'精工 NH35',price:1030,diameter:29.4,thickness:5.32,frequency:'21,600 次/小时',tone:'steel',handSize:{hour:1.5,minute:.9,second:.2}},
  {id:'sellita-sw200',type:'movement',brand:'Sellita',model:'SW200',name:'塞利塔 SW200',price:1420,diameter:25.6,thickness:4.6,frequency:'28,800 次/小时',tone:'dark',handSize:{hour:1.5,minute:.9,second:.17}},
]

export const cases = [
  {id:'case-classic-39',type:'case',name:'经典 39',diameter:39,lugWidth:20,dialDiameter:28.5,price:420,compatibleMovements:['miyota-9015','sellita-sw200'],previewLayer:'/assets/parts/cases/classic-39.webp',assetKey:'cases/classic-39.webp'},
  {id:'case-slim-38',type:'case',name:'纤薄 38',diameter:38,lugWidth:20,dialDiameter:28.5,price:460,compatibleMovements:['sellita-sw200'],previewLayer:null,assetKey:'cases/slim-38.webp'},
  {id:'case-sport-40',type:'case',name:'运动 40',diameter:40,lugWidth:22,dialDiameter:28.5,price:510,compatibleMovements:['seiko-nh35'],previewLayer:null,assetKey:'cases/sport-40.webp'},
]

export const dials = [
  {id:'dial-midnight-blue',type:'dial',name:'午夜蓝',sku:'D-001',price:168,diameter:28.5,compatibleMovements:['miyota-9015','sellita-sw200'],previewLayer:'/assets/parts/dials/midnight-blue.webp',assetKey:'dials/midnight-blue.webp',color:'#102b46',fallbackTint:null,glow:'#5f91c1'},
  {id:'dial-obsidian-black',type:'dial',name:'曜石黑',sku:'D-002',price:0,diameter:28.5,compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],previewLayer:'/assets/parts/dials/obsidian-black.webp',assetKey:'dials/obsidian-black.webp',color:'#111416',fallbackTint:'#111416',glow:'#707576'},
  {id:'dial-silver-grain',type:'dial',name:'银砂纹',sku:'D-003',price:120,diameter:28.5,compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],previewLayer:'/assets/parts/dials/silver-grain.webp',assetKey:'dials/silver-grain.webp',color:'#bbb6ad',fallbackTint:'#bbb6ad',glow:'#f4eee2'},
]

export const hands = [
  {id:'hands-dauphine',type:'hands',name:'太妃针',sku:'H-001',price:120,handSize:{hour:1.5,minute:.9,second:.17},compatibleMovements:['miyota-9015','sellita-sw200'],previewLayer:'/assets/parts/hands/dauphine.webp',assetKey:'hands/dauphine.webp'},
  {id:'hands-baton',type:'hands',name:'棒形针',sku:'H-002',price:80,handSizes:[{hour:1.5,minute:.9,second:.17},{hour:1.5,minute:.9,second:.2}],compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],previewLayer:null,assetKey:'hands/baton.webp'},
  {id:'hands-leaf',type:'hands',name:'柳叶针',sku:'H-003',price:145,handSize:{hour:1.5,minute:.9,second:.2},compatibleMovements:['seiko-nh35'],previewLayer:null,assetKey:'hands/leaf.webp'},
]

export const straps = [
  {id:'strap-steel',type:'strap',name:'精钢表链',sku:'S-001',price:590,lugWidths:[20,22],compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],backLayer:'/assets/parts/straps/steel-back.webp',frontLayer:'/assets/parts/straps/steel-front.webp',assetKey:'straps/steel',material:'steel'},
  {id:'strap-black-leather',type:'strap',name:'黑色皮带',sku:'S-002',price:260,lugWidths:[20],compatibleMovements:['miyota-9015','sellita-sw200'],backLayer:null,frontLayer:null,assetKey:'straps/black-leather',material:'black-leather'},
  {id:'strap-brown-leather',type:'strap',name:'棕色皮带',sku:'S-003',price:240,lugWidths:[20,22],compatibleMovements:['seiko-nh35','sellita-sw200'],backLayer:null,frontLayer:null,assetKey:'straps/brown-leather',material:'brown-leather'},
]

export const casebacks = [
  {id:'caseback-solid',type:'caseback',name:'实心钢底盖',sku:'B-001',price:110,compatibleMovements:['miyota-9015','seiko-nh35','sellita-sw200'],compatibleCases:['case-classic-39','case-slim-38','case-sport-40'],previewLayer:null,assetKey:'casebacks/solid.webp'},
  {id:'caseback-exhibition',type:'caseback',name:'透底底盖',sku:'B-002',price:202,compatibleMovements:['miyota-9015','sellita-sw200'],compatibleCases:['case-classic-39','case-slim-38'],previewLayer:null,assetKey:'casebacks/exhibition.webp'},
]

export const partCatalog = { movement:movements,case:cases,dial:dials,hands,strap:straps,caseback:casebacks }
export const defaultBuild = { movement:'miyota-9015',case:'case-classic-39',dial:'dial-midnight-blue',hands:'hands-dauphine',strap:'strap-steel',caseback:'caseback-exhibition' }
