

// ============================================
// نظام متابعة البريد الوارد - الإصدار 3.0.0
// ============================================

// ⚠️ استبدل هذا الرابط برابط API الخاص بك
const API_URL = 'https://script.google.com/macros/s/AKfycbxCDCw9_9LXQ0xwW0avo4bxgppYKOxLiNAHG5iJ64iKMGVVZDycVZ-luysig7oKB6gn/exec';

// ============================================
// دوال التواصل مع API
// ============================================

/**
* استدعاء API
*/
async function callAPI(action, payload = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: action, payload: payload })
        });
       
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'فشل الاتصال بالخادم' };
    }
}

// ============================================
// دوال المصادقة
// ============================================

/**
* تسجيل الدخول
*/
async function login(username, password) {
    const result = await callAPI('login', { username, password });
   
    if (result.success) {
        saveToStorage('user', result.user);
        saveToStorage('isLoggedIn', true);
       
        // تسجيل حركة في السجل
        await callAPI('logAction', {
            user_id: result.user.id,
            username: result.user.username,
            role: result.user.role,
            action: 'تسجيل دخول',
            action_type: 'login'
        });
       
        return { success: true, user: result.user };
    }
   
    return result;
}

/**
* تسجيل الخروج
*/
async function logout() {
    const user = getCurrentUser();
   
    if (user) {
        await callAPI('logAction', {
            user_id: user.id,
            username: user.username,
            role: user.role,
            action: 'تسجيل خروج',
            action_type: 'logout'
        });
    }
   
    clearStorage();
    window.location.href = 'login.html';
}

/**
* التحقق من حالة التفعيل
*/
async function checkActivation() {
    const result = await callAPI('checkActivation');
    return result.isActivated;
}

// ============================================
// دوال البريد
// ============================================

/**
* الحصول على جميع البريد
*/
async function getAllMails() {
    return await callAPI('getAllMails');
}

/**
* الحصول على بريد مكتب محدد
*/
async function getMailsByOffice(officeName) {
    return await callAPI('getMailsByOffice', { officeName });
}

/**
* إضافة بريد جديد
*/
async function addMail(mailData) {
    const user = getCurrentUser();
    mailData.created_by = user.id;
    return await callAPI('addMail', mailData);
}

/**
* تحديث حالة البريد
*/
async function updateMailStatus(mailId, status) {
    return await callAPI('updateMailStatus', { mailId, status });
}

// ============================================
// دوال المكاتب
// ============================================

/**
* إضافة مكتب للبريد
*/
async function addOfficeToMail(officeData) {
    return await callAPI('addOfficeToMail', officeData);
}

/**
* تعليم مكتب كمنجز
*/
async function markOfficeDone(mailId, officeId) {
    const user = getCurrentUser();
    return await callAPI('markOfficeDone', { mailId, officeId, userId: user.id });
}

// ============================================
// دوال المستخدمين (للمدير فقط)
// ============================================

/**
* الحصول على جميع المستخدمين
*/
async function getUsers() {
    return await callAPI('getUsers');
}

/**
* إضافة مستخدم جديد
*/
async function addUser(userData) {
    return await callAPI('addUser', userData);
}

// ============================================
// دوال سجل الحركات (للمدير فقط)
// ============================================

/**
* الحصول على سجل الحركات
*/
async function getAuditLogs() {
    return await callAPI('getAuditLogs');
}

// ============================================
// دوال التفعيل (للمدير فقط)
// ============================================

/**
* إضافة كود تفعيل
*/
async function addActivationCode(code, expiresAt) {
    return await callAPI('addActivationCode', { code, expiresAt });
}

// ============================================
// دوال مساعدة للتخزين المحلي
// ============================================

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function clearStorage() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
}

function getCurrentUser() {
    return getFromStorage('user');
}

function isLoggedIn() {
    return getFromStorage('isLoggedIn') === true;
}

function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
   
    if (requiredRole === 'admin') return user.role === 'admin';
    if (requiredRole === 'deputy') return user.role === 'admin' || user.role === 'deputy';
    return true;
}

// ============================================
// دوال التنسيق والعرض
// ============================================

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
}

function daysDiff(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diff = today - date;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge badge-pending">قيد المعالجة</span>',
        'partial': '<span class="badge badge-partial">منجز جزئياً</span>',
        'done': '<span class="badge badge-done">منجز</span>'
    };
    return badges[status] || badges.pending;
}

function getRoleName(role) {
    const roles = {
        'admin': 'مدير النظام',
        'deputy': 'نائب المدير',
        'employee': 'موظف'
    };
    return roles[role] || role;
}

// ============================================
// دوال التحقق من الصلاحيات
// ============================================

function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function redirectIfNotAuthorized(requiredRole) {
    if (!hasRole(requiredRole)) {
        alert('غير مصرح لك بالوصول إلى هذه الصفحة');
        window.location.href = 'login.html';
    }
}

// ============================================
// تهيئة التطبيق
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 نظام متابعة البريد - الإصدار 3.0.0');
   
    // التحقق من تفعيل التطبيق
    const isActivated = await checkActivation();
    if (!isActivated) {
        console.warn('⚠️ التطبيق غير مفعل');
    }
   
    // عرض اسم المستخدم في الصفحات الداخلية
    const user = getCurrentUser();
    if (user) {
        const userElements = document.querySelectorAll('[data-user-name]');
        userElements.forEach(el => {
            el.textContent = user.full_name || user.username;
        });
       
        const roleElements = document.querySelectorAll('[data-user-role]');
        roleElements.forEach(el => {
            el.textContent = getRoleName(user.role);
        });
    }
});