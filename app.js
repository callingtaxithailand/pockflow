import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { initCategoryMgmt, setupDropdowns, getExpenseCategories, getStockCategories } from "./category.js";
import { renderReports } from "./report.js";
import { initProfileModule } from "./profile.js";

// == PWA Binary Service Worker Generator ==
if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE_NAME = 'pflow-v2';
    self.addEventListener('install', (e) => { self.skipWaiting(); });
    self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
    self.addEventListener('fetch', (e) => { e.respondWith(fetch(e.request).catch(() => new Response('Online'))); });
  `;
  const blob = new Blob([swCode], { type: 'application/javascript' });
  navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(err => console.log('SW Error:', err));
}

// == PWA Dynamic Manifest Injector ==
const manifestDetails = {
  name: "PocketFlow Dime Edition", short_name: "PocketFlow", start_url: window.location.href,
  display: "standalone", orientation: "portrait", background_color: "#000000", theme_color: "#000000",
  icons: [
    { src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'><rect width='192' height='192' rx='40' fill='%2318181b'/><text x='50%' y='60%' font-size='90' text-anchor='middle' dominant-baseline='middle'>🪙</text></svg>", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
    { src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'><rect width='512' height='512' rx='110' fill='%2318181b'/><text x='50%' y='60%' font-size='240' text-anchor='middle' dominant-baseline='middle'>🪙</text></svg>", sizes: "512x512", type: "image/svg+xml", purpose: "any" }
  ]
};
const manifestBlob = new Blob([JSON.stringify(manifestDetails)], { type: 'application/json' });
document.getElementById('pwa-manifest').setAttribute('href', URL.createObjectURL(manifestBlob));

// == Firebase Setup ==
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

// Variables State
let currentDataType = 'STOCK';
let currentTradeType = 'BUY';
let allTransactions = [];

document.getElementById('trade-date').value = new Date().toISOString().split('T')[0];

// Tab Switching System
export function changeMenuTab(tabName) {
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
  if(targetNav) { targetNav.classList.remove('text-zinc-500'); targetNav.setAttribute('class', targetNav.getAttribute('class').replace('text-zinc-500', '') + ' text-amber-400'); }
}

// Global Core Processing System
window.deleteItemClick = async function(id, isStock) {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้ถาวร?")) return;
  try {
    await deleteDoc(doc(db, isStock ? "transactions" : "household_expenses", id));
  } catch (e) { console.error(e); }
}

function processAndRender() {
  let netPnL = 0, totalDiv = 0, totalExp = 0, totalTax = 0;
  let stockMap = {};
  let reportStockGroups = {}; let reportExpenseGroups = {};

  const expLogContainer = document.getElementById('expense-trades-log-list');
  const stkLogContainer = document.getElementById('stock-trades-log-list');
  
  if(expLogContainer) expLogContainer.innerHTML = '';
  if(stkLogContainer) stkLogContainer.innerHTML = '';

  const sorted = [...allTransactions].sort((a,b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(item => {
    let subKey = item.subCat || 'ทั่วไป';

    if(item.isStock) {
      if(!stockMap[item.symbol]) stockMap[item.symbol] = { pnl: 0, div: 0, count: 0 };
      if(!reportStockGroups[subKey]) reportStockGroups[subKey] = [];
      reportStockGroups[subKey].push(item);

      let logBadgeColor = 'bg-zinc-800 text-zinc-300';
      if(item.type === 'BUY') { stockMap[item.symbol].pnl -= item.total; netPnL -= item.total; logBadgeColor = 'bg-emerald-950 text-emerald-400'; } 
      else if(item.type === 'SELL') { stockMap[item.symbol].pnl += item.total; netPnL += item.total; logBadgeColor = 'bg-rose-950 text-rose-400'; } 
      else if(item.type === 'DIVIDEND') { 
        stockMap[item.symbol].div += item.total; totalDiv += item.total; logBadgeColor = 'bg-amber-950 text-amber-400';
        if(item.tax) totalTax += item.tax;
      }
      stockMap[item.symbol].count++;

      if(stkLogContainer) {
        stkLogContainer.innerHTML += `
          <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-[16px] font-black text-white">${item.symbol}</span>
                <span class="text-xs px-2 py-0.5 rounded-md font-bold ${logBadgeColor}">${item.type}</span>
              </div>
              <p class="text-xs text-zinc-500 mt-1">${item.date} • ย่อย: ${subKey}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-[17px] font-black text-white">฿${item.total.toLocaleString()}</span>
              <button onclick="deleteItemClick('${item.id}', true)" class="text-rose-500 p-1 text-base cursor-pointer">🗑️</button>
            </div>
          </div>`;
      }
    } else {
      totalExp += item.amount;
      if(!reportExpenseGroups[subKey]) reportExpenseGroups[subKey] = [];
      reportExpenseGroups[subKey].push(item);

      if(expLogContainer) {
        expLogContainer.innerHTML += `
          <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-[16px] font-bold text-zinc-200">${item.category}</span>
                <span class="text-xs px-2 py-0.5 rounded-md font-bold bg-rose-950/40 text-rose-400">รายจ่าย</span>
              </div>
              <p class="text-xs text-zinc-500 mt-1">${item.date}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-[17px] font-black text-rose-400">฿${item.amount.toLocaleString()}</span>
              <button onclick="deleteItemClick('${item.id}', false)" class="text-rose-500 p-1 text-base cursor-pointer">🗑️</button>
            </div>
          </div>`;
      }
    }
  });

  if(document.getElementById('total-pnl-display')) document.getElementById('total-pnl-display').innerText = `฿${netPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if(document.getElementById('total-div-display')) document.getElementById('total-div-display').innerText = `฿${totalDiv.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if(document.getElementById('total-exp-display')) document.getElementById('total-exp-display').innerText = `฿${totalExp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if(document.getElementById('total-tax-display')) document.getElementById('total-tax-display').innerText = `฿${totalTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Render ข้อมูลรายหุ้นบนแดชบอร์ด
  const repList = document.getElementById('stock-report-list');
  if(repList) {
    repList.innerHTML = '';
    Object.keys(stockMap).forEach(sym => {
      const sData = stockMap[sym];
      repList.innerHTML += `
        <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <p class="text-lg font-black text-white">${sym}</p>
            <p class="text-xs text-zinc-400 mt-0.5">รวมทำรายการ ${sData.count} ครั้ง</p>
          </div>
          <div class="text-right">
            <p class="text-base font-black ${sData.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">PnL: ฿${sData.pnl.toLocaleString()}</p>
            <p class="text-xs text-amber-400 font-bold mt-0.5">ปันผล: ฿${sData.div.toLocaleString()}</p>
          </div>
        </div>`;
    });
    if(Object.keys(stockMap).length === 0) repList.innerHTML = `<p class="text-sm text-zinc-700 italic text-center py-4">ไม่มีข้อมูลสรุปรายหุ้น</p>`;
  }

  // ส่งต่อข้อมูลไปแสดงผลที่หน้า Reports Module (ไฟล์ report.js)
  renderReports(reportStockGroups, reportExpenseGroups);
}

// Form Functions & Calculations
function calculateTaxLogic() {
  const amt = parseFloat(document.getElementById('trade-amount').value) || 0;
  const pct = parseFloat(document.getElementById('trade-tax-percent').value) || 0;
  const tax = amt * (pct / 100);
  const net = amt - tax;
  document.getElementById('txt-tax-amount').innerText = `฿${tax.toFixed(2)}`;
  document.getElementById('txt-net-amount').innerText = `฿${net.toFixed(2)}`;
}

function switchDataType(type) {
  currentDataType = type;
  if(type === 'STOCK') {
    document.getElementById('dtype-STOCK').className = 'py-2.5 rounded-lg font-black text-[14px] bg-zinc-800 text-white';
    document.getElementById('dtype-EXPENSE').className = 'py-2.5 rounded-lg font-bold text-[14px] text-zinc-500';
    document.getElementById('box-stock-fields').classList.remove('hidden');
    document.getElementById('box-categories').classList.add('hidden');
    document.getElementById('box-trade-type').classList.remove('hidden');
  } else {
    document.getElementById('dtype-STOCK').className = 'py-2.5 rounded-lg font-bold text-[14px] text-zinc-500';
    document.getElementById('dtype-EXPENSE').className = 'py-2.5 rounded-lg font-black text-[14px] bg-zinc-800 text-white';
    document.getElementById('box-stock-fields').classList.add('hidden');
    document.getElementById('box-categories').classList.remove('hidden');
    document.getElementById('box-trade-type').classList.add('hidden');
  }
  setupDropdowns();
}

function setTradeType(type) {
  currentTradeType = type;
  document.querySelectorAll('#box-trade-type button').forEach(b => b.className = 'py-3 rounded-xl font-bold text-[17px] bg-zinc-900 border border-zinc-800 text-zinc-400');
  document.getElementById(`ttype-${type}`).className = `py-3 rounded-xl text-[17px] font-black bg-zinc-800 text-white`;
}

// Bind Events
document.addEventListener('DOMContentLoaded', () => {
  initCategoryMgmt();
  initProfileModule();

  // Bottom Nav Bind
  ['dashboard', 'reports', 'profile', 'trades', 'settings'].forEach(tab => {
    document.getElementById(`nav-${tab}`).addEventListener('click', () => changeMenuTab(tab));
  });

  // Action Form Navigation
  document.getElementById('btn-trigger-add-form').addEventListener('click', () => {
    document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
    document.getElementById('view-add-trade').classList.remove('hidden');
    switchDataType('STOCK');
  });
  document.getElementById('btn-back-add-trade').addEventListener('click', () => changeMenuTab('dashboard'));

  document.getElementById('dtype-STOCK').addEventListener('click', () => switchDataType('STOCK'));
  document.getElementById('dtype-EXPENSE').addEventListener('click', () => switchDataType('EXPENSE'));

  ['BUY', 'SELL', 'DIVIDEND'].forEach(t => {
    document.getElementById(`ttype-${t}`).addEventListener('click', () => setTradeType(t));
  });

  document.getElementById('trade-amount').addEventListener('input', calculateTaxLogic);
  document.getElementById('trade-tax-percent').addEventListener('change', calculateTaxLogic);

  // Toggle Log view
  document.getElementById('btn-log-EXPENSE').addEventListener('click', () => {
    document.getElementById('btn-log-EXPENSE').className = 'text-xs font-black bg-rose-950 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-lg cursor-pointer';
    document.getElementById('btn-log-STOCK').className = 'text-xs font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer';
    document.getElementById('wrapper-expense-log').classList.remove('hidden');
    document.getElementById('wrapper-stock-log').classList.add('hidden');
  });

  document.getElementById('btn-log-STOCK').addEventListener('click', () => {
    document.getElementById('btn-log-EXPENSE').className = 'text-xs font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer';
    document.getElementById('btn-log-STOCK').className = 'text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg cursor-pointer';
    document.getElementById('wrapper-expense-log').classList.add('hidden');
    document.getElementById('wrapper-stock-log').classList.remove('hidden');
  });

  // Save Record
  document.getElementById('btn-save-trade').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const date = document.getElementById('trade-date').value;
    if(!amount || !date) return;

    if(currentDataType === 'STOCK') {
      const symbol = document.getElementById('trade-symbol').value.trim().toUpperCase() || "UNKNOWN";
      const mCat = document.getElementById('stock-main-cat').value;
      const sCat = document.getElementById('stock-sub-cat').value;
      const pct = parseFloat(document.getElementById('trade-tax-percent').value) || 0;
      const calculatedTax = amount * (pct / 100);

      await addDoc(collection(db, "transactions"), {
        symbol, type: currentTradeType, total: amount, date, isStock: true,
        mainCat: mCat, subCat: sCat || 'ทั่วไป', tax: calculatedTax
      });
    } else {
      const mCat = document.getElementById('exp-main-cat').value; 
      const sCat = document.getElementById('exp-sub-cat').value;
      await addDoc(collection(db, "household_expenses"), {
        category: `${mCat} (${sCat || 'ทั่วไป'})`, mainCat: mCat, subCat: sCat || 'ทั่วไป', amount, date, isStock: false
      });
    }
    
    document.getElementById('trade-amount').value = '';
    document.getElementById('trade-symbol').value = '';
    changeMenuTab('dashboard');
  });

  // Firebase Realtime listeners
  onSnapshot(collection(db, "transactions"), (snap) => {
    allTransactions = allTransactions.filter(t => !t.isStock);
    snap.forEach(d => allTransactions.push({id: d.id, ...d.data()}));
    processAndRender();
  });
  onSnapshot(collection(db, "household_expenses"), (snap) => {
    allTransactions = allTransactions.filter(t => t.isStock);
    snap.forEach(d => allTransactions.push({id: d.id, ...d.data()}));
    processAndRender();
  });

  const savedTab = localStorage.getItem('pflow_active_tab') || 'dashboard';
  changeMenuTab(savedTab === 'add-trade' || savedTab === 'category-manager' ? 'dashboard' : savedTab);
});
