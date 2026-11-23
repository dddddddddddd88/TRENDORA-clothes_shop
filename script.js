/* TRENDORA DEMO STORE
   상품·등급 데이터는 이 파일 상단에서 관리합니다.
   사진은 img 폴더의 AI 생성 패션 이미지 파일을 사용합니다.
*/
const PRODUCTS = [
  {id:1,name:"오버핏 데일리 후드",price:39000,stock:24,category:"상의",tag:"BEST",image:"img/product-01.jpg"},
  {id:2,name:"시티 레터링 반팔 티셔츠",price:22000,stock:35,category:"상의",tag:"NEW",image:"img/product-02.jpg"},
  {id:3,name:"와이드 코튼 팬츠",price:45000,stock:18,category:"하의",tag:"",image:"img/product-03.jpg"},
  {id:4,name:"빈티지 워싱 데님",price:52000,stock:15,category:"하의",tag:"HOT",image:"img/product-04.jpg"},
  {id:5,name:"미니멀 레더 블루종",price:89000,stock:9,category:"아우터",tag:"LIMITED",image:"img/product-05.jpg"},
  {id:6,name:"베이직 오버핏 셔츠",price:42000,stock:20,category:"상의",tag:"",image:"img/product-06.jpg"},
  {id:7,name:"모노 크로스백",price:29000,stock:30,category:"잡화",tag:"",image:"img/product-07.jpg"},
  {id:8,name:"클래식 볼캡",price:19000,stock:40,category:"잡화",tag:"NEW",image:"img/product-08.jpg"}
];
const GRADES = [
  {name:"WELCOME",min:0,rate:1},
  {name:"SILVER",min:100000,rate:3},
  {name:"GOLD",min:300000,rate:5},
  {name:"BLACK",min:600000,rate:7}
];
const HERO_IMAGES = [
 "img/hero-01.jpg",
 "img/hero-02.jpg",
 "img/hero-03.jpg",
 "img/hero-04.jpg"
];

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const won = n => `${Number(n).toLocaleString("ko-KR")}원`;
const load = (key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}};
const save = (key,value)=>localStorage.setItem(key,JSON.stringify(value));
let users=load("trendora_users",[]);
let currentUser=load("trendora_current_user",null);
let cart=load("trendora_cart",[]);
let activeCategory="전체";
let slideIndex=0;
let slideTimer;
let selectedProduct=null;

function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2200)}
function getUser(){return users.find(u=>u.email===currentUser)||null}
function updateUser(user){users=users.map(u=>u.email===user.email?user:u);save("trendora_users",users)}
function gradeFor(user){const total=user?.totalSpent||0;return [...GRADES].reverse().find(g=>total>=g.min)||GRADES[0]}
function formatImage(url){return url}
function renderProducts(){
 const keyword=$("#product-search").value.trim().toLowerCase();
 const list=PRODUCTS.filter(p=>(activeCategory==="전체"||p.category===activeCategory)&&p.name.toLowerCase().includes(keyword));
 $("#product-grid").innerHTML=list.length?list.map(p=>`
  <article class="product-card" data-product="${p.id}">
   <div class="product-photo"><img src="${formatImage(p.image)}" alt="${p.name}" loading="lazy" onerror="this.src='${HERO_IMAGES[(p.id-1)%4]}'">
   ${p.tag?`<span class="product-tag">${p.tag}</span>`:""}
   <button class="quick-add" data-quick="${p.id}">QUICK ADD +</button></div>
   <div class="product-info"><h3>${p.name}</h3><div class="product-meta"><span>${won(p.price)}</span><span>♡</span></div><div class="product-category">${p.category}</div></div>
  </article>`).join(""):`<div class="no-results">검색 결과가 없습니다.</div>`;
 $$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.category===activeCategory));
}
function setCategory(category){activeCategory=category;$("#product-search").value="";renderProducts();$("#products").scrollIntoView({behavior:"smooth"})}
function addToCart(id,qty=1){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;const item=cart.find(x=>x.id===id);if(item){if(item.qty+qty>p.stock)return toast("재고 수량을 초과했습니다.");item.qty+=qty}else cart.push({id,qty});save("trendora_cart",cart);renderCart();toast("장바구니에 담았습니다.")}
function changeQty(id,delta){const item=cart.find(x=>x.id===id),p=PRODUCTS.find(x=>x.id===id);if(!item)return;item.qty=Math.max(1,Math.min(p.stock,item.qty+delta));save("trendora_cart",cart);renderCart()}
function removeCart(id){cart=cart.filter(x=>x.id!==id);save("trendora_cart",cart);renderCart()}
function cartTotal(){return cart.reduce((sum,item)=>sum+PRODUCTS.find(p=>p.id===item.id).price*item.qty,0)}
function renderCart(){
 const count=cart.reduce((s,i)=>s+i.qty,0);$("#cart-count").textContent=count;$("#drawer-count").textContent=`(${count})`;$("#cart-total").textContent=won(cartTotal());
 $("#cart-items").innerHTML=cart.length?cart.map(item=>{const p=PRODUCTS.find(x=>x.id===item.id);return `<div class="cart-item"><img src="${p.image}" alt="${p.name}" onerror="this.src='${HERO_IMAGES[0]}'"><div><h4>${p.name}</h4><p>${won(p.price)}</p><div class="qty-control"><button data-qty="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove-btn" data-remove="${p.id}">삭제</button></div>`}).join(""):`<div class="empty-state">장바구니가 비어 있습니다.</div>`;
}
function openPanel(id){$("#overlay").classList.add("show");if(id==="cart-drawer")$("#cart-drawer").classList.add("open");else $("#"+id).classList.add("open")}
function closePanels(){$("#overlay").classList.remove("show");$$(".drawer,.modal").forEach(el=>el.classList.remove("open"))}
function openProduct(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;selectedProduct=p;$("#product-detail").innerHTML=`<div class="detail-layout"><img src="${p.image}" alt="${p.name}" onerror="this.src='${HERO_IMAGES[0]}'"><div class="detail-copy"><p class="eyebrow">TRENDORA SELECT</p><h2>${p.name}</h2><p class="detail-price">${won(p.price)}</p><p class="detail-desc">매일의 스타일에 자연스럽게 어울리는 TRENDORA의 데일리 아이템입니다.<br>여유로운 실루엣과 편안한 착용감을 경험해 보세요.</p><p class="product-category">카테고리 · ${p.category}　/　재고 ${p.stock}개</p><select id="detail-qty" aria-label="수량 선택">${Array.from({length:Math.min(5,p.stock)},(_,i)=>`<option value="${i+1}">${i+1}개</option>`).join("")}</select><button class="primary-btn" id="detail-add">장바구니 담기 <span>→</span></button></div></div>`;openPanel("product-modal")}
function openAuth(){const u=getUser();if(u){openMyPage();return}$("#auth-content").innerHTML=`<h2>WELCOME TO<br>TRENDORA.</h2><p class="sub">로그인하고 나만의 스타일을 시작하세요.</p><form id="login-form"><div class="form-row"><label>이메일</label><input name="email" type="email" required placeholder="example@email.com"></div><div class="form-row"><label>비밀번호</label><input name="password" type="password" required minlength="4" placeholder="비밀번호"></div><button class="primary-btn">로그인</button></form><p class="form-switch">아직 회원이 아니신가요? <button class="text-btn" id="show-signup">회원가입</button></p>`;openPanel("auth-modal")}
function signupView(){$("#auth-content").innerHTML=`<h2>JOIN TRENDORA.</h2><p class="sub">가입 축하 포인트 3,000P를 드려요.</p><form id="signup-form"><div class="form-row"><label>이름</label><input name="name" required maxlength="20" placeholder="이름"></div><div class="form-row"><label>이메일</label><input name="email" type="email" required placeholder="example@email.com"></div><div class="form-row"><label>비밀번호 (4자 이상)</label><input name="password" type="password" required minlength="4" placeholder="비밀번호"></div><button class="primary-btn">3,000P 받고 가입하기</button></form><p class="form-switch">이미 계정이 있으신가요? <button class="text-btn" id="show-login">로그인</button></p>`}
function openMyPage(){const u=getUser();if(!u)return openAuth();const grade=gradeFor(u);$("#mypage-content").innerHTML=`<h2>MY PAGE.</h2><p class="sub">${u.name}님, TRENDORA에 오신 것을 환영합니다.</p><div class="my-stats"><div><span>보유 포인트</span><strong>${(u.points||0).toLocaleString()}P</strong></div><div><span>회원 등급</span><strong>${grade.name}</strong></div></div><p class="grade-list">현재 등급 적립률 <b>${grade.rate}%</b><br>누적 구매액 ${won(u.totalSpent||0)}<br>등급 기준: WELCOME 0원 · SILVER 10만원 · GOLD 30만원 · BLACK 60만원</p><h3 style="font-size:13px;margin-top:28px">ORDER HISTORY</h3>${(u.orders||[]).length?u.orders.slice().reverse().map(o=>`<div class="order-card"><strong>${o.id} · ${o.date}</strong><p>${o.items.map(i=>`${i.name} × ${i.qty}`).join("<br>")}<br>결제 금액 ${won(o.total)} · 적립 ${o.earned}P</p></div>`).join(""):`<p class="sub">아직 주문 내역이 없습니다.</p>`}<button class="primary-btn" id="logout-btn" style="margin-top:20px">로그아웃</button>`;openPanel("mypage-modal")}
function checkout(){if(!cart.length)return toast("장바구니가 비어 있습니다.");if(!getUser()){closePanels();openAuth();return toast("주문하려면 먼저 로그인해 주세요.");}const u=getUser();$("#checkout-content").innerHTML=`<h2>DEMO CHECKOUT.</h2><p class="sub">실제 결제 없이 주문 내역만 저장됩니다.</p><div class="order-card"><strong>주문 상품</strong><p>${cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return `${p.name} × ${i.qty} — ${won(p.price*i.qty)}`}).join("<br>")}</p><strong>총 결제 금액　${won(cartTotal())}</strong></div><div class="form-row"><label>받는 사람</label><input id="receiver" value="${u.name}" required></div><div class="form-row"><label>배송 주소 (체험용)</label><input id="address" placeholder="배송 주소를 입력해 주세요" required></div><button class="primary-btn" id="confirm-order">체험 주문 완료하기 <span>→</span></button>`;openPanel("checkout-modal")}
function completeOrder(){const u=getUser();if(!u)return;const receiver=$("#receiver").value.trim(),address=$("#address").value.trim();if(!receiver||!address)return toast("받는 사람과 주소를 입력해 주세요.");const total=cartTotal(),grade=gradeFor(u),earned=Math.floor(total*grade.rate/100);const order={id:"TR"+Date.now().toString().slice(-8),date:new Date().toLocaleString("ko-KR"),receiver,address,total,earned,items:cart.map(i=>({name:PRODUCTS.find(p=>p.id===i.id).name,qty:i.qty}))};u.orders=u.orders||[];u.orders.push(order);u.totalSpent=(u.totalSpent||0)+total;u.points=(u.points||0)+earned;updateUser(u);cart=[];save("trendora_cart",cart);renderCart();closePanels();toast(`주문 완료! ${earned.toLocaleString()}P 적립되었습니다.`)}
function initSlider(){const slides=$$(".hero-slide");const dots=$("#hero-dots");dots.innerHTML=slides.map((_,i)=>`<button aria-label="${i+1}번 슬라이드" class="${i===0?"active":""}" data-slide="${i}"></button>`).join("");function show(i){slideIndex=i;slides.forEach((s,n)=>s.classList.toggle("active",n===i));$$("button",dots).forEach((d,n)=>d.classList.toggle("active",n===i))}function start(){clearInterval(slideTimer);slideTimer=setInterval(()=>show((slideIndex+1)%slides.length),6000)}dots.addEventListener("click",e=>{const b=e.target.closest("[data-slide]");if(b){show(Number(b.dataset.slide));start()}});start()}
document.addEventListener("click",e=>{
 const cat=e.target.closest("[data-category]");if(cat){e.preventDefault();setCategory(cat.dataset.category)}
 const prod=e.target.closest("[data-product]");if(prod&&!e.target.closest("[data-quick]"))openProduct(Number(prod.dataset.product));
 const quick=e.target.closest("[data-quick]");if(quick){e.stopPropagation();addToCart(Number(quick.dataset.quick))}
 const qty=e.target.closest("[data-qty]");if(qty)changeQty(Number(qty.dataset.qty),Number(qty.dataset.delta));
 const rem=e.target.closest("[data-remove]");if(rem)removeCart(Number(rem.dataset.remove));
 if(e.target.closest("[data-close]"))closePanels();
 if(e.target.id==="overlay")closePanels();
 if(e.target.closest("[data-home]")){e.preventDefault();window.scrollTo({top:0,behavior:"smooth"})}
 if(e.target.id==="cart-btn")openPanel("cart-drawer");
 if(e.target.id==="account-btn")openAuth();
 if(e.target.id==="search-toggle"){ $("#product-search").focus();$("#products").scrollIntoView({behavior:"smooth"})}
 if(e.target.id==="menu-toggle")$(".main-nav").classList.toggle("open");
 if(e.target.id==="show-signup")signupView();
 if(e.target.id==="show-login")openAuth();
 if(e.target.id==="detail-add"){addToCart(selectedProduct.id,Number($("#detail-qty").value));closePanels()}
 if(e.target.id==="checkout-btn")checkout();
 if(e.target.id==="confirm-order")completeOrder();
 if(e.target.id==="logout-btn"){currentUser=null;save("trendora_current_user",null);closePanels();toast("로그아웃되었습니다.")}
});
document.addEventListener("submit",e=>{
 if(e.target.id==="signup-form"){e.preventDefault();const fd=new FormData(e.target),name=fd.get("name").trim(),email=fd.get("email").trim().toLowerCase(),password=fd.get("password");if(users.some(u=>u.email===email))return toast("이미 가입된 이메일입니다.");const user={name,email,password,points:3000,totalSpent:0,orders:[]};users.push(user);save("trendora_users",users);currentUser=email;save("trendora_current_user",email);closePanels();toast("가입 완료! 3,000P가 지급되었습니다.");}
 if(e.target.id==="login-form"){e.preventDefault();const fd=new FormData(e.target),email=fd.get("email").trim().toLowerCase(),password=fd.get("password"),u=users.find(x=>x.email===email&&x.password===password);if(!u)return toast("이메일 또는 비밀번호를 확인해 주세요.");currentUser=email;save("trendora_current_user",email);closePanels();toast(`${u.name}님, 환영합니다!`);}
});
$("#product-search").addEventListener("input",renderProducts);
$("#checkout-btn").addEventListener("click",()=>{});
renderProducts();renderCart();initSlider();
