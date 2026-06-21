export function renderReports(reportStockGroups, reportExpenseGroups) {
  const stockSubGroup = document.getElementById('report-stock-sub-group');
  if(stockSubGroup) {
    stockSubGroup.innerHTML = '';
    Object.keys(reportStockGroups).forEach(sub => {
      let sum = reportStockGroups[sub].reduce((acc, c) => acc + (c.total || 0), 0);
      stockSubGroup.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold text-white">📁 ย่อย: ${sub}</span>
            <span class="font-black text-emerald-400">รวม ฿${sum.toLocaleString()}</span>
          </div>
        </div>`;
    });
    if(Object.keys(reportStockGroups).length === 0) stockSubGroup.innerHTML = `<p class="text-sm text-zinc-700 italic">ไม่มีข้อมูลสินทรัพย์</p>`;
  }

  const expenseSubGroup = document.getElementById('report-expense-sub-group');
  if(expenseSubGroup) {
    expenseSubGroup.innerHTML = '';
    Object.keys(reportExpenseGroups).forEach(sub => {
      let sum = reportExpenseGroups[sub].reduce((acc, c) => acc + (c.amount || 0), 0);
      expenseSubGroup.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div class="flex justify-between items-center mb-1">
            <span class="font-bold text-white">📁 ย่อย: ${sub}</span>
            <span class="font-black text-rose-400">รวม ฿${sum.toLocaleString()}</span>
          </div>
        </div>`;
    });
    if(Object.keys(reportExpenseGroups).length === 0) expenseSubGroup.innerHTML = `<p class="text-sm text-zinc-700 italic">ไม่มีข้อมูลรายจ่าย</p>`;
  }
}
