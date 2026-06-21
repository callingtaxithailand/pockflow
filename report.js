let currentAllData = { stock: {}, expense: {}, income: {} };

export function renderReports(reportStockGroups, reportExpenseGroups, reportIncomeGroups) {
  currentAllData.stock = reportStockGroups;
  currentAllData.expense = reportExpenseGroups;
  currentAllData.income = reportIncomeGroups;

  renderGroup('report-income-sub-group', reportIncomeGroups, 'emerald', 'INCOME');
  renderGroup('report-expense-sub-group', reportExpenseGroups, 'rose', 'EXPENSE');
  renderGroup('report-stock-sub-group', reportStockGroups, 'cyan', 'STOCK');

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
    let sum = dataObj[subName].reduce((acc, c) => acc + (c.amount || c.total || 0), 0);
    
    const card = document.createElement('div');
    // เพิ่มขนาดฟอนต์ของหัวข้อและยอดรวมขึ้น 15% ตามสั่งครับ
    card.className = "bg-zinc-900/90 border border-zinc-800/80 p-4.5 rounded-2xl active:bg-zinc-800 transition-colors cursor-pointer flex justify-between items-center";
    card.onclick = () => openSubCategoryDetail(subName, type);

    card.innerHTML = `
      <span class="font-bold text-zinc-200 text-[16px]">📂 ย่อย: ${subName}</span>
      <div class="flex items-center space-x-2">
          <span class="font-black text-${color}-400 text-[16px]">รวม ฿${sum.toLocaleString()}</span>
          <span class="text-zinc-600 text-sm">▶</span>
      </div>`;
    container.appendChild(card);
  });
}

function openSubCategoryDetail(subName, type) {
  const reportsView = document.getElementById('view-reports');
  const detailView = document.getElementById('view-report-detail');
  const listContainer = document.getElementById('report-detail-list');
  
  if(!reportsView || !detailView || !listContainer) return;

  let items = [];
  if(type === 'INCOME') items = currentAllData.income[subName] || [];
  if(type === 'EXPENSE') items = currentAllData.expense[subName] || [];
  if(type === 'STOCK') items = currentAllData.stock[subName] || [];

  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  let total = items.reduce((acc, c) => acc + (c.amount || c.total || 0), 0);
  
  document.getElementById('report-detail-title').innerText = subName;
  document.getElementById('report-detail-subtitle').innerText = `ประเภทข้อมูล: ${type}`;
  
  // ขยายฟอนต์ยอดรวมในหน้าดีเทลขึ้นอีก 15% เป็น text-[32px]
  const sumEl = document.getElementById('report-detail-sum');
  sumEl.innerText = `฿${total.toLocaleString(undefined, {minimumFractionDigits:2})}`;
  sumEl.className = `text-[32px] font-black ${type==='INCOME'?'text-emerald-400':(type==='EXPENSE'?'text-rose-400':'text-cyan-400')}`;
  
  document.getElementById('report-detail-count').innerText = `${items.length} รายการ`;

  listContainer.innerHTML = '';
  items.forEach(item => {
    const dateObj = new Date(item.date);
    const thaiDate = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    
    listContainer.innerHTML += `
      <div class="bg-zinc-900 border border-zinc-800/60 p-4 rounded-xl flex justify-between items-center">
        <div>
          <p class="text-[16px] font-bold text-white">${thaiDate}</p>
          <p class="text-[11px] text-zinc-500 font-bold mt-0.5">📂 กลุ่มหลัก: ${item.mainCat || 'ทั่วไป'}</p>
        </div>
        <div class="text-right">
          <p class="text-[18px] font-black ${type==='INCOME'?'text-emerald-400':(type==='EXPENSE'?'text-rose-400':'text-white')}">
            ฿${(item.amount || item.total || 0).toLocaleString()}
          </p>
        </div>
      </div>
    `;
  });

  reportsView.classList.add('hidden');
  detailView.classList.remove('hidden');
}
