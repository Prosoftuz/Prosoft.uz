/* ===== keep existing observers and tilt, plus new UI behaviors ===== */

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

  /* Sidebar toggle for mobile */
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if(sidebarToggle && sidebar){
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  /* Simple filter logic (client-side) */
  const applyBtn = document.getElementById('applyFilters');
  if(applyBtn){
    applyBtn.addEventListener('click', () => {
      const maxPrice = Number(document.getElementById('priceRange').value || 99999999);
      const cat = document.getElementById('categoryFilter').value;
      document.querySelectorAll('.product').forEach(p => {
        const price = Number(p.dataset.price || 0);
        const category = p.dataset.category || 'all';
        const matchPrice = price <= maxPrice;
        const matchCat = (cat === 'all') || (category === cat);
        if(matchPrice && matchCat) p.style.display = '';
        else p.style.display = 'none';
      });
    });
  }

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

  /* Accessibility: close sidebar on outside click (mobile) */
  document.addEventListener('click', (e)=>{
    if(window.innerWidth <= 1024){
      if(sidebar && sidebarToggle && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)){
        sidebar.classList.add('collapsed');
      }
    }
  });
});
// форматирование больших чисел: 99999999 → "99 999 999"
  function formatSum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  // обновление при движении ползунка
  if (priceRange && priceValue) {
    priceRange.addEventListener("input", () => {
      priceValue.textContent = formatSum(priceRange.value) + " сум";
    });
    // начальное значение
    priceValue.textContent = formatSum(priceRange.value) + " сум";
  }

  // ==== SIMPLE MODAL ====

// === helper: безопасное экранирование текста в HTML ===
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// === главный обработчик клика (вставляй внутрь своего listener или используй как есть) ===
document.addEventListener('click', function (e) {
  const productCard = e.target.closest('.product');
  if (!productCard) return;

  const img = productCard.querySelector('img')?.src || '';
  const title = productCard.querySelector('h3')?.textContent || 'Без названия';
  const price = productCard.querySelector('p')?.textContent || '';
  const rawDesc = productCard.dataset.desc ?? '';

  let finalDescHTML = '';

  if (rawDesc && rawDesc.includes(':')) {
    const parts = rawDesc.split('|').map(p => p.trim()).filter(p => p.length > 0);

    const rows = parts.reduce((acc, item) => {
      const idx = item.indexOf(':');
      if (idx === -1) return acc;

      const rawKey = item.slice(0, idx).trim();
      const rawValue = item.slice(idx + 1).trim();

      const key = escapeHtml(rawKey);
      const value = escapeHtml(rawValue);

      acc.push`(<tr><td>${key}</td><td>${value}</td></tr>)`; // ← ПРАВИЛЬНО!
      return acc;
    }, []);

    if (rows.length) {
      finalDescHTML = `<table class="modal-table">${rows.join('')}</table>`; // ← ПРАВИЛЬНО!
    } else {
      finalDescHTML = `<p>${escapeHtml(rawDesc)}</p>`;
    }
  } else {
    const text = rawDesc && rawDesc.trim().length ? rawDesc.trim() : 'Описание не указано';
    finalDescHTML = `<p>${escapeHtml(text)}</p>`;
  }

  document.getElementById('modalImage').src = img;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalPrice').textContent = price;
  document.getElementById('modalDesc').innerHTML = finalDescHTML;

  openModal();
});

// ==== ОТКРЫТИЕ / ЗАКРЫТИЕ МОДАЛКИ ====
function openModal() {
  document.getElementById("productModal").classList.add("active");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("productModal").classList.remove("active");
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closeModal);

document.addEventListener("click", function (e) {
  const modal = document.getElementById("productModal");
  if (e.target === modal) closeModal();
});

let lastScrollTop = 0; // запоминаем позицию скролла

// ==== ОТКРЫТИЕ МОДАЛКИ ====
function openModal() {
  lastScrollTop = window.scrollY; // где сейчас скролл
  document.getElementById("productModal").classList.add("active");

  // Блокируем скролл
  document.body.classList.add("modal-open");
  document.documentElement.style.overflow = "hidden";
}

// ==== ЗАКРЫТИЕ МОДАЛКИ ====
function closeModal() {
  document.getElementById("productModal").classList.remove("active");

  // Возвращаем скролл
  document.body.classList.remove("modal-open");
  document.documentElement.style.overflow = "hidden";

  window.scrollTo(0, lastScrollTop); // ← ВОССТАНАВЛИВАЕМ!
}

// Крестик
document.getElementById("modalClose").addEventListener("click", closeModal);

// Клик по фону
document.addEventListener("click", function (e) {
  const modal = document.getElementById("productModal");
  if (e.target === modal) closeModal();
});
