// =========================
// Sekawan FC CMS Berita Management
// Professional & Clean Version
// =========================

(function() {
    'use strict';
    
    // Cek jika sudah diinisialisasi
    if (window.beritaSelectionInitialized) {
        console.warn('Berita selection already initialized');
        return;
    }
    window.beritaSelectionInitialized = true;

    // Validasi Firebase dependency
    if (!window.firebase) {
        console.error('Firebase not loaded! Please ensure Firebase SDK is loaded before this script.');
        return;
    }

    // Semua akses Firebase via window.firebase (CDN v8)
    // Pastikan window.firebase sudah di-load sebelum file ini
    var db = window.firebase.firestore();
    var storage = window.firebase.storage ? window.firebase.storage() : null;
    var beritaCollectionRef = db.collection("berita");

    // References to HTML elements
    const addBeritaForm = document.getElementById("addBeritaForm");
    const beritaSelection = document.getElementById("berita-selection");
    const beritaAddBtn = document.getElementById("berita-add-btn");
    const beritaUpdateBtn = document.getElementById("berita-update-btn");
    const beritaCancelBtn = document.getElementById("berita-cancel-btn");
    const beritaMessage = document.getElementById("berita-message");
    let currentBeritaId = null;

    // ========== Quill Editor Setup ==========

    // Quill Font whitelist hanya boleh didaftarkan sekali di seluruh CMS
    if (window.Quill && !window.__quillFontPatched) {
        var Font = window.Quill.import('formats/font');
        Font.whitelist = ['arial', 'comic-sans', 'courier-new', 'georgia', 'helvetica', 'lucida', 'times-new-roman'];
        window.Quill.register(Font, true);
        window.__quillFontPatched = true;
    }

    var toolbarOptions = [
        [{ 'font': ['arial', 'comic-sans', 'courier-new', 'georgia', 'helvetica', 'lucida', 'times-new-roman'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video', 'formula'],
        ['clean']
    ];

    var quillBerita = null;
    
    // Inisialisasi Quill hanya jika element ada
    if (document.getElementById('beritaContentEditor')) {
        if (window.Quill) {
            try {
                const icons = window.Quill.import('ui/icons');
                icons['undo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path class="ql-stroke" d="M14,4a6,6,0,0,0-8.5,1.5"></path></svg>';
                icons['redo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M4,4a6,6,0,0,1,8.5,1.5"></path></svg>';

                quillBerita = new window.Quill('#beritaContentEditor', {
                    modules: {
                        toolbar: {
                            container: toolbarOptions,
                            handlers: {
                                undo: function() { 
                                    this.quill.history.undo(); 
                                },
                                redo: function() { 
                                    this.quill.history.redo(); 
                                },
                                indent: function(value) {
                                    if (value === '+1' || value === '-1') {
                                        this.quill.format('indent', value === '+1' ? '+1' : '-1');
                                    } else {
                                        this.quill.format('indent', false);
                                    }
                                },
                                direction: function(value) {
                                    this.quill.format('direction', value);
                                }
                            }
                        },
                        history: {
                            delay: 1000,
                            maxStack: 100,
                            userOnly: true
                        }
                    },
                    theme: 'snow',
                    placeholder: 'Tulis konten berita di sini...'
                });

                // Tambahkan tombol undo/redo secara manual ke toolbar setelah inisialisasi
                const toolbar = document.querySelector('#beritaContentEditor + .ql-toolbar');
                if (toolbar) {
                    const group = document.createElement('span');
                    group.className = 'ql-formats';
                    group.innerHTML = '<button class="ql-undo" type="button" title="Undo"></button>' +
                                      '<button class="ql-redo" type="button" title="Redo"></button>';
                    toolbar.insertBefore(group, toolbar.firstChild ? toolbar.firstChild.nextSibling : null);
                }
            } catch (error) {
                console.error('Error initializing Quill editor:', error);
            }
        }
    }

    // Function to create a unique slug from title
    function createSlug(title) {
        if (!title) return '';
        return title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Function to check if slug is unique (window.firebase v8)
    async function isSlugUnique(slug, excludeId = null) {
        try {
            const q = beritaCollectionRef.where("slug", "==", slug);
            const querySnapshot = await q.get();
            if (querySnapshot.empty) return true;
            if (excludeId) {
                return querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeId;
            }
            return false;
        } catch (error) {
            console.error('Error checking slug uniqueness:', error);
            return false;
        }
    }

    // Function to display messages in the UI
    function displayBeritaMessage(text, type = "info") {
        if (beritaMessage) {
            beritaMessage.textContent = text;
            beritaMessage.className = `alert alert-${type}`;
            beritaMessage.classList.remove("d-none");
            setTimeout(() => beritaMessage.classList.add("d-none"), 5000);
        }
    }

    // Function to upload file to Firebase Storage and return download URL (window.firebase v8)
    async function uploadFile(file) {
        if (!storage) throw new Error("Firebase Storage belum diinisialisasi.");
        return new Promise(function(resolve, reject) {
            try {
                var storageRef = storage.ref(`berita_images/${Date.now()}_${file.name}`);
                var uploadTask = storageRef.put(file);
                uploadTask.on('state_changed', null, function(error) {
                    reject(error);
                }, function() {
                    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                        resolve(downloadURL);
                    }).catch(function(error) {
                        reject(error);
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Function to reset submit button
    function resetSubmitButton() {
        const submitBtn = currentBeritaId ? beritaUpdateBtn : beritaAddBtn;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = currentBeritaId ? "Selesai" : "Tambah Berita";
        }
    }

    async function handleBeritaFormSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById("beritaTitle")?.value?.trim() || '';
        const titleKeterangan = document.getElementById("beritaTitleKeterangan")?.value?.trim() || '';
        const tanggalPembuatan = document.getElementById("beritaTanggalPembuatan")?.value || '';
        // Sanitasi konten Quill sebelum submit
        const contentRaw = quillBerita ? quillBerita.root.innerHTML.trim() : '';
        const content = window.DOMPurify ? window.DOMPurify.sanitize(contentRaw) : contentRaw;
        const photoFileInput = document.getElementById("beritaPhotoFile");
        const caption = document.getElementById("beritaCaption")?.value?.trim() || '';

        // Tampilkan loading indicator
        const submitBtn = currentBeritaId ? beritaUpdateBtn : beritaAddBtn;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Memproses...";
        }

        // Validasi input
        if (!title) {
            displayBeritaMessage("Judul berita tidak boleh kosong.", "danger");
            resetSubmitButton();
            return;
        }
        if (!titleKeterangan) {
            displayBeritaMessage("Title keterangan tidak boleh kosong.", "danger");
            resetSubmitButton();
            return;
        }
        if (!tanggalPembuatan) {
            displayBeritaMessage("Tanggal pembuatan harus diisi.", "danger");
            resetSubmitButton();
            return;
        }
        if (!content || content === "<p><br></p>") {
            displayBeritaMessage("Konten berita tidak boleh kosong.", "danger");
            resetSubmitButton();
            return;
        }
        if (!caption) {
            displayBeritaMessage("Keterangan foto tidak boleh kosong.", "danger");
            resetSubmitButton();
            return;
        }

        try {
            let photoUrl;
            if (currentBeritaId && (!photoFileInput || photoFileInput.files.length === 0)) {
                // Jika mode edit dan preview foto ada, gunakan URL foto lama
                const previewSrc = document.getElementById("beritaPhotoPreview");
                if (previewSrc && previewSrc.src && previewSrc.src !== window.location.href) {
                    photoUrl = previewSrc.src;
                } else {
                    displayBeritaMessage("Harap pilih file foto untuk diupload.", "danger");
                    resetSubmitButton();
                    return;
                }
            } else if (photoFileInput && photoFileInput.files.length > 0) {
                const file = photoFileInput.files[0];
                photoUrl = await uploadFile(file);
            } else {
                displayBeritaMessage("Harap pilih file foto untuk diupload.", "danger");
                resetSubmitButton();
                return;
            }

            if (currentBeritaId) {
                await updateBerita(currentBeritaId, title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption);
            } else {
                await addBerita(title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption);
            }
            resetBeritaForm();
        } catch (error) {
            displayBeritaMessage(`Gagal mengupload foto atau menyimpan berita: ${error.message}`, "danger");
            console.error('Error in form submit:', error);
        } finally {
            resetSubmitButton();
        }
    }

    function resetBeritaForm() {
        if (addBeritaForm) addBeritaForm.reset();
        currentBeritaId = null;
        
        const preview = document.getElementById("beritaPhotoPreview");
        if (preview) {
            preview.src = "";
            preview.style.display = "none";
        }

        // Kosongkan teks nama file foto lama
        const photoFileNameSpan = document.getElementById("beritaPhotoFileName");
        if (photoFileNameSpan) {
            photoFileNameSpan.textContent = "Tidak ada file";
        }

        if (beritaAddBtn) beritaAddBtn.classList.remove("d-none");
        if (beritaUpdateBtn) beritaUpdateBtn.classList.add("d-none");
        if (beritaCancelBtn) beritaCancelBtn.classList.add("d-none");
        
        const formTitle = document.getElementById("form-title-berita");
        if (formTitle) formTitle.innerText = "Tambah Berita Baru";
        
        if (quillBerita) {
            try {
                quillBerita.setContents([{ insert: '\n' }]);
            } catch (error) {
                console.error('Error resetting Quill content:', error);
            }
        }
    }

    // --- Tambahan: Helper untuk default image ---
    const DEFAULT_IMAGE_URL = "/img/default-news.jpg";
    // Fallback image URL (bisa diganti sesuai kebutuhan)
    const FALLBACK_IMAGE_URL = "/public/img/fallback-image.jpg";

    // --- Tambahan: Preview gambar otomatis saat memilih file ---
    const photoFileInput = document.getElementById("beritaPhotoFile");
    if (photoFileInput) {
        photoFileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            const preview = document.getElementById("beritaPhotoPreview");
            const fileNameSpan = document.getElementById("beritaPhotoFileName");
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function (ev) {
                    if (preview) {
                        preview.src = ev.target.result;
                        preview.style.display = "block";
                    }
                };
                reader.onerror = function() {
                    console.error('Error reading file');
                    displayBeritaMessage("Error membaca file gambar", "danger");
                };
                reader.readAsDataURL(file);
                
                if (fileNameSpan) fileNameSpan.textContent = file.name;
            } else {
                if (preview) {
                    preview.src = "";
                    preview.style.display = "none";
                }
                if (fileNameSpan) fileNameSpan.textContent = "Tidak ada file";
            }
        });
    }

    // --- FITUR PENCARIAN DAN REFRESH ---
    // Tambahkan input pencarian dan tombol refresh secara dinamis jika belum ada
    function ensureSearchAndRefreshUI() {
        if (!document.getElementById("berita-search-input") && beritaSelection) {
            const searchDiv = document.createElement("div");
            searchDiv.className = "d-flex mb-3 gap-2 align-items-center flex-wrap";
            searchDiv.innerHTML = `
                <input type="text" id="berita-search-input" class="form-control" placeholder="Cari berita..." style="max-width:300px;">
                <button id="berita-refresh-btn" class="btn btn-outline-secondary" title="Refresh daftar berita"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            `;
            beritaSelection.parentNode.insertBefore(searchDiv, beritaSelection);
        }
    }

    // --- GENERATE BERITA CARD DENGAN FALLBACK IMAGE DAN ESCAPE ---
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c];
        });
    }

    function generateBeritaCard(id, berita) {
        // Escape semua field yang akan dioutput ke HTML
        const title = escapeHTML(berita.title);
        const titleKeterangan = escapeHTML(berita.titleKeterangan);
        const caption = escapeHTML(berita.caption);
        const slug = escapeHTML(berita.slug);
        const photoUrl = berita.photoUrl ? berita.photoUrl : FALLBACK_IMAGE_URL;
        const tanggal = berita.tanggalPembuatan ? new Date(berita.tanggalPembuatan).toLocaleDateString('id-ID') : '-';
        
        // Truncate content (strip HTML tag)
        let contentText = berita.content ? berita.content.replace(/<[^>]+>/g, '') : '';
        const truncatedContent = contentText.length > 200 ? contentText.substring(0, 200) + "..." : contentText;
        
        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${photoUrl}" class="card-img-top" alt="${title}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE_URL}';">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text"><strong>${titleKeterangan}</strong></p>
                        <p class="card-text text-muted">${tanggal}</p>
                        <p class="card-text">${truncatedContent}</p>
                        <div class="mt-auto">
                            <a href="/berita/${slug}" target="_blank" class="btn btn-primary">Buka Berita</a>
                            <button class="btn btn-warning edit-berita-btn mt-2" data-id="${id}">Edit</button>
                            <button class="btn btn-danger delete-berita-btn mt-2" data-id="${id}">Hapus</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // --- FITUR PENCARIAN ---
    let beritaCache = [];

    function filterBerita(keyword) {
        const lower = keyword.trim().toLowerCase();
        return beritaCache.filter(b =>
            (b.title && b.title.toLowerCase().includes(lower)) ||
            (b.titleKeterangan && b.titleKeterangan.toLowerCase().includes(lower)) ||
            (b.caption && b.caption.toLowerCase().includes(lower))
        );
    }

    async function fetchBerita(force = false) {
        if (!beritaSelection) return;
        
        beritaSelection.innerHTML = "<div class='text-center py-4'><span class='spinner-border'></span> Memuat berita...</div>";
        
        try {
            const querySnapshot = await beritaCollectionRef.orderBy("tanggalPembuatan", "desc").get();
            beritaCache = [];
            
            if (querySnapshot.empty) {
                beritaSelection.innerHTML = "<p>Tidak ada berita yang tersedia.</p>";
                return;
            }
            
            querySnapshot.forEach((docSnapshot) => {
                const berita = docSnapshot.data();
                beritaCache.push({ ...berita, id: docSnapshot.id });
            });
            
            renderBeritaList(beritaCache);
            attachBeritaEventListeners();
        } catch (error) {
            beritaSelection.innerHTML = "<div class='alert alert-danger'>Gagal memuat berita: " + escapeHTML(error.message) + "</div>";
            displayBeritaMessage(`Gagal memuat berita: ${error.message}`, "danger");
            console.error("[fetchBerita]", error);
        }
    }

    function renderBeritaList(list) {
        if (!beritaSelection) return;
        
        beritaSelection.innerHTML = "";
        
        if (!list.length) {
            beritaSelection.innerHTML = "<p>Tidak ada berita yang sesuai pencarian.</p>";
            return;
        }
        
        list.forEach(b => {
            beritaSelection.innerHTML += generateBeritaCard(b.id, b);
        });
        
        attachBeritaEventListeners();
    }

    // ========== CRUD Functions ==========
    async function addBerita(title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption) {
        try {
            const slug = createSlug(title);
            if (!(await isSlugUnique(slug))) {
                throw new Error("Slug sudah digunakan.");
            }
            
            await beritaCollectionRef.add({ 
                title, 
                titleKeterangan, 
                tanggalPembuatan, 
                content, 
                photoUrl, 
                caption, 
                slug 
            });
            
            displayBeritaMessage("Berita berhasil ditambahkan!", "success");
            fetchBerita();
        } catch (error) {
            displayBeritaMessage(`Gagal menambahkan berita: ${error.message}`, "danger");
            console.error('Error adding berita:', error);
        }
    }

    async function updateBerita(id, title, titleKeterangan, tanggalPembuatan, content, photoUrl, caption) {
        try {
            const slug = createSlug(title);
            if (!(await isSlugUnique(slug, id))) {
                throw new Error("Slug sudah digunakan.");
            }
            
            const docRef = beritaCollectionRef.doc(id);
            await docRef.update({ 
                title, 
                titleKeterangan, 
                tanggalPembuatan, 
                content, 
                photoUrl, 
                caption, 
                slug 
            });
            
            displayBeritaMessage("Berita berhasil diperbarui!", "success");
            fetchBerita();
        } catch (error) {
            displayBeritaMessage(`Gagal memperbarui berita: ${error.message}`, "danger");
            console.error('Error updating berita:', error);
        }
    }

    async function deleteBerita(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;
        
        try {
            await beritaCollectionRef.doc(id).delete();
            displayBeritaMessage("Berita berhasil dihapus.", "success");
            fetchBerita();
        } catch (error) {
            displayBeritaMessage(`Gagal menghapus berita: ${error.message}`, "danger");
            console.error('Error deleting berita:', error);
        }
    }

    async function editBeritaById(id) {
        try {
            const docSnap = await beritaCollectionRef.doc(id).get();
            if (!docSnap.exists) {
                throw new Error("Berita tidak ditemukan.");
            }
            
            const berita = docSnap.data();
            populateBeritaForm(berita);
            currentBeritaId = id;
            
            if (beritaAddBtn) beritaAddBtn.classList.add("d-none");
            if (beritaUpdateBtn) beritaUpdateBtn.classList.remove("d-none");
            if (beritaCancelBtn) beritaCancelBtn.classList.remove("d-none");
            
            const formTitle = document.getElementById("form-title-berita");
            if (formTitle) formTitle.innerText = "Edit Berita";
            
            const preview = document.getElementById("beritaPhotoPreview");
            if (preview && berita.photoUrl) {
                preview.src = berita.photoUrl;
                preview.style.display = "block";
            } else if (preview) {
                preview.src = "";
                preview.style.display = "none";
            }
        } catch (error) {
            displayBeritaMessage(`Gagal memuat berita: ${error.message}`, "danger");
            console.error('Error editing berita:', error);
        }
    }

    function populateBeritaForm(berita) {
        const titleField = document.getElementById("beritaTitle");
        const titleKeteranganField = document.getElementById("beritaTitleKeterangan");
        const tanggalField = document.getElementById("beritaTanggalPembuatan");
        const photoFileField = document.getElementById("beritaPhotoFile");
        const captionField = document.getElementById("beritaCaption");
        
        if (titleField) titleField.value = berita.title || '';
        if (titleKeteranganField) titleKeteranganField.value = berita.titleKeterangan || '';
        if (tanggalField) tanggalField.value = berita.tanggalPembuatan || '';
        if (quillBerita) {
            try {
                quillBerita.root.innerHTML = berita.content || '';
            } catch (error) {
                console.error('Error setting Quill content:', error);
            }
        }
        if (photoFileField) photoFileField.value = "";
        if (captionField) captionField.value = berita.caption || '';
        
        // Tampilkan nama file foto lama di bawah input file
        const photoFileNameSpan = document.getElementById("beritaPhotoFileName");
        if (photoFileNameSpan) {
            if (berita.photoUrl) {
                try {
                    const urlParts = berita.photoUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1].split('?')[0];
                    photoFileNameSpan.textContent = fileName;
                } catch (error) {
                    photoFileNameSpan.textContent = "File foto tersedia";
                }
            } else {
                photoFileNameSpan.textContent = "Tidak ada file";
            }
        }
    }

    // ========== Attach Event Listeners ==========
    function attachBeritaEventListeners() {
        document.querySelectorAll(".edit-berita-btn").forEach((button) => {
            button.addEventListener("click", () => editBeritaById(button.dataset.id));
        });
        document.querySelectorAll(".delete-berita-btn").forEach((button) => {
            button.addEventListener("click", () => deleteBerita(button.dataset.id));
        });
    }

    // ========== Expose to Global Scope ==========
    window.beritaModule = {
        addBerita,
        editBeritaById,
        deleteBerita,
        fetchBerita,
        attachBeritaEventListeners
    };

    // --- EVENT LISTENER PENCARIAN DAN REFRESH ---
    function initializeBeritaModule() {
        try {
            ensureSearchAndRefreshUI();
            fetchBerita();
            
            // Search
            const searchInput = document.getElementById("berita-search-input");
            if (searchInput) {
                searchInput.addEventListener("input", (e) => {
                    const keyword = e.target.value;
                    renderBeritaList(filterBerita(keyword));
                });
            }
            
            // Refresh
            const refreshBtn = document.getElementById("berita-refresh-btn");
            if (refreshBtn) {
                refreshBtn.addEventListener("click", () => {
                    fetchBerita(true);
                    if (searchInput) searchInput.value = "";
                });
            }

            // Form submit
            if (addBeritaForm) {
                addBeritaForm.addEventListener("submit", handleBeritaFormSubmit);
            }
            
            // Cancel button
            if (beritaCancelBtn) {
                beritaCancelBtn.addEventListener("click", resetBeritaForm);
            }
        } catch (error) {
            console.error('Error initializing berita module:', error);
            displayBeritaMessage(`Error inisialisasi: ${error.message}`, "danger");
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", initializeBeritaModule);
    } else {
        initializeBeritaModule();
    }

    // --- Tambahan: Logging error lebih detail ---
    window.addEventListener('error', function (e) {
        console.error('Global error caught:', e.message, 'at', e.filename, ':', e.lineno, ':', e.colno);
        if (typeof displayBeritaMessage === 'function') {
            displayBeritaMessage(`Terjadi kesalahan: ${e.message}`, "danger");
        }
    });

    // Tambahan: Error handler untuk unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        if (typeof displayBeritaMessage === 'function') {
            displayBeritaMessage(`Promise error: ${e.reason}`, "danger");
        }
    });

})();