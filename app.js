// ฟังก์ชันสลับหน้าจอแอปแบบปลอดภัยสูงระดับ Global
export function switchTab(tabName) {
  // 1. ซ่อนหน้าต่าง View ทั้งหมด
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.add('hidden');
  });

  // 2. เปิดหน้าต่างที่กดเลือก
  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // 3. ปรับไฮไลท์สีปุ่มเมนูด้านล่างให้ตรงหน้าปัจจุบัน
  const tabs = ['dashboard', 'reports', 'profile', 'transactions', 'settings'];
  tabs.forEach(t => {
    const btn = document.getElementById(`nav-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.classList.remove('text-zinc-500');
        btn.classList.add('text-amber-500', 'font-black');
      } else {
        btn.classList.remove('text-amber-500', 'font-black');
        btn.classList.add('text-zinc-500');
      }
    }
  });
}

// รวมศุนย์การผูกมัด EventListener แก้ไขปัญหาคลิกไม่ไปบนเบราว์เซอร์มือถือ
export function bindAllAppEvents() {
  const mapping = {
    'nav-dashboard': 'dashboard',
    'nav-reports': 'reports',
    'nav-profile': 'profile',
    'nav-transactions': 'transactions',
    'nav-settings': 'settings'
  };

  // ผูกปุ่มเนวิเกชันบาร์ 5 ปุ่มหลัก
  Object.keys(mapping).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', () => switchTab(mapping[id]));
    }
  });

  // ผูกปุ่มเพิ่มธุรกรรมในหน้าแดชบอร์ด
  const goAddBtn = document.getElementById('btn-go-add-transaction');
  if (goAddBtn) {
    goAddBtn.addEventListener('click', () => switchTab('add-transaction'));
  }
  
  // ผูกปุ่มกดบันทึกธุรกรรม
  const saveTxBtn = document.getElementById('btn-save-tx');
  if (saveTxBtn) {
    saveTxBtn.addEventListener('click', () => {
      alert('บันทึกข้อมูลธุรกรรมสำเร็จ!');
      switchTab('dashboard');
    });
  }
}
