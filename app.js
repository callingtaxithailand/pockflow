import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    // นำค่า apiKey, authDomain, ฯลฯ จากรูปที่แคปมาใส่ตรงนี้
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ฟังก์ชันบันทึกข้อมูล
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "transactions"), {
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        mainCat: document.getElementById('mainCat').value,
        subCat: document.getElementById('subCat').value,
        owner: document.getElementById('owner').value,
        price: document.getElementById('price').value
    });
});

// ฟังก์ชันดึงข้อมูลมาแสดง (พร้อมใส่สี)
onSnapshot(collection(db, "transactions"), (snapshot) => {
    const display = document.getElementById('displayArea');
    display.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = `card ${data.type}`;
        div.innerHTML = `วันที่: ${data.date} | หมวด: ${data.subCat} | จำนวน: ${data.price}`;
        display.appendChild(div);
    });
});
