
document.addEventListener("DOMContentLoaded",()=>{
  document.body.classList.add("loading");
  const loader=document.querySelector(".loader");
  const finish=()=>setTimeout(()=>{loader?.classList.add("hide");document.body.classList.remove("loading")},700);
  if(document.readyState==="complete") finish(); else window.addEventListener("load",finish,{once:true});

  const menu=document.querySelector(".menu-btn"), nav=document.querySelector(".nav-links");
  menu?.addEventListener("click",()=>{nav.classList.toggle("open");menu.setAttribute("aria-expanded",nav.classList.contains("open"))});
  nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

  // Mark current page.
  const page=document.body.dataset.page;
  nav?.querySelectorAll("a[data-page]").forEach(a=>a.classList.toggle("active",a.dataset.page===page));

  // Gallery lightbox
  const items=[...document.querySelectorAll(".gallery-item")];
  const modal=document.querySelector(".modal"), modalImg=modal?.querySelector("img");
  let current=0;
  const openGallery=(i)=>{if(!modal)return;current=i;modalImg.src=items[i].querySelector("img").src;modalImg.alt=items[i].querySelector("img").alt;modal.classList.add("open");document.body.style.overflow="hidden"};
  const closeGallery=()=>{modal?.classList.remove("open");document.body.style.overflow=""};
  items.forEach((item,i)=>item.addEventListener("click",()=>openGallery(i)));
  modal?.querySelector(".modal-close")?.addEventListener("click",closeGallery);
  modal?.querySelector(".modal-prev")?.addEventListener("click",()=>openGallery((current-1+items.length)%items.length));
  modal?.querySelector(".modal-next")?.addEventListener("click",()=>openGallery((current+1)%items.length));
  modal?.addEventListener("click",e=>{if(e.target===modal)closeGallery()});
  document.addEventListener("keydown",e=>{if(!modal?.classList.contains("open"))return;if(e.key==="Escape")closeGallery();if(e.key==="ArrowLeft")openGallery((current-1+items.length)%items.length);if(e.key==="ArrowRight")openGallery((current+1)%items.length)});

  // Contact expandable cards
  document.querySelectorAll(".contact-card").forEach(card=>{
    const toggle=()=>{const open=card.classList.toggle("open");card.setAttribute("aria-expanded",open)};
    card.addEventListener("click",e=>{if(e.target.closest("a")) return; toggle()});
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
  });

  // PWA install notice: mobile only, dismissed for the current browser session.
  let deferredPrompt=null;
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e});
  const install=document.querySelector(".install-card");
  const isMobile=window.matchMedia("(max-width: 850px)").matches;
  if(install && isMobile && !sessionStorage.getItem("tpcInstallDismissed")){
    setTimeout(()=>install.classList.add("show"),1800);
  }
  install?.querySelector(".dismiss")?.addEventListener("click",()=>{sessionStorage.setItem("tpcInstallDismissed","1");install.classList.remove("show")});
  install?.querySelector(".install")?.addEventListener("click",async()=>{
    if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;install.classList.remove("show");sessionStorage.setItem("tpcInstallDismissed","1")}
    else{
      const help=install.querySelector(".install-help"); if(help) help.hidden=!help.hidden;
    }
  });

  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
});
