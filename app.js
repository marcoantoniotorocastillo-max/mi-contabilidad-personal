const $=id=>document.getElementById(id);
const money=value=>new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(value||0);
const dateToday=()=>new Date().toISOString().slice(0,10);
let accounts=[],entries=[];
const accountName=code=>accounts.find(a=>a.code===code)?.name||code;
async function refresh(){
  accounts=await storeAll("accounts");
  entries=(await storeAll("entries")).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
  renderDashboard();renderJournal();renderAccounts();renderTrialBalance();populateCategories();
}
function accountBalances(){
  const result={}; accounts.forEach(a=>result[a.code]={debit:0,credit:0});
  entries.forEach(e=>e.lines.forEach(l=>{if(!result[l.account])result[l.account]={debit:0,credit:0};result[l.account].debit+=l.debit;result[l.account].credit+=l.credit;}));
  return result;
}
function renderDashboard(){
  let income=0,expense=0;
  entries.forEach(e=>e.lines.forEach(l=>{const a=accounts.find(x=>x.code===l.account);if(a?.type==="income")income+=l.credit-l.debit;if(a?.type==="expense")expense+=l.debit-l.credit;}));
  $("incomeTotal").textContent=money(income);$("expenseTotal").textContent=money(expense);$("netTotal").textContent=money(income-expense);$("movementCount").textContent=entries.length;
  $("recentList").innerHTML=entries.length?tableHTML(["Fecha","Descripción","Tipo","Monto"],entries.slice(0,6).map(e=>`<tr><td>${safe(e.date)}</td><td>${safe(e.description)}</td><td><span class="tag ${e.kind==="expense"?"expense":""}">${e.kind==="expense"?"Gasto":"Ingreso"}</span></td><td class="amount">${money(e.amount)}</td></tr>`)):'<p class="empty">Todavía no hay movimientos. Registra tu primer ingreso o gasto.</p>';
}
function tableHTML(headers,rows){return `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;}
function renderJournal(){
  $("journalList").innerHTML=entries.length?entries.map(e=>`<div class="journal-entry"><div class="panel-heading"><div><strong>${safe(e.description)}</strong><p class="muted">${safe(e.date)} · ${e.kind==="income"?"Ingreso":"Gasto"} · ${money(e.amount)}</p></div><span class="tag">Debe = Haber</span></div>${tableHTML(["Cuenta","Debe","Haber"],e.lines.map(l=>`<tr><td>${safe(accountName(l.account))}</td><td class="amount">${l.debit?money(l.debit):"—"}</td><td class="amount">${l.credit?money(l.credit):"—"}</td></tr>`))}</div>`).join(""):'<p class="empty">No hay asientos registrados.</p>';
}
function renderAccounts(){
  $("accountList").innerHTML=tableHTML(["Código","Cuenta","Clasificación","Grupo"],accounts.sort((a,b)=>a.code.localeCompare(b.code)).map(a=>`<tr><td>${a.code}</td><td>${safe(a.name)}</td><td>${typeName(a.type)}</td><td>${safe(a.group)}</td></tr>`));
}
function renderTrialBalance(){
  const balances=accountBalances();let debitTotal=0,creditTotal=0;
  const rows=accounts.sort((a,b)=>a.code.localeCompare(b.code)).map(a=>{
    const b=balances[a.code]||{debit:0,credit:0};
    const net=b.debit-b.credit;
    const debit=net>0?net:0,credit=net<0?-net:0;
    debitTotal+=debit;creditTotal+=credit;
    return `<tr><td>${a.code}</td><td>${safe(a.name)}</td><td class="amount">${debit?money(debit):"—"}</td><td class="amount">${credit?money(credit):"—"}</td></tr>`;
  });
  rows.push(`<tr><th colspan="2">Totales</th><th class="amount">${money(debitTotal)}</th><th class="amount">${money(creditTotal)}</th></tr>`);
  $("trialBalance").innerHTML=tableHTML(["Código","Cuenta","Saldo deudor","Saldo acreedor"],rows)+`<p class="muted">${Math.round(debitTotal)===Math.round(creditTotal)?"✓ Balance cuadrado.":"⚠ Revisa los asientos: existe una diferencia."}</p>`;
}
function typeName(t){return ({asset:"Activo",liability:"Pasivo",equity:"Patrimonio",income:"Ingreso",expense:"Gasto"})[t]||t;}
function populateCategories(){
  const kind=$("movementType").value;
  const list=accounts.filter(a=>a.type===(kind==="income"?"income":"expense"));
  $("category").innerHTML=list.map(a=>`<option value="${a.code}">${safe(a.name)}</option>`).join("");
}
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name));
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
$("movementType").addEventListener("change",populateCategories);
$("movementDate").value=dateToday();
$("movementForm").addEventListener("submit",async ev=>{
  ev.preventDefault();const message=$("formMessage");message.className="form-message";message.textContent="";
  const kind=$("movementType").value,date=$("movementDate").value,description=$("description").value.trim(),amount=Number($("amount").value),cash=$("cashAccount").value,category=$("category").value,note=$("note").value.trim();
  if(!date||!description||!Number.isSafeInteger(amount)||amount<=0){message.textContent="Revisa la fecha, descripción y monto. Usa pesos enteros mayores que cero.";message.classList.add("error");return;}
  const lines=kind==="income"?[{account:cash,debit:amount,credit:0},{account:category,debit:0,credit:amount}]:[{account:category,debit:amount,credit:0},{account:cash,debit:0,credit:amount}];
  try{
    await saveEntry({id:crypto.randomUUID(),date,description,kind,amount,note,lines,createdAt:new Date().toISOString()});
    $("movementForm").reset();$("movementDate").value=dateToday();populateCategories();message.textContent="Movimiento guardado correctamente.";
    await refresh();
  }catch(err){message.textContent=err.message||"No fue posible guardar.";message.classList.add("error");}
});
$("exportBtn").addEventListener("click",async()=>{
  const data=await exportDatabase(),blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`respaldo-contabilidad-${dateToday()}.json`;a.click();URL.revokeObjectURL(url);
});
$("importFile").addEventListener("change",async ev=>{
  const file=ev.target.files[0];if(!file)return;
  if(!confirm("Restaurar reemplazará los datos actuales de esta aplicación. ¿Continuar?")){ev.target.value="";return;}
  try{const data=JSON.parse(await file.text());await importDatabase(data);await refresh();alert("Respaldo restaurado correctamente.");}
  catch(e){alert("No se pudo restaurar: "+e.message);}
  ev.target.value="";
});
(async()=>{
  try{await seedAccounts();await refresh();$("connection").textContent=navigator.onLine?"● Datos locales listos":"● Modo sin conexión";if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});}
  catch(e){$("connection").textContent="No se pudo iniciar la base de datos";console.error(e);}
})();
window.addEventListener("online",()=>{$("connection").textContent="● Datos locales listos";});
window.addEventListener("offline",()=>{$("connection").textContent="● Modo sin conexión";});
