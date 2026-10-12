(() => {
const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
const seed={
 agencies:[{id:"a1",name:"Agencia Central",parentId:"",status:"Activa"},{id:"a2",name:"Agencia Norte",parentId:"a1",status:"Activa"},{id:"a3",name:"Agencia Sur",parentId:"a1",status:"Activa"}],
 clients:[
 {id:"c1",name:"Juan Carlos Pérez",phone:"+1 555 123 4567",email:"juan.perez@email.com",dob:"1985-05-13",agency:"Agencia Central",status:"Activo",notes:"Cliente preferente",created:Date.now()-100000},
 {id:"c2",name:"María González",phone:"+1 555 987 6543",email:"maria.g@email.com",dob:"1990-08-24",agency:"Agencia Norte",status:"Activo",notes:"",created:Date.now()-90000},
 {id:"c3",name:"Luis Rodríguez",phone:"+1 555 456 7890",email:"luis.r@email.com",dob:"1978-11-02",agency:"Agencia Central",status:"Pendiente",notes:"Pendiente confirmar datos",created:Date.now()-80000},
 {id:"c4",name:"Ana Pérez",phone:"+1 555 321 0987",email:"ana.p@email.com",dob:"1994-02-16",agency:"Agencia Sur",status:"Activo",notes:"",created:Date.now()-70000},
 {id:"c5",name:"Roberto Martínez",phone:"+1 555 654 3210",email:"roberto.m@email.com",dob:"1982-06-30",agency:"Agencia Central",status:"Activo",notes:"",created:Date.now()-60000}
 ],
 policies:[
 {id:"p1",clientId:"c1",carrier:"Oscar",type:"Seguro médico",number:"OS-10492",start:"2026-01-01",renewal:"2026-11-15",status:"Activa",premium:0},
 {id:"p2",clientId:"c2",carrier:"HealthSpring",type:"Dental, visión y audición (DVH)",number:"HS-20421",start:"2026-01-01",renewal:"2026-11-20",status:"En renovación",premium:0},
 {id:"p3",clientId:"c3",carrier:"Ambetter",type:"Seguro médico",number:"AM-88412",start:"2026-01-01",renewal:"2026-12-05",status:"Pendiente",premium:0},
 {id:"p4",clientId:"c4",carrier:"Cigna",type:"Vida",number:"CG-33771",start:"2026-03-01",renewal:"2027-03-01",status:"Activa",premium:0},
 {id:"p5",clientId:"c5",carrier:"HealthSpring",type:"Accidentes",number:"HS-99023",start:"2026-04-01",renewal:"2026-11-28",status:"Activa",premium:0}
 ],
 renewals:[{id:"r1",policyId:"p2",date:"2026-10-05",result:"Contactado",notes:"Se solicitó confirmar ingreso."},{id:"r2",policyId:"p3",date:"2026-10-08",result:"Requiere seguimiento",notes:"Esperando documentos."}],
 users:[{name:"Administrador",email:"admin@s3rviceslr.com",agency:"S3rvicesLR",role:"Administrador general",status:"Demostración"},{name:"María López",email:"maria@example.com",agency:"Agencia Central",role:"Gerente de agencia",status:"Demostración"},{name:"Carlos Rojas",email:"carlos@example.com",agency:"Agencia Norte",role:"Agente",status:"Demostración"}]
};
let db;
try{db=JSON.parse(localStorage.getItem("s3rviceslr_demo_v1"))||structuredClone(seed)}catch(e){db=JSON.parse(JSON.stringify(seed))}
const save=()=>localStorage.setItem("s3rviceslr_demo_v1",JSON.stringify(db));
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clientBy=id=>db.clients.find(c=>c.id===id), policyBy=id=>db.policies.find(p=>p.id===id), agencyName=id=>db.agencies.find(a=>a.id===id)?.name||id||"—";
function toast(s){let t=$("toast");t.textContent=s;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function dateFmt(s){if(!s)return"—";return new Date(s+"T00:00:00").toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric"})}
function tagStatus(s){let cls=s==="Activo"||s==="Activa"||s==="Renovado"?"green":s==="Pendiente"||s==="En renovación"||s==="Contactado"||s==="Requiere seguimiento"?"orange":s==="Inactivo"||s==="Cancelada"||s==="No renovó"?"red":"gray";return `<span class="tag ${cls}">${esc(s||"—")}</span>`}
function clientPolicyCount(id){return db.policies.filter(p=>p.clientId===id).length}
function nextRenewal(id){return db.policies.filter(p=>p.clientId===id&&p.renewal).map(p=>p.renewal).sort()[0]||""}
function agencyFilter(){return $("agencyFilter")?.value||"Todas"}
function renderDashboard(){
 const ag=agencyFilter(), visible=db.clients.filter(c=>ag==="Todas"||c.agency===ag), visIds=new Set(visible.map(c=>c.id)), policies=db.policies.filter(p=>visIds.has(p.clientId));
 $("statClients").textContent=visible.length;$("statPolicies").textContent=policies.length;$("statAgencies").textContent=db.agencies.length;
 const now=new Date();const max=new Date();max.setDate(max.getDate()+60);
 $("statRenewals").textContent=policies.filter(p=>p.renewal&&new Date(p.renewal+"T00:00:00")>=new Date(today()+"T00:00:00")&&new Date(p.renewal+"T00:00:00")<=max&&p.status!=="Cancelada").length;
 const months=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
 const counts=months.map((_,i)=>db.renewals.filter(r=>new Date(r.date+"T00:00:00").getMonth()===i).length);
 const maxCount=Math.max(1,...counts);
 $("renewalChart").innerHTML=counts.map((n,i)=>`<div class="bar" style="height:${Math.max(7,n/maxCount*78)}%"><span>${months[i]}</span></div>`).join("");
 const types={};policies.forEach(p=>types[p.type]=(types[p.type]||0)+1);
 const colors=["#2182eb","#ff695e","#f5ad31","#8d67e8","#39b98a","#71839b"], total=Math.max(1,policies.length);
 let offset=0;const stops=Object.entries(types).map(([k,v],i)=>{const start=offset;offset+=v/total*100;return `${colors[i%colors.length]} ${start}% ${offset}%`}).join(",");
 $("typeChart").innerHTML=`<div class="donut" style="background:conic-gradient(${stops||"#e6ebf2 0 100%"})"><div class="donut-center"><strong>${policies.length}</strong><small>Pólizas</small></div></div><div class="legend">${Object.entries(types).length?Object.entries(types).map(([k,v],i)=>`<div class="legend-row"><span class="legend-dot" style="background:${colors[i%colors.length]}"></span><span>${esc(k)}</span><strong>${Math.round(v/total*100)}%</strong></div>`).join(""):'<span class="muted">Sin pólizas registradas</span>'}</div>`;
 const ac=db.agencies.map(a=>({name:a.name,count:visible.filter(c=>c.agency===a.name).length})),mx=Math.max(1,...ac.map(x=>x.count));
 $("agencyChart").innerHTML=ac.map(a=>`<div class="agency-bar-row"><span>${esc(a.name.replace("Agencia ",""))}</span><div class="agency-track"><div class="agency-fill" style="width:${a.count/mx*100}%"></div></div><strong>${a.count}</strong></div>`).join("");
 const recent=[...visible].sort((a,b)=>b.created-a.created).slice(0,5);
 $("recentRows").innerHTML=recent.length?recent.map(c=>`<tr><td><div class="client-cell"><span class="client-initial">${esc(c.name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase())}</span><div><strong>${esc(c.name)}</strong><small>${esc(c.email||"Sin correo")}</small></div></div></td><td>${esc(c.phone||"—")}</td><td>${esc(c.agency)}</td><td>${clientPolicyCount(c.id)}</td><td>${dateFmt(nextRenewal(c.id))}</td><td>${tagStatus(c.status)}</td><td><div class="row-actions"><button data-edit-client="${c.id}" title="Editar">✎</button></div></td></tr>`).join(""):`<tr><td colspan="7" class="empty">No hay clientes registrados.</td></tr>`;
}
function renderClients(){
 const q=($("clientSearch")?.value||"").toLowerCase(),ag=$("clientAgencyFilter")?.value||"Todas",st=$("clientStatusFilter")?.value||"Todos";
 const rows=db.clients.filter(c=>(ag==="Todas"||c.agency===ag)&&(st==="Todos"||c.status===st)&&[c.name,c.phone,c.email].some(x=>(x||"").toLowerCase().includes(q)));
 $("clientsCount").textContent=`Mostrando ${rows.length} de ${db.clients.length} clientes`;
 $("navClients").textContent=db.clients.length;
 $("clientsRows").innerHTML=rows.length?rows.map(c=>`<tr><td><div class="client-cell"><span class="client-initial">${esc(c.name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase())}</span><div><strong>${esc(c.name)}</strong><small>${esc(c.notes||"Sin notas")}</small></div></div></td><td>${esc(c.phone||"—")}<br><small>${esc(c.email||"")}</small></td><td>${esc(c.agency)}</td><td>${clientPolicyCount(c.id)}</td><td>${tagStatus(c.status)}</td><td><div class="row-actions"><button data-edit-client="${c.id}" title="Editar">✎</button><button class="delete" data-delete-client="${c.id}" title="Eliminar">⌫</button></div></td></tr>`).join(""):`<tr><td colspan="6" class="empty">No se encontraron clientes.</td></tr>`;
}
function renderPolicies(){
 const q=($("policySearch")?.value||"").toLowerCase(),st=$("policyStatusFilter")?.value||"Todos";
 const rows=db.policies.filter(p=>{const c=clientBy(p.clientId);return(st==="Todos"||p.status===st)&&[c?.name,p.carrier,p.number,p.type].some(x=>(x||"").toLowerCase().includes(q))});
 $("policiesRows").innerHTML=rows.length?rows.map(p=>{const c=clientBy(p.clientId);return `<tr><td><strong>${esc(c?.name||"Cliente eliminado")}</strong><br><small>${esc(c?.agency||"")}</small></td><td>${esc(p.carrier)}<br><small>${esc(p.type)}</small></td><td>${esc(p.number||"—")}</td><td>${dateFmt(p.start)}<br><small>${dateFmt(p.renewal)}</small></td><td>${dateFmt(p.renewal)}</td><td>${tagStatus(p.status)}</td><td><div class="row-actions"><button class="delete" data-delete-policy="${p.id}" title="Eliminar">⌫</button></div></td></tr>`}).join(""):`<tr><td colspan="7" class="empty">No hay pólizas que coincidan.</td></tr>`;
 $("policyClient").innerHTML='<option value="">Selecciona un cliente</option>'+db.clients.map(c=>`<option value="${c.id}">${esc(c.name)} · ${esc(c.agency)}</option>`).join("");
}
function renderRenewals(){
 const q=($("renewalSearch")?.value||"").toLowerCase(),f=$("renewalResultFilter")?.value||"Todos";
 const rows=db.renewals.filter(r=>{const p=policyBy(r.policyId),c=clientBy(p?.clientId);return(f==="Todos"||r.result===f)&&[c?.name,p?.carrier,p?.number,r.notes].some(x=>(x||"").toLowerCase().includes(q))});
 $("renewalsRows").innerHTML=rows.length?rows.map(r=>{const p=policyBy(r.policyId),c=clientBy(p?.clientId);return `<tr><td>${dateFmt(r.date)}</td><td><strong>${esc(c?.name||"—")}</strong><br><small>${esc(p?.carrier||"")} · ${esc(p?.number||"")}</small></td><td>${tagStatus(r.result)}</td><td>${esc(r.notes||"—")}</td><td><div class="row-actions"><button class="delete" data-delete-renewal="${r.id}">⌫</button></div></td></tr>`}).join(""):`<tr><td colspan="5" class="empty">No hay gestiones que coincidan.</td></tr>`;
 const now=new Date(today()+"T00:00:00"),d30=new Date(now);d30.setDate(d30.getDate()+30);const d60=new Date(now);d60.setDate(d60.getDate()+60);
 const upcoming=db.policies.filter(p=>p.renewal&&new Date(p.renewal+"T00:00:00")>=now&&p.status!=="Cancelada");
 $("renew30").textContent=upcoming.filter(p=>new Date(p.renewal+"T00:00:00")<=d30).length;$("renew60").textContent=upcoming.filter(p=>new Date(p.renewal+"T00:00:00")<=d60).length;$("renewDone").textContent=db.renewals.filter(r=>r.result==="Renovado").length;
 $("renewalPolicy").innerHTML='<option value="">Selecciona una póliza</option>'+db.policies.map(p=>`<option value="${p.id}">${esc(clientBy(p.clientId)?.name||"Cliente")} · ${esc(p.carrier)} · ${esc(p.number||"sin número")}</option>`).join("");
}
function renderAgencies(){
 $("agencyCards").innerHTML=db.agencies.map((a,i)=>`<article class="agency-card"><div class="agency-card-head"><div class="agency-symbol">▦</div><div><h3>${esc(a.name)}</h3><small>${a.parentId?"Subordinada de "+esc(agencyName(a.parentId)):"Agencia principal"}</small></div></div><div class="agency-metrics"><span>Clientes <strong>${db.clients.filter(c=>c.agency===a.name).length}</strong></span><span>Seguros <strong>${db.policies.filter(p=>db.clients.some(c=>c.id===p.clientId&&c.agency===a.name)).length}</strong></span><span>${tagStatus(a.status)}</span></div></article>`).join("");
 $("agencyTree").innerHTML=`<div class="tree-root">S3rvicesLR · Organización</div><div class="tree-children">${db.agencies.filter(a=>!a.parentId).map(a=>`<div class="tree-child"><strong>${esc(a.name)}</strong><small>${db.clients.filter(c=>c.agency===a.name).length} clientes</small>${db.agencies.filter(b=>b.parentId===a.id).map(b=>`<div class="tree-child" style="margin-top:12px;background:#fbfdff"><strong>${esc(b.name)}</strong><small>${db.clients.filter(c=>c.agency===b.name).length} clientes</small></div>`).join("")}</div>`).join("")}</div>`;
 $("agencyParent").innerHTML='<option value="">Ninguna (principal)</option>'+db.agencies.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join("");
 const opts=db.agencies.map(a=>`<option>${esc(a.name)}</option>`).join("");$("clientAgency").innerHTML=opts;$("userAgency").innerHTML='<option>S3rvicesLR</option>'+opts;
}
function renderUsers(){$("usersRows").innerHTML=db.users.map(u=>`<tr><td><div class="client-cell"><span class="client-initial">${esc(u.name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase())}</span><div><strong>${esc(u.name)}</strong><small>Usuario de demostración</small></div></div></td><td>${esc(u.email)}</td><td>${esc(u.agency)}</td><td>${esc(u.role)}</td><td>${tagStatus(u.status==="Activo"?"Activo":"Pendiente")}</td></tr>`).join("")}
function renderReports(){
 const statuses=["Activo","Pendiente","Inactivo"],counts=statuses.map(s=>[s,db.clients.filter(c=>c.status===s).length]),max=Math.max(1,...counts.map(x=>x[1]));
 $("statusReport").innerHTML=counts.map(([s,n])=>`<div class="report-row"><span>${esc(s)}</span><div class="report-track"><div class="report-fill" style="width:${n/max*100}%"></div></div><strong>${n}</strong></div>`).join("");
 const types=[...new Set(db.policies.map(p=>p.type))].map(s=>[s,db.policies.filter(p=>p.type===s).length]),m2=Math.max(1,...types.map(x=>x[1]));
 $("policyReport").innerHTML=types.length?types.map(([s,n])=>`<div class="report-row"><span>${esc(s)}</span><div class="report-track"><div class="report-fill" style="width:${n/m2*100}%"></div></div><strong>${n}</strong></div>`).join(""):'<p class="muted">Sin datos.</p>';
 const ag=db.agencies.map(a=>[a.name,db.clients.filter(c=>c.agency===a.name).length]),m3=Math.max(1,...ag.map(x=>x[1]));
 $("agencyReport").innerHTML=ag.map(([s,n])=>`<div class="report-row"><span>${esc(s)}</span><div class="report-track"><div class="report-fill" style="width:${n/m3*100}%"></div></div><strong>${n}</strong></div>`).join("");
}
function renderAll(){renderDashboard();renderClients();renderPolicies();renderRenewals();renderAgencies();renderUsers();renderReports();save()}
function showPage(name){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+name));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===name));if(name==="clientes")renderClients();if(name==="seguros")renderPolicies();if(name==="renovaciones")renderRenewals();if(name==="agencias")renderAgencies();if(name==="usuarios")renderUsers();if(name==="reportes")renderReports();$("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.addEventListener("click",e=>{const close=e.target.closest("[data-close]");if(close)$(close.dataset.close).classList.add("hidden");const edit=e.target.closest("[data-edit-client]");if(edit){const c=clientBy(edit.dataset.editClient);if(c){showPage("clientes");$("clientForm").classList.remove("hidden");$("clientFormTitle").textContent="Editar cliente";$("clientId").value=c.id;$("clientName").value=c.name;$("clientPhone").value=c.phone||"";$("clientEmail").value=c.email||"";$("clientDob").value=c.dob||"";$("clientAgency").value=c.agency;$("clientStatus").value=c.status;$("clientNotes").value=c.notes||"";window.scrollTo({top:0,behavior:"smooth"})}}});
$("newClientBtn").addEventListener("click",()=>{$("clientForm").reset();$("clientId").value="";$("clientFormTitle").textContent="Nuevo cliente";$("clientForm").classList.remove("hidden");$("clientAgency").value=db.agencies[0]?.name||"";$("clientForm").scrollIntoView({behavior:"smooth",block:"start"})});
$("clientForm").addEventListener("submit",e=>{e.preventDefault();const id=$("clientId").value;const row={id:id||"c"+Date.now(),name:$("clientName").value.trim(),phone:$("clientPhone").value.trim(),email:$("clientEmail").value.trim(),dob:$("clientDob").value,agency:$("clientAgency").value,status:$("clientStatus").value,notes:$("clientNotes").value.trim(),created:id?(clientBy(id)?.created||Date.now()):Date.now()};if(!row.name)return; if(id)db.clients=db.clients.map(c=>c.id===id?row:c);else db.clients.unshift(row);$("clientForm").reset();$("clientId").value="";$("clientForm").classList.add("hidden");renderAll();toast(id?"Cliente actualizado":"Cliente registrado")});
$("clientsRows").addEventListener("click",e=>{const b=e.target.closest("[data-delete-client]");if(!b)return;const c=clientBy(b.dataset.deleteClient);if(!c)return;if(confirm(`¿Eliminar a ${c.name} y sus pólizas e historial de demostración?`)){const pids=db.policies.filter(p=>p.clientId===c.id).map(p=>p.id);db.renewals=db.renewals.filter(r=>!pids.includes(r.policyId));db.policies=db.policies.filter(p=>p.clientId!==c.id);db.clients=db.clients.filter(x=>x.id!==c.id);renderAll();toast("Cliente eliminado") }});
["clientSearch","clientAgencyFilter","clientStatusFilter"].forEach(id=>$(id).addEventListener(id==="clientSearch"?"input":"change",renderClients));
$("agencyFilter").addEventListener("change",renderDashboard);
$("newPolicyBtn").addEventListener("click",()=>{if(!db.clients.length)return toast("Primero registra un cliente");$("policyForm").reset();$("policyForm").classList.remove("hidden");renderPolicies();$("policyForm").scrollIntoView({behavior:"smooth"})});
$("policyForm").addEventListener("submit",e=>{e.preventDefault();db.policies.unshift({id:"p"+Date.now(),clientId:$("policyClient").value,carrier:$("carrier").value.trim(),type:$("policyType").value,number:$("policyNumber").value.trim(),start:$("policyStart").value,renewal:$("policyRenewal").value,status:$("policyStatus").value,premium:Number($("policyPremium").value)||0});$("policyForm").reset();$("policyForm").classList.add("hidden");renderAll();toast("Póliza registrada")});
$("policiesRows").addEventListener("click",e=>{const b=e.target.closest("[data-delete-policy]");if(!b)return;if(confirm("¿Eliminar esta póliza y su historial de demostración?")){db.renewals=db.renewals.filter(r=>r.policyId!==b.dataset.deletePolicy);db.policies=db.policies.filter(p=>p.id!==b.dataset.deletePolicy);renderAll();toast("Póliza eliminada")}});
["policySearch","policyStatusFilter"].forEach(id=>$(id).addEventListener(id==="policySearch"?"input":"change",renderPolicies));
$("newRenewalBtn").addEventListener("click",()=>{if(!db.policies.length)return toast("Primero registra una póliza");$("renewalForm").reset();$("renewalDate").value=today();renderRenewals();$("renewalForm").classList.remove("hidden");$("renewalForm").scrollIntoView({behavior:"smooth"})});
$("renewalForm").addEventListener("submit",e=>{e.preventDefault();db.renewals.unshift({id:"r"+Date.now(),policyId:$("renewalPolicy").value,date:$("renewalDate").value,result:$("renewalResult").value,notes:$("renewalNotes").value.trim()});$("renewalForm").reset();$("renewalDate").value=today();$("renewalForm").classList.add("hidden");renderAll();toast("Gestión guardada en el historial")});
$("renewalsRows").addEventListener("click",e=>{const b=e.target.closest("[data-delete-renewal]");if(!b)return;if(confirm("¿Eliminar esta gestión del historial?")){db.renewals=db.renewals.filter(r=>r.id!==b.dataset.deleteRenewal);renderAll();toast("Gestión eliminada")}});
["renewalSearch","renewalResultFilter"].forEach(id=>$(id).addEventListener(id==="renewalSearch"?"input":"change",renderRenewals));
$("newAgencyBtn").addEventListener("click",()=>{$("agencyForm").reset();$("agencyForm").classList.remove("hidden");renderAgencies()});
$("agencyForm").addEventListener("submit",e=>{e.preventDefault();const name=$("agencyName").value.trim();if(!name)return;if(db.agencies.some(a=>a.name.toLowerCase()===name.toLowerCase()))return toast("Ya existe una agencia con ese nombre");db.agencies.push({id:"a"+Date.now(),name,parentId:$("agencyParent").value,status:$("agencyStatus").value});$("agencyForm").reset();$("agencyForm").classList.add("hidden");renderAll();toast("Agencia agregada a la demostración")});
$("newUserBtn").addEventListener("click",()=>{$("userForm").reset();renderAgencies();$("userForm").classList.remove("hidden")});
$("userForm").addEventListener("submit",e=>{e.preventDefault();db.users.push({name:$("userName").value.trim(),email:$("userEmail").value.trim(),agency:$("userAgency").value,role:$("userRole").value,status:"Demostración"});$("userForm").reset();$("userForm").classList.add("hidden");renderUsers();save();toast("Usuario añadido solo a la vista de demostración")});
function exportExcel(){if(!window.XLSX)return toast("No se cargó la librería Excel. Revisa tu conexión.");const data=db.clients.map(c=>({"Nombre completo":c.name,"Teléfono":c.phone,"Correo":c.email,"Fecha nacimiento":c.dob,"Agencia":c.agency,"Estado":c.status,"Notas":c.notes}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),"Clientes");XLSX.writeFile(wb,"S3rvicesLR_clientes_demo.xlsx")}
["exportClientsBtn","exportMainBtn","reportExport"].forEach(id=>$(id).addEventListener("click",exportExcel));
async function importFile(file,msgId){if(!file)return;if(!window.XLSX)return toast("No se cargó la librería Excel.");try{const wb=XLSX.read(await file.arrayBuffer());const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""});let count=0;rows.forEach(r=>{const get=(...keys)=>{for(const k of keys)if(r[k]!==undefined)return String(r[k]).trim();return""};const name=get("Nombre completo","Nombre","nombre","full_name");if(!name)return;const ag=get("Agencia","agency")||db.agencies[0]?.name||"Agencia Central";if(!db.agencies.some(a=>a.name===ag))db.agencies.push({id:"a"+Date.now()+count,name:ag,parentId:"",status:"Activa"});db.clients.push({id:"c"+Date.now()+count,name,phone:get("Teléfono","Telefono","phone"),email:get("Correo","Email","email"),dob:get("Fecha nacimiento","Fecha de nacimiento","dob"),agency:ag,status:get("Estado","status")||"Activo",notes:get("Notas","notes"),created:Date.now()+count});count++});if(!count)throw Error("No se encontraron filas con nombre. Revisa los encabezados de la hoja.");renderAll();$(msgId).textContent=`Importación completada: ${count} clientes añadidos al prototipo.`;toast(`${count} clientes importados`)}catch(err){$(msgId).textContent="Error: "+err.message} }
$("importClientsInput").addEventListener("change",e=>importFile(e.target.files[0],"clientMsg").finally(()=>e.target.value=""));
$("importMainInput").addEventListener("change",e=>importFile(e.target.files[0],"importMsg").finally(()=>e.target.value=""));
$("globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){ $("clientSearch").value=e.target.value;showPage("clientes");renderClients()}});
$("resetDemo").addEventListener("click",()=>{if(confirm("Esto reemplazará los datos locales por los registros ficticios iniciales. ¿Continuar?")){db=JSON.parse(JSON.stringify(seed));save();renderAll();toast("Datos de demostración restaurados")}});
renderAll();
})();