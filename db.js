/* Base de datos local: IndexedDB. No requiere servidor ni cuenta externa. */
const DB_NAME = "mi_contabilidad_personal";
const DB_VERSION = 1;
const DEFAULT_ACCOUNTS = [
  {code:"1101",name:"Efectivo",type:"asset",group:"Activo corriente"},
  {code:"1102",name:"Cuenta bancaria",type:"asset",group:"Activo corriente"},
  {code:"1201",name:"Ahorros e inversiones",type:"asset",group:"Activo"},
  {code:"2101",name:"Deudas personales",type:"liability",group:"Pasivo"},
  {code:"3101",name:"Patrimonio inicial",type:"equity",group:"Patrimonio"},
  {code:"4101",name:"Sueldo y remuneraciones",type:"income",group:"Ingresos"},
  {code:"4102",name:"Otros ingresos",type:"income",group:"Ingresos"},
  {code:"5101",name:"Alimentación",type:"expense",group:"Gastos"},
  {code:"5102",name:"Vivienda y servicios",type:"expense",group:"Gastos"},
  {code:"5103",name:"Transporte",type:"expense",group:"Gastos"},
  {code:"5104",name:"Salud",type:"expense",group:"Gastos"},
  {code:"5105",name:"Educación",type:"expense",group:"Gastos"},
  {code:"5106",name:"Ocio y otros gastos",type:"expense",group:"Gastos"}
];
function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("accounts")) db.createObjectStore("accounts",{keyPath:"code"});
      if(!db.objectStoreNames.contains("entries")) db.createObjectStore("entries",{keyPath:"id"});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function storeAll(storeName){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,"readonly");
    const req=tx.objectStore(storeName).getAll();
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
    tx.oncomplete=()=>db.close();
  });
}
async function putRecord(storeName,record){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,"readwrite");
    tx.objectStore(storeName).put(record);
    tx.oncomplete=()=>{db.close();resolve(true)};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
async function seedAccounts(){
  const existing=await storeAll("accounts");
  if(existing.length) return;
  for(const account of DEFAULT_ACCOUNTS) await putRecord("accounts",account);
}
async function saveEntry(entry){
  const debit=entry.lines.reduce((s,l)=>s+l.debit,0);
  const credit=entry.lines.reduce((s,l)=>s+l.credit,0);
  if(Math.round(debit)!==Math.round(credit)) throw new Error("El asiento no está balanceado.");
  if(entry.lines.some(l=>l.debit<0||l.credit<0|| (l.debit>0&&l.credit>0))) throw new Error("Línea contable inválida.");
  return putRecord("entries",entry);
}
async function exportDatabase(){
  return {format:"mi-contabilidad-backup",version:1,createdAt:new Date().toISOString(),accounts:await storeAll("accounts"),entries:await storeAll("entries")};
}
async function importDatabase(data){
  if(data.format!=="mi-contabilidad-backup"||!Array.isArray(data.accounts)||!Array.isArray(data.entries)) throw new Error("El archivo no corresponde a un respaldo válido.");
  const db=await openDB();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(["accounts","entries"],"readwrite");
    tx.objectStore("accounts").clear(); tx.objectStore("entries").clear();
    data.accounts.forEach(x=>tx.objectStore("accounts").put(x));
    data.entries.forEach(x=>tx.objectStore("entries").put(x));
    tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
  });
  db.close();
}
