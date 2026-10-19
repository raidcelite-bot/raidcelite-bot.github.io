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
  return `طلبية جملة - Crown Elite\n\n${lines}\n\nعدد الباكيات: ${t.qty}\n` +
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
  if (validate()) { saveCustomer(); window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`, '_blank'); }
};
$('sendTG').onclick = () => {
  if (!validate()) return;
  saveCustomer();
  const text = encodeURIComponent(buildMessage());
  const target = TELEGRAM_USER ? TELEGRAM_USER : '+' + WHATSAPP;
  window.open(`https://t.me/${target}?text=${text}`, '_blank');
};

// ===== تذكّر بيانات الزبون (تُحفظ في جهازه هو فقط) =====
const KEY = 'ce_customer';
function loadCustomer() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d) { $('fName').value = d.n || ''; $('fPhone').value = d.p || ''; $('fAddr').value = d.a || ''; }
  } catch (e) {}
}
function saveCustomer() {
  try {
    if ($('remember').checked) {
      localStorage.setItem(KEY, JSON.stringify({ n: $('fName').value.trim(), p: $('fPhone').value.trim(), a: $('fAddr').value.trim() }));
    } else localStorage.removeItem(KEY);
  } catch (e) {}
}
loadCustomer();

renderCats(); renderProducts(); renderCart();
