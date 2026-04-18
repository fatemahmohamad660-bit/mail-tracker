

// ============================================
// نظام متابعة البريد الوارد - الإصدار 3.0.0
// ============================================

// سيتم إضافة عنوان API لاحقاً
const API_URL = '';

// ============================================
// دوال مساعدة
// ============================================

/**
* حفظ البيانات في localStorage
*/
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
* استرجاع البيانات من localStorage
*/
function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

/**
* حذف البيانات من localStorage
*/
function removeFromStorage(key) {
    localStorage.removeItem(key);
}

/**
* التحقق من تسجيل الدخول
*/
function isLoggedIn() {
    return getFromStorage('user') !== null;
}

/**
* الحصول على المستخدم الحالي
*/
function getCurrentUser() {
    return getFromStorage('user');
}

/**
* تسجيل الخروج
*/
function logout() {
    removeFromStorage('user');
    window.location.href = 'login.html';
}

/**
* التحقق من الصلاحيات
*/
function hasPermission(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
   
    if (requiredRole === 'admin') {
        return user.role === 'admin';
    }
    if (requiredRole === 'deputy') {
        return user.role === 'admin' || user.role === 'deputy';
    }
    if (requiredRole === 'employee') {
        return true; // جميع الأدوار يمكنها الوصول
    }
    return false;
}

/**
* تنسيق التاريخ
*/
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

/**
* حساب فرق الأيام
*/
function daysDiff(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diff = today - date;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ============================================
// دوال التواصل مع API (ستفعل لاحقاً)
// ============================================

async function callAPI(action, payload = {}) {
    // سيتم تنفيذها في المرحلة الثالثة
    console.log('API Call:', action, payload);
    return { success: false, message: 'API غير مفعل بعد' };
}

// ============================================
// تهيئة التطبيق
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('نظام متابعة البريد الوارد - جاهز');
   
    // التحقق من الصفحة الحالية
    const currentPage = window.location.pathname.split('/').pop();
   
    // إذا لم تكن صفحة تسجيل الدخول، تحقق من تسجيل الدخول
    if (currentPage !== 'login.html' && !isLoggedIn()) {
        window.location.href = 'login.html';
    }
});