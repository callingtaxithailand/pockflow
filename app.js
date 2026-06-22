// ฟังก์ชันสลับหน้า
function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + tabName).classList.remove('hidden');
}

// ฟังก์ชันล้างข้อมูล (เริ่มนับ 1 ใหม่)
function resetData() {
    if(confirm("เริ่มนับ 1 ใหม่? ข้อมูลทั้งหมดจะกลายเป็น 0")) {
        localStorage.clear();
        location.reload();
    }
}
