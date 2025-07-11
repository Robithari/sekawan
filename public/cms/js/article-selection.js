// =========================
// Sekawan FC CMS Article Management
// Professional & Clean Version
// =========================

(function() {
    'use strict';
    
    // Cek jika sudah diinisialisasi
    if (window.articleSelectionInitialized) {
        console.warn('Article selection already initialized');
        return;
    }
    window.articleSelectionInitialized = true;

    // Validasi Firebase dependency
    if (!window.firebase) {
        console.error('Firebase not loaded! Please ensure Firebase SDK is loaded before this script.');
        return;
    }

    // Semua akses Firebase via window.firebase (CDN v8)
    // Pastikan window.firebase sudah di-load sebelum file ini
    var db = window.firebase.firestore();
    var storage = window.firebase.storage ? window.firebase.storage() : null;
    var articleCollectionRef = db.collection("articles");

    // References to HTML elements
    const addContentForm = document.getElementById("addContentForm");
    const articleSelection = document.getElementById("artikel-selection");
    // Tombol mode tambah
    const addFinishBtn = document.getElementById("add-finish-btn");
    const addCancelBtn = document.getElementById("add-cancel-btn");
    // Tombol mode edit
    const updateBtn = document.getElementById("update-btn");
    const cancelBtn = document.getElementById("cancel-artikel-btn");
    // Button group
    const addBtnGroup = document.getElementById("add-article-btn-group");
    const editBtnGroup = document.getElementById("edit-article-btn-group");
    const message = document.getElementById("message");
    let currentArticleId = null;

    // ========== Quill Editor Setup ==========

    // Quill Font whitelist hanya boleh didaftarkan sekali di seluruh CMS
    if (window.Quill && !window.__quillArticleFontPatched) {
        var Font = window.Quill.import('formats/font');
        Font.whitelist = ['arial', 'comic-sans', 'courier-new', 'georgia', 'helvetica', 'lucida', 'times-new-roman'];
        window.Quill.register(Font, true);
        window.__quillArticleFontPatched = true;
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

    var quillArticle = null;
    
    // Inisialisasi Quill hanya jika element ada
    if (document.getElementById('contentEditor')) {
        if (window.Quill) {
            try {
                const icons = window.Quill.import('ui/icons');
                icons['undo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path class="ql-stroke" d="M14,4a6,6,0,0,0-8.5,1.5"></path></svg>';
                icons['redo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M4,4a6,6,0,0,1,8.5,1.5"></path></svg>';

                quillArticle = new window.Quill('#contentEditor', {
                    modules: {
                        toolbar: {
                            container: toolbarOptions,
                            handlers: {
                                undo: function() { this.quill.history.undo(); },
                                redo: function() { this.quill.history.redo(); },
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
                    placeholder: 'Tulis konten artikel di sini...'
                });

                // Tambahkan tombol undo/redo secara manual ke toolbar setelah inisialisasi
                const toolbar = document.querySelector('#contentEditor + .ql-toolbar');
                if (toolbar) {
                    const group = document.createElement('span');
                    group.className = 'ql-formats';
                    group.innerHTML = '<button class="ql-undo" type="button" title="Undo"></button>' +
                                      '<button class="ql-redo" type="button" title="Redo"></button>';
                    toolbar.insertBefore(group, toolbar.firstChild ? toolbar.firstChild.nextSibling : null);
                }

                // Ensure Times New Roman font is applied
                quillArticle.on('text-change', function () {
                    const editor = document.querySelector('.ql-editor');
                    if (editor) {
                        editor.querySelectorAll('.ql-font-times-new-roman').forEach(el => {
                            el.style.fontFamily = '"Times New Roman", Times, serif';
                        });
                    }
                });
            } catch (error) {
                console.error('Error initializing Quill editor:', error);
            }
        }
    }

    // ========== Utility Functions ==========
    
    // Function to create a unique slug from title
    function createSlug(title) {
        if (!title) return '';
        return title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Function to format date for input[type="date"]
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        // Jika sudah dalam format YYYY-MM-DD, return apa adanya
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        // Jika format dd-mm-yyyy, konversi ke yyyy-mm-dd
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
            var parts = dateString.split('-');
            return parts[2] + '-' + parts[1] + '-' + parts[0];
        }
        // Jika ISO atau timestamp
        try {
            let date;
            if (typeof dateString === 'string' && dateString.includes('T')) {
                date = new Date(dateString);
            } else if (typeof dateString === 'number') {
                date = new Date(dateString);
            } else {
                date = new Date(dateString);
            }
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return '';
            }
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return '';
        }
    }

    // Function to check if slug is unique (window.firebase v8)
    async function isSlugUnique(slug, excludeId = null) {
        try {
            const q = articleCollectionRef.where("slug", "==", slug);
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
    function displayMessage(text, type = "info") {
        if (message) {
            message.textContent = text;
            message.className = `alert alert-${type}`;
            message.classList.remove("d-none");
            setTimeout(() => message.classList.add("d-none"), 5000);
        }
    }

    // Function to upload file to Firebase Storage and return download URL (window.firebase v8)
    async function uploadFile(file) {
        if (!storage) throw new Error("Firebase Storage belum diinisialisasi.");
        return new Promise(function(resolve, reject) {
            try {
                var storageRef = storage.ref(`article_images/${Date.now()}_${file.name}`);
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

    // Function to show/hide loading spinner on button
    function setButtonLoading(btn, isLoading, defaultText) {
        if (btn) {
            if (isLoading) {
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memproses...';
            } else {
                btn.disabled = false;
                btn.textContent = defaultText;
            }
        }
    }

    // Function to get form values safely
    function getFormValues() {
        const titleField = document.getElementById("title");
        // PATCH: gunakan id yang benar sesuai EJS/HTML
        const captionField = document.getElementById("artikel-caption");
        const titleKeteranganField = document.getElementById("titleKeterangan");
        const tanggalPembuatanField = document.getElementById("artikel-tanggal");
        const photoFileInput = document.getElementById("photoFile");

        return {
            title: titleField ? titleField.value.trim() : '',
            caption: captionField ? captionField.value.trim() : '',
            titleKeterangan: titleKeteranganField ? titleKeteranganField.value.trim() : '',
            tanggalPembuatan: tanggalPembuatanField ? tanggalPembuatanField.value.trim() : '',
            photoFileInput: photoFileInput,
            content: quillArticle ? quillArticle.root.innerHTML.trim() : ''
        };
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const formValues = getFormValues();
        
        // Sanitasi konten Quill sebelum submit
        const content = window.DOMPurify ? window.DOMPurify.sanitize(formValues.content) : formValues.content;
        

        // Tampilkan loading indicator
        let submitBtn, submitBtnText;
        if (currentArticleId) {
            submitBtn = updateBtn;
            submitBtnText = "Selesai";
        } else {
            submitBtn = addFinishBtn;
            submitBtnText = "Selesai";
        }
        setButtonLoading(submitBtn, true, submitBtnText);

        function showError(msg) {
            displayMessage(msg, "danger");
            setButtonLoading(submitBtn, false, submitBtnText);
            console.error('Form validation error:', msg);
        }

        // Validasi input dengan logging untuk debugging
        console.log('Form values for validation:', {
            title: formValues.title,
            titleKeterangan: formValues.titleKeterangan,
            tanggalPembuatan: formValues.tanggalPembuatan,
            caption: formValues.caption,
            content: content ? 'Content exists' : 'No content'
        });

        if (!formValues.title) return showError("Judul artikel tidak boleh kosong.");
        if (!formValues.titleKeterangan) return showError("Title keterangan tidak boleh kosong.");
        if (!formValues.tanggalPembuatan) return showError("Tanggal pembuatan harus diisi.");
        // Konversi kembali ke format dd-mm-yyyy sebelum simpan
        function toDDMMYYYY(dateStr) {
            if (!dateStr) return '';
            if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                var p = dateStr.split('-');
                return p[2] + '-' + p[1] + '-' + p[0];
            }
            return dateStr;
        }
        const tanggalPembuatanDDMMYYYY = toDDMMYYYY(formValues.tanggalPembuatan);
        if (!content || content === "<p><br></p>" || content === "<p></p>") return showError("Konten artikel tidak boleh kosong.");
        if (!formValues.caption) return showError("Keterangan foto tidak boleh kosong.");

        try {
            let photoUrl;
            if (currentArticleId && (!formValues.photoFileInput || formValues.photoFileInput.files.length === 0)) {
                // Jika mode edit dan preview foto ada, gunakan URL foto lama
                const previewSrc = document.getElementById("articlePhotoPreview");
                if (previewSrc && previewSrc.src && previewSrc.src !== window.location.href) {
                    photoUrl = previewSrc.src;
                } else {
                    return showError("Harap pilih file foto untuk diupload.");
                }
            } else if (formValues.photoFileInput && formValues.photoFileInput.files.length > 0) {
                const file = formValues.photoFileInput.files[0];
                photoUrl = await uploadFile(file);
            } else {
                return showError("Harap pilih file foto untuk diupload.");
            }

            const slug = createSlug(formValues.title);
            if (!(await isSlugUnique(slug, currentArticleId))) {
                return showError("Slug sudah digunakan.");
            }

            if (currentArticleId) {
                await updateArticle(currentArticleId, formValues.title, content, photoUrl, formValues.caption, formValues.titleKeterangan, tanggalPembuatanDDMMYYYY, slug);
            } else {
                await addArticle(formValues.title, content, photoUrl, formValues.caption, formValues.titleKeterangan, tanggalPembuatanDDMMYYYY, slug);
            }
            resetForm();
        } catch (error) {
            displayMessage(`Gagal mengupload foto atau menyimpan artikel: ${error.message}`, "danger");
            console.error('Error in form submit:', error);
        } finally {
            setButtonLoading(submitBtn, false, submitBtnText);
        }
    }

    function resetForm() {
        if (addContentForm) addContentForm.reset();
        currentArticleId = null;

        // Bersihkan Quill
        if (quillArticle) {
            try {
                quillArticle.setContents([{ insert: '\n' }]);
            } catch (error) {
                console.error('Error resetting Quill content:', error);
            }
        }

        // Bersihkan preview foto
        const preview = document.getElementById("articlePhotoPreview");
        if (preview) {
            preview.src = "";
            preview.style.display = "none";
        }

        // Kosongkan teks nama file foto lama
        const photoFileNameSpan = document.getElementById("articlePhotoFileName");
        if (photoFileNameSpan) {
            photoFileNameSpan.textContent = "Tidak ada file";
        }

        // Tampilkan tombol mode tambah, sembunyikan mode edit
        if (addBtnGroup) addBtnGroup.classList.remove("d-none");
        if (editBtnGroup) editBtnGroup.classList.add("d-none");

        const formTitle = document.getElementById("form-title");
        if (formTitle) formTitle.innerText = "Tambah Artikel Baru";
    }

    // --- Tambahan: Helper untuk default image ---
    const DEFAULT_IMAGE_URL = "/img/default-article.jpg";
    // Fallback image URL (bisa diganti sesuai kebutuhan)
    const FALLBACK_IMAGE_URL = "/public/img/fallback-article.jpg";

    // --- Tambahan: Preview gambar otomatis saat memilih file ---
    const photoFileInput = document.getElementById("photoFile");
    if (photoFileInput) {
        photoFileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            const preview = document.getElementById("articlePhotoPreview");
            const fileNameSpan = document.getElementById("articlePhotoFileName");
            
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
                    displayMessage("Error membaca file gambar", "danger");
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
        if (!document.getElementById("artikel-search-input") && articleSelection) {
            const searchDiv = document.createElement("div");
            searchDiv.className = "d-flex mb-3 gap-2 align-items-center flex-wrap";
            searchDiv.innerHTML = `
                <input type="text" id="artikel-search-input" class="form-control" placeholder="Cari artikel..." style="max-width:300px;">
                <button id="artikel-refresh-btn" class="btn btn-outline-secondary" title="Refresh daftar artikel"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            `;
            articleSelection.parentNode.insertBefore(searchDiv, articleSelection);
        }
    }

    // --- GENERATE ARTIKEL CARD DENGAN FALLBACK IMAGE DAN ESCAPE ---
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c];
        });
    }

    function generateArticleCard(id, article) {
        // Escape semua field yang akan dioutput ke HTML
        const title = escapeHTML(article.title);
        const titleKeterangan = escapeHTML(article.titleKeterangan);
        const slug = escapeHTML(article.slug);
        const photoUrl = article.photoUrl ? article.photoUrl : FALLBACK_IMAGE_URL;
        const tanggal = article.tanggalPembuatan ? new Date(article.tanggalPembuatan).toLocaleDateString('id-ID') : '-';
        
        // Truncate content (strip HTML tag)
        let contentText = article.content ? article.content.replace(/<[^>]+>/g, '') : '';
        const truncatedContent = contentText.length > 120 ? contentText.substring(0, 120) + "..." : contentText;
        
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
                            <a href="/articles/${slug}" target="_blank" class="btn btn-primary">Buka Artikel</a>
                            <button class="btn btn-warning artikel-edit-btn mt-2" data-id="${id}">Edit</button>
                            <button class="btn btn-danger artikel-delete-btn mt-2" data-id="${id}">Hapus</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // --- FITUR PENCARIAN ---
    let articleCache = [];

    function filterArticles(keyword) {
        const lower = keyword.trim().toLowerCase();
        return articleCache.filter(a =>
            (a.title && a.title.toLowerCase().includes(lower)) ||
            (a.titleKeterangan && a.titleKeterangan.toLowerCase().includes(lower)) ||
            (a.content && a.content.toLowerCase().includes(lower))
        );
    }

    async function fetchArticles(force = false) {
        if (!articleSelection) return;
        
        articleSelection.innerHTML = "<div class='text-center py-4'><span class='spinner-border'></span> Memuat artikel...</div>";
        
        try {
            const querySnapshot = await articleCollectionRef.orderBy("tanggalPembuatan", "desc").get();
            articleCache = [];
            
            if (querySnapshot.empty) {
                articleSelection.innerHTML = "<p>Tidak ada artikel yang tersedia.</p>";
                return;
            }
            
            querySnapshot.forEach((docSnapshot) => {
                const article = docSnapshot.data();
                articleCache.push({ ...article, id: docSnapshot.id });
            });
            
            renderArticleList(articleCache);
            attachArticleEventListeners();
        } catch (error) {
            articleSelection.innerHTML = "<div class='alert alert-danger'>Gagal memuat artikel: " + escapeHTML(error.message) + "</div>";
            displayMessage(`Gagal memuat artikel: ${error.message}`, "danger");
            console.error("[fetchArticles]", error);
        }
    }

    function renderArticleList(list) {
        if (!articleSelection) return;
        
        articleSelection.innerHTML = "";
        
        if (!list.length) {
            articleSelection.innerHTML = "<p>Tidak ada artikel yang sesuai pencarian.</p>";
            return;
        }
        
        list.forEach(a => {
            articleSelection.innerHTML += generateArticleCard(a.id, a);
        });
        
        attachArticleEventListeners();
    }

    // ========== CRUD Functions ==========
    async function addArticle(title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan, slug) {
        try {
            await articleCollectionRef.add({ 
                title, 
                content, 
                photoUrl, 
                caption, 
                titleKeterangan, 
                tanggalPembuatan, 
                slug,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            displayMessage("Artikel berhasil ditambahkan!", "success");
            fetchArticles();
        } catch (error) {
            displayMessage(`Gagal menambahkan artikel: ${error.message}`, "danger");
            console.error('Error adding article:', error);
        }
    }

    async function updateArticle(id, title, content, photoUrl, caption, titleKeterangan, tanggalPembuatan, slug) {
        try {
            const docRef = articleCollectionRef.doc(id);
            await docRef.update({ 
                title, 
                content, 
                photoUrl, 
                caption, 
                titleKeterangan, 
                tanggalPembuatan, 
                slug,
                updatedAt: new Date().toISOString()
            });
            displayMessage("Artikel berhasil diperbarui!", "success");
            fetchArticles();
        } catch (error) {
            displayMessage(`Gagal memperbarui artikel: ${error.message}`, "danger");
            console.error('Error updating article:', error);
        }
    }

    async function deleteArticle(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;
        
        try {
            await articleCollectionRef.doc(id).delete();
            displayMessage("Artikel berhasil dihapus.", "success");
            fetchArticles();
        } catch (error) {
            displayMessage(`Gagal menghapus artikel: ${error.message}`, "danger");
            console.error('Error deleting article:', error);
        }
    }

    async function editArticleById(id) {
        try {
            console.log('Editing article with ID:', id); // Debug log
            const docSnap = await articleCollectionRef.doc(id).get();
            if (!docSnap.exists) {
                throw new Error("Artikel tidak ditemukan.");
            }

            const article = docSnap.data();
            console.log('Article data loaded:', article); // Debug log

            populateForm(article);
            currentArticleId = id;

            // Sembunyikan tombol tambah, tampilkan tombol edit
            if (addBtnGroup) addBtnGroup.classList.add("d-none");
            if (editBtnGroup) editBtnGroup.classList.remove("d-none");

            const formTitle = document.getElementById("form-title");
            if (formTitle) formTitle.innerText = "Edit Artikel";

            const preview = document.getElementById("articlePhotoPreview");
            if (preview && article.photoUrl) {
                preview.src = article.photoUrl;
                preview.style.display = "block";
            } else if (preview) {
                preview.src = "";
                preview.style.display = "none";
            }

            // Scroll ke form untuk user experience yang lebih baik
            if (addContentForm) {
                addContentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            displayMessage(`Gagal memuat artikel: ${error.message}`, "danger");
            console.error('Error editing article:', error);
        }
    }

    function populateForm(article) {
        console.log('Populating form with article:', article); // Debug log
        
        // Cek setiap elemen sebelum mengatur nilai untuk mencegah error null
        const titleField = document.getElementById("title");
        if (titleField) {
            titleField.value = article.title || '';
            console.log('Title field populated:', titleField.value);
        }
        
        if (quillArticle) {
            try {
                quillArticle.root.innerHTML = article.content || '';
                console.log('Quill content populated');
            } catch (error) {
                console.error('Error setting Quill content:', error);
            }
        }
        
        const photoFileField = document.getElementById("photoFile");
        if (photoFileField) {
            photoFileField.value = "";
        }

        // PATCH: gunakan id yang benar sesuai EJS/HTML
        const captionField = document.getElementById("artikel-caption");
        if (!captionField) {
            console.error('[populateForm] Tidak menemukan field #artikel-caption di DOM!');
        } else {
            captionField.value = (typeof article.caption === 'string') ? article.caption : '';
            console.log('Caption field populated:', captionField.value);
        }

        const titleKeteranganField = document.getElementById("titleKeterangan");
        if (titleKeteranganField) {
            titleKeteranganField.value = (typeof article.titleKeterangan === 'string') ? article.titleKeterangan : '';
            console.log('TitleKeterangan field populated:', titleKeteranganField.value);
        }

        const tanggalPembuatanField = document.getElementById("artikel-tanggal");
        if (!tanggalPembuatanField) {
            console.error('[populateForm] Tidak menemukan field #artikel-tanggal di DOM!');
        } else {
            let formattedDate = '';
            if (article.tanggalPembuatan) {
                if (/^\d{2}-\d{2}-\d{4}$/.test(article.tanggalPembuatan)) {
                    var p = article.tanggalPembuatan.split('-');
                    formattedDate = p[2] + '-' + p[1] + '-' + p[0];
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(article.tanggalPembuatan)) {
                    formattedDate = article.tanggalPembuatan;
                } else if (typeof article.tanggalPembuatan === 'string' && article.tanggalPembuatan.includes('T')) {
                    var d = new Date(article.tanggalPembuatan);
                    if (!isNaN(d.getTime())) formattedDate = d.toISOString().split('T')[0];
                } else {
                    var d2 = new Date(article.tanggalPembuatan);
                    if (!isNaN(d2.getTime())) formattedDate = d2.toISOString().split('T')[0];
                }
            }
            tanggalPembuatanField.value = formattedDate;
            console.log('TanggalPembuatan field populated:', formattedDate, 'from original:', article.tanggalPembuatan);
        }
        
        // Tampilkan nama file foto lama di bawah input file
        const photoFileNameSpan = document.getElementById("articlePhotoFileName");
        if (photoFileNameSpan) {
            if (article.photoUrl) {
                try {
                    const urlParts = article.photoUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1].split('?')[0];
                    photoFileNameSpan.textContent = fileName;
                } catch (error) {
                    photoFileNameSpan.textContent = "File foto tersedia";
                }
            } else {
                photoFileNameSpan.textContent = "Tidak ada file";
            }
        }
        
        // Debug: Log semua field values setelah populate
        setTimeout(() => {
            const formValues = getFormValues();
            console.log('Form values after populate:', formValues);
        }, 100);
    }

    // ========== Attach Event Listeners ==========
    function attachArticleEventListeners() {
        // Gunakan class yang unik untuk artikel
        document.querySelectorAll(".artikel-edit-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Article edit button clicked:', button.dataset.id); // Debug log
                editArticleById(button.dataset.id);
            });
        });
        document.querySelectorAll(".artikel-delete-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Article delete button clicked:', button.dataset.id); // Debug log
                deleteArticle(button.dataset.id);
            });
        });
    }

    // ========== Expose to Global Scope ==========
    window.articleModule = {
        addArticle,
        editArticleById,
        deleteArticle,
        fetchArticles,
        attachArticleEventListeners,
        formatDateForInput,
        getFormValues
    };

    // --- EVENT LISTENER PENCARIAN DAN REFRESH ---
    function initializeArticleModule() {
        try {
            ensureSearchAndRefreshUI();
            fetchArticles();

            // Search
            const searchInput = document.getElementById("artikel-search-input");
            if (searchInput) {
                searchInput.addEventListener("input", (e) => {
                    const keyword = e.target.value;
                    renderArticleList(filterArticles(keyword));
                });
            }

            // Refresh
            const refreshBtn = document.getElementById("artikel-refresh-btn");
            if (refreshBtn) {
                refreshBtn.addEventListener("click", () => {
                    fetchArticles(true);
                    if (searchInput) searchInput.value = "";
                });
            }

            // Form submit (mode tambah)
            if (addFinishBtn && addContentForm) {
                addFinishBtn.addEventListener("click", function(e) {
                    // Submit form secara eksplisit
                    e.preventDefault();
                    handleFormSubmit(e);
                });
            }
            // Form submit (mode edit)
            if (updateBtn && addContentForm) {
                updateBtn.addEventListener("click", function(e) {
                    // Submit form secara eksplisit
                    e.preventDefault();
                    handleFormSubmit(e);
                });
            }
            // Cancel (mode tambah)
            if (addCancelBtn) {
                addCancelBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    resetForm();
                });
            }
            // Cancel (mode edit)
            if (cancelBtn) {
                cancelBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    resetForm();
                });
            }
        } catch (error) {
            console.error('Error initializing article module:', error);
            displayMessage(`Error inisialisasi: ${error.message}`, "danger");
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", initializeArticleModule);
    } else {
        initializeArticleModule();
    }

    // --- Tambahan: Logging error lebih detail ---
    window.addEventListener('error', function (e) {
        // Filter hanya error dari artikel module
        if (e.filename && e.filename.includes('article-selection.js')) {
            console.error('[Article Module] Global error caught:', e.message, 'at', e.filename, ':', e.lineno, ':', e.colno);
            if (typeof displayMessage === 'function') {
                displayMessage(`Terjadi kesalahan artikel: ${e.message}`, "danger");
            }
        }
    });

    // Tambahan: Error handler untuk unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.error('[Article Module] Unhandled promise rejection:', e.reason);
        if (typeof displayMessage === 'function') {
            displayMessage(`Promise error artikel: ${e.reason}`, "danger");
        }
    });

})();