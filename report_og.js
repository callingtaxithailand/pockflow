export function renderReports(reportStockGroups, reportExpenseGroups, reportIncomeGroups) {
  // 1. รายงานกลุ่มรายรับ
  const incSubGroup = document.getElementById('report-income-sub-group');
  if(incSubGroup) {
    incSubGroup.innerHTML = '';
    Object.keys(reportIncomeGroups).forEach(sub => {
      let sum = reportIncomeGroups[sub].reduce((acc, c) => acc + (c.amount || 0), 0);
      incSubGroup.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div class="flex justify-between items-center">
            <span class="font-bold text-zinc-200">📁 ย่อย: ${sub}</span>
            <span class="font-black text-emerald-400">รวม ฿${sum.toLocaleString()}</span>
          </div>
        </div>`;
    });
    if(Object.keys(reportIncomeGroups).length === 0) incSubGroup.innerHTML = `<p class="text-sm text-zinc-700 italic">ไม่มีข้อมูลรายรับ</p>`;
  }

  // 2. รายงานกลุ่มรายจ่าย
  const expenseSubGroup = document.getElementById('report-expense-sub-group');
  if(expenseSubGroup) {
    expenseSubGroup.innerHTML = '';
    Object.keys(reportExpenseGroups).forEach(sub => {
      let sum = reportExpenseGroups[sub].reduce((acc, c) => acc + (c.amount || 0), 0);
      expenseSubGroup.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div class="flex justify-between items-center">
            <span class="font-bold text-zinc-200">📁 ย่อย: ${sub}</span>
            <span class="font-black text-rose-400">รวม ฿${sum.toLocaleString()}</span>
          </div>
        </div>`;
    });
    if(Object.keys(reportExpenseGroups).length === 0) expenseSubGroup.innerHTML = `<p class="text-sm text-zinc-700 italic">ไม่มีข้อมูลรายจ่าย</p>`;
  }

  // 3. รายงานกลุ่มหุ้น
  const stockSubGroup = document.getElementById('report-stock-sub-group');
  if(stockSubGroup) {
    stockSubGroup.innerHTML = '';
    Object.keys(reportStockGroups).forEach(sub => {
      let sum = reportStockGroups[sub].reduce((acc, c) => acc + (c.total || 0), 0);
      stockSubGroup.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div class="flex justify-between items-center">
            <span class="font-bold text-zinc-200">📁 ย่อย: ${sub}</span>
            <span class="font-black text-cyan-400">รวม ฿${sum.toLocaleString()}</span>
          </div>
        </div>`;
    });
    if(Object.keys(reportStockGroups).length === 0) stockSubGroup.innerHTML = `<p class="text-sm text-zinc-700 italic">ไม่มีข้อมูลสินทรัพย์</p>`;
  }
}
