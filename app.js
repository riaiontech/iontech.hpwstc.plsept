(function(){
  const baseProducts = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const dataLoadError = !Array.isArray(window.PRODUCTS);
  const STORAGE = "iontech_catalog_overrides_v1";
  const SETTINGS = "iontech_catalog_settings_v1";
  const CONTENT = "iontech_site_content_v1";

  const FAMILY_GROUPS = [
    {category:"Mobile Workstation", items:[
      ["ZB8 G1i", p=>p.category==="Mobile Workstations" && /^ZBook 8 G1i$/i.test(p.model)],
      ["ZB8 G2i", p=>p.category==="Mobile Workstations" && /^ZBook 8 G2i$/i.test(p.model)],
      ["ZB8 G2a", p=>p.category==="Mobile Workstations" && /^ZBook 8 G2a$/i.test(p.model)],
      ["ZBook X G1i", p=>p.category==="Mobile Workstations" && /^ZBook X G1i$/i.test(p.model)],
      ["ZBook X G2i", p=>p.category==="Mobile Workstations" && /^ZBook X G2i$/i.test(p.model)],
      ["ZB Ultra G1a", p=>p.category==="Mobile Workstations" && /^ZBook Ultra G1a$/i.test(p.model)]
    ]},
    {category:"Tower", items:[
      ["Z1 Tower G1i", p=>p.category==="Desktop Workstations" && /^Z1 Tower G1i$/i.test(p.model)],
      ["Z2 Mini G1a", p=>p.category==="Desktop Workstations" && /^Z2 Mini G1a$/i.test(p.model)],
      ["Z2 Tower G1i", p=>p.category==="Desktop Workstations" && /^Z2 Tower G1i$/i.test(p.model)]
    ]},
    {category:"Thin Client", items:[
      ["ProDesk 5", p=>p.category==="Thin Clients" && /^PD5G1i/i.test(p.model)],
      ["Elite t655", p=>p.category==="Thin Clients" && /elite\s*t655/i.test(p.model)],
      ["Elite t660", p=>p.category==="Thin Clients" && /elite\s*t660/i.test(p.model)],
      ["elite t755", p=>p.category==="Thin Clients" && /(?:^|\/)t755/i.test(p.model)]
    ]}
  ];

  let selectedCategory = "Mobile Workstation";
  let selectedFamily = "";

  function readOverrides(){try{return JSON.parse(localStorage.getItem(STORAGE)||"{}")}catch(e){return {}}}
  function readSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS)||"{}")}catch(e){return {}}}
  function readContent(){
    const d={
      heroKicker:"Workstations · Business Computing · Thin Clients",
      heroHeading:"Find the right professional machine with confidence.",
      heroSubheading:"Clear specifications, component details and pricing in an easy-to-read professional catalog.",
      heroButtonText:"Browse products",
      productsHeading:"Products",
      productsSubheading:"Browse our professional computing lineup.",
      productsHelper:"Click a product for full specifications & components.",
      footerDescription:"Professional computing catalog.",
      footerNote:"Pricing is shown according to the current pricelist.",
      pricelistDate:"September 16, 2026",
      showHero:true,showHeroKicker:true,showHeroButton:true,showFooter:true
    };
    try{return {...d,...JSON.parse(localStorage.getItem(CONTENT)||"{}")}}catch(e){return d}
  }
  function getProducts(){
    const overrides=readOverrides();
    return baseProducts.map(p=>({...p,...(overrides[p.sku]||{})})).filter(p=>p.hidden!==true);
  }
  function money(v){
    if(!v || String(v).trim()==="" || String(v).trim()==="-") return "—";
    return "₱"+String(v).replace(/₱/g,"").trim();
  }
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  function setMeta(name,content){
    let el=document.querySelector(`meta[name="${name}"]`);
    if(!el){el=document.createElement("meta");el.name=name;document.head.appendChild(el)}
    el.content=content||"";
  }
  function setCanonical(url){
    let el=document.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement("link");el.rel="canonical";document.head.appendChild(el)}
    el.href=url;
  }
  function imageHTML(src,label){
    return src?`<div class="thumb"><img loading="lazy" src="${esc(src)}" alt="${esc(label)} product image"></div>`:
      `<div class="thumb"><div class="placeholder">PRODUCT IMAGE<br><span>${esc(label)}</span></div></div>`;
  }
  function productUrl(p){return `${location.origin}${location.pathname}#product=${encodeURIComponent(p.sku)}`}

  function familyFor(p){
    for(const group of FAMILY_GROUPS){
      for(const [label,test] of group.items) if(test(p)) return label;
    }
    return "";
  }

  function renderFamilySelection(){
    const box=document.getElementById("modelSelection");
    if(!box)return;
    const activeGroup=FAMILY_GROUPS.find(g=>g.category===selectedCategory)||FAMILY_GROUPS[0];
    box.innerHTML=`
      <div class="category-tabs" role="tablist" aria-label="Product categories">
        ${FAMILY_GROUPS.map(group=>`<button class="category-tab ${selectedCategory===group.category?"active":""}" data-category="${esc(group.category)}" role="tab" aria-selected="${selectedCategory===group.category}">${esc(group.category)}</button>`).join("")}
      </div>
      <div class="model-tabs" role="tablist" aria-label="${esc(activeGroup.category)} models">
        ${activeGroup.items.map(([label])=>`<button class="model-tab ${selectedFamily===label?"active":""}" data-family="${esc(label)}" role="tab" aria-selected="${selectedFamily===label}">${esc(label)}</button>`).join("")}
      </div>`;
  }

  function applyBrand(){
    const s=readSettings(), c=readContent(), name=s.companyName||"IONTECH";
    const byId=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
    byId("heroKicker",c.heroKicker);byId("heroHeading",c.heroHeading);byId("heroSubheading",c.heroSubheading);
    byId("heroButton",c.heroButtonText);byId("productsHeading",c.productsHeading);byId("productsSubheading",c.productsSubheading);
    byId("productsHelper",c.productsHelper);byId("footerDescription",c.footerDescription);byId("footerNote",c.footerNote);
    byId("pricelistDate",c.pricelistDate?`Pricelist updated as of ${c.pricelistDate}`:"");
    const hero=document.getElementById("heroSection");if(hero)hero.style.display=c.showHero===false?"none":"";
    const kicker=document.getElementById("heroKicker");if(kicker)kicker.style.display=c.showHeroKicker===false?"none":"";
    const button=document.getElementById("heroButton");if(button){button.style.display=c.showHeroButton===false?"none":"inline-block";button.href="#catalog"}
    const footer=document.getElementById("siteFooter");if(footer)footer.style.display=c.showFooter===false?"none":"";
    document.querySelectorAll("[data-brand]").forEach(el=>el.textContent=name);
    const logo=s.logo||"";
    document.querySelectorAll("[data-logo]").forEach(el=>el.innerHTML=logo?`<img src="${esc(logo)}" alt="${esc(name)} logo">`:`<span>YOUR<br>LOGO</span>`);
  }

  function card(p){
    const onhandLabel=p.priceLabels?.onhand||"On-Hand Price";
    const orderLabel=p.priceLabels?.orderBasis||"Order-Basis Price";
    return `<article class="card">
      <div class="card-media">${imageHTML(p.image1,p.model)}${imageHTML(p.image2,p.model)}</div>
      <div class="card-body">
        <span class="badge">${esc(p.category)}</span>
        <h4>${esc(p.model)}</h4>
        <div class="sku">SKU: ${esc(p.sku)}</div>
        <p class="card-desc">${esc(p.description)}</p>
        <div class="price-grid">
          <div class="price-box"><div class="price-label">${esc(onhandLabel)}</div><div class="price">${money(p.onhandPrice)}</div></div>
          <div class="price-box"><div class="price-label">${esc(orderLabel)}</div><div class="price">${money(p.orderBasisPrice)}</div></div>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" data-view="${esc(p.sku)}">View details</button>
          <button class="btn btn-secondary" data-copy="${esc(productUrl(p))}">Copy link</button>
        </div>
      </div>
    </article>`;
  }

  function render(){
    const products=getProducts();
    const q=(document.querySelector("#search")?.value||"").toLowerCase().trim();
    let list=products.filter(p=>{
      const hay=[p.sku,p.model,p.category,p.description,p.processorBrand,Object.values(p.specs||{}).join(" "),familyFor(p)].join(" ").toLowerCase();
      const group=FAMILY_GROUPS.find(g=>g.category===selectedCategory);
      const inCategory=group ? group.items.some(([,test])=>test(p)) : true;
      const inFamily=!selectedFamily || familyFor(p)===selectedFamily;
      return inCategory && inFamily && (!q||hay.includes(q));
    });
    list.sort((a,b)=>a.model.localeCompare(b.model)||a.sku.localeCompare(b.sku));
    const count=document.querySelector("#count");
    if(count)count.textContent=dataLoadError?"Product data could not be loaded":`${list.length} product${list.length===1?"":"s"}`;
    const grid=document.querySelector("#grid");
    if(grid)grid.innerHTML=dataLoadError?`<div class="empty"><strong>Product data could not be loaded.</strong><br><span class="small">Please make sure products.js is uploaded to the same GitHub repository.</span></div>`:(list.length?list.map(card).join(""):`<div class="empty">No products matched your search or selection.</div>`);
    renderFamilySelection();
  }

  function openProduct(sku){
    const p=getProducts().find(x=>x.sku===sku);if(!p)return;
    const modal=document.querySelector("#modal");
    const specs=Object.entries(p.specs||{}).filter(([k,v])=>v);
    const comps=p.components||[];
    document.querySelector("#modalContent").innerHTML=`
      <div class="modal-top"><div><span class="badge">${esc(p.category)}</span><div class="small">SKU ${esc(p.sku)}</div></div><button class="close" data-close>×</button></div>
      <div class="detail"><div class="detail-grid">
        <div><div class="gallery">${imageHTML(p.image1,p.model)}${imageHTML(p.image2,p.model)}</div></div>
        <div>
          <h2>${esc(p.model)}</h2><p class="lead">${esc(p.description)}</p>
          <div class="detail-prices">
            <div class="detail-price"><span>${esc(p.priceLabels?.onhand||"On-Hand Price")}</span><strong>${money(p.onhandPrice)}</strong></div>
            <div class="detail-price"><span>${esc(p.priceLabels?.orderBasis||"Order-Basis Price")}</span><strong>${money(p.orderBasisPrice)}</strong></div>
          </div>
          ${specs.length?`<h3>Specifications</h3><table class="specs"><tbody>${specs.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`:""}
          ${comps.length?`<h3>Components & included configuration</h3><div class="table-wrap"><table class="specs"><thead><tr><th>Part No.</th><th>Part Description</th></tr></thead><tbody>${comps.map(c=>`<tr><td>${esc(c.partNo)}</td><td>${esc(c.description)}</td></tr>`).join("")}</tbody></table></div>`:""}
        </div>
      </div></div>`;
    modal.classList.add("open");
    history.replaceState(null,"",`#product=${encodeURIComponent(sku)}`);
    updateSEO(p);
  }

  function updateSEO(p){
    const title=p.seoTitle||`${p.model} ${p.sku} | IONTECH`;
    document.title=title;
    setMeta("description",p.seoDescription||p.description);
    setMeta("robots","index,follow");
    setCanonical(productUrl(p));
    let ld=document.querySelector("#product-jsonld");
    if(!ld){ld=document.createElement("script");ld.id="product-jsonld";ld.type="application/ld+json";document.head.appendChild(ld)}
    const offers=[];
    if(p.onhandPrice)offers.push({"@type":"Offer","name":p.seoOnhandTitle||"On-Hand Price","description":p.seoOnhandDescription||"On-hand pricing for this product.","priceCurrency":"PHP","price":String(p.onhandPrice).replace(/[^\d.]/g,"")});
    if(p.orderBasisPrice)offers.push({"@type":"Offer","name":p.seoOrderTitle||"Order-Basis Price","description":p.seoOrderDescription||"Order-basis pricing for this product.","priceCurrency":"PHP","price":String(p.orderBasisPrice).replace(/[^\d.]/g,"")});
    ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product","name":p.model,"description":p.description,"sku":p.sku,"category":p.category,"image":[p.image1,p.image2].filter(Boolean),"offers":offers});
  }

  function resetSEO(){
    const s=readSettings();
    document.title=s.siteTitle||"IONTECH Professional Computing Catalog";
    setMeta("description",s.siteDescription||"Professional workstations and thin clients with specifications, components and pricing.");
    setMeta("robots","index,follow");
    setCanonical(location.origin+location.pathname);
    document.querySelector("#product-jsonld")?.remove();
  }

  document.addEventListener("click",e=>{
    const v=e.target.closest("[data-view]");if(v)openProduct(v.dataset.view);
    const c=e.target.closest("[data-copy]");if(c){navigator.clipboard?.writeText(c.dataset.copy);c.textContent="Copied";setTimeout(()=>c.textContent="Copy link",1200)}
    const cat=e.target.closest("[data-category]");if(cat){selectedCategory=cat.dataset.category;selectedFamily="";render();return}
    const f=e.target.closest("[data-family]");if(f){selectedFamily=selectedFamily===f.dataset.family?"":f.dataset.family;render()}
    const close=e.target.closest("[data-close]");if(close){document.querySelector("#modal")?.classList.remove("open");history.replaceState(null,"",location.pathname);resetSEO()}
    if(e.target.id==="modal")e.target.classList.remove("open");
  });
  document.getElementById("search")?.addEventListener("input",render);

  window.IONTECH={getProducts,readOverrides,readSettings,readContent,render,applyBrand,openProduct,STORAGE,SETTINGS,CONTENT,baseProducts};

  window.addEventListener("DOMContentLoaded",()=>{
    applyBrand();
    render();
    const m=location.hash.match(/^#product=(.+)$/);
    if(m)openProduct(decodeURIComponent(m[1]));else resetSEO();
  });
})();