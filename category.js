import { changeMenuTab } from "./app.js";

const defExpenseCats = { 
  "🔧 ซ่อมบำรุง": ["รถยนต์", "มอเตอร์ไซค์"], 
  "⚡ สาธารณูปโภค": ["ค่าไฟฟ้า", "ค่าน้ำประปา", "ค่าส่วนกลาง"] 
};
const defStockCats = { 
  "🇹🇭 หุ้นไทย (SET)": ["🏦 กลุ่มธนาคาร", "🔋 กลุ่มพลังงาน", "🛍️ กลุ่มค้าปลีก"], 
  "🇺🇸 หุ้นอเมริกา (US)": ["🤖 กลุ่ม AI & Tech", "🍏 กลุ่มสินค้าบริโภค"],
  "🪙 คริปโตเคอร์เรนซี": ["₿ Bitcoin", "💎 Altcoins"]
};

let expenseCategories = JSON.parse(localStorage.getItem('pflow_exp_cats')) || defExpenseCats;
let stockCategories = JSON.parse(localStorage.getItem('pflow_stk_cats')) || defStockCats;
let currentMgmtType = 'EXPENSE';

export function getExpenseCategories() { return expenseCategories; }
export function getStockCategories() { return stockCategories; }

export function initCategoryMgmt() {
  document.getElementById('btn-trigger-category-mgmt').addEventListener('click', () => {
    document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
    document.getElementById('view-category-manager').classList.remove('hidden');
    updateMgmtDisplay();
  });

  document.getElementById('btn-back-category-mgmt').addEventListener('click', () => changeMenuTab('settings'));

  document.getElementById('mtype-EXPENSE').addEventListener('click', () => switchMgmtType('EXPENSE'));
  document.getElementById('mtype-STOCK').addEventListener('click', () => switchMgmtType('STOCK'));

  document.getElementById('btn-mgmt-add-main').addEventListener('click', addMainCategoryClick);
  document.getElementById('btn-mgmt-add-sub').addEventListener('click', addSubCategoryClick);

  setupDropdowns();
}

export function setupDropdowns() {
  const eMain = document.getElementById('exp-main-cat'); const eSub = document.getElementById('exp-sub-cat');
  const sMain = document.getElementById('stock-main-cat'); const sSub = document.getElementById('stock-sub-cat');
  
  if(eMain && eSub) {
    eMain.innerHTML = ''; 
    Object.keys(expenseCategories).forEach(m => eMain.innerHTML += `<option value="${m}">${m}</option>`);
    eMain.onchange = () => { 
      eSub.innerHTML = ''; 
      if(expenseCategories[eMain.value]) {
        expenseCategories[eMain.value].forEach(s => eSub.innerHTML += `<option value="${s}">${s}</option>`);
      }
    };
  }
  
  if(sMain && sSub) {
    sMain.innerHTML = ''; 
    Object.keys(stockCategories).forEach(m => sMain.innerHTML += `<option value="${m}">${m}</option>`);
    sMain.onchange = () => { 
      sSub.innerHTML = ''; 
      if(stockCategories[sMain.value]) {
        stockCategories[sMain.value].forEach(s => sSub.innerHTML += `<option value="${s}">${s}</option>`);
      }
    };
  }

  if(sMain && sMain.value) sMain.onchange();
  if(eMain && eMain.value) eMain.onchange();
}

function switchMgmtType(type) {
  currentMgmtType = type;
  if(type === 'EXPENSE') {
    document.getElementById('mtype-EXPENSE').className = 'py-2.5 rounded-lg font-black text-[14px] bg-zinc-800 text-white cursor-pointer';
    document.getElementById('mtype-STOCK').className = 'py-2.5 rounded-lg font-bold text-[14px] text-zinc-500 cursor-pointer';
  } else {
    document.getElementById('mtype-EXPENSE').className = 'py-2.5 rounded-lg font-bold text-[14px] text-zinc-500 cursor-pointer';
    document.getElementById('mtype-STOCK').className = 'py-2.5 rounded-lg font-black text-[14px] bg-zinc-800 text-white cursor-pointer';
  }
  updateMgmtDisplay();
}

function updateMgmtDisplay() {
  const selectMain = document.getElementById('mgmt-select-main');
  const treeDisplay = document.getElementById('mgmt-tree-display');
  const targetCats = currentMgmtType === 'EXPENSE' ? expenseCategories : stockCategories;
  
  if(!selectMain || !treeDisplay) return;

  selectMain.innerHTML = '';
  treeDisplay.innerHTML = '';

  Object.keys(targetCats).forEach(main => {
    selectMain.innerHTML += `<option value="${main}">${main}</option>`;
    let subItemsHtml = '';
    targetCats[main].forEach(sub => {
      subItemsHtml += `<span class="inline-block bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md mr-1.5 mb-1.5">${sub}</span>`;
    });
    
    treeDisplay.innerHTML += `
      <div class="py-2.5">
        <p class="font-bold text-white mb-1">${main}</p>
        <div>${subItemsHtml || '<span class="text-xs text-zinc-600 italic">ไม่มีหมวดหมู่ย่อย</span>'}</div>
      </div>`;
  });
}

function addMainCategoryClick() {
  const input = document.getElementById('mgmt-new-main');
  const name = input.value.trim();
  if(!name) return;

  if(currentMgmtType === 'EXPENSE') {
    if(!expenseCategories[name]) expenseCategories[name] = [];
    localStorage.setItem('pflow_exp_cats', JSON.stringify(expenseCategories));
  } else {
    if(!stockCategories[name]) stockCategories[name] = [];
    localStorage.setItem('pflow_stk_cats', JSON.stringify(stockCategories));
  }
  input.value = '';
  updateMgmtDisplay();
  setupDropdowns();
}

function addSubCategoryClick() {
  const select = document.getElementById('mgmt-select-main');
  const input = document.getElementById('mgmt-new-sub');
  const mainName = select.value;
  const subName = input.value.trim();
  if(!mainName || !subName) return;

  if(currentMgmtType === 'EXPENSE') {
    if(!expenseCategories[mainName].includes(subName)) expenseCategories[mainName].push(subName);
    localStorage.setItem('pflow_exp_cats', JSON.stringify(expenseCategories));
  } else {
    if(!stockCategories[mainName].includes(subName)) stockCategories[mainName].push(subName);
    localStorage.setItem('pflow_stk_cats', JSON.stringify(stockCategories));
  }
  input.value = '';
  updateMgmtDisplay();
  setupDropdowns();
}
