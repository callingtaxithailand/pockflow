import { changeMenuTab } from "./app.js";

const defIncomeCats = {
  "💰 รายได้หลัก": ["เงินเดือน", "โบนัส"],
  "🚗 ThaiRide Travel": ["รับส่งสนามบิน", "เช่ารถส่วนบุคคล"],
  "📊 การลงทุน": ["ปันผลหุ้น", "กำไรขายสินทรัพย์"]
};
const defExpenseCats = { 
  "🔧 ซ่อมบำรุง": ["รถยนต์", "มอเตอร์ไซค์"], 
  "⚡ สาธารณูปโภค": ["ค่าไฟฟ้า", "ค่าน้ำประปา"] 
};
const defStockCats = { 
  "🇹🇭 หุ้นไทย (SET)": ["🏦 กลุ่มธนาคาร", "🔋 กลุ่มพลังงาน"], 
  "🇺🇸 หุ้นอเมริกา (US)": ["🤖 กลุ่ม AI & Tech"]
};

let incomeCategories = JSON.parse(localStorage.getItem('pflow_inc_cats')) || defIncomeCats;
let expenseCategories = JSON.parse(localStorage.getItem('pflow_exp_cats')) || defExpenseCats;
let stockCategories = JSON.parse(localStorage.getItem('pflow_stk_cats')) || defStockCats;
let currentMgmtType = 'INCOME';

export function getCategoriesByType(type) {
  if(type === 'INCOME') return incomeCategories;
  if(type === 'EXPENSE') return expenseCategories;
  return stockCategories;
}

export function initCategoryMgmt() {
  document.getElementById('btn-trigger-category-mgmt').addEventListener('click', () => {
    document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
    document.getElementById('view-category-manager').classList.remove('hidden');
    updateMgmtDisplay();
  });

  document.getElementById('btn-back-category-mgmt').addEventListener('click', () => changeMenuTab('settings'));

  ['INCOME', 'EXPENSE', 'STOCK'].forEach(t => {
    document.getElementById(`mtype-${t}`).addEventListener('click', () => switchMgmtType(t));
  });

  document.getElementById('btn-mgmt-add-main').addEventListener('click', addMainCategoryClick);
  document.getElementById('btn-mgmt-add-sub').addEventListener('click', addSubCategoryClick);

  window.deleteMainCat = function(mainName) {
    if(!confirm(`ยืนยันลบหมวดหมู่หลัก "${mainName}" และย่อยทั้งหมด?`)) return;
    const target = currentMgmtType === 'INCOME' ? incomeCategories : (currentMgmtType === 'EXPENSE' ? expenseCategories : stockCategories);
    delete target[mainName];
    saveToStorage();
  };

  window.deleteSubCat = function(mainName, subName) {
    if(!confirm(`ยืนยันลบหมวดหมู่ย่อย "${subName}"?`)) return;
    const target = currentMgmtType === 'INCOME' ? incomeCategories : (currentMgmtType === 'EXPENSE' ? expenseCategories : stockCategories);
    if(target[mainName]) {
      target[mainName] = target[mainName].filter(s => s !== subName);
      saveToStorage();
    }
  };

  setupDropdowns('INCOME');
}

function saveToStorage() {
  localStorage.setItem('pflow_inc_cats', JSON.stringify(incomeCategories));
  localStorage.setItem('pflow_exp_cats', JSON.stringify(expenseCategories));
  localStorage.setItem('pflow_stk_cats', JSON.stringify(stockCategories));
  updateMgmtDisplay();
  setupDropdowns(currentMgmtType);
}

export function setupDropdowns(type) {
  const nMain = document.getElementById('normal-main-cat');
  const nSub = document.getElementById('normal-sub-cat');
  const sMain = document.getElementById('stock-main-cat');
  const sSub = document.getElementById('stock-sub-cat');
  
  const currentCats = getCategoriesByType(type);

  if(type === 'STOCK' && sMain && sSub) {
    sMain.innerHTML = '';
    Object.keys(currentCats).forEach(m => sMain.innerHTML += `<option value="${m}">${m}</option>`);
    sMain.onchange = () => {
      sSub.innerHTML = '';
      if(currentCats[sMain.value]) {
        currentCats[sMain.value].forEach(s => sSub.innerHTML += `<option value="${s}">${s}</option>`);
      }
    };
    if(sMain.value) sMain.onchange();
  } else if(nMain && nSub) {
    nMain.innerHTML = '';
    Object.keys(currentCats).forEach(m => nMain.innerHTML += `<option value="${m}">${m}</option>`);
    nMain.onchange = () => {
      nSub.innerHTML = '';
      if(currentCats[nMain.value]) {
        currentCats[nMain.value].forEach(s => nSub.innerHTML += `<option value="${s}">${s}</option>`);
      }
    };
    if(nMain.value) nMain.onchange();
  }
}

function switchMgmtType(type) {
  currentMgmtType = type;
  ['INCOME', 'EXPENSE', 'STOCK'].forEach(t => {
    const el = document.getElementById(`mtype-${t}`);
    if(t === type) el.className = 'py-2 rounded-lg font-black text-[12px] bg-zinc-800 text-white cursor-pointer';
    else el.className = 'py-2 rounded-lg font-bold text-[12px] text-zinc-500 cursor-pointer';
  });
  updateMgmtDisplay();
}

function updateMgmtDisplay() {
  const selectMain = document.getElementById('mgmt-select-main');
  const treeDisplay = document.getElementById('mgmt-tree-display');
  const targetCats = getCategoriesByType(currentMgmtType);
  
  if(!selectMain || !treeDisplay) return;
  selectMain.innerHTML = ''; treeDisplay.innerHTML = '';

  Object.keys(targetCats).forEach(main => {
    selectMain.innerHTML += `<option value="${main}">${main}</option>`;
    let subItemsHtml = '';
    targetCats[main].forEach(sub => {
      subItemsHtml += `
        <span class="inline-flex items-center bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md mr-1.5 mb-1.5 font-bold">
          ${sub} <button onclick="deleteSubCat('${main}','${sub}')" class="ml-1 text-rose-500 font-black">×</button>
        </span>`;
    });
    
    treeDisplay.innerHTML += `
      <div class="py-3">
        <div class="flex justify-between items-center mb-1">
          <p class="font-black text-white text-[15px]">${main}</p>
          <button onclick="deleteMainCat('${main}')" class="text-xs text-rose-500 font-bold">🗑️ ลบหลัก</button>
        </div>
        <div class="pl-2">${subItemsHtml || '<span class="text-xs text-zinc-600 italic">ไม่มีหมวดหมู่ย่อย</span>'}</div>
      </div>`;
  });
}

function addMainCategoryClick() {
  const input = document.getElementById('mgmt-new-main');
  const name = input.value.trim();
  if(!name) return;
  const target = getCategoriesByType(currentMgmtType);
  if(!target[name]) target[name] = [];
  input.value = '';
  saveToStorage();
}

function addSubCategoryClick() {
  const select = document.getElementById('mgmt-select-main');
  const input = document.getElementById('mgmt-new-sub');
  const mainName = select.value;
  const subName = input.value.trim();
  if(!mainName || !subName) return;
  const target = getCategoriesByType(currentMgmtType);
  if(target[mainName] && !target[mainName].includes(subName)) {
    target[mainName].push(subName);
  }
  input.value = '';
  saveToStorage();
}
