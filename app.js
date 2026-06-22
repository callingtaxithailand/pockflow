// โครงสร้างหมวดหมู่เริ่มจากศูนย์
let appCategories = {
    INCOME: {
        "รายได้หลัก": { subs: ["เงินเดือน", "โบนัส"], img: "" },
        "ThaiRide": { subs: ["งานรับส่ง", "เช่ารถ"], img: "" }
    },
    EXPENSE: {
        "ค่าใช้จ่ายในบ้าน": { subs: ["ค่าน้ำ", "ค่าไฟ", "ส่วนกลาง"], img: "" }
    },
    STOCK: {
        "หุ้น": { subs: ["ปันผล", "กำไรขาย"], img: "" }
    }
};

// บันทึกหมวดหมู่ลง LocalStorage ครั้งแรก
if (!localStorage.getItem('PF_Categories')) {
    localStorage.setItem('PF_Categories', JSON.stringify(appCategories));
}
