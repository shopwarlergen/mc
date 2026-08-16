/* =========================================================
   SCRIPT.JS - Xử lý Logic Tìm kiếm, Bộ lọc & Hiển thị
   Minecraft Resource Hub
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải và kết hợp dữ liệu (data.js + LocalStorage nếu có cập nhật từ admin)
    function getAllResources() {
        try {
            const localData = localStorage.getItem('mc_custom_resources');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Lỗi đọc dữ liệu từ LocalStorage:', e);
        }
        return typeof resourceData !== 'undefined' ? resourceData : [];
    }

    let allItems = getAllResources();
    let currentCategory = 'all';
    let currentVersion = 'all';
    let currentTag = 'all';
    let currentSort = 'default';
    let searchQuery = '';

    // DOM Elements
    const cardsContainer = document.getElementById('cards-container');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const categoryTabs = document.querySelectorAll('#category-tabs .tab-btn');
    const versionSelect = document.getElementById('filter-version');
    const sortSelect = document.getElementById('filter-sort');
    const tagChips = document.querySelectorAll('#tag-chips-container .chip-btn');
    const toastContainer = document.getElementById('toast-container');

    // Detail Modal Elements
    const detailModal = document.getElementById('detail-modal');
    const btnCloseDetailModal = document.getElementById('btn-close-detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalImg = document.getElementById('modal-img');
    const modalImageContainer = document.getElementById('modal-image-container');
    const modalYield = document.getElementById('modal-yield');
    const modalDimensions = document.getElementById('modal-dimensions');
    const modalDifficulty = document.getElementById('modal-difficulty');
    const modalVersion = document.getElementById('modal-version');
    const modalMaterials = document.getElementById('modal-materials');
    const modalNotes = document.getElementById('modal-notes');
    const modalDownloadBtn = document.getElementById('modal-download-btn');
    const btnCopyModalLink = document.getElementById('btn-copy-modal-link');

    let activeModalItem = null;

    // Toast Notification System
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
        toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 2. Cập nhật số lượng thống kê
    function updateStats() {
        const totalCount = allItems.length;
        const fixlagCount = allItems.filter(i => i.category === 'fixlag').length;
        const litematicaCount = allItems.filter(i => i.category === 'litematica').length;

        // Banner Stats
        const statTotal = document.getElementById('stat-total');
        const statFixlag = document.getElementById('stat-fixlag');
        const statLitematica = document.getElementById('stat-litematica');
        if (statTotal) statTotal.textContent = totalCount;
        if (statFixlag) statFixlag.textContent = fixlagCount;
        if (statLitematica) statLitematica.textContent = litematicaCount;

        // Tab Badges
        const countAll = document.getElementById('count-all');
        const countFixlag = document.getElementById('count-fixlag');
        const countLitematica = document.getElementById('count-litematica');
        if (countAll) countAll.textContent = totalCount;
        if (countFixlag) countFixlag.textContent = fixlagCount;
        if (countLitematica) countLitematica.textContent = litematicaCount;
    }

    // 3. Tự động trích xuất các phiên bản Minecraft vào Dropdown
    function populateVersions() {
        const versions = new Set();
        allItems.forEach(item => {
            if (item.version && item.version.trim() !== '') {
                versions.add(item.version.trim());
            }
        });

        // Giữ lại option "all"
        versionSelect.innerHTML = '<option value="all">Tất cả phiên bản</option>';
        Array.from(versions).sort().reverse().forEach(ver => {
            const opt = document.createElement('option');
            opt.value = ver;
            opt.textContent = `Phiên bản: ${ver}`;
            versionSelect.appendChild(opt);
        });
    }

    // 4. Lọc và Hiển Thị Danh Sách Thẻ Card
    function renderCards() {
        cardsContainer.innerHTML = '';

        let filtered = allItems.filter(item => {
            // Lọc theo thể loại (Category)
            if (currentCategory !== 'all' && item.category !== currentCategory) {
                return false;
            }

            // Lọc theo phiên bản (Version)
            if (currentVersion !== 'all' && item.version !== currentVersion) {
                return false;
            }

            // Lọc theo tag
            if (currentTag !== 'all') {
                const itemTags = item.tags || [];
                const hasTag = itemTags.some(t => t.toLowerCase().includes(currentTag.toLowerCase()));
                const inTitleOrDesc = (item.title + ' ' + (item.description || '')).toLowerCase().includes(currentTag.toLowerCase());
                if (!hasTag && !inTitleOrDesc) {
                    return false;
                }
            }

            // Tìm kiếm theo từ khóa (Search Query)
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false;
                const descMatch = item.description ? item.description.toLowerCase().includes(q) : false;
                const verMatch = item.version ? item.version.toLowerCase().includes(q) : false;
                const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
                
                let farmMatch = false;
                if (item.farmInfo) {
                    const farmStr = `${item.farmInfo.yield || ''} ${item.farmInfo.materials || ''} ${item.farmInfo.notes || ''}`.toLowerCase();
                    farmMatch = farmStr.includes(q);
                }

                if (!titleMatch && !descMatch && !verMatch && !tagMatch && !farmMatch) {
                    return false;
                }
            }

            return true;
        });

        // Sắp xếp (Sorting)
        if (currentSort === 'name-asc') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (currentSort === 'name-desc') {
            filtered.sort((a, b) => b.title.localeCompare(a.title));
        }

        // Trạng thái trống (Empty State)
        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        // Tạo thẻ Card cho từng item
        filtered.forEach(item => {
            const cardEl = document.createElement('article');
            cardEl.className = 'card';

            const isFixlag = item.category === 'fixlag';
            const tagClass = isFixlag ? 'tag-fixlag' : 'tag-litematica';
            const tagLabel = isFixlag ? 'Fix Lag FPS' : 'Litematica';

            // Xử lý ảnh đại diện
            let imageHTML = '';
            if (item.image && item.image.trim() !== '') {
                imageHTML = `
                    <div class="card-image-wrapper">
                        <img src="${item.image}" alt="${item.title}" class="card-img" loading="lazy" 
                             onerror="this.parentElement.innerHTML='<div class=\\'card-image-wrapper\\'><i class=\\'${isFixlag ? 'fa-solid fa-gauge-high' : 'fa-solid fa-cubes'}\\' style=\\'font-size:3.5rem;color:rgba(255,255,255,0.15)\\'></i></div>'">
                        <div class="card-top-badges">
                            <span class="badge-tag ${tagClass}">${tagLabel}</span>
                            <span class="badge-version">${item.version || 'Mọi phiên bản'}</span>
                        </div>
                    </div>
                `;
            } else {
                imageHTML = `
                    <div class="card-image-wrapper">
                        <i class="${isFixlag ? 'fa-solid fa-gauge-high' : 'fa-solid fa-cubes'} card-placeholder-icon"></i>
                        <div class="card-top-badges">
                            <span class="badge-tag ${tagClass}">${tagLabel}</span>
                            <span class="badge-version">${item.version || 'Mọi phiên bản'}</span>
                        </div>
                    </div>
                `;
            }

            // Xử lý khối thông số máy farm nếu có
            let farmSnippetHTML = '';
            if (item.farmInfo && item.farmInfo.yield) {
                farmSnippetHTML = `
                    <div class="farm-specs-box">
                        <div class="spec-line">
                            <span class="spec-label"><i class="fa-solid fa-bolt-lightning"></i> Năng suất:</span>
                            <span class="spec-value yield-highlight">${item.farmInfo.yield}</span>
                        </div>
                        ${item.farmInfo.difficulty ? `
                        <div class="spec-line">
                            <span class="spec-label"><i class="fa-solid fa-shield-halved"></i> Độ khó:</span>
                            <span class="spec-value">${item.farmInfo.difficulty}</span>
                        </div>` : ''}
                    </div>
                `;
            }

            cardEl.innerHTML = `
                ${imageHTML}
                <div class="card-body">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-desc">${item.description || 'Chưa có mô tả chi tiết cho mục này.'}</p>
                    
                    ${farmSnippetHTML}

                    <div class="card-meta-bar">
                        <span class="meta-item"><i class="fa-solid fa-hard-drive"></i> ${item.size || 'Dung lượng nhẹ'}</span>
                        <span class="meta-item"><i class="fa-solid fa-shield-check"></i> Đã quét sạch an toàn</span>
                    </div>

                    <div class="card-actions">
                        ${item.farmInfo ? `
                            <button type="button" class="btn-detail btn-open-detail" data-id="${item.id}" title="Xem bảng nguyên liệu & thông số">
                                <i class="fa-solid fa-circle-info"></i> Chi tiết
                            </button>
                        ` : ''}
                        <button type="button" class="btn-download btn-download-trigger" data-link="${item.link}">
                            <i class="fa-solid fa-download"></i> Tải Về Ngay
                        </button>
                    </div>
                </div>
            `;

            cardsContainer.appendChild(cardEl);
        });

        // Gán sự kiện cho các nút Download (Chuyển trực tiếp đến link kiếm tiền rút gọn)
        document.querySelectorAll('.btn-download-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const link = e.currentTarget.getAttribute('data-link');
                if (link && link.trim() !== '' && !link.includes('link-rut-gon-cua-ban.com')) {
                    window.location.href = link;
                } else {
                    showToast('Link rút gọn đang được cập nhật, vui lòng thử lại sau!', 'error');
                }
            });
        });

        // Gán sự kiện mở Modal Chi Tiết
        document.querySelectorAll('.btn-open-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-id');
                const item = allItems.find(i => i.id === itemId);
                if (item) {
                    openDetailModal(item);
                }
            });
        });
    }

    // 5. Modal Xem Chi Tiết Bản Vẽ
    function openDetailModal(item) {
        activeModalItem = item;
        modalTitle.textContent = item.title;
        modalVersion.textContent = item.version || '1.21+';

        if (item.image && item.image.trim() !== '') {
            modalImg.src = item.image;
            modalImageContainer.style.display = 'flex';
        } else {
            modalImageContainer.style.display = 'none';
        }

        if (item.farmInfo) {
            modalYield.textContent = item.farmInfo.yield || 'N/A';
            modalDimensions.textContent = item.farmInfo.dimensions || 'N/A';
            modalDifficulty.textContent = item.farmInfo.difficulty || 'Trung bình';
            modalMaterials.textContent = item.farmInfo.materials || 'Chưa cập nhật danh sách nguyên liệu cụ thể.';
            modalNotes.textContent = item.farmInfo.notes || item.description || 'Không có ghi chú thêm.';
        } else {
            modalYield.textContent = 'Tối ưu hiệu suất';
            modalDimensions.textContent = 'Mọi kích thước';
            modalDifficulty.textContent = 'Cài đặt dễ dàng';
            modalMaterials.textContent = 'Cần cài đặt Fabric Loader và thư mục mods.';
            modalNotes.textContent = item.description || 'Tối ưu hóa game Minecraft.';
        }

        modalDownloadBtn.href = item.link || '#';
        detailModal.classList.add('active');
    }

    function closeDetailModal() {
        detailModal.classList.remove('active');
        activeModalItem = null;
    }

    if (btnCloseDetailModal) {
        btnCloseDetailModal.addEventListener('click', closeDetailModal);
    }

    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) closeDetailModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailModal && detailModal.classList.contains('active')) {
            closeDetailModal();
        }
    });

    if (btnCopyModalLink) {
        btnCopyModalLink.addEventListener('click', () => {
            if (activeModalItem && activeModalItem.link) {
                navigator.clipboard.writeText(activeModalItem.link).then(() => {
                    showToast('Đã sao chép link tải rút gọn vào clipboard!');
                }).catch(() => {
                    showToast('Không thể sao chép tự động!', 'error');
                });
            }
        });
    }

    // 6. Xử lý Tab Thể Loại
    categoryTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderCards();
        });
    });

    // 7. Xử lý Tìm Kiếm Tức Thì (Real-time Instant Search)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (searchQuery.trim() !== '') {
                btnClearSearch.style.display = 'block';
            } else {
                btnClearSearch.style.display = 'none';
            }
            renderCards();
        });
    }

    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            btnClearSearch.style.display = 'none';
            searchInput.focus();
            renderCards();
        });
    }

    // 8. Xử lý Dropdown Phiên Bản & Sắp Xếp
    if (versionSelect) {
        versionSelect.addEventListener('change', (e) => {
            currentVersion = e.target.value;
            renderCards();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderCards();
        });
    }

    // 9. Xử lý Tag Chips
    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            tagChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentTag = chip.getAttribute('data-tag');
            renderCards();
        });
    });

    // Lắng nghe sự thay đổi dữ liệu từ tab Admin
    window.addEventListener('storage', (e) => {
        if (e.key === 'mc_custom_resources') {
            allItems = getAllResources();
            updateStats();
            populateVersions();
            renderCards();
        }
    });

    // Khởi chạy ban đầu
    updateStats();
    populateVersions();
    renderCards();
});
