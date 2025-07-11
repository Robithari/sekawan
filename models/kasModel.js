const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const db = getFirestore();
const kasCollection = db.collection('kas');

function generateKodeKas(tanggal, count = 0) {
    // tanggal: Date object
    const pad = n => n.toString().padStart(2, '0');
    const y = tanggal.getFullYear();
    const m = pad(tanggal.getMonth() + 1);
    const d = pad(tanggal.getDate());
    // count: urutan/hitung data hari itu, default 0
    return `KAS-${y}${m}${d}-${(count + 1).toString().padStart(3, '0')}`;
}

async function getAllKas() {
    const snapshot = await kasCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addKas(data) {
    data.tanggal = data.tanggal ? Timestamp.fromDate(new Date(data.tanggal)) : Timestamp.now();
    // Hitung jumlah kas pada tanggal yang sama untuk kode unik
    const tgl = data.tanggal.toDate ? data.tanggal.toDate() : new Date();
    const sameDaySnap = await kasCollection.where('tanggal', '>=', Timestamp.fromDate(new Date(tgl.setHours(0,0,0,0))))
        .where('tanggal', '<=', Timestamp.fromDate(new Date(tgl.setHours(23,59,59,999)))).get();
    const kode = generateKodeKas(data.tanggal.toDate ? data.tanggal.toDate() : new Date(), sameDaySnap.size);
    data.kode = kode;
    const ref = await kasCollection.add(data);
    return { id: ref.id, ...data };
}

async function updateKas(id, data) {
    if (data.tanggal) data.tanggal = Timestamp.fromDate(new Date(data.tanggal));
    // Jika kode diinput, update kode, jika tidak, biarkan kode lama
    if (!data.kode) {
        const doc = await kasCollection.doc(id).get();
        data.kode = doc.exists && doc.data().kode ? doc.data().kode : '';
    }
    await kasCollection.doc(id).update(data);
    return { id, ...data };
}

async function deleteKas(id) {
    await kasCollection.doc(id).delete();
    return { id };
}

module.exports = { getAllKas, addKas, updateKas, deleteKas };
