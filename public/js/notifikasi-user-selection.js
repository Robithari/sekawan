// Notifikasi User Handler for CMS
(function() {
    console.log('[NotifikasiUser] Script loaded');

    let notifikasiData = [];
    let currentNo = 1;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initNotifikasiUser();
    });

    function initNotifikasiUser() {
        console.log('[NotifikasiUser] Initializing...');
        
        // Setup form handlers
        setupFormHandlers();
        
        // Load existing data
        loadNotifikasiHistory();
        
        // Update nomor form
        updateFormNumber();
    }

    function setupFormHandlers() {
        // Form submit handler
        const form = document.getElementById('notifikasiUserForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Batal button handler
        const batalBtn = document.getElementById('notifikasiUserBatalBtn');
        if (batalBtn) {
            batalBtn.addEventListener('click', handleFormReset);
        }

        // Test button handler
        const testBtn = document.getElementById('testNotifikasiBtn');
        if (testBtn) {
            testBtn.addEventListener('click', handleTestNotification);
        }

        // Checkbox handlers
        const kirimSemuaCheckbox = document.getElementById('kirimSemuaUser');
        const kirimTertentuCheckbox = document.getElementById('kirimUserTertentu');
        const nikWrapper = document.getElementById('inputNikWrapper');

        if (kirimSemuaCheckbox) {
            kirimSemuaCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    kirimTertentuCheckbox.checked = false;
                    nikWrapper.classList.add('d-none');
                }
            });
        }

        if (kirimTertentuCheckbox) {
            kirimTertentuCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    kirimSemuaCheckbox.checked = false;
                    nikWrapper.classList.remove('d-none');
                } else {
                    nikWrapper.classList.add('d-none');
                }
            });
        }
    }

    async function handleTestNotification() {
        const messageDiv = document.getElementById('notifikasiUserMessage');
        
        try {
            const payload = {
                judul: '🧪 Test Notifikasi CMS',
                isi: 'Ini adalah test notifikasi dari CMS. Klik untuk menuju halaman notifikasi.',
                keSemua: true,
                keTertentu: false,
                nik: ''
            };

            console.log('[NotifikasiUser] Sending test notification:', payload);
            showMessage(messageDiv, 'success', '🧪 Mengirim test notifikasi...');

            const response = await fetch('/cms/notifikasi-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window.CSRF_TOKEN || ''
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('[NotifikasiUser] Test response:', result);

            if (result.success) {
                showMessage(messageDiv, 'success', '✅ Test notifikasi terkirim! Periksa browser Anda dan coba klik notifikasi untuk test redirect ke /notifikasi');
                
                // Reload history after test
                setTimeout(() => {
                    loadNotifikasiHistory();
                }, 1000);
                
            } else {
                showMessage(messageDiv, 'error', '❌ Test gagal: ' + (result.message || 'Unknown error'));
            }

        } catch (error) {
            console.error('[NotifikasiUser] Test error:', error);
            showMessage(messageDiv, 'error', '❌ Test error: ' + error.message);
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('notifikasiUserMessage');
        
        // Get form data
        const judul = document.getElementById('judulNotifikasi').value.trim();
        const isi = document.getElementById('isiNotifikasi').value.trim();
        const keSemua = document.getElementById('kirimSemuaUser').checked;
        const keTertentu = document.getElementById('kirimUserTertentu').checked;
        const nik = document.getElementById('inputNikUser').value.trim();

        // Validation
        if (!judul || !isi) {
            showMessage(messageDiv, 'error', 'Judul dan isi notifikasi wajib diisi!');
            return;
        }

        if (!keSemua && !keTertentu) {
            showMessage(messageDiv, 'error', 'Pilih target pengiriman notifikasi!');
            return;
        }

        if (keTertentu && !nik) {
            showMessage(messageDiv, 'error', 'NIK user wajib diisi jika kirim ke user tertentu!');
            return;
        }

        // Disable submit button
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Mengirim...';

        try {
            const payload = {
                judul,
                isi,
                keSemua,
                keTertentu,
                nik: keTertentu ? nik : ''
            };

            console.log('[NotifikasiUser] Sending notification:', payload);

            const response = await fetch('/cms/notifikasi-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window.CSRF_TOKEN || ''
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('[NotifikasiUser] Response:', result);

            if (result.success) {
                showMessage(messageDiv, 'success', 'Notifikasi berhasil dikirim!');
                
                // Reset form
                handleFormReset();
                
                // Reload history
                setTimeout(() => {
                    loadNotifikasiHistory();
                }, 1000);
                
            } else {
                showMessage(messageDiv, 'error', result.message || 'Gagal mengirim notifikasi!');
            }

        } catch (error) {
            console.error('[NotifikasiUser] Send error:', error);
            showMessage(messageDiv, 'error', 'Terjadi kesalahan: ' + error.message);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    function handleFormReset() {
        // Reset form
        const form = document.getElementById('notifikasiUserForm');
        if (form) {
            form.reset();
        }

        // Hide NIK input
        const nikWrapper = document.getElementById('inputNikWrapper');
        if (nikWrapper) {
            nikWrapper.classList.add('d-none');
        }

        // Clear message
        const messageDiv = document.getElementById('notifikasiUserMessage');
        if (messageDiv) {
            messageDiv.classList.add('d-none');
            messageDiv.innerHTML = '';
        }

        // Update form number
        updateFormNumber();
    }

    async function loadNotifikasiHistory() {
        try {
            console.log('[NotifikasiUser] Loading notification history...');
            
            const response = await fetch('/cms/notifikasi-user/histori', {
                method: 'GET',
                headers: {
                    'X-CSRF-Token': window.CSRF_TOKEN || ''
                }
            });

            const result = await response.json();
            console.log('[NotifikasiUser] History response:', result);

            if (result.histori) {
                notifikasiData = result.histori;
                renderNotifikasiTable();
                updateFormNumber();
            } else {
                console.warn('[NotifikasiUser] No history data received');
            }

        } catch (error) {
            console.error('[NotifikasiUser] Load history error:', error);
        }
    }

    function renderNotifikasiTable() {
        const tbody = document.getElementById('notifikasi-user-tbody');
        if (!tbody) return;

        if (!notifikasiData || notifikasiData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Belum ada riwayat notifikasi
                    </td>
                </tr>
            `;
            return;
        }

        const rows = notifikasiData.map((item, index) => {
            const no = notifikasiData.length - index;
            const judul = item.judul || 'Tidak ada judul';
            const isi = item.isi || '';
            const waktu = formatTime(item.waktu);
            const target = item.keSemua ? 'Semua User' : (item.nik ? `User: ${item.nik}` : 'User Tertentu');
            const status = item.status || 'Tidak diketahui';
            
            // Status styling
            let statusClass = 'badge bg-secondary';
            if (status.toLowerCase().includes('terkirim')) {
                statusClass = 'badge bg-success';
            } else if (status.toLowerCase().includes('gagal')) {
                statusClass = 'badge bg-danger';
            } else if (status.toLowerCase().includes('sebagian')) {
                statusClass = 'badge bg-warning';
            }

            return `
                <tr>
                    <td>${no}</td>
                    <td>${escapeHtml(judul)}</td>
                    <td>${escapeHtml(isi.length > 50 ? isi.substring(0, 50) + '...' : isi)}</td>
                    <td>${waktu}</td>
                    <td>${escapeHtml(target)}</td>
                    <td><span class="${statusClass}">${escapeHtml(status)}</span></td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    }

    function updateFormNumber() {
        const noInput = document.getElementById('notifikasiNo');
        if (noInput) {
            currentNo = (notifikasiData ? notifikasiData.length : 0) + 1;
            noInput.value = currentNo;
        }
    }

    function showMessage(container, type, message) {
        if (!container) return;

        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        
        container.innerHTML = `
            <i class="bi bi-${icon}"></i> ${message}
        `;
        container.className = `alert ${alertClass}`;
        container.classList.remove('d-none');

        // Auto hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                container.classList.add('d-none');
            }, 5000);
        }
    }

    function formatTime(timestamp) {
        if (!timestamp) return '-';
        
        const date = new Date(timestamp);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Export functions for global access if needed
    window.NotifikasiUser = {
        loadNotifikasiHistory,
        handleFormReset
    };

    console.log('[NotifikasiUser] Script initialization complete');

})();
