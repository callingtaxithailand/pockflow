// ตัวแปรภายในเพื่อแคชฐานข้อมูลล่าสุดไว้ใช้ในหน้าตรวจสอบประวัติย่อย
let currentAllData = { stock: {}, expense: {}, income: {} };

export function renderReports(reportStockGroups, reportExpenseGroups, reportIncomeGroups) {
  // สำเนาข้อมูลลงตัวแปรกลางของโมดูล
  currentAllData.stock = reportStockGroups;
  currentAllData.expense = reportExpenseGroups;
  currentAllData.income = reportIncomeGroups;

  // วาดรายการบนหน้าจอรายงานแยกตามประเภทกลุ่มหลัก
  renderGroup('report-income-sub-group', reportIncomeGroups, 'emerald', 'INCOME');
  renderGroup('report-expense-sub-group', reportExpenseGroups, 'rose', 'EXPENSE');
  renderGroup('report-stock-sub-group', reportStockGroups, 'cyan', 'STOCK');

  // ผูกการทำงานให้ปุ่มกดกลับในหน้าดีเทลประวัติย่อย
  const backBtn = document.getElementById('btn-back-report-detail');
  if(backBtn) {
    backBtn.onclick = () => {
      document.getElementById('view-report-detail').classList.add('hidden');
      document.getElementById('view-reports').classList.remove('hidden');
    };
  }
}

function renderGroup(containerId, dataObj, color, type) {
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';

  Object.keys(dataObj).forEach(subName => {
    // คำนวณหายอดรวมทั้งหมดของกลุ่มย่อยนี้เพื่อแสดงผลหน้าแรก
    let sum = dataObj[subName].reduce((acc, c) => acc + (c.amount || c.total || 0), 0);
    
    const card = document.createElement('div');
    card.className = "bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl active:bg-zinc-800 transition-colors cursor-pointer flex justify-between items-center";
    
    // เมื่อเอานิ้วคลิกที่แถบรายการ ให้เรียกเปิดหน้าดูรายละเอียดเจาะลึกทันที
    card.onclick = () => openSubCategoryDetail(subName, type);

    card.innerHTML = `
      <span class="font-bold text-zinc-200 text-sm">📁 ${subName}</span>
      <div class="flex items-center space-x-2">
          <span class="font-black text-${color}-400 text-sm">฿${sum.toLocaleString()}</span>
          <span class="text-zinc-600 text-xs">▶</span>
      </div>`;
    container.appendChild(card);
  });
  
  if(Object.keys(dataObj).length === 0) {
    container.innerHTML = `<p class="text-xs text-zinc-600 italic pl-1">ไม่มีข้อมูลบันทึกในเดือนนี้</p>`;
  }
}

// ฟังก์ชันเปิดหน้าจอเจาะลึกดูประวัติ เรียงตาม วัน เดือน ปี
function openSubCategoryDetail(subName, type) {
  const reportsView = document.getElementById('view-reports');
  const detailView = document.getElementById('view-report-detail');
  const listContainer = document.getElementById('report-detail-list');
  
  if(!reportsView || !detailView || !listContainer) return;

  // ดึงประวัติรายการทั้งหมดที่ผูกกับหมวดหมู่ย่อยกลุ่มนี้
  let items = [];
  if(type === 'INCOME') items = currentAllData.income[subName] || [];
  if(type === 'EXPENSE') items = currentAllData.expense[subName] || [];
  if(type === 'STOCK') items = currentAllData.stock[subName] || [];

  // [핵심 기능] จัดเรียงลำดับวันที่จาก "ใหม่ล่าสุดไปหาเก่าสุด" (วัน/เดือน/ปี)
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  // คำนวณสรุปยอดรวมเฉพาะกิจ
  let total = items.reduce((acc, c) => acc + (c.amount || c.total || 0), 0);
  
  // อัปเดตข้อความหัวเรื่องหน้ารายละเอียดข้อมูล
  document.getElementById('report-detail-title').innerText = subName;
  document.getElementById('report-detail-subtitle').innerText = `ประเภทข้อมูล: ${type}`;
  document.getElementById('report-detail-sum').innerText = `฿${total.toLocaleString(undefined, {minimumFractionDigits:2})}`;
  
  // สลับสีตัวเลขยอดรวมตามประเภทงาน
  const sumEl = document.getElementById('report-detail-sum');
  sumEl.className = `text-2xl font-black ${type==='INCOME'?'text-emerald-400':(type==='EXPENSE'?'text-rose-400':'text-cyan-400')}`;
  document.getElementById('report-detail-count').innerText = `${items.length} รายการ`;

  // ล้างค่าเก่าและทำการเรนเดอร์แถวรายการประวัติตามลำดับวันเวลา
  listContainer.innerHTML = '';
  items.forEach(item => {
    const dateObj = new Date(item.date);
    // ฟอร์แมตวันที่ให้เป็นสไตล์ไทยอ่านง่าย เช่น 21 มิ.ย. 26
    const thaiDate = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    
    listContainer.innerHTML += `
      <div class="bg-zinc-900 border border-zinc-800/60 p-3.5 rounded-xl flex justify-between items-center active:bg-zinc-800/40">
        <div>
          <p class="text-[14px] font-bold text-white">${thaiDate}</p>
          <p class="text-[10px] text-zinc-500 font-bold tracking-wide mt-0.5">📂 กลุ่มหลัก: ${item.mainCat || 'ทั่วไป'}</p>
        </div>
        <div class="text-right">
          <p class="text-[15px] font-black ${type==='INCOME'?'text-emerald-400':(type==='EXPENSE'?'text-rose-400':'text-white')}">
            ฿${(item.amount || item.total || 0).toLocaleString()}
          </p>
          ${item.type ? `<span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">${item.type}</span>` : ''}
        </div>
      </div>
    `;
  });

  // เล่นเอฟเฟกต์สลับหน้าจอซ่อนตัวเก่า เปิดดีเทลย่อย
  reportsView.classList.add('hidden');
  detailView.classList.remove('hidden');
}
