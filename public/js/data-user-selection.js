// js/data-user-selection.js
// Script untuk section Data User pada halaman /cms


// Data User Section - Robust, Professional, Donasi-style UX
document.addEventListener('DOMContentLoaded', function () {
    // --- Helper Functions ---
    function getCsrfToken() {
        const formToken = document.querySelector('#userForm input[name="_csrf"]');
        if (formToken && formToken.value) return formToken.value;
        if (window.CSRF_TOKEN) return window.CSRF_TOKEN;
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.content;
        return '';
    }
    function isValidEmail(email) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    }
    const loadingEl = document.getElementById('user-action-loading');
    const inputLoadingEl = document.getElementById('user-input-loading');
    const sectionMessage = document.getElementById('user-section-message');
    function showUserLoading() { loadingEl && loadingEl.classList.remove('d-none'); }
    function hideUserLoading() { loadingEl && loadingEl.classList.add('d-none'); }
    function showUserInputLoading() { inputLoadingEl && inputLoadingEl.classList.remove('d-none'); }
    function hideUserInputLoading() { inputLoadingEl && inputLoadingEl.classList.add('d-none'); }
    function showSectionMessage(type, msg) {
        if (!sectionMessage) return;
        sectionMessage.className = 'alert mb-3';
        sectionMessage.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
        sectionMessage.textContent = msg;
        sectionMessage.classList.remove('d-none');
        setTimeout(() => sectionMessage.classList.add('d-none'), 3500);
    }

    // --- Sidebar menu handler ---
    const menuDataUser = document.getElementById('menu-data-user');
    const sectionDataUser = document.getElementById('data-user-section');
    if (menuDataUser && sectionDataUser) {
        menuDataUser.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('section[id$="-section"]').forEach(sec => sec.classList.add('d-none'));
            sectionDataUser.classList.remove('d-none');
        });
    }

    // --- User Data Cache & Table ---
    let allUsersCache = [];
    function renderUserTable(users) {
        const tbody = document.getElementById('user-tbody');
        tbody.innerHTML = '';
        if (!Array.isArray(users) || users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">Belum ada user terdaftar.</td></tr>`;
            return;
        }
        users.forEach((user, i) => {
            const createdAt = user.createdAt ? (typeof user.createdAt === 'string' ? new Date(user.createdAt) : new Date(user.createdAt._seconds * 1000)) : null;
            const tanggal = createdAt ? createdAt.toLocaleString('id-ID') : '-';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${user.name || '-'}</td>
                <td>${user.email || '-'}</td>
                <td>${tanggal}</td>
                <td>${user.membershipCode || '-'}</td>
                <td>${user.phoneNumber || '-'}</td>
                <td>${user.fcmToken || '-'}</td>
                <td>${user.nik || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" data-action="send" data-id="${user.id}" title="Kirim Pesan"><i class="bi bi-send"></i></button>
                    <button class="btn btn-sm btn-warning me-1" data-action="edit" data-id="${user.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${user.id}" title="Hapus"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    function updateUserCacheAndTable(newCache) {
        allUsersCache = newCache;
        renderUserTable(allUsersCache);
    }

    // --- Delegasi event pada tombol aksi ---
    document.getElementById('user-tbody').addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        if (action === 'edit') {
            enterEditMode(id);
        } else if (action === 'delete') {
            openDeleteModal(id);
        } else if (action === 'send') {
            openSendMessageModal(id);
        }
    });

    // --- Modal konfirmasi hapus user (modern) ---
    let userIdToDelete = null;
    function openDeleteModal(id) {
        userIdToDelete = id;
        const user = allUsersCache.find(u => u.id === id);
        document.getElementById('deleteUserId').value = id;
        document.getElementById('deleteUserName').textContent = user ? user.name : '';
        document.getElementById('deleteUserEmail').textContent = user ? user.email : '';
        const modal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
        modal.show();
    }
    document.getElementById('confirmDeleteUserBtn')?.addEventListener('click', function () {
        if (userIdToDelete) {
            deleteUser(userIdToDelete);
            userIdToDelete = null;
        }
        bootstrap.Modal.getInstance(document.getElementById('deleteUserModal')).hide();
    });
    // No need for cancel btn handler, modal auto closes

    // --- Edit Mode ---
    function enterEditMode(id) {
        const user = allUsersCache.find(u => u.id === id);
        if (!user) return;
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userMembershipCode').value = user.membershipCode || '';
        document.getElementById('userPhoneNumber').value = user.phoneNumber || '';
        document.getElementById('userFcmToken').value = user.fcmToken || '';
        document.getElementById('userNik').value = user.nik || '';
        document.getElementById('user-add-btn').classList.add('d-none');
        document.getElementById('user-update-btn').classList.remove('d-none');
        document.getElementById('user-cancel-btn').classList.remove('d-none');
        document.getElementById('userName').focus();
    }
    function exitEditMode() {
        document.getElementById('userId').value = '';
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userMembershipCode').value = '';
        document.getElementById('userPhoneNumber').value = '';
        document.getElementById('userFcmToken').value = '';
        document.getElementById('userNik').value = '';
        document.getElementById('user-add-btn').classList.remove('d-none');
        document.getElementById('user-update-btn').classList.add('d-none');
        document.getElementById('user-cancel-btn').classList.add('d-none');
    }
    document.getElementById('user-cancel-btn').addEventListener('click', function () {
        exitEditMode();
    });

    // --- Tambah User ---
    document.getElementById('userForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!document.getElementById('user-add-btn').classList.contains('d-none')) {
            // Validasi
            const name = document.getElementById('userName').value.trim();
            const email = document.getElementById('userEmail').value.trim();
            const nik = document.getElementById('userNik').value.trim();
            if (!name) {
                showSectionMessage('error', 'Nama tidak boleh kosong!');
                return;
            }
            if (!isValidEmail(email)) {
                showSectionMessage('error', 'Format email tidak valid!');
                return;
            }
            if (!/^\d{16}$/.test(nik)) {
                showSectionMessage('error', 'NIK harus 16 digit angka!');
                return;
            }
            const membershipCode = document.getElementById('userMembershipCode').value.trim();
            const phoneNumber = document.getElementById('userPhoneNumber').value.trim();
            const fcmToken = document.getElementById('userFcmToken').value.trim();
            const csrf = getCsrfToken();
            showUserInputLoading();
            try {
                const res = await fetch('/cms/data-user/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrf
                    },
                    body: JSON.stringify({ name, email, membershipCode, phoneNumber, fcmToken, nik, _csrf: csrf })
                });
                const result = await res.json();
                hideUserInputLoading();
                if (result.success && result.user) {
                    showSectionMessage('success', 'User berhasil ditambahkan!');
                    // Tambah ke cache dan render ulang
                    allUsersCache.push(result.user);
                    renderUserTable(allUsersCache);
                    exitEditMode();
                } else {
                    showSectionMessage('error', result.error || 'Gagal menambah user');
                }
            } catch (err) {
                hideUserInputLoading();
                showSectionMessage('error', 'Terjadi error jaringan atau CSRF.');
            }
        }
    });

    // --- Update User ---
    document.getElementById('user-update-btn').addEventListener('click', async function () {
        // Cek apakah modal edit user sedang terbuka
        const editModal = document.getElementById('editUserModal');
        const isModalOpen = editModal && editModal.classList.contains('show');
        let id, name, email, nik, membershipCode, phoneNumber, fcmToken, csrf;
        if (isModalOpen) {
            // Ambil dari modal
            id = document.getElementById('editUserId').value;
            name = document.getElementById('editUserName').value.trim();
            email = document.getElementById('editUserEmail').value.trim();
            nik = document.getElementById('editUserNik').value.trim();
            membershipCode = document.getElementById('editUserMembershipCode').value.trim();
            phoneNumber = document.getElementById('editUserPhoneNumber').value.trim();
            fcmToken = document.getElementById('editUserFcmToken').value.trim();
            // Cari CSRF token di form modal jika ada
            const modalForm = editModal.querySelector('form');
            if (modalForm) {
                const csrfInput = modalForm.querySelector('input[name="_csrf"]');
                csrf = csrfInput ? csrfInput.value : getCsrfToken();
            } else {
                csrf = getCsrfToken();
            }
        } else {
            // Ambil dari form utama
            id = document.getElementById('userId').value;
            name = document.getElementById('userName').value.trim();
            email = document.getElementById('userEmail').value.trim();
            nik = document.getElementById('userNik').value.trim();
            membershipCode = document.getElementById('userMembershipCode').value.trim();
            phoneNumber = document.getElementById('userPhoneNumber').value.trim();
            fcmToken = document.getElementById('userFcmToken').value.trim();
            csrf = getCsrfToken();
        }
        if (!/^\d{16}$/.test(nik)) {
            showSectionMessage('error', 'NIK harus 16 digit angka!');
            return;
        }
        showUserInputLoading();
        try {
            const res = await fetch('/cms/data-user/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrf
                },
                body: JSON.stringify({ id, name, email, membershipCode, phoneNumber, fcmToken, nik, _csrf: csrf })
            });
            const result = await res.json();
            hideUserInputLoading();
            if (result.success && result.user) {
                showSectionMessage('success', 'User berhasil diupdate!');
                // Update cache
                const idx = allUsersCache.findIndex(u => u.id === id);
                if (idx !== -1) {
                    allUsersCache[idx] = result.user;
                    renderUserTable(allUsersCache);
                }
                exitEditMode();
            } else {
                showSectionMessage('error', result.error || 'Gagal update user');
            }
        } catch (err) {
            hideUserInputLoading();
            showSectionMessage('error', 'Terjadi error jaringan atau CSRF.');
        }
    });

    // --- Hapus User ---
    async function deleteUser(id) {
        const csrf = getCsrfToken();
        showUserLoading();
        try {
            const res = await fetch('/cms/data-user/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrf
                },
                body: JSON.stringify({ id, _csrf: csrf })
            });
            const result = await res.json();
            hideUserLoading();
            if (result.success) {
                showSectionMessage('success', 'User berhasil dihapus!');
                // Remove from cache
                allUsersCache = allUsersCache.filter(u => u.id !== id);
                renderUserTable(allUsersCache);
                exitEditMode();
            } else {
                showSectionMessage('error', result.error || 'Gagal hapus user');
            }
        } catch (err) {
            hideUserLoading();
            showSectionMessage('error', 'Terjadi error jaringan atau CSRF.');
        }
    }

    // --- Modal Kirim Pesan (FCM) ---
    async function openSendMessageModal(id) {
        const user = allUsersCache.find(u => u.id === id);
        if (!user || !user.fcmToken || user.fcmToken === '-') {
            alert('User ini belum memiliki token FCM.');
            return;
        }
        const title = prompt('Judul Pesan:');
        if (!title) return;
        const body = prompt('Isi Pesan:');
        if (!body) return;
        const csrf = getCsrfToken();
        showUserLoading();
        try {
            const res = await fetch('/cms/data-user/send-fcm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrf
                },
                body: JSON.stringify({ token: user.fcmToken, title, body, _csrf: csrf })
            });
            const result = await res.json();
            hideUserLoading();
            if (result.success) alert('Pesan berhasil dikirim!');
            else alert(result.error || 'Gagal mengirim pesan');
        } catch (err) {
            hideUserLoading();
            alert('Terjadi error jaringan atau CSRF.');
        }
    }

    // --- Pencarian User ---
    document.getElementById('user-search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const q = document.getElementById('userSearchInput').value.trim().toLowerCase();
        if (!q) {
            renderUserTable(allUsersCache);
            exitEditMode();
            return;
        }
        const filtered = allUsersCache.filter(u =>
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
        );
        renderUserTable(filtered);
        if (filtered.length === 1) {
            enterEditMode(filtered[0].id);
        } else {
            exitEditMode();
        }
    });
    document.getElementById('userSearchResetBtn').addEventListener('click', function() {
        document.getElementById('userSearchInput').value = '';
        renderUserTable(allUsersCache);
        exitEditMode();
    });

    // --- Inisialisasi ---
    // Fetch awal user dari server
    function fetchUsersWithCache(cb) {
        showUserInputLoading();
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                // Pastikan setiap user punya field nik (bisa undefined/null jika data lama)
                allUsersCache = data.map(u => ({ ...u, nik: u.nik || '' }));
                renderUserTable(allUsersCache);
                hideUserInputLoading();
                if (cb) cb(allUsersCache);
            })
            .catch(() => {
                allUsersCache = [];
                renderUserTable([]);
                hideUserInputLoading();
                if (cb) cb([]);
            });
    }
    fetchUsersWithCache();
    exitEditMode();
});
