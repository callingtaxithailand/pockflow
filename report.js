let currentAllData = { stock: {}, expense: {}, income: {} };

export function renderReports(reportStockGroups, reportExpenseGroups, reportIncomeGroups) {
  currentAllData.stock = reportStockGroups;
  currentAllData.expense = reportExpenseGroups;
  currentAllData.income = reportIncomeGroups;

  renderGroup('report-income-sub-group', reportIncomeGroups, '#0fb77a', 'INCOME');
  renderGroup('report-expense-sub-group', reportExpenseGroups, '#ff526c', 'EXPENSE');
  renderGroup('report-stock-sub-group', reportStockGroups, '#00b4eb', 'STOCK');

  const backBtn = document.getElementById('btn-back-report-detail');
  if(backBtn) {
    backBtn.onclick = () => {
      document.getElementById('view-report-detail').classList.add('hidden');
      document.getElementById('view-reports').classList.remove('hidden');
    };
  }
}

// ฟังก์ชันเรนเดอร์ประวัติประวัติบันทึกรายการที่ข้างล่างของหน้าแรก (Dashboard)
export function renderRecentTransactions(expenseData) {
  const container = document.getElementById('dash-recent-tx-container');
  const txListContainer = document.getElementById('tx-list-container');
  if (!container) return;

  container.innerHTML = '';
  if (txListContainer) txListContainer.innerHTML = '';

  // ดึงรายการจากหมวดรายจ่ายมาวนลูปโชว์เป็นประวัติ
  Object.keys(expenseData).forEach(subName => {
    expenseData[subName].forEach(item => {
      const htmlContent = `
        <div class="bg-zinc-900/80 border border-zinc-800/80 p-4.5 rounded-2xl flex justify-between items-center">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-zinc-200 font-bold text-[16px]">${item.mainCat || '⚡ สาธารณูปโภค'}</span>
              <span class="bg-zinc-800 text-zinc-400 text-[11px] px-2 py-0.5 rounded font-bold">ย่อย: ${subName}</span>
            </div>
            <p class="text-[12px] text-zinc-500 font-bold mt-1">📅 วันที่: ${item.date}</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="font-black text-[#ff526c] text-[19px]">฿${item.amount.toLocaleString()}</span>
            <span class="text-zinc-600 text-sm cursor-pointer hover:text-rose-400">🗑️</span>
          </div>
        </div>
      `;
      container.innerHTML += htmlContent;
      if (txListContainer) {
        txListContainer.innerHTML += htmlContent;
      }
    });
  });
}

function renderGroup(containerId, dataObj, colorHex, type) {
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';

  Object.keys(dataObj).forEach(subName => {
    let sum = dataObj[subName].reduce((acc, c) => acc + (c.amount || c.total || 0), 0);
    
    const card = document.createElement('div');
    card.className = "bg-zinc-900/90 border border-zinc-800/80 p-4.5 rounded-2xl active:bg-zinc-800 transition-colors cursor-pointer flex justify-between items-center";
    
    // ใช้ EventListener แทน inline onclick เพื่อความปลอดภัยในการรันบนเครื่องมือถือ
    card.addEventListener('click', () => openSubCategoryDetail(subName, type));

    card.innerHTML = `
      <span class="font-bold text-zinc-200 text-[16px]">📂 ย่อย: ${subName}</span>
      <div class="flex items-center space-x-2">
          <span class="font-black text-[16px]" style="color: ${colorHex}">รวม ฿${sum.toLocaleString()}</span>
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
  
  const sumEl = document.getElementById('report-detail-sum');
  sumEl.innerText = `฿${total.toLocaleString(undefined, {minimumFractionDigits:2})}`;
  sumEl.style.color = type==='INCOME'?'#0fb77a':(type==='EXPENSE'?'#ff526c':'#00b4eb');
  
  document.getElementById('report-detail-count').innerText = `${items.length} รายการ`;

  listContainer.innerHTML = '';
  items.forEach(item => {
    listContainer.innerHTML += `
      <div class="bg-zinc-900 border border-zinc-800/60 p-4 rounded-xl flex justify-between items-center">
        <div>
          <p class="text-[16px] font-bold text-white">${item.date}</p>
          <p class="text-[11px] text-zinc-500 font-bold mt-0.5">📂 กลุ่มหลัก: ${item.mainCat || 'ทั่วไป'}</p>
        </div>
        <div class="text-right">
          <p class="text-[18px] font-black" style="color: ${type==='INCOME'?'#0fb77a':(type==='EXPENSE'?'#ff526c':'#white')}">
            ฿${(item.amount || item.total || 0).toLocaleString()}
          </p>
        </div>
      </div>
    `;
  });

  reportsView.classList.add('hidden');
  detailView.classList.remove('hidden');
}
