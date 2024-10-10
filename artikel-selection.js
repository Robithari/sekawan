import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from './firebase-config.js'; 

let currentEditId = null;

export async function loadContents() {
    try {
        console.log("Fungsi loadContents dipanggil");
        const querySnapshot = await getDocs(collection(db, "contents"));
        console.log("Data artikel diambil:", querySnapshot);
        const contentList = document.getElementById('artikel-selection');
        contentList.innerHTML = ''; 

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Data artikel:", data);
            const contentItem = `
                <div class="article-item">
                    <h3>${data.title}</h3>
                    <p>${data.content}</p>
                    <button class="btn btn-danger" onclick="deleteContent('${doc.id}')">Delete</button>
                    <button class="btn btn-warning" onclick="editContent('${doc.id}', \`${data.title}\`, \`${data.content}\`)">Edit</button>
                </div>
                <hr>
            `;
            contentList.innerHTML += contentItem;
        });
    } catch (e) {
        console.error("Error loading contents: ", e);
    }
}

document.getElementById('addContentForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const messageDiv = document.getElementById('message');

    try {
        const docRef = await addDoc(collection(db, "contents"), {
            title: title,
            content: content,
            createdAt: new Date()
        });

        messageDiv.innerHTML = '<p class="text-success">Data berhasil ditambahkan!</p>';
        loadContents();
        document.getElementById('addContentForm').reset();
    } catch (e) {
        console.error("Error adding document: ", e);
        messageDiv.innerHTML = `<p class="text-danger">Error menambahkan data: ${e.message}</p>`;
    }
});

window.deleteContent = async function (id) {
    if (confirm("Apakah kamu yakin ingin menghapus data ini?")) {
        try {
            await deleteDoc(doc(db, "contents", id));
            alert("Data berhasil dihapus!");
            loadContents();
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    }
}

window.editContent = function (id, title, content) {
    currentEditId = id;
    document.getElementById('title').value = title;
    document.getElementById('content').value = content;
    document.getElementById('update-btn').style.display = 'inline-block';
}

document.getElementById('update-btn').onclick = async function () {
    if (currentEditId) {
        try {
            await updateDoc(doc(db, "contents", currentEditId), {
                title: document.getElementById('title').value,
                content: document.getElementById('content').value
            });
            alert("Data berhasil diperbarui!");
            loadContents();
            document.getElementById('addContentForm').reset();
            document.getElementById('update-btn').style.display = 'none';
            currentEditId = null;
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    }
};
