import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.saveData = async (type) => {
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if(!desc || !amount) return alert("กรุณากรอกข้อมูลให้ครบ");

    try {
        await addDoc(collection(db, "transactions"), {
            desc,
            amount,
            type,
            date: new Date()
        });
        alert("บันทึกสำเร็จ");
        document.getElementById('desc').value = '';
        document.getElementById('amount').value = '';
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

// ดึงข้อมูล Realtime มาแสดงยอด
onSnapshot(collection(db, "transactions"), (snapshot) => {
    let total = 0;
    snapshot.forEach((doc) => {
        const data = doc.data();
        if(data.type === 'รายรับ' || data.type === 'ปันผล') total += data.amount;
        if(data.type === 'รายจ่าย') total -= data.amount;
    });
    document.getElementById('totalProfit').innerText = total.toLocaleString();
});
