// البريد الإلكتروني الخاص بك كمالك للموقع
const OWNER_EMAIL = "raidcelite@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
    const savedRole = localStorage.getItem("userRole");
    const loginOverlay = document.getElementById("login-overlay");
    const settingsIcon = document.getElementById("admin-settings-icon");

    // التحقق مما إذا كان المستخدم قد سجل دخوله سابقاً في هذا المتصفح
    if (savedRole === "owner") {
        if (loginOverlay) loginOverlay.style.display = "none";
        if (settingsIcon) settingsIcon.style.display = "inline-block";
    } else if (savedRole === "customer") {
        if (loginOverlay) loginOverlay.style.display = "none";
        if (settingsIcon) settingsIcon.style.display = "none";
    }
});

// معالجة النموذج عند إدخال البريد الإلكتروني
document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // تنظيف البريد المدخل وتحويله لحروف صغيرة لمطابقته بأمان
    const inputEmail = document.getElementById("user-email").value.trim().toLowerCase();
    const loginOverlay = document.getElementById("login-overlay");
    const settingsIcon = document.getElementById("admin-settings-icon");

    if (inputEmail === OWNER_EMAIL) {
        // إذا كان البريد هو بريد المالك
        localStorage.setItem("userRole", "owner");
        localStorage.setItem("userEmail", inputEmail);
        alert("مرحباً بك يا مالك الموقع!");
        
        if (loginOverlay) loginOverlay.style.display = "none";
        if (settingsIcon) settingsIcon.style.display = "inline-block";
    } else {
        // أي بريد إلكتروني آخر يعتبر زبوناً
        localStorage.setItem("userRole", "customer");
        localStorage.setItem("userEmail", inputEmail);
        
        if (loginOverlay) loginOverlay.style.display = "none";
        if (settingsIcon) settingsIcon.style.display = "none";
    }
});

// الدخول كزائر بدون إدخال بريد
function continueAsGuest() {
    localStorage.setItem("userRole", "customer");
    const loginOverlay = document.getElementById("login-overlay");
    const settingsIcon = document.getElementById("admin-settings-icon");
    
    if (loginOverlay) loginOverlay.style.display = "none";
    if (settingsIcon) settingsIcon.style.display = "none";
}
