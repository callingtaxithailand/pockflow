// ฟังก์ชันสลับหน้าจอแอปแบบปลอดภัยสูง
export function switchTab(tabName) {
  // 1. ซ่อนหน้าต่าง View ทั้งหมดในระบบ
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.add('hidden');
  });

  // 2. เปิดหน้าต่างที่เลือก
  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // 3. ปรับเปลี่ยนสีและน้ำหนักของปุ่มเมนูบาร์ด้านล่าง
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

// ฟังก์ชันผูกมัด EventListener ป้องกันบราวเซอร์มือถือหา Inline Onclick ไม่เจอ
export function bindNavEvents() {
  const mapping = {
    'nav-dashboard': 'dashboard',
    'nav-reports': 'reports',
    'nav-profile': 'profile',
    'nav-transactions': 'transactions',
    'nav-settings': 'settings'
  };

  Object.keys(mapping).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', () => {
        switchTab(mapping[id]);
      });
    }
  });
}
