import { useState, useEffect, useRef } from "react";

const GOLD = "#C9A84C";
const CREAM = "#F5EDD6";

// ── Data ──────────────────────────────────────────────────────────────────────
const BADGES = [
  { id:"first",        icon:"🥂", label:"Premier Verre",    desc:"Première commande passée",             condition:(h)=>h.length>=1 },
  { id:"ten",          icon:"🏅", label:"Fidèle du Bar",     desc:"10 boissons consommées",               condition:(h)=>h.reduce((a,o)=>a+o.qty,0)>=10 },
  { id:"twenty",       icon:"🥃", label:"Amateur Éclairé",   desc:"20 boissons consommées",               condition:(h)=>h.reduce((a,o)=>a+o.qty,0)>=20 },
  { id:"cocktail5",    icon:"🍸", label:"Cocktail Lover",    desc:"5 cocktails commandés",                condition:(h)=>h.filter(o=>o.category==="cocktail").reduce((a,o)=>a+o.qty,0)>=5 },
  { id:"wine5",        icon:"🍷", label:"Œnophile",          desc:"5 verres de vin",                      condition:(h)=>h.filter(o=>o.category==="vin").reduce((a,o)=>a+o.qty,0)>=5 },
  { id:"night",        icon:"🌙", label:"Noctambule",        desc:"Commande après minuit",                condition:(h)=>h.some(o=>o.isLate) },
  { id:"critic",       icon:"✍️", label:"Critique Amateur",  desc:"5 avis laissés",                       condition:(h)=>h.filter(o=>o.review?.note).length>=5 },
  { id:"photographer", icon:"📸", label:"Photographe",       desc:"3 photos postées",                     condition:(h)=>h.filter(o=>o.review?.photo).length>=3 },
  { id:"masterclass",  icon:"🎬", label:"Élève Assidu",      desc:"3 masterclass regardées",              condition:(h,w)=>w>=3 },
];

const MENU = [
  { name:"Old Fashioned",     category:"cocktail",   price:14 },
  { name:"Negroni",           category:"cocktail",   price:13 },
  { name:"Espresso Martini",  category:"cocktail",   price:15 },
  { name:"Mojito Maison",     category:"cocktail",   price:12 },
  { name:"Whisky Single Malt",category:"spiritueux", price:16 },
  { name:"Gin Premium",       category:"spiritueux", price:14 },
  { name:"Bordeaux Rouge",    category:"vin",        price:10 },
  { name:"Champagne",         category:"vin",        price:18 },
  { name:"Bière Artisanale",  category:"biere",      price:8  },
  { name:"Eau Pétillante",    category:"soft",       price:5  },
];

const TIERS = {
  bronze:   { label:"Bronze",  color:"#CD7F32", next:"silver",   xpNeeded:100 },
  silver:   { label:"Argent",  color:"#A8A9AD", next:"gold",     xpNeeded:300 },
  gold:     { label:"Or",      color:"#C9A84C", next:"platinum", xpNeeded:700 },
  platinum: { label:"Platine", color:"#E5E4E2", next:null,       xpNeeded:null },
};

const SPECIAL_PERKS = [
  { id:"menu-secret",    label:"Menu Secret",       icon:"📜", desc:"Accès aux cocktails exclusifs non listés" },
  { id:"happy-hour-vip", label:"Happy Hour VIP",    icon:"⏰", desc:"Happy hour prolongé jusqu'à 21h" },
  { id:"table-reservee", label:"Table Réservée",    icon:"🪑", desc:"Table prioritaire sans réservation" },
  { id:"degustation",    label:"Dégustation Privée",icon:"🎩", desc:"Invitation aux événements de dégustation" },
  { id:"anniversaire",   label:"Offre Anniversaire",icon:"🎂", desc:"Cocktail offert le jour de l'anniversaire" },
];

const MASTERCLASSES = [
  {
    id:1, title:"Old Fashioned · Deux Âmes",
    subtitle:"Whisky & équilibre sucré-amer",
    duration:"12 min", level:"Débutant",
    thumbnail:"🥃",
    videoUrl:"https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:"Découvrez comment une simple variation de sucre et de bitters peut transformer radicalement un Old Fashioned — de la version classique et douce à une expression plus sèche, presque médicinale.",
    duoA:{ label:"Expression I — Classique & Gourmand",
      ingredients:["6 cl Bourbon 45°","1 sucre brun","2 traits Angostura","1 trait Orange bitters","Zeste d'orange"],
      steps:["Dissoudre le sucre avec 1 trait d'eau","Ajouter les bitters, remuer","Ajouter le bourbon, glace unique","Remuer 30 secondes, zeste en finition"],
      tip:"La glace unique est essentielle — elle dilue lentement et gardela texture." },
    duoB:{ label:"Expression II — Sec & Minéral",
      ingredients:["6 cl Rye Whiskey 50°","½ sucre de canne blanc","3 traits Peychaud's","1 trait Absinthe","Zeste de citron"],
      steps:["Rincer le verre à l'absinthe","Dissoudre le sucre sans eau","Ajouter le rye et les bitters","Remuer 40 secondes, plus froid","Zeste de citron exprimé puis jeté"],
      tip:"Le Peychaud's apporte une note anisée qui dialogue avec l'absinthe." },
  },
  {
    id:2, title:"Espuma · Technique & Application",
    subtitle:"Maîtriser la texture aérienne",
    duration:"18 min", level:"Intermédiaire",
    thumbnail:"🫧",
    videoUrl:"https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:"L'espuma appliquée à la mixologie ouvre un champ infini. Cette masterclass couvre les bases de la lécithine de soja, du siphon, et comment passer d'une espuma neutre à une espuma aromatisée complex.",
    duoA:{ label:"Expression I — Espuma Légère au Citron",
      ingredients:["20 cl jus de citron frais","5 cl eau","3g lécithine de soja","1 cs sucre glace"],
      steps:["Mixer tous les ingrédients","Incliner le bol à 45°","Mixer en surface pour incorporer de l'air","Récupérer la mousse à la cuillère"],
      tip:"La lécithine fonctionne mieux entre 40-60°C. À froid, augmenter légèrement la dose." },
    duoB:{ label:"Expression II — Espuma Dense au Siphon",
      ingredients:["25 cl base aromatisée","1g xanthane","2 blancs d'œuf","Cartouche N²O"],
      steps:["Mélanger xanthane + base au mixeur","Ajouter les blancs, mélanger","Filtrer et verser dans le siphon","1 cartouche N²O, secouer 10×"],
      tip:"Le xanthane stabilise — moins de 1g pour 25cl sinon texture caoutchouteuse." },
  },
  {
    id:3, title:"Fatwashing · Gras & Alcool",
    subtitle:"Infuser les saveurs grasses",
    duration:"15 min", level:"Avancé",
    thumbnail:"🧈",
    videoUrl:"https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:"Le fatwashing est l'une des techniques les plus puissantes de la mixologie moderne. Elle permet d'extraire les arômes liposolubles d'un corps gras et de les transférer dans un alcool, sans la texture huileuse.",
    duoA:{ label:"Expression I — Beurre Noisette & Bourbon",
      ingredients:["70cl Bourbon","150g beurre doux","Faire noisette 5 min"],
      steps:["Faire fondre le beurre jusqu'à coloration noisette","Laisser tiédir 5 min","Mélanger beurre + bourbon, agiter","4h à température ambiante","Congeler 12h, filtrer le gras solidifié"],
      tip:"Plus le beurre est noisette (pas brûlé), plus les arômes de caramel sont intenses." },
    duoB:{ label:"Expression II — Huile de Truffe & Gin",
      ingredients:["70cl Gin London Dry","30ml huile de truffe noire","5g sel fin"],
      steps:["Mélanger gin + huile + sel","Agiter vigoureusement 2 min","Repos 2h (pas de chaleur)","Congeler 8h","Filtrer au chinois étamine"],
      tip:"Le gin doit être neutre aromatiquement — le Beefeater est idéal, éviter les gins floraux." },
  },
  {
    id:4, title:"Clarification · Transparence & Pureté",
    subtitle:"Nettoyer un cocktail trouble",
    duration:"20 min", level:"Avancé",
    thumbnail:"💎",
    videoUrl:"https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:"La clarification au lait (milk washing) ou à l'agar-agar permet d'obtenir des cocktails d'une transparence cristalline tout en gardant toute la complexité aromatique. Deux méthodes, deux résultats.",
    duoA:{ label:"Expression I — Clarification au Lait",
      ingredients:["Cocktail à clarifier 50cl","10cl lait entier froid","2cl citron frais"],
      steps:["Préparer le cocktail complet avec acides","Ajouter le lait froid — ne pas chauffer","Le lait va cailler immédiatement","Laisser reposer 30 min","Filtrer au filtre à café — 2 passages"],
      tip:"L'acidité du cocktail est cruciale pour faire cailler le lait. Sans acide, ça ne fonctionne pas." },
    duoB:{ label:"Expression II — Clarification Agar-Agar",
      ingredients:["Cocktail à clarifier 50cl","2g agar-agar","Centrifugeuse ou repos 4h"],
      steps:["Chauffer 10cl du cocktail + agar-agar à 85°C","Mélanger avec le reste du cocktail","Laisser prendre en gel au froid (45 min)","Briser le gel et filtrer ou centrifuger","Résultat : cristallin sans perte aromatique"],
      tip:"Cette méthode préserve mieux les arômes volatils que le milk washing." },
  },
];

const initialSuggestions = [
  { id:1, text:"Ce serait super d'avoir un cocktail sans alcool aussi raffiné que les autres !", date:"2025-03-28", memberId:1, reply:"Excellente idée — on travaille sur deux expressions 0% pour l'ouverture. 👀", repliedAt:"2025-03-29" },
  { id:2, text:"La musique était un peu forte vendredi soir, difficile de parler.", date:"2025-03-20", memberId:2, reply:null, repliedAt:null },
];

const initialMembers = [
  { id:1, name:"Sophie Marchand", email:"sophie@mail.com", tier:"gold",   xp:420, joinDate:"2024-11-15", avatar:null,
    history:[
      { id:101, date:"2025-03-28", item:"Old Fashioned",    category:"cocktail",   qty:2, price:14, isLate:false, review:{ rating:5, note:"Absolument parfait, l'équilibre est impeccable !", photo:null } },
      { id:102, date:"2025-03-20", item:"Negroni",           category:"cocktail",   qty:1, price:13, isLate:true,  review:{ rating:4, note:"Très bon mais légèrement trop amer.", photo:null } },
      { id:103, date:"2025-03-10", item:"Bordeaux Rouge",    category:"vin",        qty:3, price:10, isLate:false, review:null },
      { id:104, date:"2025-02-14", item:"Champagne",         category:"vin",        qty:2, price:18, isLate:false, review:null },
      { id:105, date:"2025-02-01", item:"Espresso Martini",  category:"cocktail",   qty:2, price:15, isLate:false, review:{ rating:5, note:"Mon préféré du bar ☕🍸", photo:null } },
    ],
    specialAccess:["menu-secret","happy-hour-vip"], managerNote:"Cliente régulière, très appréciée", watchedVideos:[1,2] },
  { id:2, name:"Thomas Lefèvre",  email:"thomas@mail.com",  tier:"silver", xp:185, joinDate:"2025-01-08", avatar:null,
    history:[
      { id:201, date:"2025-03-25", item:"Mojito Maison",     category:"cocktail",   qty:1, price:12, isLate:false, review:{ rating:3, note:"Bien mais j'aurais préféré plus de menthe.", photo:null } },
      { id:202, date:"2025-03-15", item:"Whisky Single Malt",category:"spiritueux", qty:2, price:16, isLate:false, review:null },
    ],
    specialAccess:[], managerNote:"", watchedVideos:[] },
  { id:3, name:"Isabelle Durand", email:"isabelle@mail.com", tier:"bronze", xp:45,  joinDate:"2025-03-01", avatar:null,
    history:[
      { id:301, date:"2025-03-30", item:"Bière Artisanale",  category:"biere",      qty:1, price:8,  isLate:false, review:null },
    ],
    specialAccess:[], managerNote:"", watchedVideos:[] },
];

const BAR_INFO = {
  instagram: "https://instagram.com/essence.bar",
  google:    "https://maps.google.com/?q=Essence+Bar",
  address:   "12 Rue des Alchimistes, Paris 11e",
  hours:     "Mar–Sam · 18h–2h",
  phone:     "+33 1 23 45 67 89",
};

// ── Fonts ─────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@300;400;500&family=Cinzel:wght@400;600&display=swap";
document.head.appendChild(fontLink);

const css = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0D0D0D;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.6}}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .4s ease forwards;}
  .slide-up{animation:slideUp .3s ease forwards;}
  .card-shine{position:relative;overflow:hidden;}
  .card-shine::before{content:'';position:absolute;top:-60%;left:-60%;width:40%;height:220%;
    background:linear-gradient(105deg,transparent 40%,rgba(201,168,76,.15) 50%,transparent 60%);
    transform:rotate(-10deg);animation:shimmer 4s ease-in-out infinite;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:${GOLD}44;border-radius:2px;}
  input,textarea,select{color-scheme:dark;}
`;
const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

// ── Helpers ───────────────────────────────────────────────────────────────────
const totalDrinks  = h => h.reduce((a,o)=>a+o.qty,0);
const totalSpent   = h => h.reduce((a,o)=>a+o.qty*o.price,0);
const earnedBadges = (h,w=0) => BADGES.filter(b=>b.condition(h,w));
const xpProgress   = (xp,tier) => {
  const t=TIERS[tier]; if(!t.next) return 100;
  const prev=tier==="bronze"?0:tier==="silver"?100:tier==="gold"?300:700;
  return Math.min(100,((xp-prev)/(t.xpNeeded-prev))*100);
};

const Stars = ({value,onChange,size=20})=>(
  <div style={{display:"flex",gap:3}}>
    {[1,2,3,4,5].map(n=>(
      <span key={n} onClick={()=>onChange&&onChange(n)}
        style={{fontSize:size,cursor:onChange?"pointer":"default",
          color:n<=value?GOLD:"#2a2a2a",transition:"color .15s",lineHeight:1}}>★</span>
    ))}
  </div>
);

const Divider=()=>(
  <div style={{display:"flex",alignItems:"center",gap:12,margin:"14px 0"}}>
    <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,${GOLD}55)`}}/>
    <span style={{color:GOLD,fontSize:9,letterSpacing:3}}>◆</span>
    <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,${GOLD}55)`}}/>
  </div>
);

const Toast=({msg})=>msg?(
  <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
    background:`linear-gradient(135deg,#1a1408,#2a2210)`,
    border:`1px solid ${GOLD}55`,borderRadius:10,padding:"10px 22px",
    fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:GOLD,
    zIndex:500,boxShadow:`0 4px 20px ${GOLD}22`,whiteSpace:"nowrap"}}>
    {msg}
  </div>
):null;

// ── AvatarUpload ──────────────────────────────────────────────────────────────
const AvatarUpload=({avatar,onChange,name,size=68})=>{
  const ref=useRef();
  const initials=name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  return(
    <div onClick={()=>ref.current.click()} style={{
      width:size,height:size,borderRadius:size/2,cursor:"pointer",
      border:`2px solid ${GOLD}55`,overflow:"hidden",
      background:"#1a1408",display:"flex",alignItems:"center",
      justifyContent:"center",flexShrink:0,position:"relative"}}>
      {avatar
        ?<img src={avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        :<span style={{fontFamily:"'Cinzel',serif",fontSize:size*.28,color:GOLD}}>{initials}</span>
      }
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:22,
        background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",
        justifyContent:"center",fontSize:12}}>📷</div>
      <input ref={ref} type="file" accept="image/*" capture="user"
        onChange={e=>{const f=e.target.files[0];if(!f)return;
          const r=new FileReader();r.onload=()=>onChange(r.result);r.readAsDataURL(f);
        }} style={{display:"none"}}/>
    </div>
  );
};

// ── ReviewModal ───────────────────────────────────────────────────────────────
const ReviewModal=({order,onSave,onClose})=>{
  const [rating,setRating]=useState(order.review?.rating||0);
  const [note,setNote]=useState(order.review?.note||"");
  const [photo,setPhoto]=useState(order.review?.photo||null);
  const fileRef=useRef();
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
      <div className="slide-up" style={{background:"#141414",border:`1px solid ${GOLD}44`,
        borderRadius:20,padding:26,width:"100%",maxWidth:380,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:CREAM,marginBottom:3}}>{order.item}</div>
        <div style={{fontSize:12,color:"#555",marginBottom:20}}>{new Date(order.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#666",letterSpacing:2,marginBottom:10}}>VOTRE NOTE</div>
        <div style={{marginBottom:20}}><Stars value={rating} onChange={setRating} size={34}/></div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#666",letterSpacing:2,marginBottom:8}}>COMMENTAIRE</div>
        <textarea value={note} onChange={e=>setNote(e.target.value)}
          placeholder="Qu'avez-vous pensé ? Trop sucré, trop fort, parfait ?"
          style={{width:"100%",height:88,background:"#0f0f0f",border:"1px solid #2a2a2a",
            borderRadius:10,padding:"12px 14px",color:CREAM,resize:"none",outline:"none",
            fontFamily:"'Cormorant Garamond',serif",fontSize:14,lineHeight:1.5,marginBottom:16}}/>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#666",letterSpacing:2,marginBottom:10}}>PHOTO</div>
        {photo
          ?<div style={{position:"relative",marginBottom:16}}>
            <img src={photo} alt="cocktail" style={{width:"100%",height:180,objectFit:"cover",borderRadius:12,border:`1px solid ${GOLD}33`}}/>
            <button onClick={()=>setPhoto(null)} style={{position:"absolute",top:8,right:8,
              background:"rgba(0,0,0,.75)",border:"1px solid #444",borderRadius:20,width:28,height:28,
              color:"#ccc",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
          :<div onClick={()=>fileRef.current.click()} style={{width:"100%",height:100,borderRadius:12,
            border:"2px dashed #2a2a2a",display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",gap:8,cursor:"pointer",marginBottom:16,background:"#0f0f0f"}}>
            <span style={{fontSize:26}}>📸</span>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#555"}}>Prendre / choisir une photo</span>
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              onChange={e=>{const f=e.target.files[0];if(!f)return;
                const r=new FileReader();r.onload=()=>setPhoto(r.result);r.readAsDataURL(f);
              }} style={{display:"none"}}/>
          </div>
        }
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px",background:"#111",border:"1px solid #333",
            borderRadius:10,color:"#666",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:14}}>Annuler</button>
          <button onClick={()=>onSave({rating,note,photo})} style={{flex:2,padding:"11px",
            background:`linear-gradient(135deg,#1a1408,#2a2210)`,border:`1px solid ${GOLD}55`,
            borderRadius:10,color:GOLD,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:1}}>ENREGISTRER</button>
        </div>
      </div>
    </div>
  );
};

// ── MemberCard (liste gérant) ─────────────────────────────────────────────────
const MemberCard=({member,onClick,selected})=>{
  const tier=TIERS[member.tier];
  const initials=member.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  return(
    <div onClick={onClick} className="card-shine" style={{
      background:selected?`linear-gradient(135deg,#1f1a0e,#2a2210)`:`linear-gradient(135deg,#141414,#1a1a1a)`,
      border:`1px solid ${selected?GOLD:"#222"}`,borderRadius:12,padding:"14px 18px",
      cursor:"pointer",transition:"all .25s",marginBottom:10,boxShadow:selected?`0 0 18px ${GOLD}22`:"none"}}>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div style={{width:42,height:42,borderRadius:21,border:`1px solid ${tier.co
