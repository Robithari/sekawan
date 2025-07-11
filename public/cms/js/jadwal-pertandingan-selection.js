// =========================
// Sekawan FC CMS Jadwal Pertandingan Management
// Professional & Clean Version
// =========================

(function() {
    'use strict';
    
    // Cek jika sudah diinisialisasi
    if (window.jadwalPertandinganInitialized) {
        console.warn('Jadwal pertandingan already initialized');
        return;
    }
    window.jadwalPertandinganInitialized = true;

    // Validasi Firebase dependency
    if (!window.firebase) {
        console.error('Firebase not loaded! Please ensure Firebase SDK is loaded before this script.');
        return;
    }

    // Semua akses Firebase via window.firebase (CDN v8)
    // Pastikan window.firebase sudah di-load sebelum file ini
    var db = window.firebase.firestore();
    var pertandinganCollectionRef = db.collection("jadwalPertandingan");

    // References to HTML elements
    const pertandinganSelection = document.getElementById("pertandingan-selection");
    const updateBtn = document.getElementById("pertandingan-update-btn");
    const cancelBtn = document.getElementById("pertandingan-cancel-btn");
    const message = document.getElementById("pertandingan-message");
    const addPertandinganForm = document.getElementById("addPertandinganForm");
    let currentPertandinganId = null; // To track edit mode

    // Hide the edit form initially
    if (addPertandinganForm) {
        addPertandinganForm.style.display = "none";
    }

    // Function to display messages in the UI
    function displayMessage(text, type = "info") {
        if (message) {
            message.textContent = text;
            message.className = "alert alert-" + type;
            message.classList.remove("d-none");
            setTimeout(function() { 
                message.classList.add("d-none"); 
            }, 5000);
        }
    }

    // Function to handle form submission (Update Pertandingan)
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            const timKita = document.getElementById("timA")?.value || '';
            const timLawan = document.getElementById("timB")?.value || '';
            const hari = document.getElementById("hari")?.value || '';
            const tanggalValue = document.getElementById("tanggalPertandingan")?.value || '';
            const waktu = document.getElementById("waktu")?.value || '';

            // Validasi input
            if (!timKita || !timLawan || !hari || !tanggalValue || !waktu) {
                displayMessage("Semua field harus diisi!", "danger");
                return;
            }

            const tanggal = new Date(tanggalValue).toISOString();

            const pertandinganData = {
                timKita: timKita,
                vs: "vs",
                timLawan: timLawan,
                hari: hari,
                tanggal: tanggal,
                waktu: waktu
            };

            if (currentPertandinganId) {
                await updatePertandingan(currentPertandinganId, pertandinganData);
                resetForm(); // Reset form fields after submission
            }
        } catch (error) {
            console.error('Error in form submit:', error);
            displayMessage(`Gagal menyimpan pertandingan: ${error.message}`, "danger");
        }
    }

    // Function to reset the form
    function resetForm() {
        if (addPertandinganForm) {
            addPertandinganForm.reset();
            addPertandinganForm.style.display = "none"; // Hide the edit form after reset
        }
        
        currentPertandinganId = null;
        
        if (updateBtn) updateBtn.classList.add("d-none");
        if (cancelBtn) cancelBtn.classList.add("d-none");
        
        const formTitle = document.getElementById("form-title-pertandingan");
        if (formTitle) formTitle.innerText = "Edit Jadwal Pertandingan";
    }

    // Function to fetch and display the list of pertandingan (window.firebase v8)
    async function fetchPertandingan() {
        if (!pertandinganSelection) return;
        
        pertandinganSelection.innerHTML = "<div class='text-center py-4'><span class='spinner-border'></span> Memuat jadwal pertandingan...</div>";
        
        try {
            const querySnapshot = await pertandinganCollectionRef.orderBy("tanggal", "asc").get();
            pertandinganSelection.innerHTML = "";
            
            if (querySnapshot.empty) {
                pertandinganSelection.innerHTML = "<p>Tidak ada jadwal pertandingan yang tersedia.</p>";
                return;
            }
            
            querySnapshot.forEach(function(docSnapshot) {
                const pertandingan = docSnapshot.data();
                pertandinganSelection.innerHTML += generatePertandinganCard(docSnapshot.id, pertandingan);
            });
            
            attachEventListeners();
        } catch (error) {
            console.error("Error saat memuat daftar pertandingan:", error);
            pertandinganSelection.innerHTML = "<div class='alert alert-danger'>Gagal memuat jadwal pertandingan: " + escapeHTML(error.message) + "</div>";
            displayMessage('Gagal memuat pertandingan: ' + error.message, "danger");
        }
    }

    // Function to escape HTML
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c];
        });
    }

    // Helper function to generate pertandingan card HTML
    function generatePertandinganCard(id, pertandingan) {
        const timKita = escapeHTML(pertandingan.timKita);
        const timLawan = escapeHTML(pertandingan.timLawan);
        const hari = escapeHTML(pertandingan.hari);
        const waktu = escapeHTML(pertandingan.waktu);
        const tanggal = pertandingan.tanggal ? new Date(pertandingan.tanggal).toLocaleDateString('id-ID') : '-';
        
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${timKita} ${pertandingan.vs || 'vs'} ${timLawan}</h5>
                        <p class="card-text text-muted">${hari}, ${tanggal} Pukul ${waktu}</p>
                        <div class="mt-auto">
                            <button class="btn btn-warning edit-btn mt-2" data-id="${id}">Edit</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // Function to update an existing pertandingan (window.firebase v8)
    async function updatePertandingan(id, pertandinganData) {
        try {
            const docRef = pertandinganCollectionRef.doc(id);
            await docRef.update(pertandinganData);
            displayMessage("Pertandingan berhasil diperbarui!", "success");
            fetchPertandingan();
        } catch (error) {
            console.error('Error updating pertandingan:', error);
            displayMessage(`Gagal memperbarui pertandingan: ${error.message}`, "danger");
        }
    }

    // Function to edit a pertandingan by ID (window.firebase v8)
    async function editPertandinganById(id) {
        try {
            const docSnap = await pertandinganCollectionRef.doc(id).get();
            if (!docSnap.exists) {
                throw new Error("Pertandingan tidak ditemukan.");
            }
            
            const pertandingan = docSnap.data();
            populateForm(pertandingan);
            currentPertandinganId = id;
            
            if (updateBtn) updateBtn.classList.remove("d-none");
            if (cancelBtn) cancelBtn.classList.remove("d-none");
            
            const formTitle = document.getElementById("form-title-pertandingan");
            if (formTitle) formTitle.innerText = "Edit Jadwal Pertandingan";
            
            if (addPertandinganForm) {
                addPertandinganForm.style.display = "block"; // Show the edit form when editing
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the form
        } catch (error) {
            console.error('Error editing pertandingan:', error);
            displayMessage(`Gagal memuat pertandingan: ${error.message}`, "danger");
        }
    }

    // Helper function to populate the form with pertandingan data
    function populateForm(pertandingan) {
        const timAField = document.getElementById("timA");
        const timBField = document.getElementById("timB");
        const hariField = document.getElementById("hari");
        const tanggalField = document.getElementById("tanggalPertandingan");
        const waktuField = document.getElementById("waktu");
        
        if (timAField) timAField.value = pertandingan.timKita || '';
        if (timBField) timBField.value = pertandingan.timLawan || '';
        if (hariField) hariField.value = pertandingan.hari || '';
        if (waktuField) waktuField.value = pertandingan.waktu || '';
        
        if (tanggalField && pertandingan.tanggal) {
            try {
                tanggalField.value = new Date(pertandingan.tanggal).toISOString().split('T')[0];
            } catch (error) {
                console.error('Error parsing date:', error);
                tanggalField.value = '';
            }
        }
    }

    // Attach event listeners to Edit buttons
    function attachEventListeners() {
        document.querySelectorAll(".edit-btn").forEach(function(button) {
            button.addEventListener("click", function() { 
                editPertandinganById(button.dataset.id); 
            });
        });
    }

    // --- FITUR PENCARIAN DAN REFRESH ---
    function ensureSearchAndRefreshUI() {
        if (!document.getElementById("pertandingan-search-input") && pertandinganSelection) {
            const searchDiv = document.createElement("div");
            searchDiv.className = "d-flex mb-3 gap-2 align-items-center flex-wrap";
            searchDiv.innerHTML = `
                <input type="text" id="pertandingan-search-input" class="form-control" placeholder="Cari pertandingan..." style="max-width:300px;">
                <button id="pertandingan-refresh-btn" class="btn btn-outline-secondary" title="Refresh daftar pertandingan"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            `;
            pertandinganSelection.parentNode.insertBefore(searchDiv, pertandinganSelection);
        }
    }

    // Initialize module
    function initializePertandinganModule() {
        try {
            ensureSearchAndRefreshUI();
            fetchPertandingan();

            // Search functionality
            const searchInput = document.getElementById("pertandingan-search-input");
            if (searchInput) {
                searchInput.addEventListener("input", function(e) {
                    // Implement search logic here if needed
                    console.log('Search:', e.target.value);
                });
            }

            // Refresh functionality
            const refreshBtn = document.getElementById("pertandingan-refresh-btn");
            if (refreshBtn) {
                refreshBtn.addEventListener("click", function() {
                    fetchPertandingan();
                    if (searchInput) searchInput.value = "";
                });
            }

            // Attach event listeners to form submission and cancel button
            if (addPertandinganForm) {
                addPertandinganForm.addEventListener("submit", handleFormSubmit);
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener("click", resetForm);
            }
        } catch (error) {
            console.error('Error initializing pertandingan module:', error);
            displayMessage(`Error inisialisasi: ${error.message}`, "danger");
        }
    }

    // Expose to global scope
    window.pertandinganModule = {
        fetchPertandingan,
        editPertandinganById,
        updatePertandingan,
        attachEventListeners
    };

    // Load pertandingan when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", initializePertandinganModule);
    } else {
        initializePertandinganModule();
    }

    // Error handler
    window.addEventListener('error', function(e) {
        console.error('Pertandingan module error:', e.message, 'at', e.filename, ':', e.lineno, ':', e.colno);
    });

})();