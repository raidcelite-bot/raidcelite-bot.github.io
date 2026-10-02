// ===== إعدادات المتجر (عدّلها هنا فقط) =====
const WHATSAPP = '213660018673';   // رقم واتساب بالصيغة الدولية
const TELEGRAM_USER = '';          // اسم مستخدم تليغرام بدون @ (اتركه فارغاً لاستعمال الرقم)
const DISCOUNT_FROM = 10;          // الخصم عند أكثر من 10 باكيات
const DISCOUNT_RATE = 0.03;        // 3%

// ===== المنتجات =====
// الصور: ترفع مع الملفات مباشرة بنفس الاسم (مثلاً qatifa-1.jpg)
const CATS = [
  { id: 'qatifa', name: 'شوشوات قطيفة', fabric: 'قطيفة' },
  { id: 'satin',  name: 'شوشوات ساتان', fabric: 'ساتان' },
  { id: 'crepe',  name: 'شوشوات كريب',  fabric: 'كريب' }
];
const MODELS = [
  { key: 1, label: 'ملون بسيط', price: 700 },
  { key: 2, label: 'ملون مزين بالعقروش', price: 900 },
  { key: 3, label: 'أسود بسيط', price: 700 },
  { key: 4, label: 'أسود مزين بالعقروش', price: 900 }
];
const PRODUCTS = [];
CATS.forEach(c => {
  const count = c.id === 'crepe' ? 2 : 4;
  MODELS.slice(0, count).forEach(m => PRODUCTS.push({
    id: c.id + '-' + m.key, cat: c.id,
    name: 'شوشوات ' + c.fabric + ' ' + m.label,
    price: m.price, img: c.id + '-' + m.key + '.jpg'
  }));
});

// ===== الحالة =====
const cart = {};   // id -> الكمية
let activeCat = CATS[0].id;
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n) + ' د.ج';

function totals() {
  let qty = 0, sum = 0;
  PRODUCTS.forEach(p => { const q = cart[p.id] || 0; qty += q; sum += q * p.price; });
  const disc = qty > DISCOUNT_FROM ? sum * DISCOUNT_RATE : 0;
  return { qty, sum, disc, total: sum - disc };
}

// ===== العرض =====
function renderCats() {
  $('cats').innerHTML = CATS.map(c =>
    `<button class="cat ${c.id === activeCat ? 'on' : ''}" data-cat="${c.id}">${c.name}</button>`).join('');
}
function renderProducts() {
  $('products').innerHTML = PRODUCTS.filter(p => p.cat === activeCat).map(p => `
    <article class="card">
      <div class="pic" style="background-image:url('${p.img}')"></div>
      <h4>${p.name}</h4>
      <div class="price">${p.price} د.ج / باكي</div>
      <div class="step">
        <button data-add="${p.id}" aria-label="زيادة">+</button>
        <span id="q-${p.id}">${cart[p.id] || 0}</span>
        <button data-sub="${p.id}" aria-label="إنقاص">-</button>
      </div>
    </article>`).join('');
}
function renderCart() {
  const t = totals();
  $('cartTotal').textContent = fmt(t.total);
  $('cartCount').textContent = t.qty;
  $('sumQty').textContent = t.qty;
  $('sumTotal').textContent = fmt(t.total);
  $('discRow').classList.toggle('hidden', t.disc === 0);
  $('sumDisc').textContent = '- ' + fmt(t.disc);
  const lines = PRODUCTS.filter(p => cart[p.id]).map(p => `
    <div class="line">
      <div><b>${p.name}</b><small>${cart[p.id]} × ${p.price} د.ج</small></div>
      <div class="mini">
        <button data-add="${p.id}">+</button><b>${cart[p.id]}</b><button data-sub="${p.id}">-</button>
        <b>${fmt(cart[p.id] * p.price)}</b>
      </div>
    </div>`).join('');
  $('items').innerHTML = lines || '<p class="empty">الفاتورة فارغة، اختر منتجات أولاً.</p>';
  PRODUCTS.forEach(p => { const el = $('q-' + p.id); if (el) el.textContent = cart[p.id] || 0; });
}
function change(id, d) {
  cart[id] = Math.max(0, (cart[id] || 0) + d);
  if (!cart[id]) delete cart[id];
  renderCart();
}

// ===== الأحداث =====
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.cat) { activeCat = t.dataset.cat; renderCats(); renderProducts(); }
  if (t.dataset.add) change(t.dataset.add, 1);
  if (t.dataset.sub) change(t.dataset.sub, -1);
});
$('cartBtn').onclick = () => $('modal').classList.remove('hidden');
$('closeModal').onclick = () => $('modal').classList.add('hidden');
$('modal').onclick = e => { if (e.target.id === 'modal') $('modal').classList.add('hidden'); };

let gpsLink = '';
$('gpsBtn').onclick = () => {
  if (!navigator.geolocation) { $('msg').textContent = 'متصفحك لا يدعم تحديد الموقع.'; return; }
  $('gpsBtn').textContent = '⏳ جارٍ تحديد الموقع...';
  navigator.geolocation.getCurrentPosition(pos => {
    gpsLink = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
    $('gpsBtn').textContent = '✅ تم تحديد موقعك';
  }, () => {
    $('gpsBtn').textContent = '📍 مشاركة موقعي الجغرافي (GPS)';
    $('msg').textContent = 'تعذر تحديد الموقع، اسمح للمتصفح بالوصول إليه.';
  });
};

function buildMessage() {
  const t = totals();
  const lines = PRODUCTS.filter(p => cart[p.id])
    .map(p => `- ${p.name}: ${cart[p.id]} × ${p.price} = ${cart[p.id] * p.price} د.ج`).join('\n');
  return `طلبية جملة - Couture Elite\n\n${lines}\n\nعدد الباكيات: ${t.qty}\n` +
    (t.disc ? `خصم 3%: -${Math.round(t.disc)} د.ج\n` : '') +
    `المجموع النهائي: ${Math.round(t.total)} د.ج\n\n` +
    `الاسم: ${$('fName').value.trim()}\nالهاتف: ${$('fPhone').value.trim()}\n` +
    `العنوان: ${$('fAddr').value.trim()}` + (gpsLink ? `\nالموقع: ${gpsLink}` : '');
}
function validate() {
  if (!totals().qty) { $('msg').textContent = 'اختر منتجاً واحداً على الأقل.'; return false; }
  if (!$('fName').value.trim() || !$('fPhone').value.trim() || !$('fAddr').value.trim()) {
    $('msg').textContent = 'املأ الاسم ورقم الهاتف والعنوان.'; return false;
  }
  $('msg').textContent = ''; return true;
}
$('sendWA').onclick = () => {
  if (validate()) window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`, '_blank');
};
$('sendTG').onclick = () => {
  if (!validate()) return;
  const text = encodeURIComponent(buildMessage());
  const target = TELEGRAM_USER ? TELEGRAM_USER : '+' + WHATSAPP;
  window.open(`https://t.me/${target}?text=${text}`, '_blank');
};

renderCats(); renderProducts(); renderCart();
