// ฟังก์ชันสลับหน้า
function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + tabName).classList.remove('hidden');
    localStorage.setItem('currentTab', tabName);
}

// ฟังก์ชันล้างข้อมูล (กดแล้วเป็น 0 ทันที)
function resetSystem() {
    if(confirm("ล้างข้อมูลทั้งหมดให้เป็น 0?")) {
        localStorage.clear();
        location.reload();
    }
}

// เริ่มต้นโหลดหน้า
window.onload = () => {
    const tab = localStorage.getItem('currentTab') || 'dashboard';
    switchTab(tab);
};
