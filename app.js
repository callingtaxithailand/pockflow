import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { initCategoryMgmt, setupDropdowns, getCategoriesByType } from "./category.js";
import { renderReports } from "./report.js";
import { initProfileModule } from "./profile.js";

const firebaseConfig = {
  apiKey: "AIzaSyCybJyauuHOPTtdH-PSM5QsVM25ePyuymE",
  authDomain: "pocketflow-49763.firebaseapp.com",
  projectId: "pocketflow-49763",
  storageBucket: "pocketflow-49763.firebasestorage.app",
  messagingSenderId: "213638502575",
  appId: "1:213638502575:web:6028d33bead869f0405c5a"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

let currentDataType = 'INCOME'; 
let currentTradeType = 'BUY';
let allTransactions = [];
let currentLogTab = 'INCOME';

document.getElementById('trade-date').value = new Date().toISOString().split('T')[0];

export function changeMenuTab(tabName) {
  // บันทึกหน้าปัจจุบันลง LocalStorage ทุกครั้งที่มีการเปลี่ยนแท็บ
  localStorage.setItem('pflow_active_tab', tabName);
  
  document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
  document.getElementById('view-add-trade').classList.add('hidden');
  document.getElementById('view-category-manager').classList.add('hidden');
  
  document.querySelectorAll('#bottom-nav-bar button').forEach(btn => { 
    btn.classList.remove('text-amber-400'); btn.classList.add('text-zinc-500'); 
  });
  
  const targetView = document.getElementById(`view-${tabName}`);
  if(targetView) targetView.classList.remove('hidden');
  const targetNav = document.getElementById(`nav-${tabName}`);
  if(targetNav) { targetNav.classList.remove('text-zinc-500'); targetNav.classList.add('text-amber-400'); }

  if(tabName === 'trades') {
    updateFilterMainDropdown();
    processAndRender();
  }
}

window.deleteItemClick = async function(id, type) {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้ถาวร?")) return;
  try {
    let collName = "pocketflow-income";
    if(type === 'EXPENSE') collName = "household_expenses";
    if(type === 'STOCK') collName = "transactions";
    await deleteDoc(doc(db, collName, id));
  } catch (e) { console.error(e); }
}

function updateFilterMainDropdown() {
  const filterDropdown = document.getElementById('log-filter-main');
  if(!filterDropdown) return;
  const currentVal = filterDropdown.value;
  filterDropdown.innerHTML = '<option value="ALL">ทั้งหมด</option>';
  
  const distinctMains = new Set();
  allTransactions.forEach(item => {
    if(item.originType === currentLogTab && item.mainCat) {
      distinctMains.add(item.mainCat);
    }
  });
  distinctMains.forEach(m => {
    filterDropdown.innerHTML += `<option value="${m}">${m}</option>`;
  });
  filterDropdown.value = distinctMains.has(currentVal) ? currentVal : "ALL";
}

function processAndRender() {
  let netPnL = 0, totalDiv = 0, totalExp = 0, totalTax = 0, totalInc = 0;
  let stockMap = {};
  let reportStockGroups = {}; let reportExpenseGroups = {}; let reportIncomeGroups = {};

  const incLogContainer = document.getElementById('wrapper-income-log');
  const expLogContainer = document.getElementById('wrapper-expense-log');
  const stkLogContainer = document.getElementById('wrapper-stock-log');
  
  if(incLogContainer) incLogContainer.innerHTML = '';
  if(expLogContainer) expLogContainer.innerHTML = '';
  if(stkLogContainer) stkLogContainer.innerHTML = '';

  // Processing Data Loop
  allTransactions.forEach(item => {
    let subKey = item.subCat || 'ทั่วไป';

    if(item.originType === 'STOCK') {
      if(!stockMap[item.symbol]) stockMap[item.symbol] = { pnl: 0, div: 0, count: 0 };
      if(!reportStockGroups[subKey]) reportStockGroups[subKey] = [];
      reportStockGroups[subKey].push(item);

      if(item.type === 'BUY') { stockMap[item.symbol].pnl -= item.total; netPnL -= item.total; } 
      else if(item.type === 'SELL') { stockMap[item.symbol].pnl += item.total; netPnL += item.total; } 
      else if(item.type === 'DIVIDEND') { 
        stockMap[item.symbol].div += item.total; totalDiv += item.total;
        if(item.tax) totalTax += item.tax;
      }
      stockMap[item.symbol].count++;
    } else if(item.originType === 'EXPENSE') {
      totalExp += item.amount;
      if(!reportExpenseGroups[subKey]) reportExpenseGroups[subKey] = [];
      reportExpenseGroups[subKey].push(item);
    } else if(item.originType === 'INCOME') {
      totalInc += item.amount;
      if(!reportIncomeGroups[subKey]) reportIncomeGroups[subKey] = [];
      reportIncomeGroups[subKey].push(item);
    }
  });

  let totalPortfolioNet = netPnL + totalDiv + totalInc - totalExp;

  if(document.getElementById('total-pnl-display')) document.getElementById('total-pnl-display').innerText = `฿${totalPortfolioNet.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  if(document.getElementById('total-inc-display')) document.getElementById('total-inc-display').innerText = `฿${totalInc.toLocaleString()}`;
  if(document.getElementById('total-div-display')) document.getElementById('total-div-display').innerText = `฿${totalDiv.toLocaleString()}`;
  if(document.getElementById('total-exp-display')) document.getElementById('total-exp-display').innerText = `฿${totalExp.toLocaleString()}`;
  if(document.getElementById('total-tax-display')) document.getElementById('total-tax-display').innerText = `฿${totalTax.toLocaleString()}`;

  // Dashboard Stock summaries rendering
  const repList = document.getElementById('stock-report-list');
  if(repList) {
    repList.innerHTML = '';
    Object.keys(stockMap).forEach(sym => {
      const sData = stockMap[sym];
      repList.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
          <div><p class="text-lg font-black text-white">${sym}</p><p class="text-xs text-zinc-400 mt-0.5">รวมทำรายการ ${sData.count} ครั้ง</p></div>
          <div class="text-right">
            <p class="text-base font-black ${sData.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">PnL: ฿${sData.pnl.toLocaleString()}</p>
            <p class="text-xs text-amber-400 font-bold mt-0.5">ปันผล: ฿${sData.div.toLocaleString()}</p>
          </div>
        </div>`;
    });
  }

  // LOG HISTORY RENDER WITH FILTER & SORTING
  const sortBy = document.getElementById('log-sort-by')?.value || 'date-desc';
  const filterMain = document.getElementById('log-filter-main')?.value || 'ALL';

  let filtered = allTransactions.filter(t => t.originType === currentLogTab);
  if(filterMain !== 'ALL') {
    filtered = filtered.filter(t => t.mainCat === filterMain);
  }

  filtered.sort((a, b) => {
    if(sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if(sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if(sortBy === 'main-cat') return (a.mainCat || '').localeCompare(b.mainCat || '');
    if(sortBy === 'sub-cat') return (a.subCat || '').localeCompare(b.subCat || '');
    return 0;
  });

  filtered.forEach(item => {
    if(currentLogTab === 'INCOME' && incLogContainer) {
      incLogContainer.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <div class="flex items-center space-x-2"><span class="text-[16px] font-bold text-white">${item.mainCat}</span><span class="text-xs px-2 py-0.5 rounded-md font-bold bg-emerald-950 text-emerald-400">ย่อย: ${item.subCat}</span></div>
            <p class="text-xs text-zinc-500 mt-1">📅 วันที่: ${item.date}</p>
          </div>
          <div class="flex items-center space-x-2"><span class="text-[17px] font-black text-emerald-400">฿${item.amount.toLocaleString()}</span><button onclick="deleteItemClick('${item.id}', 'INCOME')" class="text-rose-500 p-1 cursor-pointer">🗑️</button></div>
        </div>`;
    } else if(currentLogTab === 'EXPENSE' && expLogContainer) {
      expLogContainer.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <div class="flex items-center space-x-2"><span class="text-[16px] font-bold text-zinc-200">${item.mainCat}</span><span class="text-xs px-2 py-0.5 rounded-md font-bold bg-rose-950 text-rose-400">ย่อย: ${item.subCat}</span></div>
            <p class="text-xs text-zinc-500 mt-1">📅 วันที่: ${item.date}</p>
          </div>
          <div class="flex items-center space-x-2"><span class="text-[17px] font-black text-rose-400">฿${item.amount.toLocaleString()}</span><button onclick="deleteItemClick('${item.id}', 'EXPENSE')" class="text-rose-500 p-1 cursor-pointer">🗑️</button></div>
        </div>`;
    } else if(currentLogTab === 'STOCK' && stkLogContainer) {
      let logBadgeColor = item.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : (item.type === 'SELL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400');
      stkLogContainer.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <div class="flex items-center space-x-2"><span class="text-[16px] font-black text-white">${item.symbol}</span><span class="text-xs px-2 py-0.5 rounded-md font-bold ${logBadgeColor}">${item.type}</span></div>
            <p class="text-xs text-zinc-500 mt-1">📅 วันที่: ${item.date} | หลัก: ${item.mainCat} > ย่อย: ${item.subCat}</p>
          </div>
          <div class="flex items-center space-x-2"><span class="text-[17px] font-black text-white">฿${item.total.toLocaleString()}</span><button onclick="deleteItemClick('${item.id}', 'STOCK')" class="text-rose-500 p-1 cursor-pointer">🗑️</button></div>
        </div>`;
    }
  });

  renderReports(reportStockGroups, reportExpenseGroups, reportIncomeGroups);
}

function switchDataType(type) {
  currentDataType = type;
  const tabs = ['INCOME', 'EXPENSE', 'STOCK'];
  tabs.forEach(t => {
    const el = document.getElementById(`dtype-${t}`);
    if(t === type) { el.className = 'py-2.5 rounded-lg font-black text-[13px] bg-zinc-800 text-white cursor-pointer'; }
    else { el.className = 'py-2.5 rounded-lg font-bold text-[13px] text-zinc-500 cursor-pointer'; }
  });

  if(type === 'STOCK') {
    document.getElementById('box-stock-fields').classList.remove('hidden');
    document.getElementById('box-normal-categories').classList.add('hidden');
    document.getElementById('box-trade-type').classList.remove('hidden');
    document.getElementById('box-tax-section').classList.remove('hidden');
  } else {
    document.getElementById('box-stock-fields').classList.add('hidden');
    document.getElementById('box-normal-categories').classList.remove('hidden');
    document.getElementById('box-trade-type').classList.add('hidden');
    document.getElementById('box-tax-section').classList.add('hidden');
  }
  setupDropdowns(type);
}

function setLogTab(tab) {
  currentLogTab = tab;
  ['INCOME', 'EXPENSE', 'STOCK'].forEach(t => {
    const btn = document.getElementById(`btn-log-${t}`);
    if(t === tab) {
      btn.className = `text-xs font-black px-2.5 py-1.5 rounded-lg cursor-pointer ${t==='INCOME'?'bg-emerald-950 text-emerald-300 border border-emerald-800':(t==='EXPENSE'?'bg-rose-950 text-rose-300 border border-rose-800':'bg-zinc-800 text-white border border-zinc-600')}`;
      document.getElementById(`wrapper-${t.toLowerCase()}-log`).classList.remove('hidden');
    } else {
      btn.className = 'text-xs font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-1.5 rounded-lg cursor-pointer';
      document.getElementById(`wrapper-${t.toLowerCase()}-log`).classList.add('hidden');
    }
  });
  updateFilterMainDropdown();
  processAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
  initCategoryMgmt();
  initProfileModule();

  ['dashboard', 'reports', 'profile', 'trades', 'settings'].forEach(tab => {
    document.getElementById(`nav-${tab}`).addEventListener('click', () => changeMenuTab(tab));
  });

  document.getElementById('btn-trigger-add-form').addEventListener('click', () => {
    document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
    document.getElementById('view-add-trade').classList.remove('hidden');
    switchDataType('INCOME');
  });
  
  document.getElementById('btn-back-add-trade').addEventListener('click', () => changeMenuTab('dashboard'));

  ['INCOME', 'EXPENSE', 'STOCK'].forEach(t => {
    document.getElementById(`dtype-${t}`).addEventListener('click', () => switchDataType(t));
    document.getElementById(`btn-log-${t}`).addEventListener('click', () => setLogTab(t));
  });

  document.getElementById('log-sort-by').addEventListener('change', processAndRender);
  document.getElementById('log-filter-main').addEventListener('change', processAndRender);

  ['BUY', 'SELL', 'DIVIDEND'].forEach(t => {
    document.getElementById(`ttype-${t}`).addEventListener('click', () => {
      currentTradeType = t;
      document.querySelectorAll('#box-trade-type button').forEach(b => b.className = 'py-3 rounded-xl font-bold text-[16px] bg-zinc-900 border border-zinc-800 text-zinc-400');
      document.getElementById(`ttype-${t}`).className = `py-3 rounded-xl text-[16px] font-black bg-zinc-800 text-white`;
    });
  });

  document.getElementById('btn-save-trade').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const date = document.getElementById('trade-date').value;
    if(!amount || !date) return;

    if(currentDataType === 'STOCK') {
      const symbol = document.getElementById('trade-symbol').value.trim().toUpperCase() || "UNKNOWN";
      const mCat = document.getElementById('stock-main-cat').value;
      const sCat = document.getElementById('stock-sub-cat').value;
      const pct = parseFloat(document.getElementById('trade-tax-percent').value) || 0;
      await addDoc(collection(db, "transactions"), {
        symbol, type: currentTradeType, total: amount, date, originType: 'STOCK',
        mainCat: mCat, subCat: sCat || 'ทั่วไป', tax: (amount * (pct/100))
      });
    } else if(currentDataType === 'EXPENSE') {
      const mCat = document.getElementById('normal-main-cat').value;
      const sCat = document.getElementById('normal-sub-cat').value;
      await addDoc(collection(db, "household_expenses"), {
        mainCat: mCat, subCat: sCat || 'ทั่วไป', amount, date, originType: 'EXPENSE'
      });
    } else if(currentDataType === 'INCOME') {
      const mCat = document.getElementById('normal-main-cat').value;
      const sCat = document.getElementById('normal-sub-cat').value;
      await addDoc(collection(db, "pocketflow-income"), {
        mainCat: mCat, subCat: sCat || 'ทั่วไป', amount, date, originType: 'INCOME'
      });
    }
    
    document.getElementById('trade-amount').value = '';
    if(document.getElementById('trade-symbol')) document.getElementById('trade-symbol').value = '';
    changeMenuTab('dashboard');
  });

  // Database Synced Hooking
  onSnapshot(collection(db, "transactions"), (snap) => {
    allTransactions = allTransactions.filter(t => t.originType !== 'STOCK');
    snap.forEach(d => allTransactions.push({id: d.id, ...d.data(), originType: 'STOCK'}));
    processAndRender();
  });
  onSnapshot(collection(db, "household_expenses"), (snap) => {
    allTransactions = allTransactions.filter(t => t.originType !== 'EXPENSE');
    snap.forEach(d => allTransactions.push({id: d.id, ...d.data(), originType: 'EXPENSE'}));
    processAndRender();
  });
  onSnapshot(collection(db, "pocketflow-income"), (snap) => {
    allTransactions = allTransactions.filter(t => t.originType !== 'INCOME');
    snap.forEach(d => allTransactions.push({id: d.id, ...d.data(), originType: 'INCOME'}));
    processAndRender();
  });

  // --- [ส่วนที่แก้ไข] ตรวจสอบและดึงข้อมูลสเตตัสแท็บล่าสุดตอนกด F5 ---
  const savedActiveTab = localStorage.getItem('pflow_active_tab') || 'dashboard';
  changeMenuTab(savedActiveTab);
});
