/* Wait for DOM ready to avoid early queries */
document.addEventListener('DOMContentLoaded', function() {
  const products = document.querySelectorAll('.product');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const delay = entry.target.dataset.delay ? Number(entry.target.dataset.delay) : 0;
        setTimeout(()=> entry.target.classList.add('show'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  products.forEach((p,i)=> {
    p.dataset.delay = i * 90; // faster stagger
    observer.observe(p);
  });

  /* Parallax bg-layers */
  const parallaxLayers = document.querySelectorAll('.section .bg-layer');
  function updateParallax(){
    parallaxLayers.forEach(layer => {
      const rect = layer.parentElement.getBoundingClientRect();
      const offset = rect.top * -0.06; // tweak
      layer.style.transform = `translateY(${offset}px)`;
    });
  }
  window.addEventListener('scroll', updateParallax);
  updateParallax();

  /* Tilt effect (keeps behavior) */
  document.querySelectorAll('.product').forEach(prod => {
    const card = prod.querySelector('.card');
    prod.addEventListener('mousemove', (e) => {
      const rect = prod.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = -dy * 6; const ry = dx * 8;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    prod.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* Tag & sort filters for hits */
  const tagSelect = document.getElementById('tagSelect');
  if(tagSelect){
    tagSelect.addEventListener('change', (e) => {
      const tag = e.target.value;
      document.querySelectorAll('#hitsSlider .product').forEach(p => {
        const tags = (p.dataset.tags||'').split(',');
        if(tag === 'all' || tags.includes(tag)) p.style.display = '';
        else p.style.display = 'none';
      });
    });
  }
  const sortSelect = document.getElementById('sortSelect');
  if(sortSelect){
    sortSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const slider = document.getElementById('hitsSlider');
      const items = Array.from(slider.querySelectorAll('.product'));
      if(val === 'priceAsc' || val === 'priceDesc'){
        items.sort((a,b)=> (Number(a.dataset.price||0) - Number(b.dataset.price||0)));
        if(val === 'priceDesc') items.reverse();
        items.forEach(i=> slider.appendChild(i));
      }
    });
  }

  /* simple autoplay for hits (optional) */
  let autoSlideInterval = null;
  function startAutoSlide(){
    const slider = document.getElementById('hitsSlider');
    if(!slider) return;
    autoSlideInterval = setInterval(()=> {
      slider.scrollBy({ left: 260, behavior: 'smooth' });
      if(slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) slider.scrollTo({ left:0, behavior:'smooth' });
    }, 4200);
  }
  startAutoSlide();
  const hitsSliderEl = document.getElementById('hitsSlider');
  if(hitsSliderEl){
    hitsSliderEl.addEventListener('mouseenter', ()=> clearInterval(autoSlideInterval));
    hitsSliderEl.addEventListener('mouseleave', ()=> startAutoSlide());
  }

  /* optional: counters on icons (example) */
  const cartBtn = document.getElementById('cartBtn');
  let cartCount = 0;
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      cartCount++;
      if(cartBtn) cartBtn.setAttribute('title', `Корзина (${cartCount})`);
      if(cartBtn) { cartBtn.style.boxShadow = '0 8px 20px rgba(10,127,63,0.12)'; setTimeout(()=> cartBtn.style.boxShadow = '', 500); }
    });
  });
  });

// ===============================
//   MODAL WITH GALLERY + INFO RIGHT
// ===============================
// элементы модалки
const modal = document.getElementById("productModal");
const modalImg = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalClose = document.getElementById("modalClose");
// вкладки
const tabDesc = document.getElementById("descTab");
const tabSpecs = document.getElementById("specsTab");
// стрелки галереи
const prevBtn = document.querySelector(".gallery-nav.left");
const nextBtn = document.querySelector(".gallery-nav.right");
// Галерея
let gallery = [];
let galleryIndex = 0;
// ====================
// ОТКРЫТИЕ МОДАЛКИ
// ====================
function openModal(card) {

  // ----- IMAGES -----
  gallery = JSON.parse(card.dataset.images || "[]");
  galleryIndex = 0;
  modalImg.src = gallery[0] || "";


  // ----- TITLE & PRICE -----
  modalTitle.textContent = card.querySelector("h3")?.textContent || "";
  modalPrice.textContent = card.querySelector(".card-price")?.textContent || "";


  // ----- DESCRIPTION -----
  const desc = card.dataset.desc || "Описание отсутствует";
  tabDesc.textContent = desc;


  // ----- SPECS -----
  const specsRaw = card.dataset.specs || "";
  tabSpecs.innerHTML = buildSpecs(specsRaw);


  // ----- OPEN -----
  modal.style.display = "flex";
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}
// ====================
// СПЕЦИФИКАЦИИ
// ====================
function buildSpecs(str) {
  if (!str.includes(":")) return "Нет характеристик";
  const rows = str.split("|").map(line => {
    const [key, val] = line.split(":");
    return `<tr><td>${key.trim()}</td><td>${val.trim()}</td></tr>`;
  }).join("");
  return `<table class="modal-specs-table">${rows}</table>`;
}
// ====================
// ПЕРЕКЛЮЧЕНИЕ КАРТИНОК
// ====================
function showImage() {
    modalImg.style.opacity = 0;
    setTimeout(() => {
        modalImg.src = gallery[galleryIndex];
        modalImg.style.opacity = 1;
        modalImg.style.transform = "scale(1.05)";
        setTimeout(() => modalImg.style.transform = "scale(1)", 150);
    }, 150);
}
prevBtn.addEventListener("click", () => {
  if (!gallery.length) return;
  galleryIndex = (galleryIndex - 1 + gallery.length) % gallery.length;
  showImage();
});
nextBtn.addEventListener("click", () => {
  if (!gallery.length) return;
  galleryIndex = (galleryIndex + 1) % gallery.length;
  showImage();
});
// ====================
// ОТКРЫТИЕ ПО КАРТОЧКЕ
// ====================
document.addEventListener("click", (e) => {
  const card = e.target.closest(".product");
  if (!card) return;

  // НЕ открывать модалку при клике на кнопки навигации/иконки
  if (e.target.closest(".icon-wrap")) return;

  openModal(card);
});
// ====================
// ТАБЫ
// ====================
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("tab-btn")) {
    
    // снимаем active со всех вкладок
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    // показываем содержимое
    const tab = e.target.dataset.tab;
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.getElementById(tab + "Tab").classList.add("active");
  }
});
// ====================
// ЗАКРЫТИЕ
// ====================
function closeModal() {
  modal.style.display = "none";
  modal.classList.remove("active");
  document.body.style.overflow = "";
}
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
// ============ SIDEBAR КНОПКА ==============
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');
const closeSidebar = document.getElementById('closeSidebar');
toggleBtn.addEventListener('click', () => {
  sidebar.classList.add('active');
});
closeSidebar.addEventListener('click', () => {
  sidebar.classList.remove('active');
});