export function initCategoryMgmt() {
  setupPreventRefresh();
  updateMgmtDisplay();
  // ... ผูก Event สลับประเภท และเพิ่มหมวดหมู่ตามปกติของพี่ได้เลยครับ ...
}

function setupPreventRefresh() {
  window.addEventListener('beforeunload', (e) => {
    const mainInput = document.getElementById('mgmt-new-main');
    const subInput = document.getElementById('mgmt-new-sub');
    
    const hasMainText = mainInput && mainInput.value.trim().length > 0;
    const hasSubText = subInput && subInput.value.trim().length > 0;

    // ถ้าตรวจเจอตัวหนังสือค้างในกล่องกรอกข้อมูล ฟังก์ชันนี้จะสั่งให้เบราว์เซอร์ดีด Popup แจ้งเตือนขึ้นทันที
    if (hasMainText || hasSubText) {
      e.preventDefault();
      e.returnValue = 'คุณมีข้อมูลที่ยังไม่ได้บันทึก ยืนยันที่จะปิดหน้าต่างนี้หรือไม่?'; 
      return e.returnValue;
    }
  });
}

function updateMgmtDisplay() {
  // โค้ดเรนเดอร์รายชื่อหมวดหมู่ย่อยและหลักตัวเดิมของพี่
}
