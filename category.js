import { changeMenuTab } from "./app.js";

// หมวดหมู่เริ่มต้น (จะดึงมาช่วยพยุงระบบทันทีหากคีย์ในเครื่องของพี่ว่าง เพื่อให้มีหมวดหมู่หลักเลือกใช้งาน)
const defIncomeCats = {
  "💰 รายได้หลัก": [
    { name: "เงินเดือน", icon: "💵" },
    { name: "โบนัส", icon: "🎁" }
  ],
  "🚗 ThaiRide Travel": [
    { name: "รับส่งสนามบิน", icon: "✈️" },
    { name: "เช่ารถส่วนบุคคล", icon: "🔑" }
  ],
  "📊 การลงทุน": [
    { name: "ปันผลหุ้น", icon: "📈" },
    { name: "กำไรขายสินทรัพย์", icon: "🪙" }
  ]
};

const defExpenseCats = { 
  "⚡ สาธารณูปโภค": [
    { name: "COWAY", icon: "💧" },
    { name: "ค่าไฟฟ้า", icon: "🔌" },
    { name: "ค่าน้ำประปา", icon: "🚰" },
    { name: "ค่าส่วนกลาง", icon: "🏢" }
  ],
  "🔧 ซ่อมบำรุง": [
    { name: "เปลี่ยนน้ำมันเครื่อง", icon: "🛢️" },
    { name: "เปลี่ยนน้ำมันเกียร์", icon: "⚙️" }
  ] 
};

const defStockCats = { 
  "🇹🇭 หุ้นไทย (SET)": [
    { name: "กลุ่มธนาคาร", icon: "🏦" },
    { name: "กลุ่มพลังงาน", icon: "🔋" }
  ], 
  "🇺🇸 หุ้นอเมริกา (US)": [
    { name: "กลุ่ม AI & Tech", icon: "🤖" }
  ]
};

// ฟังก์ชันโหลดข้อมูล (ตรวจสอบข้อมูลจริงของพี่ก่อน ถ้าไม่มีค่อยดึงค่าเริ่มต้นมาใช้งาน)
function loadCategories(currentKey, fallbackKeys, defaultData) {
  let data = localStorage.getItem(currentKey);
  if (data) return JSON.parse(data);

  for (let oldKey of fallbackKeys) {
    let oldData = localStorage.getItem(oldKey);
    if (oldData) {
      let parsed = JSON.parse(oldData);
      let converted = {};
      Object.keys(parsed).forEach(main => {
        converted[main] = parsed[main].map(sub => {
          if (typeof sub === 'string') return { name: sub, icon: "🔹" };
          return sub;
        });
      });
      localStorage.setItem(currentKey, JSON.stringify(converted));
      return converted;
    }
  }
  return defaultData;
}

let incomeCategories = loadCategories('pflow_inc_cats_v3', ['pflow_inc_cats_v2', 'pflow_income_categories', 'incomeCategories'], defIncomeCats);
let expenseCategories = loadCategories('pflow_exp_cats_v3', ['pflow_exp_cats_v2', 'pflow_expense_categories', 'expenseCategories'], defExpenseCats);
let stockCategories = loadCategories('pflow_stk_cats_v3', ['pflow_stk_cats_v2', 'pflow_stock_categories', 'stockCategories'], defStockCats);

let currentMgmtType = 'INCOME';

// คลังอิโมจิยอดนิยมแบ่งตามหมวดหมู่
const emojiGroups = {
  "💰 การเงิน/ธุรกิจ": ["💰", "💵", "💸", "🪙", "💳", "💎", "📊", "📈", "📉", "💼", "👔", "🛍️", "🛒"],
  "🚗 ยานพาหนะ/เดินทาง": ["🚗", "🏍️", "🚕", "🚌", "🚚", "📦", "⛽", "🔧", "🛢️", "⚙️", "✈️", "🔑", "🗺️"],
  "🏠 บ้าน/ชีวิตประจำวัน": ["🏠", "🏢", "⚡", "🔌", "💧", "🚰", "🪠", "🧹", "🛏️", "🛋️", "📌", "📝", "✂️"],
  "🍔 อาหาร/เครื่องดื่ม": ["🍔", "🍕", "🍜", "🍲", "🍚", "🍞", "🍿", "🍰", "🥤", "☕", "🍺", "🍏", "🍇"],
  "🐱 สัตว์/ธรรมชาติ": ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐦", "🦆", "🦅", "🦉", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🐢", "🐍", "🦎", "🐙", "🦑", "🦐", "🦪", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🐪", "🦒", "🦘", "🐎", "🐖", "🐏", "🐐", "🦌", "🐕", "🐈", "🐓", "🕊️", "🐇", "🌱", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🌐", "🌞", "🌙", "⭐️", "🌟", "✨", "🔥", "🌈", "☀️", "🌤️", "☁️", "🌧️", "⛈️", "❄️", "🌊"],
  "🎉 บันเทิง/สุขภาพ": ["🎉", "🎁", "🎈", "🎨", "🎬", "🎤", "🎧", "🎮", "⚽️", "⛳️", "🏋️", "💊", "🩹", "🩺", "⭐"]
};

export function getCategoriesByType(type) {
  if(type === 'INCOME') return incomeCategories;
  if(type === 'EXPENSE') return expenseCategories;
  return stockCategories;
}

export function initCategoryMgmt() {
  createEmojiPickerPopup();

  const triggerBtn = document.getElementById('btn-trigger-category-mgmt');
  if(triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
      document.getElementById('view-category-manager').classList.remove('hidden');
      updateMgmtDisplay();
    });
  }

  const backBtn = document.getElementById('btn-back-category-mgmt');
  if(backBtn) {
    backBtn.addEventListener('click', () => changeMenuTab('settings'));
  }

  ['INCOME', 'EXPENSE', 'STOCK'].forEach(t => {
    const el = document.getElementById(`mtype-${t}`);
    if(el) el.addEventListener('click', () => switchMgmtType(t));
  });

  const addMainBtn = document.getElementById('btn-mgmt-add-main');
  if(addMainBtn) {
    addMainBtn.replaceWith(addMainBtn.cloneNode(true)); // ล้าง Listener เก่ากันทำงานซ้ำซ้อน
    document.getElementById('btn-mgmt-add-main').addEventListener('click', addMainCategoryClick);
  }

  const addSubBtn = document.getElementById('btn-mgmt-add-sub');
  if(addSubBtn) {
    addSubBtn.replaceWith(addSubBtn.cloneNode(true));
    document.getElementById('btn-mgmt-add-sub').addEventListener('click', addSubCategoryClick);
  }

  // ตัวดักการคลิกเพื่อเรียกกล่องเลือกอิโมจิ
  setupIconInputListeners();

  window.deleteMainCat = function(mainName) {
    if(!confirm(`ยืนยันลบหมวดหมู่หลัก "${mainName}" และหมวดหมู่ย่อยทั้งหมดข้างในหรือไม่?`)) return;
    const target = getCategoriesByType(currentMgmtType);
    delete target[mainName];
    saveToStorage();
  };

  window.deleteSubCat = function(mainName, subName) {
    if(!confirm(`ยืนยันลบหมวดหมู่ย่อย "${subName}" หรือไม่?`)) return;
    const target = getCategoriesByType(currentMgmtType);
    if(target[mainName]) {
      target[mainName] = target[mainName].filter(s => s.name !== subName);
      saveToStorage();
    }
  };

  updateMgmtDisplay();
}

function setupIconInputListeners() {
  const mainIconInput = document.getElementById('mgmt-main-icon');
  if(mainIconInput) {
    mainIconInput.onclick = (e) => openEmojiPicker(e.target);
    mainIconInput.readOnly = true; 
  }

  const subIconInput = document.getElementById('mgmt-sub-icon');
  if(subIconInput) {
    subIconInput.onclick = (e) => openEmojiPicker(e.target);
    subIconInput.readOnly = true; 
  }
}

function createEmojiPickerPopup() {
  if (document.getElementById('pflow-emoji-picker')) return;
  
  const picker = document.createElement('div');
  picker.id = 'pflow-emoji-picker';
  picker.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center hidden p-4';
  
  let contentHtml = '';
  Object.keys(emojiGroups).forEach(groupTitle => {
    contentHtml += `<p class="text-[11px] font-black text-zinc-500 mt-3 mb-1 border-b border-zinc-800/60 pb-1">${groupTitle}</p>`;
    contentHtml += `<div class="grid grid-cols-6 gap-1">`;
    emojiGroups[groupTitle].forEach(emoji => {
      contentHtml += `
        <button class="text-2xl p-2 active:bg-zinc-800 rounded-xl transition-colors cursor-pointer" onclick="selectEmojiForInput('${emoji}')">
          ${emoji}
        </button>`;
    });
    contentHtml += `</div>`;
  });

  picker.innerHTML = `
    <div class="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-4 shadow-2xl flex flex-col max-h-[70vh]">
      <div class="flex justify-between items-center pb-2 border-b border-zinc-800">
        <p class="text-sm font-black text-white">เลือกไอคอนอิโมจิ</p>
        <button class="text-rose-500 text-xs font-bold bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-900/40" onclick="closeEmojiPicker()">ปิด ✕</button>
      </div>
      <div class="flex-1 overflow-y-auto pr-1">
        ${contentHtml}
      </div>
    </div>
  `;
  document.body.appendChild(picker);
}

let activeTargetInput = null;

function openEmojiPicker(inputElement) {
  activeTargetInput = inputElement;
  document.getElementById('pflow-emoji-picker').classList.remove('hidden');
}

window.closeEmojiPicker = function() {
  document.getElementById('pflow-emoji-picker').classList.add('hidden');
  activeTargetInput = null;
}

window.selectEmojiForInput = function(emoji) {
  if (activeTargetInput) {
    activeTargetInput.value = emoji;
  }
  closeEmojiPicker();
}

function saveToStorage() {
  localStorage.setItem('pflow_inc_cats_v3', JSON.stringify(incomeCategories));
  localStorage.setItem('pflow_exp_cats_v3', JSON.stringify(expenseCategories));
  localStorage.setItem('pflow_stk_cats_v3', JSON.stringify(stockCategories));
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
        currentCats[sMain.value].forEach(s => {
          sSub.innerHTML += `<option value="${s.icon} ${s.name}">${s.icon} ${s.name}</option>`;
        });
      }
    };
    if(sMain.value) sMain.onchange();
  } else if(nMain && nSub) {
    nMain.innerHTML = '';
    Object.keys(currentCats).forEach(m => nMain.innerHTML += `<option value="${m}">${m}</option>`);
    nMain.onchange = () => {
      nSub.innerHTML = '';
      if(currentCats[nMain.value]) {
        currentCats[nMain.value].forEach(s => {
          nSub.innerHTML += `<option value="${s.icon} ${s.name}">${s.icon} ${s.name}</option>`;
        });
      }
    };
    if(nMain.value) nMain.onchange();
  }
}

function switchMgmtType(type) {
  currentMgmtType = type;
  ['INCOME', 'EXPENSE', 'STOCK'].forEach(t => {
    const el = document.getElementById(`mtype-${t}`);
    if(!el) return;
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
        <span class="inline-flex items-center bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg mr-2 mb-2 font-bold border border-zinc-700/50">
          <span class="mr-1">${sub.icon || '🔹'}</span> ${sub.name} 
          <button onclick="deleteSubCat('${main}','${sub.name}')" class="ml-1.5 text-rose-500 font-black text-sm hover:text-rose-400">×</button>
        </span>`;
    });
    
    treeDisplay.innerHTML += `
      <div class="py-3.5 border-b border-zinc-800/60 last:border-0">
        <div class="flex justify-between items-center mb-2">
          <p class="font-black text-white text-[15px] tracking-tight">${main}</p>
          <button onclick="deleteMainCat('${main}')" class="text-xs text-rose-500 font-bold bg-rose-950/30 px-2 py-1 rounded-md border border-rose-900/40">🗑️ ลบหลัก</button>
        </div>
        <div class="pl-1 flex flex-wrap">${subItemsHtml || '<span class="text-xs text-zinc-650 italic">ไม่มีหมวดหมู่ย่อยภายในกลุ่มนี้</span>'}</div>
      </div>`;
  });
}

function addMainCategoryClick() {
  const iconInput = document.getElementById('mgmt-main-icon');
  const nameInput = document.getElementById('mgmt-new-main');
  
  const icon = iconInput ? iconInput.value.trim() : "📁";
  const name = nameInput ? nameInput.value.trim() : "";
  
  if(!name) return;
  
  const fullMainName = `${icon} ${name}`.trim();
  const target = getCategoriesByType(currentMgmtType);
  
  if(!target[fullMainName]) {
    target[fullMainName] = [];
    if(nameInput) nameInput.value = '';
    if(iconInput) iconInput.value = '📁'; 
    saveToStorage();
  } else {
    alert('มีหมวดหมู่หลักชื่อนี้อยู่แล้วครับพี่!');
  }
}

function addSubCategoryClick() {
  const select = document.getElementById('mgmt-select-main');
  const iconInput = document.getElementById('mgmt-sub-icon');
  const nameInput = document.getElementById('mgmt-new-sub');
  
  const mainName = select ? select.value : "";
  const icon = iconInput ? iconInput.value.trim() : "🔹";
  const name = nameInput ? nameInput.value.trim() : "";
  
  if(!mainName || !name) return;
  const target = getCategoriesByType(currentMgmtType);
  
  if(target[mainName]) {
    const isExist = target[mainName].some(s => s.name === name);
    if(!isExist) {
      target[mainName].push({ name: name, icon: icon });
      if(nameInput) nameInput.value = '';
      if(iconInput) iconInput.value = '🔹'; 
      saveToStorage();
    } else {
      alert('มีหมวดหมู่ย่อยชื่อนี้อยู่ในกลุ่มนี้แล้วครับพี่!');
    }
  }
}
