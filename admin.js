(function(){
  const ADMIN_KEY="iontech_admin_session";
  const ADMIN_PASSWORD="CHANGE-ME-1234";

  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  function getOverrides(){return IONTECH.readOverrides()}
  function saveOverrides(o){localStorage.setItem(IONTECH.STORAGE,JSON.stringify(o))}
  function settings(){return IONTECH.readSettings()}
  function saveSettings(s){localStorage.setItem(IONTECH.SETTINGS,JSON.stringify(s))}
  function content(){return IONTECH.readContent()}
  function saveContent(c){localStorage.setItem(IONTECH.CONTENT,JSON.stringify(c))}
  function logged(){return sessionStorage.getItem(ADMIN_KEY)==="1"}
  function show(id,on){document.getElementById(id)?.classList.toggle("hidden",!on)}

  function init(){
    show("loginPanel",!logged());show("adminPanel",logged());
    if(logged())renderAdmin();
  }

  document.getElementById("loginForm")?.addEventListener("submit",e=>{
    e.preventDefault();
    if(document.getElementById("adminPassword").value===ADMIN_PASSWORD){
      sessionStorage.setItem(ADMIN_KEY,"1");init();
    }else document.getElementById("loginError").textContent="Incorrect password.";
  });
  document.getElementById("logout")?.addEventListener("click",()=>{sessionStorage.removeItem(ADMIN_KEY);location.reload()});

  document.querySelectorAll(".admin-tab").forEach(tab=>tab.addEventListener("click",()=>{
    document.querySelectorAll(".admin-tab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".admin-section").forEach(x=>x.classList.remove("active"));
    tab.classList.add("active");document.getElementById("tab-"+tab.dataset.tab)?.classList.add("active");
  }));

  function renderAdmin(){
    const s=settings(),c=content();
    document.getElementById("companyName").value=s.companyName||"IONTECH";
    document.getElementById("siteTitle").value=s.siteTitle||"IONTECH Professional Computing Catalog";
    document.getElementById("siteDescription").value=s.siteDescription||"Professional workstations and thin clients with specifications, components and pricing.";
    document.getElementById("heroKicker").value=c.heroKicker||"";
    document.getElementById("heroHeading").value=c.heroHeading||"";
    document.getElementById("heroSubheading").value=c.heroSubheading||"";
    document.getElementById("heroButtonText").value=c.heroButtonText||"";
    document.getElementById("productsHeading").value=c.productsHeading||"";
    document.getElementById("productsSubheading").value=c.productsSubheading||"";
    document.getElementById("productsHelper").value=c.productsHelper||"";
    document.getElementById("footerDescription").value=c.footerDescription||"";
    document.getElementById("footerNote").value=c.footerNote||"";
    document.getElementById("pricelistDate").value=c.pricelistDate||"September 16, 2026";
    document.getElementById("showHero").checked=c.showHero!==false;
    document.getElementById("showHeroKicker").checked=c.showHeroKicker!==false;
    document.getElementById("showHeroButton").checked=c.showHeroButton!==false;
    document.getElementById("showFooter").checked=c.showFooter!==false;
    renderRows();
    if(s.logo)document.getElementById("logoPreview").innerHTML=`<img src="${esc(s.logo)}" alt="Logo preview">`;
  }

  function renderRows(){
    const q=(document.getElementById("productSearch").value||"").toLowerCase();
    const products=IONTECH.getProducts().filter(p=>(p.model+" "+p.sku+" "+p.category+" "+p.processorBrand).toLowerCase().includes(q));
    document.getElementById("adminCount").textContent=`${products.length} products`;
    document.getElementById("adminRows").innerHTML=products.map(p=>`
      <div class="admin-row"><div><strong>${esc(p.model)}</strong><div class="small">${esc(p.sku)} · ${esc(p.category)}</div></div>
      <button class="btn btn-primary" data-edit="${esc(p.sku)}">Edit</button></div>`).join("");
  }
  document.getElementById("productSearch")?.addEventListener("input",renderRows);
  document.addEventListener("click",e=>{const b=e.target.closest("[data-edit]");if(b)editProduct(b.dataset.edit)});

  function editProduct(sku){
    const p=IONTECH.getProducts().find(x=>x.sku===sku);if(!p)return;
    const o=getOverrides(),current=o[sku]||{};
    document.getElementById("editPanel").classList.remove("hidden");
    document.getElementById("editSku").value=sku;
    document.getElementById("editModel").value=current.model??p.model;
    document.getElementById("editCategory").value=current.category??p.category;
    document.getElementById("editProcessorBrand").value=current.processorBrand??p.processorBrand??"";
    document.getElementById("editScreenSize").value=current.screenSize??p.screenSize??"";
    document.getElementById("editDescription").value=current.description??p.description??"";
    document.getElementById("editOnhand").value=current.onhandPrice??p.onhandPrice??"";
    document.getElementById("editOrder").value=current.orderBasisPrice??p.orderBasisPrice??"";
    document.getElementById("editOnhandLabel").value=current.priceLabels?.onhand??p.priceLabels?.onhand??"On-Hand Price";
    document.getElementById("editOrderLabel").value=current.priceLabels?.orderBasis??p.priceLabels?.orderBasis??"Order-Basis Price";
    document.getElementById("editSeoTitle").value=current.seoTitle??p.seoTitle??"";
    document.getElementById("editSeoDescription").value=current.seoDescription??p.seoDescription??"";
    document.getElementById("editSeoOnhandTitle").value=current.seoOnhandTitle??p.seoOnhandTitle??"";
    document.getElementById("editSeoOnhandDescription").value=current.seoOnhandDescription??p.seoOnhandDescription??"";
    document.getElementById("editSeoOrderTitle").value=current.seoOrderTitle??p.seoOrderTitle??"";
    document.getElementById("editSeoOrderDescription").value=current.seoOrderDescription??p.seoOrderDescription??"";
    document.getElementById("editImage1").value="";document.getElementById("editImage2").value="";
    preview("preview1",current.image1??p.image1,"Image 1");preview("preview2",current.image2??p.image2,"Image 2");
    renderSpecRows(current.specs??p.specs??{});renderComponentRows(current.components??p.components??[]);
    window.scrollTo({top:document.getElementById("editPanel").offsetTop-90,behavior:"smooth"});
  }

  function preview(id,src,label){document.getElementById(id).innerHTML=src?`<img src="${esc(src)}" alt="${esc(label)} preview">`:`<div class="placeholder">${esc(label)}<br>Not uploaded</div>`}
  function readImage(file){return new Promise((resolve,reject)=>{if(!file)return resolve("");const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}

  function renderSpecRows(specs){
    const rows=Object.entries(specs);
    document.getElementById("specRows").innerHTML=rows.map(([k,v])=>`<tr><td><input class="spec-key" value="${esc(k)}"></td><td><input class="spec-value" value="${esc(v)}"></td><td><button class="btn btn-danger remove-spec">Remove</button></td></tr>`).join("");
  }
  function renderComponentRows(comps){
    document.getElementById("componentRows").innerHTML=comps.map(c=>`<tr><td><input class="comp-no" value="${esc(c.partNo??"")}"></td><td><input class="comp-desc" value="${esc(c.description??"")}"></td><td><button class="btn btn-danger remove-component">Remove</button></td></tr>`).join("");
  }
  document.getElementById("addSpec")?.addEventListener("click",()=>{
    const tr=document.createElement("tr");tr.innerHTML=`<td><input class="spec-key" placeholder="Specification"></td><td><input class="spec-value" placeholder="Value"></td><td><button class="btn btn-danger remove-spec">Remove</button></td>`;document.getElementById("specRows").appendChild(tr);
  });
  document.getElementById("addComponent")?.addEventListener("click",()=>{
    const tr=document.createElement("tr");tr.innerHTML=`<td><input class="comp-no" placeholder="Part No."></td><td><input class="comp-desc" placeholder="Part Description"></td><td><button class="btn btn-danger remove-component">Remove</button></td>`;document.getElementById("componentRows").appendChild(tr);
  });
  document.addEventListener("click",e=>{
    if(e.target.classList.contains("remove-spec"))e.target.closest("tr").remove();
    if(e.target.classList.contains("remove-component"))e.target.closest("tr").remove();
  });

  document.getElementById("editImage1")?.addEventListener("change",async e=>{const x=await readImage(e.target.files[0]);if(x)preview("preview1",x,"Image 1")});
  document.getElementById("editImage2")?.addEventListener("change",async e=>{const x=await readImage(e.target.files[0]);if(x)preview("preview2",x,"Image 2")});

  document.getElementById("saveProduct")?.addEventListener("click",async()=>{
    const sku=document.getElementById("editSku").value,base=IONTECH.getProducts().find(x=>x.sku===sku);
    const o=getOverrides(),old=o[sku]||{};
    const i1=await readImage(document.getElementById("editImage1").files[0]),i2=await readImage(document.getElementById("editImage2").files[0]);
    const specs={};document.querySelectorAll("#specRows tr").forEach(tr=>{const k=tr.querySelector(".spec-key")?.value.trim(),v=tr.querySelector(".spec-value")?.value.trim();if(k)specs[k]=v});
    const components=[];document.querySelectorAll("#componentRows tr").forEach(tr=>{const partNo=tr.querySelector(".comp-no")?.value.trim(),description=tr.querySelector(".comp-desc")?.value.trim();if(partNo||description)components.push({partNo,description})});
    o[sku]={
      ...old,
      model:document.getElementById("editModel").value.trim()||base.model,
      category:document.getElementById("editCategory").value.trim()||base.category,
      processorBrand:document.getElementById("editProcessorBrand").value.trim(),
      screenSize:document.getElementById("editScreenSize").value.trim(),
      description:document.getElementById("editDescription").value.trim(),
      onhandPrice:document.getElementById("editOnhand").value.trim(),
      orderBasisPrice:document.getElementById("editOrder").value.trim(),
      priceLabels:{onhand:document.getElementById("editOnhandLabel").value.trim()||"On-Hand Price",orderBasis:document.getElementById("editOrderLabel").value.trim()||"Order-Basis Price"},
      seoTitle:document.getElementById("editSeoTitle").value.trim(),
      seoDescription:document.getElementById("editSeoDescription").value.trim(),
      seoOnhandTitle:document.getElementById("editSeoOnhandTitle").value.trim(),
      seoOnhandDescription:document.getElementById("editSeoOnhandDescription").value.trim(),
      seoOrderTitle:document.getElementById("editSeoOrderTitle").value.trim(),
      seoOrderDescription:document.getElementById("editSeoOrderDescription").value.trim(),
      image1:i1||old.image1||base.image1||"",
      image2:i2||old.image2||base.image2||"",
      specs,components
    };
    saveOverrides(o);document.getElementById("saveStatus").textContent="Saved in this browser.";
    setTimeout(()=>document.getElementById("saveStatus").textContent="",2500);renderRows();
  });
  document.getElementById("cancelEdit")?.addEventListener("click",()=>document.getElementById("editPanel").classList.add("hidden"));

  document.getElementById("saveHomepage")?.addEventListener("click",()=>{
    const c=content();
    Object.assign(c,{
      heroKicker:document.getElementById("heroKicker").value.trim(),heroHeading:document.getElementById("heroHeading").value.trim(),
      heroSubheading:document.getElementById("heroSubheading").value.trim(),heroButtonText:document.getElementById("heroButtonText").value.trim(),
      productsHeading:document.getElementById("productsHeading").value.trim(),productsSubheading:document.getElementById("productsSubheading").value.trim(),
      productsHelper:document.getElementById("productsHelper").value.trim(),footerDescription:document.getElementById("footerDescription").value.trim(),
      footerNote:document.getElementById("footerNote").value.trim(),pricelistDate:document.getElementById("pricelistDate").value.trim(),
      showHero:document.getElementById("showHero").checked,showHeroKicker:document.getElementById("showHeroKicker").checked,
      showHeroButton:document.getElementById("showHeroButton").checked,showFooter:document.getElementById("showFooter").checked
    });
    saveContent(c);document.getElementById("homepageStatus").textContent="Homepage settings saved in this browser.";IONTECH.applyBrand();
  });

  document.getElementById("saveSettings")?.addEventListener("click",()=>{
    const old=settings();
    saveSettings({...old,companyName:document.getElementById("companyName").value.trim()||"IONTECH",siteTitle:document.getElementById("siteTitle").value.trim(),siteDescription:document.getElementById("siteDescription").value.trim()});
    document.getElementById("settingsStatus").textContent="Branding & SEO saved in this browser.";IONTECH.applyBrand();
  });

  document.getElementById("logoFile")?.addEventListener("change",async e=>{
    const x=await readImage(e.target.files[0]);if(!x)return;const s=settings();s.logo=x;saveSettings(s);
    document.getElementById("logoPreview").innerHTML=`<img src="${esc(x)}" alt="Logo preview">`;IONTECH.applyBrand();
  });

  document.getElementById("exportData")?.addEventListener("click",()=>{
    const payload={settings:settings(),content:content(),overrides:getOverrides()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="iontech-catalog-admin-backup.json";a.click();
  });
  document.getElementById("importData")?.addEventListener("change",()=>{
    const file=document.getElementById("importData").files[0];if(!file)return;
    const r=new FileReader();r.onload=()=>{
      try{
        const p=JSON.parse(r.result);
        if(p.settings)localStorage.setItem(IONTECH.SETTINGS,JSON.stringify(p.settings));
        if(p.content)localStorage.setItem(IONTECH.CONTENT,JSON.stringify(p.content));
        if(p.overrides)localStorage.setItem(IONTECH.STORAGE,JSON.stringify(p.overrides));
        alert("Backup imported.");location.reload();
      }catch(e){alert("Invalid backup file.")}
    };r.readAsText(file);
  });

  window.addEventListener("DOMContentLoaded",init);
})();