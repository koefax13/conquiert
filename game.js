const S=5,FW=W*S,FH=H*S,NEU=60,SEA=61;
const $=id=>document.getElementById(id);
const cv=$("c"),ctx=cv.getContext("2d"),tip=$("tip"),hud=$("hud"),rows=$("rows"),tl=$("tl"),tc=tl.getContext("2d");
let land,owner,orig,pop,troops,flash,adj,alive,tick,quiet,done,labs=[],arrows=[],fdt=16,mult=[],dist,paused=false,speed=1,acc=0,last=0,cell=10,hov=-1,hovO=-1,DPR=1;
let rel,cdUntil,cdGift,tgt,tradeDone,lastAsk=0,askJ=0,occ,trait,agr,boost,al,alT,leader=-1,hist=[],CAP=[],toast,ter,isCap,fallen,siege,lastSg,recr,me=-1,stance=1,decOn=false,nextDec=0,lastSgDec=0,meLost=false,dirty=true,modals=0;
const rnd=Math.random,U=1500;
const MD={"Russie":1.45,"Turquie":1.2,"France":1.35,"Royaume-Uni":1.2,"Allemagne":1.15,"Italie":1.05,"Pologne":1.15,"Ukraine":1.25,"Espagne":.95,"Grèce":1,"Suède":1,"Finlande":1.05,"Norvège":.95,"Roumanie":.9,"Pays-Bas":.9,"Belgique":.8,"Danemark":.85,"Portugal":.8,"Autriche":.8,"Suisse":.85,"Hongrie":.8,"Tchéquie":.8,"Serbie":.85,"Bulgarie":.8,"Croatie":.75,"Lituanie":.75,"Lettonie":.7,"Estonie":.7,"Irlande":.65,"Slovaquie":.75,"Slovénie":.65,"Biélorussie":1,"Moldavie":.6,"Bosnie":.65,"Albanie":.65,"Macédoine du Nord":.65,"Monténégro":.6,"Chypre":.6,"Luxembourg":.5,"Kosovo":.6};
const MP=NAMES.map(n=>MD[n]||.8),NU=NAMES.map(n=>n==="Russie"||n==="France"||n==="Royaume-Uni");
const GD={"Russie":13000,"Turquie":12700,"Suède":56000,"Ukraine":5200,"France":44000,"Finlande":53000,"Norvège":87000,"Espagne":33000,"Allemagne":52000,"Pologne":22000,"Italie":38000,"Royaume-Uni":48000,"Roumanie":18000,"Biélorussie":7500,"Grèce":22000,"Bulgarie":15000,"Hongrie":21000,"Portugal":27000,"Autriche":55000,"Tchéquie":30000,"Serbie":10500,"Irlande":105000,"Lituanie":26000,"Lettonie":21000,"Croatie":20000,"Bosnie":8000,"Slovaquie":22000,"Estonie":29000,"Danemark":67000,"Pays-Bas":62000,"Suisse":93000,"Moldavie":6500,"Belgique":55000,"Albanie":8800,"Macédoine du Nord":8000,"Monténégro":11000,"Slovénie":31000,"Chypre":33000,"Luxembourg":127000,"Kosovo":5700};
const GP=NAMES.map(n=>GD[n]||25000),PF=GP.map(g=>Math.max(.6,Math.min(1.5,Math.pow(g/3e4,.3))));
const CP={"Russie":[37.62,55.75,"Moscou"],"Turquie":[32.85,39.93,"Ankara"],"Suède":[18.07,59.33,"Stockholm"],"Ukraine":[30.52,50.45,"Kiev"],"France":[2.35,48.85,"Paris"],"Finlande":[24.94,60.17,"Helsinki"],"Norvège":[10.75,59.91,"Oslo"],"Espagne":[-3.7,40.42,"Madrid"],"Allemagne":[13.4,52.52,"Berlin"],"Pologne":[21.01,52.23,"Varsovie"],"Italie":[12.5,41.9,"Rome"],"Royaume-Uni":[-0.13,51.51,"Londres"],"Roumanie":[26.1,44.43,"Bucarest"],"Biélorussie":[27.57,53.9,"Minsk"],"Grèce":[23.73,37.98,"Athènes"],"Bulgarie":[23.32,42.7,"Sofia"],"Hongrie":[19.04,47.5,"Budapest"],"Portugal":[-9.14,38.72,"Lisbonne"],"Autriche":[16.37,48.21,"Vienne"],"Tchéquie":[14.42,50.08,"Prague"],"Serbie":[20.46,44.82,"Belgrade"],"Irlande":[-6.26,53.35,"Dublin"],"Lituanie":[25.28,54.69,"Vilnius"],"Lettonie":[24.11,56.95,"Riga"],"Croatie":[15.98,45.81,"Zagreb"],"Bosnie":[18.41,43.86,"Sarajevo"],"Slovaquie":[17.11,48.15,"Bratislava"],"Estonie":[24.75,59.44,"Tallinn"],"Danemark":[12.57,55.68,"Copenhague"],"Pays-Bas":[4.9,52.37,"Amsterdam"],"Suisse":[7.45,46.95,"Berne"],"Moldavie":[28.86,47.01,"Chisinau"],"Belgique":[4.35,50.85,"Bruxelles"],"Albanie":[19.82,41.33,"Tirana"],"Macédoine du Nord":[21.43,42,"Skopje"],"Monténégro":[19.26,42.44,"Podgorica"],"Slovénie":[14.51,46.06,"Ljubljana"],"Kosovo":[21.17,42.66,"Pristina"],"Chypre":[33.38,35.17,"Nicosie"],"Luxembourg":[6.13,49.61,"Luxembourg"]};
const CN=NAMES.map(n=>(CP[n]||[0,0,"la capitale"])[2]);
const TUN={capD:1.8,capG:3,capT:.35,occ:6,att:260,seaCap:.3,mpExp:.4,nuc:1.1,tr:.35,mx:.2};
const RM=[1.1,.75,1.1,.75],TRN=["Plaine","Montagne","Fleuve","Montagne et fleuve"];
const STA=[1.2,1,.85],STD=[.88,1,1.2],STG=[1.4,1,.65];
const canAsk=()=>decOn&&!modals&&performance.now()-lastAsk>18000+askJ;
const hs=(a,b)=>owner[a]!==owner[b]&&!al[owner[a]*N+owner[b]];
const MPv=k=>Math.pow(MP[k],TUN.mpExp);
const pwA=k=>mult[k]*MPv(k)*trait[k]*boost[k]*(k===me?STA[stance]:1);
const pwD=k=>mult[k]*MPv(k)*trait[k]*boost[k]*(k===me?STD[stance]:1);
const fmt=p=>p>=1e6?(p/1e6).toFixed(1).replace(".",",")+" M":Math.round(p/1e3)+" k";
const col=(k,L)=>`hsl(${HU[k]} ${SA[k]*.8}% ${L}%)`;
const lum=p=>34+24*Math.min(1,Math.log(p/2e4+1)/Math.log(601));
const wk=t=>new Date(2026,10,21+t*7).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});
const hslRGB=(h,s,l)=>{s/=100;l/=100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return[Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)]};

/* ---------- rendu continu ---------- */
let FPC,MT,CI,CW,LS,OW,LUT,mc,mctx,img,u32,seaC,rivPath;
const GOLD=(255<<24)|(74<<16)|(213<<8)|255;
const dim=(c,f)=>(255<<24)|(((((c>>16)&255)*f)|0)<<16)|(((((c>>8)&255)*f)|0)<<8)|(((c&255)*f)|0);
function unrle(s,len){const a=new Uint8Array(len);let p=0;for(let i=0;i<s.length;i+=3){const v=s.charCodeAt(i)-48,n=parseInt(s.substr(i+1,2),36);a.fill(v,p,p+n);p+=n}return a}
function prep(){
  const P=FW*FH;
  FPC=unrle(FRLE,P);MT=unrle(MRLE,P);
  CI=new Int16Array(P*4).fill(-1);CW=new Float32Array(P*4);LS=new Uint8Array(P);OW=new Uint8Array(P);
  const lc=new Float32Array(M);for(let i=0;i<M;i++)lc[i]=lum(pop[i]);
  const Lf=new Float32Array(P);
  for(let py=0;py<FH;py++)for(let px=0;px<FW;px++){
    const p=py*FW+px;let c=FPC[p];
    if(c===SEA)continue;
    let L=36;
    if(c<N){
      const wx=.34*Math.sin(py*.09+px*.031)+.2*Math.sin(px*.07-py*.053),wy=.34*Math.sin(px*.083-py*.04)+.2*Math.sin(py*.061+px*.047);
      const gx=(px+.5)/S+wx-.5,gy=(py+.5)/S+wy-.5,x0=Math.floor(gx),y0=Math.floor(gy),tx=gx-x0,ty=gy-y0;
      let n=0,sw=0;
      for(let b=0;b<2;b++)for(let a=0;a<2;a++){
        const cx=x0+a,cy=y0+b;if(cx<0||cy<0||cx>=W||cy>=H)continue;
        const ci=cy*W+cx;if(!land[ci]||orig[ci]!==c)continue;
        const w=(a?tx:1-tx)*(b?ty:1-ty);if(w<.001)continue;
        CI[p*4+n]=ci;CW[p*4+n]=w;sw+=w;n++;
      }
      if(!n){
        const fx=gx+.5,fy=gy+.5;let best=-1,bd=1e9;
        for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const cx=Math.floor(fx)+dx,cy=Math.floor(fy)+dy;if(cx<0||cy<0||cx>=W||cy>=H)continue;const ci=cy*W+cx;if(!land[ci]||orig[ci]!==c)continue;const d=(cx+.5-fx)**2+(cy+.5-fy)**2;if(d<bd){bd=d;best=ci}}
        if(best<0){for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const cx=Math.floor(fx)+dx,cy=Math.floor(fy)+dy;if(cx<0||cy<0||cx>=W||cy>=H)continue;const ci=cy*W+cx;if(!land[ci])continue;const d=(cx+.5-fx)**2+(cy+.5-fy)**2;if(d<bd){bd=d;best=ci}}}
        if(best<0){FPC[p]=NEU;c=NEU}else{CI[p*4]=best;CW[p*4]=1;sw=1;n=1}
      }
      if(c<N){let l=0;for(let k=0;k<n;k++){CW[p*4+k]/=sw;l+=CW[p*4+k]*lc[CI[p*4+k]]}L=l}
    }
    const h=((px*73856093)^(py*19349663))>>>0,nz=((h%1000)/1000-.5)*2.4;
    L+=nz;
    if(MT[p])L-=4+2*Math.sin((px+py)*.8);
    Lf[p]=L;
  }
  for(let py=0;py<FH;py++)for(let px=0;px<FW;px++){
    const p=py*FW+px;if(FPC[p]===SEA)continue;
    let L=Lf[p];
    if(px===0||py===0||px===FW-1||py===FH-1||FPC[p-1]===SEA||FPC[p+1]===SEA||FPC[p-FW]===SEA||FPC[p+FW]===SEA)L-=10;
    LS[p]=Math.max(0,Math.min(63,Math.round((L-14)/60*63)));
  }
  LUT=new Uint32Array((N+1)*64);
  for(let o=0;o<=N;o++)for(let q=0;q<64;q++){
    const L=14+q/63*60;let r,g,b;
    if(o<N)[r,g,b]=hslRGB(HU[o],SA[o]*.8,L);else[r,g,b]=hslRGB(205,9,L*.8);
    LUT[o*64+q]=(255<<24)|(b<<16)|(g<<8)|r;
  }
  mc=document.createElement("canvas");mc.width=FW;mc.height=FH;mctx=mc.getContext("2d");
  img=mctx.createImageData(FW,FH);u32=new Uint32Array(img.data.buffer);
  rivPath=new Path2D();for(const r of RIV){rivPath.moveTo(r[0],r[1]);for(let i=2;i<r.length;i+=2)rivPath.lineTo(r[i],r[i+1])}
}
function paint(){
  const P=FW*FH;
  for(let p=0;p<P;p++){
    const c=FPC[p];
    if(c===SEA){OW[p]=255;continue}
    if(c===NEU){OW[p]=N;continue}
    const b=p*4;let n=4;while(n>1&&CI[b+n-1]<0)n--;
    const o0=owner[CI[b]];let o=o0,same=true;
    for(let k=1;k<n;k++)if(owner[CI[b+k]]!==o0){same=false;break}
    if(!same){let bw=-1;for(let k=0;k<n;k++){const ok=owner[CI[b+k]];let w=0;for(let m=0;m<n;m++)if(owner[CI[b+m]]===ok)w+=CW[b+m];if(w>bw||(w===bw&&ok<o)){bw=w;o=ok}}}
    OW[p]=o;
  }
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){
    const p=y*FW+x,o=OW[p];
    if(o===255){u32[p]=0;continue}
    let c=LUT[o*64+LS[p]];
    const r=x<FW-1?OW[p+1]:255,d=y<FH-1?OW[p+FW]:255;
    if((r!==o&&r!==255)||(d!==o&&d!==255))c=(o===me||(r===me&&r!==o)||(d===me&&d!==o))?GOLD:dim(c,.36);
    else if(o===me&&(r===255||d===255))c=GOLD;
    else if(o<N&&((x<FW-1&&FPC[p+1]!==FPC[p]&&FPC[p+1]<N)||(y<FH-1&&FPC[p+FW]!==FPC[p]&&FPC[p+FW]<N)))c=dim(c,.8);
    u32[p]=c;
  }
  mctx.putImageData(img,0,0);
}
function mkSea(w,h,d){
  const W2=Math.round(w*d),H2=Math.round(h*d);
  seaC=document.createElement("canvas");seaC.width=W2;seaC.height=H2;const s=seaC.getContext("2d");
  const g=s.createLinearGradient(0,0,0,H2);g.addColorStop(0,"#10304a");g.addColorStop(1,"#0a1d2c");s.fillStyle=g;s.fillRect(0,0,W2,H2);
  s.strokeStyle="rgba(150,200,240,.08)";s.lineWidth=d;
  for(let lon=-10;lon<=40;lon+=10){const x=(lon+11)/56*W2;s.beginPath();s.moveTo(x,0);s.lineTo(x,H2);s.stroke()}
  for(let lat=40;lat<=70;lat+=10){const y=(71.5-lat)/37.5*H2;s.beginPath();s.moveTo(0,y);s.lineTo(W2,y);s.stroke()}
  const lm=document.createElement("canvas");lm.width=FW;lm.height=FH;const l2=lm.getContext("2d"),id=l2.createImageData(FW,FH),u=new Uint32Array(id.data.buffer);
  for(let p=0;p<FW*FH;p++)if(FPC[p]!==SEA)u[p]=0xFFFFFFFF;
  l2.putImageData(id,0,0);
  const OFF=W2+5000;s.shadowColor="rgba(110,185,235,.5)";s.shadowBlur=16*d;s.shadowOffsetX=OFF;s.drawImage(lm,-OFF,0,W2,H2);
  s.shadowColor="rgba(60,130,190,.35)";s.shadowBlur=34*d;s.drawImage(lm,-OFF,0,W2,H2);
}
function size(){
  const w=cv.parentElement.clientWidth,d=Math.min(2,window.devicePixelRatio||1);DPR=d;cell=w/W;
  tl.width=w*d;tl.height=80*d;tl.style.height="80px";tc.setTransform(d,0,0,d,0,0);
  cv.width=w*d;cv.height=cell*H*d;cv.style.height=cell*H+"px";ctx.setTransform(d,0,0,d,0,0);
  mkSea(w,cell*H,d);drawTL();
}

/* ---------- partie ---------- */
function gen(){
  land=new Uint8Array(M);owner=new Int8Array(M).fill(-1);orig=new Int8Array(M).fill(-1);pop=new Float32Array(M);troops=new Float32Array(M);flash=new Float32Array(M);isCap=new Uint8Array(M);
  for(let i=0;i<M;i++){const c=G.charCodeAt(i)-48;if(c>=0&&c<N){land[i]=1;owner[i]=orig[i]=c;pop[i]=parseInt(PK.substr(i*3,3),36)*1000+15000;troops[i]=pop[i]/U*.3}}
  adj=[];
  for(let i=0;i<M;i++){
    const x=i%W,y=(i/W)|0,a=[];
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
      for(let s=1;s<=4;s++){const nx=x+dx*s,ny=y+dy*s;if(nx<0||ny<0||nx>=W||ny>=H)break;const j=ny*W+nx;if(land[j]){a.push(j);break}}
    }
    adj.push(a);
  }
  ter=Uint8Array.from(TR,c=>c.charCodeAt(0)-48);
  CAP=NAMES.map((n,k)=>{
    let best=-1,bd=1e9;const ll=CP[n];
    if(ll){const fx=(ll[0]+11)/56*W,fy=(71.5-ll[1])/37.5*H;for(let i=0;i<M;i++)if(land[i]&&orig[i]===k){const d=(i%W+.5-fx)**2+(((i/W)|0)+.5-fy)**2;if(d<bd){bd=d;best=i}}}
    if(best<0)for(let i=0;i<M;i++)if(land[i]&&orig[i]===k&&(best<0||pop[i]>pop[best]))best=i;
    return best});
  CAP.forEach(c=>{if(c>=0){isCap[c]=1;troops[c]*=TUN.capG}});
  trait=NAMES.map(()=>1-TUN.tr+rnd()*2*TUN.tr);agr=NAMES.map(()=>.6+rnd()*.9);boost=NAMES.map(()=>1);recr=NAMES.map(()=>1);
  fallen=new Array(N).fill(false);occ=new Array(N).fill(null);siege=new Float32Array(N);lastSg=new Int16Array(N).fill(-99);
  al=new Int8Array(N*N);alT=new Int16Array(N*N);leader=-1;rel=new Float32Array(N*N).map(()=>(rnd()-.5)*16);cdUntil=new Int32Array(N);cdGift=new Int32Array(N).fill(-99);tgt=new Array(N).fill(null);tradeDone=new Array(N).fill(false);hist=[];dist=new Int16Array(M);alive=new Array(N).fill(true);arrows=[];
  tick=0;quiet=0;done=false;me=-1;decOn=false;meLost=false;dirty=true;
  $("log").innerHTML="";
  stats();
}
function log(t){const l=$("log");const e=document.createElement("div");e.textContent=t;l.appendChild(e);while(l.children.length>3)l.removeChild(l.firstChild)}
function flashMsg(t,s,k){const e=$("toast");e.innerHTML=t+"<br><small style='font-weight:400'>"+s+"</small>";e.style.borderColor=col(k,60);e.classList.add("on");clearTimeout(toast);toast=setTimeout(()=>e.classList.remove("on"),2800);log(s)}
function drawTL(){
  const w=tl.width/DPR,h=80,n=hist.length;
  tc.clearRect(0,0,w,h);if(n<2)return;
  const base=new Float32Array(n);
  for(let k=0;k<N;k++){
    tc.beginPath();
    for(let s=0;s<n;s++){const x=s/(n-1)*w,y=h*(1-base[s]-hist[s][k]);s?tc.lineTo(x,y):tc.moveTo(x,y)}
    for(let s=n-1;s>=0;s--)tc.lineTo(s/(n-1)*w,h*(1-base[s]));
    tc.closePath();tc.fillStyle=col(k,50);tc.fill();
    for(let s=0;s<n;s++)base[s]+=hist[s][k];
  }
}
const deg=k=>{let d=0;for(let m=0;m<N;m++)d+=al[k*N+m]?1:0;return d};
function nbOf(k){const s=new Set();for(let i=0;i<M;i++)if(land[i]&&owner[i]===k)for(const j of adj[i])if(owner[j]!==k)s.add(owner[j]);return[...s]}
function randEvent(){
  const live=[];for(let k=0;k<N;k++)if(alive[k])live.push(k);
  const k=live[(rnd()*live.length)|0],r=rnd();
  if(k===me&&decOn)return;
  if(r<.3){boost[k]=1.35;log(NAMES[k]+" : mobilisation générale")}
  else if(r<.5){boost[k]=.7;log(NAMES[k]+" : crise économique")}
  else if(r<.7){boost[k]=1.3;log(NAMES[k]+" : percée technologique")}
  else if(r<.85){boost[k]=.75;log(NAMES[k]+" : scandale politique")}
  else{
    const fr=[];for(let i=0;i<M;i++)if(land[i]&&owner[i]===k&&!isCap[i]&&adj[i].some(j=>owner[j]!==k))fr.push(i);
    if(fr.length){const i=fr[(rnd()*fr.length)|0],o=adj[i].filter(j=>owner[j]!==k),j=o[(rnd()*o.length)|0];log("Soulèvement en "+NAMES[k]+" : une zone de "+fmt(pop[i])+" passe à "+NAMES[owner[j]]);owner[i]=owner[j];troops[i]=3;flash[i]=1;quiet=0;dirty=true}
  }
}
function form(k,m,d,ty=1){al[k*N+m]=al[m*N+k]=ty;alT[k*N+m]=alT[m*N+k]=d;rel[k*N+m]+=10;rel[m*N+k]+=10;log((ty===1?"Alliance entre ":"Pacte de non-agression entre ")+NAMES[k]+" et "+NAMES[m])}
function diplo(cnt){
  const tot=cnt.reduce((a,b)=>a+b,0);
  for(let k=0;k<N;k++)boost[k]+=(1-boost[k])*.06;
  let b=0;cnt.forEach((n,k)=>{if(n>cnt[b])b=k});
  const nl=cnt[b]/tot>.3?b:-1;
  if(nl!==leader){leader=nl;if(nl>=0){for(let k=0;k<N;k++){al[nl*N+k]=0;al[k*N+nl]=0}flashMsg("Coalition","Tous contre "+NAMES[nl]+" : ses alliés se retournent",nl)}}
  for(let x=0;x<N*N;x++)if(al[x]&&--alT[x]<=0){const a=(x/N)|0,c2=x%N;al[x]=0;al[c2*N+a]=0;if(alive[a]&&alive[c2]&&a<c2)log("L’alliance "+NAMES[a]+"–"+NAMES[c2]+" est rompue")}
  if(quiet>60)al.fill(0);
  else if(tick%6===0){
    const k=(decOn&&me>=0&&alive[me]&&tick%12===0&&rnd()<.6)?me:(rnd()*N)|0;
    if(alive[k]&&k!==leader&&deg(k)<2){
      const nb=nbOf(k).filter(m=>alive[m]&&m!==leader&&!al[k*N+m]&&deg(m)<2);
      if(nb.length&&rnd()<.6){
        const m=nb[(rnd()*nb.length)|0],d=40+((rnd()*80)|0);
        if(decOn&&(k===me||m===me)){
          if(canAsk()){const o=k===me?m:k;
            decide("Proposition d’alliance",NAMES[o]+" vous propose une alliance de "+d+" semaines.",[{l:"Accepter",s:"Plus d’attaques entre vous, et soutien mutuel en défense",f:()=>form(k,m,d)},{l:"Refuser",s:"Vous restez libre de l’attaquer",f:()=>{}}])}
        }else form(k,m,d);
      }
    }
  }
  if(tick%14===0&&rnd()<.5)randEvent();
}
function collapse(ow,w){
  fallen[ow]=true;let lib=0;
  for(let i=0;i<M;i++)if(land[i]&&owner[i]===ow){
    const o=orig[i];
    if(o!==ow&&!fallen[o]&&owner[CAP[o]]===o){owner[i]=o;lib++}else owner[i]=w;
    troops[i]=Math.max(3,troops[i]*.35);flash[i]=1;
  }
  for(let m=0;m<N;m++){al[ow*N+m]=0;al[m*N+ow]=0}
  boost[w]=Math.max(boost[w],1.25);quiet=0;dirty=true;
  flashMsg("Chute de "+CN[ow],NAMES[w]+" prend "+CN[ow]+" : "+NAMES[ow]+" capitule"+(lib?" ("+lib+(lib>1?" zones libérées)":" zone libérée)"):""),w);
}
function step(){
  tick++;
  for(let x=0;x<N*N;x++)rel[x]*=.997;
  for(let i=0;i<M;i++){
    if(!land[i])continue;
    const u=pop[i]/U,lim=u*.9*(isCap[i]?1.6:1);
    if(troops[i]<lim)troops[i]=Math.min(lim,troops[i]+u*.014*RM[ter[i]]*PF[orig[i]]*(isCap[i]?1.8:1)*recr[owner[i]]);
  }
  const sp=new Float64Array(N),sg=new Float64Array(N);
  for(let i=0;i<M;i++)if(land[i]){sp[owner[i]]+=pop[i];sg[owner[i]]+=pop[i]*GP[orig[i]]}
  for(let k=0;k<N;k++)mult[k]=sp[k]?Math.max(.5,Math.min(1.8,Math.pow(sg[k]/sp[k]/3e4,TUN.mx))):1;
  const q=[];dist.fill(-1);
  for(let i=0;i<M;i++)if(land[i]&&adj[i].some(j=>hs(i,j))){dist[i]=0;q.push(i)}
  for(let h=0;h<q.length;h++){const i=q[h];for(const j of adj[i])if(land[j]&&dist[j]<0&&owner[j]===owner[i]){dist[j]=dist[i]+1;q.push(j)}}
  for(let i=0;i<M;i++){
    if(!land[i]||dist[i]<=0||troops[i]<2)continue;
    let b=-1,bd=dist[i];
    for(const j of adj[i])if(owner[j]===owner[i]&&dist[j]>=0&&dist[j]<bd){bd=dist[j];b=j}
    if(b>=0){const m=troops[i]*.4;troops[i]-=m;troops[b]+=m}
  }
  const c=[];
  for(let i=0;i<M;i++)if(land[i]&&troops[i]>(quiet>60?2:5)&&adj[i].some(j=>hs(i,j)))c.push(i);
  for(let k=0;k<Math.ceil(M/TUN.att)*(quiet>60?2:1)&&c.length;k++){
    const i=c.splice((rnd()*c.length)|0,1)[0],oi=owner[i];
    const en=adj[i].filter(j=>hs(i,j));
    if(!en.length)continue;
    if(rnd()>agr[oi]*(oi===me?STG[stance]:1)/1.5)continue;
    en.sort((a,b)=>troops[a]-troops[b]);
    const cj=en.find(x=>isCap[x]&&!fallen[orig[x]]&&owner[x]===orig[x]);
    let j=(cj!==undefined&&rnd()<TUN.capT)?cj:(rnd()<.6?en[0]:en[(rnd()*en.length)|0]);
    const tg=tgt[oi];if(tg&&tick<tg.until){const c2=en.filter(x=>owner[x]===tg.t);if(c2.length&&rnd()<.8)j=c2[(rnd()*c2.length)|0]}
    const sea=Math.abs(i%W-j%W)+Math.abs(((i/W)|0)-((j/W)|0))>1;
    const sent=sea?Math.min(troops[i]*.65,pop[i]/U*TUN.seaCap):troops[i]*.65,A=sent*pwA(oi)*(ter[j]===0?1.1:1)*(sea?.65:1)*(owner[j]===leader&&oi!==leader?1.25:1)*(.6+rnd()*.8);
    let sup=0;for(const m of adj[j])if(owner[m]!==owner[j]&&al[owner[m]*N+owner[j]]===1){const t=troops[m]*.25;sup+=t;troops[m]-=t*.4}
    const D=(troops[j]+sup)*(1+.5*Math.log(1+pop[j]/U/50))*pwD(owner[j])*(NU[owner[j]]&&owner[j]===orig[j]?TUN.nuc:1)*(isCap[j]?TUN.capD:1)*(ter[j]&1?1.5:1)*(ter[j]&2?1.25:1)*(.6+rnd()*.8);
    troops[i]-=sent;flash[j]=1;if(arrows.length<260)arrows.push({a:i,b:j,k:oi,t:0,w:A>D});
    if(A>D){
      const ow=owner[j],pp=pop[j];
      troops[j]=Math.max(3,(A-D)*.8);owner[j]=oi;quiet=0;dirty=true;rel[ow*N+oi]=Math.max(-100,rel[ow*N+oi]-10);
      if(isCap[j]&&ow===orig[j]&&!fallen[ow]){if(TUN.occ>0){occ[ow]={t:tick};dirty=true;flashMsg("Capitale occupée",NAMES[oi]+" occupe "+CN[ow]+" : "+NAMES[ow]+" a "+TUN.occ+" semaines pour la reprendre",oi)}else collapse(ow,oi)}
      else if(pp>1.2e6)log(NAMES[oi]+" prend "+fmt(pp)+" d’habitants à "+NAMES[ow]);
    }else{troops[j]=Math.max(0,troops[j]-A*.6)}
  }
  for(let k=0;k<N;k++){
    siege[k]=0;
    if(!alive[k]||fallen[k])continue;
    const cc=CAP[k];if(cc<0||owner[cc]!==k)continue;
    let e=0,by=-1,bt=0;
    for(const j of adj[cc])if(hs(cc,j)){e+=troops[j];if(troops[j]>bt){bt=troops[j];by=owner[j]}}
    const r=e/Math.max(1,troops[cc]);siege[k]=r;
    if(r>.8&&by>=0&&tick-lastSg[k]>40){
      lastSg[k]=tick;
      if(k===me||r>1.3)log("⚔ Siège de "+CN[k]+" : "+NAMES[by]+" menace "+NAMES[k]);
      if(k===me&&decOn&&tick-lastSgDec>30&&!modals&&performance.now()-lastAsk>6000){lastSgDec=tick;dSiege(by)}
    }
  }
  const cnt=new Array(N).fill(0);
  for(let i=0;i<M;i++)if(land[i])cnt[owner[i]]++;
  cnt.forEach((n,k)=>{if(n===0&&alive[k]){alive[k]=false;if(!fallen[k])flashMsg("Pays éliminé",NAMES[k]+" est éliminé(e)",k)}});
  for(let k=0;k<N;k++)if(occ[k]){
    const cc=CAP[k];
    if(!alive[k]){occ[k]=null;continue}
    if(owner[cc]===k){occ[k]=null;dirty=true;flashMsg("Capitale reprise",NAMES[k]+" reprend "+CN[k]+" !",k)}
    else{boost[k]=Math.min(boost[k],.5);if(tick-occ[k].t>=TUN.occ){occ[k]=null;collapse(k,owner[cc])}}
  }
  quiet++;diplo(cnt);if(quiet===61)flashMsg("Guerre totale","Toutes les alliances sont rompues",0);
  if(decOn&&me>=0&&alive[me]&&tick>=nextDec&&canAsk()){
    const fs=[dEcon,dTech,dBorder,dRevolt,dUlt].sort(()=>rnd()-.5);
    for(const f of fs)if(f())break;
    nextDec=tick+20+((rnd()*20)|0);
  }
  const left=alive.filter(Boolean).length;
  if(me>=0&&!alive[me]&&!meLost&&left>1){meLost=true;showEnd("fall")}
  if(left===1||tick>3000){
    done=true;const t=stats();let b=0;t.forEach((v,k)=>{if(v.p>t[b].p)b=k});
    showEnd(left===1?(b===me?"win":"master"):"time",b);meLost=true;
  }
  if(tick%3===0)stats();
}

/* ---------- décisions du joueur ---------- */
function decide(title,text,opts){
  if($("m-dec").classList.contains("on"))return;
  lastAsk=performance.now();askJ=Math.random()*8000;
  $("dc-t").textContent=title;$("dc-x").textContent=text;
  const b=$("dc-b");b.innerHTML="";
  opts.forEach(o=>{const e=document.createElement("button");e.className="opt";e.innerHTML="<b>"+o.l+"</b><small>"+o.s+"</small>";e.onclick=()=>{closeM("m-dec");o.f();dirty=true;stats();if($("m-dip").classList.contains("on"))renderDip()};b.appendChild(e)});
  openM("m-dec");
}
function dSiege(by){
  decide("⚔ "+CN[me]+" est menacée",NAMES[by]+" assiège votre capitale avec des forces supérieures.",[
    {l:"Rappeler les troupes",s:"35 % des troupes de vos autres zones rejoignent la capitale (60 % arrivent à temps)",f:()=>{let s=0;for(let i=0;i<M;i++)if(land[i]&&owner[i]===me&&i!==CAP[me]){const t=troops[i]*.35;troops[i]-=t;s+=t}troops[CAP[me]]+=s*.6}},
    {l:"Tenir les lignes",s:"La capitale compte sur sa garnison : +15 % de troupes, vos zones restent intactes",f:()=>{troops[CAP[me]]*=1.15}}]);
}
function dEcon(){decide("Crise économique","Les marchés s’effondrent en "+NAMES[me]+". Comment réagir ?",[
  {l:"Austérité",s:"Votre force baisse de 15 % quelques semaines, puis revient",f:()=>{boost[me]=.85}},
  {l:"Emprunt massif",s:"+30 % de troupes tout de suite, mais force −35 % ensuite",f:()=>{for(let i=0;i<M;i++)if(land[i]&&owner[i]===me)troops[i]*=1.3;boost[me]=.65}}]);return true}
function dTech(){decide("Percée technologique","Vos laboratoires obtiennent une avancée majeure. Où investir ?",[
  {l:"L’armée",s:"Force +30 % pendant quelques semaines",f:()=>{boost[me]=1.3}},
  {l:"L’économie",s:"Recrutement +12 % pour le reste de la partie",f:()=>{recr[me]*=1.12}}]);return true}
function dBorder(){
  const nb=nbOf(me).filter(m=>alive[m]&&!al[me*N+m]&&m!==leader);if(!nb.length)return false;
  const m=nb[(rnd()*nb.length)|0];
  decide("Tension à la frontière",NAMES[m]+" masse des troupes près de vos zones frontalières.",[
    {l:"Pacte de non-agression",s:"Alliance de 40 à 80 semaines avec "+NAMES[m],f:()=>form(me,m,40+((rnd()*40)|0),2)},
    {l:"Renforcer la frontière",s:"+25 % de troupes dans vos zones frontalières",f:()=>{for(let i=0;i<M;i++)if(land[i]&&owner[i]===me&&adj[i].some(j=>hs(i,j)))troops[i]*=1.25}}]);return true}
function dRevolt(){
  const fr=[];for(let i=0;i<M;i++)if(land[i]&&owner[i]===me&&!isCap[i]&&adj[i].some(j=>hs(i,j)))fr.push(i);if(!fr.length)return false;
  const i=fr[(rnd()*fr.length)|0],o=adj[i].filter(j=>hs(i,j)),w=owner[o[(rnd()*o.length)|0]];
  decide("Soulèvement","Une zone de "+fmt(pop[i])+" d’habitants se soulève près de "+NAMES[w]+".",[
    {l:"Réprimer",s:"Vous gardez la zone, mais elle perd la moitié de ses troupes",f:()=>{troops[i]*=.5}},
    {l:"Négocier",s:"Vous cédez la zone à "+NAMES[w]+" : votre force augmente de 15 % un moment",f:()=>{owner[i]=w;troops[i]=3;flash[i]=1;boost[me]=Math.max(boost[me],1.15)}}]);return true}

function dUlt(){
  let best=-1,br=0;
  for(const m of nbOf(me)){if(!alive[m]||al[me*N+m])continue;const r=strength(m)/Math.max(1,strength(me));if(r>br){br=r;best=m}}
  if(best<0||br<1.3)return false;
  const cand=[];for(let i=0;i<M;i++)if(land[i]&&owner[i]===me&&!isCap[i]&&adj[i].some(j=>owner[j]===best))cand.push(i);
  if(!cand.length)return false;
  cand.sort((x,y)=>pop[y]-pop[x]);const i=cand[0];
  decide("Ultimatum",NAMES[best]+" exige une zone de "+fmt(pop[i])+" d’habitants à sa frontière, sous peine de guerre.",[
    {l:"Céder la zone",s:"Pacte de non-agression de 40 semaines et relations améliorées",f:()=>{owner[i]=best;troops[i]=3;flash[i]=1;form(me,best,40,2);rel[best*N+me]+=10}},
    {l:"Refuser",s:NAMES[best]+" se mobilise (force +20 % un moment) et vous en veut",f:()=>{boost[best]=Math.max(boost[best],1.2);rel[best*N+me]-=30}}]);return true}

/* ---------- diplomatie ---------- */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const relLabel=v=>v>50?"amicale":v>15?"cordiale":v>-15?"neutre":v>-50?"froide":"hostile";
function strength(k){let s=0;for(let i=0;i<M;i++)if(land[i]&&owner[i]===k)s+=troops[i];return s*(mult[k]||1)*MPv(k)*trait[k]*boost[k]}
let dpK=-1,dpMsg="";
function openDip(k){if(me<0||!alive[me]||k<0||k===me||!alive[k]||modals)return;dpK=k;dpMsg="";renderDip();openM("m-dip")}
function refuse(k,txt){rel[k*N+me]-=3;cdUntil[k]=tick+6;dpMsg=NAMES[k]+" "+txt+"."}
function renderDip(){
  const k=dpK;if(!alive[k]||!alive[me]){closeM("m-dip");return}
  let z=0,pp=0;for(let i=0;i<M;i++)if(land[i]&&owner[i]===k){z++;pp+=pop[i]}
  const sM=strength(me),sK=strength(k),ratio=sK/Math.max(1,sM),a=al[me*N+k],rl=rel[k*N+me],cd=cdUntil[k]-tick;
  const nm=nbOf(me),nk=nbOf(k),ce=nm.filter(m=>m!==k&&nk.includes(m)&&!al[me*N+m]&&!al[k*N+m]).length;
  $("dp-t").innerHTML=`<i class="sw" style="background:${col(k,56)}"></i>${NAMES[k]}`;
  $("dp-i").textContent=`${z} zones · ${fmt(pp)} d’habitants · capitale ${CN[k]} · force ${ratio.toFixed(1).replace(".",",")}× la vôtre · attitude ${relLabel(rl)} · `+(a===1?"alliés ("+alT[me*N+k]+" sem. restantes)":a===2?"pacte de non-agression ("+alT[me*N+k]+" sem. restantes)":"en conflit");
  const r=$("dp-r");r.textContent=dpMsg;r.classList.toggle("on",!!dpMsg);
  const wait=cd>0?"Refuse de négocier pendant "+cd+" semaines":"";
  const lr=Math.log(sM/Math.max(1,sK));
  const cand=[];for(let i=0;i<M;i++)if(land[i]&&owner[i]===k&&!isCap[i]&&adj[i].some(j=>owner[j]===me))cand.push(i);
  cand.sort((x,y)=>pop[y]-pop[x]);
  const tg=nk.filter(m=>m!==me&&alive[m]&&!al[k*N+m]);
  const L=[
   {l:"Proposer une alliance",s:"Soutien mutuel en défense et plus d’attaques entre vous (60 à 120 semaines)",
    why:wait||(a===1?"Vous êtes déjà alliés":(k===leader||me===leader)?"Impossible face à un pays dominant":deg(k)>=2?NAMES[k]+" a déjà deux alliés":deg(me)>=3?"Vous avez déjà trois alliés":""),
    f:()=>{const p=clamp(.3+rl/120+lr*.15+ce*.15,.03,.9);if(rl<-45||rnd()>p)refuse(k,"refuse l’alliance"+(rl<-45?" : trop de rancune":" : elle n’y trouve pas son intérêt"));else{form(me,k,60+((rnd()*60)|0),1);rel[k*N+me]+=15;dpMsg=NAMES[k]+" accepte l’alliance."}}},
   {l:"Proposer un pacte de non-agression",s:"Plus d’attaques entre vous pendant 40 à 80 semaines, sans soutien en défense",
    why:wait||(a?"Un traité vous lie déjà":""),
    f:()=>{const p=clamp(.55+rl/100+lr*.1,.05,.95);if(rl<-60||rnd()>p)refuse(k,"refuse le pacte");else{form(me,k,40+((rnd()*40)|0),2);rel[k*N+me]+=8;dpMsg=NAMES[k]+" accepte le pacte."}}},
   {l:"Proposer un accord commercial",s:"Recrutement +5 % pour chacun, définitivement",
    why:wait||(tradeDone[k]?"Déjà conclu":rl<-30?"Relations trop mauvaises":""),
    f:()=>{if(rnd()<clamp(.6+rl/120,.05,.95)){tradeDone[k]=true;recr[me]=Math.min(1.3,recr[me]*1.05);recr[k]=Math.min(1.3,recr[k]*1.05);rel[k*N+me]+=8;dpMsg="Accord commercial signé avec "+NAMES[k]+"."}else refuse(k,"refuse l’accord commercial")}},
   {l:"Envoyer une aide économique",s:"Votre force baisse de 10 % un moment, son attitude envers vous s’améliore nettement",
    why:tick-cdGift[k]<20?"Vous venez déjà de l’aider":"",
    f:()=>{cdGift[k]=tick;boost[me]=Math.min(boost[me],.9);boost[k]=Math.max(boost[k],1.1);rel[k*N+me]+=25;dpMsg=NAMES[k]+" apprécie ce geste."}},
   {l:"Lancer un ultimatum",s:cand.length?"Exiger la zone la plus peuplée à votre frontière ("+fmt(pop[cand[0]])+" d’habitants)":"",
    why:wait||(a?"Impossible tant qu’un traité vous lie":!cand.length?"Aucune zone cédable à votre frontière":""),
    f:()=>{if(rnd()<clamp((sM/Math.max(1,sK)-1.1)*.9,0,.9)){const i=cand[0];owner[i]=me;troops[i]=Math.max(3,troops[i]*.5);flash[i]=1;rel[k*N+me]-=25;quiet=0;dpMsg=NAMES[k]+" cède la zone, sous la menace."}else{rel[k*N+me]-=35;boost[k]=Math.max(boost[k],1.1);cdUntil[k]=tick+8;dpMsg=NAMES[k]+" rejette l’ultimatum et se mobilise."}}},
   {l:"Pousser à attaquer un rival",s:"Il concentrera ses assauts sur un de ses voisins pendant 40 semaines",
    why:wait||(!(a||rl>25)?"Il faut être allié ou en très bons termes":!tg.length?"Aucun voisin à attaquer":""),
    f:()=>decide("Quelle cible ?","Contre qui "+NAMES[k]+" doit-il se tourner ?",tg.slice(0,5).map(m=>({l:NAMES[m],s:"Voisin de "+NAMES[k],f:()=>{if(rnd()<clamp(.35+rl/100+(rel[k*N+m]<0?.2:0),.1,.92)){tgt[k]={t:m,until:tick+40};rel[k*N+me]-=3;dpMsg=NAMES[k]+" attaquera "+NAMES[m]+".";log(NAMES[k]+" se retourne contre "+NAMES[m]+" à votre demande")}else refuse(k,"refuse de s’en prendre à "+NAMES[m])}})).concat([{l:"Annuler",s:"",f:()=>{}}]))},
   {l:a===2?"Rompre le pacte":"Rompre l’alliance",s:"Vous pouvez de nouveau l’attaquer, mais votre réputation en souffre",
    why:a?"":"Aucun traité à rompre",
    f:()=>{al[me*N+k]=al[k*N+me]=0;rel[k*N+me]-=a===1?40:25;for(let m=0;m<N;m++)if(m!==me&&m!==k)rel[m*N+me]-=4;dpMsg="Traité rompu avec "+NAMES[k]+".";log("Vous rompez le traité avec "+NAMES[k])}}
  ];
  const b=$("dp-b");b.innerHTML="";
  L.forEach(o=>{const e=document.createElement("button");e.className="opt";e.disabled=!!o.why;e.innerHTML="<b>"+o.l+"</b><small>"+(o.why||o.s)+"</small>";e.onclick=()=>{dpMsg="";o.f();dirty=true;stats();if(alive[k])renderDip()};b.appendChild(e)});
}
$("dp-x").onclick=()=>closeM("m-dip");
cv.addEventListener("click",e=>{
  if(me<0)return;
  const r=cv.getBoundingClientRect(),px=Math.floor((e.clientX-r.left)/r.width*FW),py=Math.floor((e.clientY-r.top)/r.height*FH);
  if(px<0||py<0||px>=FW||py>=FH)return;
  const o=OW[py*FW+px];if(o<N&&o!==me)openDip(o);
});
rows.addEventListener("click",e=>{const r=e.target.closest("[data-k]");if(r)openDip(+r.dataset.k)});
rows.addEventListener("keydown",e=>{if(e.key==="Enter"){const r=e.target.closest("[data-k]");if(r)openDip(+r.dataset.k)}});

/* ---------- fenêtres ---------- */
function openM(id){const e=$(id);if(!e.classList.contains("on")){e.classList.add("on");modals++}const b=e.querySelector("button");if(b)b.focus({preventScroll:true})}
function closeM(id){const e=$(id);if(e.classList.contains("on")){e.classList.remove("on");modals--}}
function buildPick(){
  const t=NAMES.map(()=>({p:0,n:0}));
  for(let i=0;i<M;i++)if(land[i]){t[orig[i]].p+=pop[i];t[orig[i]].n++}
  const sc=NAMES.map((n,k)=>t[k].p/1e6*MP[k]*PF[k]*(NU[k]?1.3:1));
  const rk=NAMES.map((n,k)=>k).sort((a,b)=>sc[b]-sc[a]);
  const tier={};rk.forEach((k,r)=>tier[k]=r<6?["Grande puissance","★★★"]:r<18?["Puissance moyenne","★★"]:["Petit État","★"]);
  $("pk-grid").innerHTML=rk.map(k=>`<button class="pk" data-k="${k}"><i style="background:${col(k,56)}"></i><b>${NAMES[k]}</b><small>${tier[k][1]} ${tier[k][0]}<br>${fmt(t[k].p)} · ${Math.round(GP[k]/1000)} k$/hab. · capitale ${CN[k]}</small></button>`).join("");
  $("pk-grid").querySelectorAll(".pk").forEach(b=>b.onclick=()=>begin(+b.dataset.k));
  $("pk-rnd").onclick=()=>begin((rnd()*N)|0);
  $("pk-obs").onclick=()=>begin(-1);
}
function openPick(){closeM("m-dip");closeM("m-dec");closeM("m-end");openM("m-pick")}
function begin(k){
  closeM("m-pick");closeM("m-end");closeM("m-dec");closeM("m-dip");
  gen();me=k;decOn=k>=0;nextDec=20;lastSgDec=-99;stance=1;lastAsk=performance.now()-10000;askJ=0;
  paused=false;$("pp").textContent="Pause";$("pp").setAttribute("aria-pressed","false");
  stats();
  if(k>=0)flashMsg("Votre pays : "+NAMES[k],"Capitale "+CN[k]+". Si elle tombe, le pays s’effondre.",k);
}
function endBtns(list){const b=$("en-b");b.innerHTML="";list.forEach(([l,f])=>{const e=document.createElement("button");e.className="opt";e.innerHTML="<b>"+l+"</b>";e.onclick=()=>{closeM("m-end");f&&f()};b.appendChild(e)})}
function showEnd(type,w){
  closeM("m-dec");closeM("m-dip");stats();
  const d=wk(tick);let t,x;
  if(type==="win"){t="Victoire";x=NAMES[me]+" est l’unique maître de l’Europe, après "+tick+" semaines ("+d+")."}
  else if(type==="fall"){t=NAMES[me]+" est tombé";x="Votre pays a été rayé de la carte à la semaine "+tick+" ("+d+"). La partie continue sans vous."}
  else if(type==="master"){t=NAMES[w]+" est l’unique maître de l’Europe";x="Fin de partie après "+tick+" semaines ("+d+")."+(me>=0?" Votre pays, "+NAMES[me]+", n’a pas survécu.":"")}
  else{t="Fin de partie";x="Pas de maître unique après "+tick+" semaines : "+NAMES[w]+" est en tête."}
  $("en-t").textContent=t;$("en-x").textContent=x;
  endBtns(type==="fall"?[["Continuer en spectateur"],["Nouvelle partie",openPick]]:[["Nouvelle partie",openPick],["Voir la carte"]]);
  openM("m-end");
}

/* ---------- affichage ---------- */
function stats(){
  const t=NAMES.map(()=>({n:0,p:0,x:0,y:0}));let tot=0;
  for(let i=0;i<M;i++)if(land[i]){const o=t[owner[i]];o.n++;o.p+=pop[i];o.x+=i%W;o.y+=(i/W)|0;tot+=pop[i]}
  {const LT=t.reduce((a,v)=>a+v.n,0)||1;hist.push(Float32Array.from(t,v=>v.n/LT));drawTL()}
  labs=t.map((v,k)=>({k,n:v.n,x:v.x/v.n+.5,y:v.y/v.n+.5})).filter(v=>v.n>=20);
  const o=t.map((v,k)=>k).filter(k=>t[k].n>0).sort((a,b)=>t[b].p-t[a].p),top=o.slice(0,10);
  if(me>=0&&t[me].n>0&&!top.includes(me))top.push(me);
  rows.innerHTML=top.map(k=>`<div class="row${k===me?" me-r":""}"${me>=0&&k!==me&&alive[me]?` data-k="${k}" tabindex="0" role="button" title="Négocier avec ${NAMES[k]}"`:""}><span><b style="color:${col(k,58)}">●</b> ${k===me?"★ ":""}${NAMES[k]}</span><div class="t"><i style="background:${col(k,58)};width:${t[k].p/t[o[0]].p*100}%"></i></div><span>${fmt(t[k].p)} · ${t[k].n} zones</span></div>`).join("");
  $("al").textContent=(()=>{const p=[];for(let a=0;a<N;a++)for(let b=a+1;b<N;b++)if(al[a*N+b])p.push(NAMES[a]+" + "+NAMES[b]+(al[a*N+b]===2?" (pacte)":""));return "Alliances : "+(p.length?p.join(", "):"aucune")+(leader>=0?". Coalition contre "+NAMES[leader]+".":"")})();
  const rk=me>=0&&t[me].n?t.filter(v=>v.p>t[me].p).length+1:0;
  hud.innerHTML=`Semaine ${tick} · ${wk(tick)}<small>${fmt(tot)} d’habitants · ${alive.filter(Boolean).length}/${N} pays en lice${me>=0?" · ★ "+NAMES[me]+" : "+(t[me].n?"rang "+rk+", "+t[me].n+" zones":"éliminé"):""}</small>`;
  const m=$("me");
  if(me<0)m.classList.remove("on");
  else{
    m.classList.add("on");
    const cs=fallen[me]||!t[me].n?"tombée":occ[me]?"occupée ("+Math.max(0,TUN.occ-(tick-occ[me].t))+" sem. pour la reprendre)":siege[me]>.8?"assiégée":"intacte";
    $("me-n").innerHTML=`<i class="sw" style="background:${col(me,56)}"></i><b>${NAMES[me]}</b>`;
    $("me-i").textContent=t[me].n?`Rang ${rk} · ${t[me].n} zones · ${(t[me].p/tot*100).toFixed(1).replace(".",",")} % du continent · capitale ${CN[me]} ${cs}`:"Éliminé";
    document.querySelectorAll("[data-st]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.st===stance));
  }
  return t;
}
function star(x,y,r,fill){
  ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;ctx[i?"lineTo":"moveTo"](x+Math.cos(a)*rr,y+Math.sin(a)*rr)}
  ctx.closePath();ctx.fillStyle=fill;ctx.strokeStyle="rgba(8,14,20,.95)";ctx.lineWidth=1.6;ctx.lineJoin="round";ctx.fill();ctx.stroke();
}
function draw(t){
  const w=W*cell,h=H*cell;
  if(dirty){paint();dirty=false}
  ctx.drawImage(seaC,0,0,w,h);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  ctx.drawImage(mc,0,0,w,h);
  ctx.save();ctx.scale(cell/S,cell/S);ctx.strokeStyle="rgba(150,205,240,.6)";ctx.lineWidth=.7;ctx.lineJoin="round";ctx.stroke(rivPath);ctx.restore();
  for(let i=0;i<M;i++)if(flash[i]>0){
    const x=(i%W+.5)*cell,y=(((i/W)|0)+.5)*cell,r=cell*1.15,g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,"rgba(255,236,170,"+flash[i]*.32+")");g.addColorStop(1,"rgba(255,236,170,0)");ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);flash[i]=Math.max(0,flash[i]-.05);
  }
  ctx.lineCap="round";
  for(let n=arrows.length-1;n>=0;n--){
    const a=arrows[n];if(!paused&&!done&&!modals)a.t+=fdt*speed/700;
    if(a.t>1.5){arrows.splice(n,1);continue}
    const ax=(a.a%W+.5)*cell,ay=(((a.a/W)|0)+.5)*cell,bx=(a.b%W+.5)*cell,by=(((a.b/W)|0)+.5)*cell;
    const p=Math.min(1,a.t),e=1-(1-p)*(1-p),q=Math.max(0,e-.55);
    const hx=ax+(bx-ax)*e,hy=ay+(by-ay)*e,tx=ax+(bx-ax)*q,ty=ay+(by-ay)*q;
    const alp=a.t<1?1:(1.5-a.t)*2,an=Math.atan2(by-ay,bx-ax),hh=cell*(a.w?.7:.45),lw=cell*(a.w?.34:.2);
    ctx.globalAlpha=alp*(a.w?1:.55);
    ctx.strokeStyle="rgba(8,14,20,.7)";ctx.lineWidth=lw+2;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(hx,hy);ctx.stroke();
    ctx.strokeStyle=a.w?`hsl(${HU[a.k]} 95% 80%)`:"#fff";ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(hx,hy);ctx.stroke();
    ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.moveTo(hx+Math.cos(an)*hh*.6,hy+Math.sin(an)*hh*.6);ctx.lineTo(hx+Math.cos(an+2.5)*hh,hy+Math.sin(an+2.5)*hh);ctx.lineTo(hx+Math.cos(an-2.5)*hh,hy+Math.sin(an-2.5)*hh);ctx.fill();
    if(a.w&&a.t>=1){ctx.globalAlpha=alp;ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,(a.t-1)*cell*5+cell*.4,0,6.28);ctx.stroke()}
  }
  ctx.globalAlpha=1;
  for(let k=0;k<N;k++){
    const c=CAP[k];if(c<0)continue;
    const x=(c%W+.5)*cell,y=(((c/W)|0)+.5)*cell,r=Math.max(3.5,cell*.36);
    if(fallen[k]||occ[k]){ctx.strokeStyle="rgba(255,95,95,.95)";ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x-r,y-r);ctx.lineTo(x+r,y+r);ctx.moveTo(x+r,y-r);ctx.lineTo(x-r,y+r);ctx.stroke();continue}
    if(siege[k]>.8){const pr=(Math.sin(t*.008)+1)/2;ctx.strokeStyle="rgba(255,80,80,"+(.95-pr*.6)+")";ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y,r*(1.7+pr*1.8),0,6.28);ctx.stroke()}
    star(x,y,k===me?r*1.5:r,k===me?"#ffd54a":"#fff");
  }
  ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
  for(const l of labs){const s=Math.max(9,Math.min(cell*2.1,cell*Math.sqrt(l.n)*.36));ctx.font=`800 ${s}px "Bricolage Grotesque",sans-serif`;ctx.lineWidth=s/4;ctx.strokeStyle="rgba(8,14,20,.85)";ctx.strokeText(NAMES[l.k],l.x*cell,l.y*cell);ctx.fillStyle="#fff";ctx.fillText(NAMES[l.k],l.x*cell,l.y*cell)}
  if(me>=0&&CAP[me]>=0){const c=CAP[me],s=Math.max(9,cell*.95);ctx.font=`800 ${s}px "Bricolage Grotesque",sans-serif`;ctx.lineWidth=s/4;ctx.strokeStyle="rgba(8,14,20,.9)";ctx.strokeText(CN[me],(c%W+.5)*cell,(((c/W)|0)+.5)*cell-cell*1.1);ctx.fillStyle="#ffd54a";ctx.fillText(CN[me],(c%W+.5)*cell,(((c/W)|0)+.5)*cell-cell*1.1)}
  if(hov>=0){ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=2;ctx.beginPath();ctx.arc((hov%W+.5)*cell,(((hov/W)|0)+.5)*cell,cell*.75,0,6.28);ctx.stroke()}
}
function loop(t){
  const dt=Math.min(100,t-last);last=t;fdt=dt;
  if(!paused&&!done&&!modals){acc+=dt*speed;while(acc>=170&&!modals&&!done){acc-=170;step()}}
  draw(t);requestAnimationFrame(loop);
}
function hover(e){
  const r=cv.getBoundingClientRect(),px=Math.floor((e.clientX-r.left)/r.width*FW),py=Math.floor((e.clientY-r.top)/r.height*FH);
  hov=-1;
  if(px>=0&&py>=0&&px<FW&&py<FH){
    const p=py*FW+px,o=OW[p];
    if(o<N){let b=-1,bw=-1;for(let k=0;k<4;k++){const ci=CI[p*4+k];if(ci>=0&&owner[ci]===o&&CW[p*4+k]>bw){bw=CW[p*4+k];b=ci}}if(b<0)b=CI[p*4];hov=b;hovO=o;hovC=FPC[p]}
    else if(o===N){tip.innerHTML="<b>Hors jeu</b>";tip.style.display="block";tip.style.left=Math.max(4,Math.min(e.clientX-r.left+12,r.width-220))+"px";tip.style.top=Math.max(4,Math.min(e.clientY-r.top+12,r.height-40))+"px";return}
  }
  if(hov<0){tip.style.display="none";return}
  const i=hov,o=hovO,capOf=CAP.indexOf(i);
  tip.innerHTML=`<b>${NAMES[o]}</b>${hovC!==o&&hovC<N?" (ex-"+NAMES[hovC]+")":""}<br>${fmt(pop[i])} d’habitants<br>Force militaire : ${Math.round(troops[i])}<br>Terrain : ${TRN[ter[i]]}<br>PIB/hab. : ${Math.round(GP[orig[i]]/1000)} k$`+(capOf>=0?`<br>★ Capitale : ${CN[capOf]}${fallen[capOf]?" (tombée)":""}`:"")+(me>=0&&alive[me]&&o!==me?"<br><b>Clic : négocier</b>":"");
  tip.style.display="block";tip.style.left=Math.max(4,Math.min(e.clientX-r.left+12,r.width-220))+"px";tip.style.top=Math.max(4,Math.min(e.clientY-r.top+12,r.height-110))+"px";
}
let hovC=-1;
cv.addEventListener("pointermove",hover);cv.addEventListener("pointerdown",hover);
cv.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"){hov=-1;tip.style.display="none"}});
$("pp").onclick=e=>{paused=!paused;e.target.setAttribute("aria-pressed",paused);e.target.textContent=paused?"Reprendre":"Pause"};
document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{speed=+b.dataset.s;document.querySelectorAll("[data-s]").forEach(o=>o.setAttribute("aria-pressed",o===b))});
document.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{stance=+b.dataset.st;stats()});
$("nw").onclick=openPick;
addEventListener("resize",size);
gen();prep();size();buildPick();openPick();requestAnimationFrame(loop);
