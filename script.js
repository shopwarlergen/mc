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
    let currentCategory = 'fixlag'; // Mặc định mở mục Fix Lag
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
    const versionFilterWrapper = document.getElementById('version-filter-wrapper');
    const sortSelect = document.getElementById('filter-sort');
    const tagChipsContainer = document.getElementById('tag-chips-container');
    const toastContainer = document.getElementById('toast-container');

    // Detail Modal Elements
    const detailModal = document.getElementById('detail-modal');
    const btnCloseDetailModal = document.getElementById('btn-close-detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalImg = document.getElementById('modal-img');
    const modalImageContainer = document.getElementById('modal-image-container');
    const modalProfit = document.getElementById('modal-profit');
    const modalCost = document.getElementById('modal-cost');
    const modalDimensions = document.getElementById('modal-dimensions');
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
        const fixlagCount = allItems.filter(i => i.category === 'fixlag').length;
        const litematicaCount = allItems.filter(i => i.category === 'litematica').length;

        const statFixlag = document.getElementById('stat-fixlag');
        const statLitematica = document.getElementById('stat-litematica');
        if (statFixlag) statFixlag.textContent = fixlagCount;
        if (statLitematica) statLitematica.textContent = litematicaCount;

        const countFixlag = document.getElementById('count-fixlag');
        const countLitematica = document.getElementById('count-litematica');
        if (countFixlag) countFixlag.textContent = fixlagCount;
        if (countLitematica) countLitematica.textContent = litematicaCount;
    }

    // 3. Tự động sinh danh sách Thẻ Tag động (Chỉ hiển thị khi có thẻ do người dùng tự tạo)
    function renderTagChips() {
        if (!tagChipsContainer) return;
        tagChipsContainer.innerHTML = '';

        const tags = new Set();
        allItems.filter(i => i.category === currentCategory).forEach(item => {
            (item.tags || []).forEach(t => {
                if (t && t.trim() !== '') tags.add(t.trim());
            });
        });

        // Nếu chưa có thẻ nào được tạo, ẩn vùng tag chips
        if (tags.size === 0) {
            tagChipsContainer.style.display = 'none';
            return;
        } else {
            tagChipsContainer.style.display = 'flex';
        }

        // Nút "Tất cả thẻ"
        const allBtn = document.createElement('button');
        allBtn.className = `chip-btn ${currentTag === 'all' ? 'active' : ''}`;
        allBtn.setAttribute('data-tag', 'all');
        allBtn.textContent = 'Tất cả thẻ';
        allBtn.addEventListener('click', () => {
            currentTag = 'all';
            updateActiveChip();
            renderCards();
        });
        tagChipsContainer.appendChild(allBtn);

        // Render từng nút tag
        Array.from(tags).sort().forEach(tag => {
            const btn = document.createElement('button');
            btn.className = `chip-btn ${currentTag === tag ? 'active' : ''}`;
            btn.setAttribute('data-tag', tag);
            btn.textContent = tag;
            btn.addEventListener('click', () => {
                currentTag = tag;
                updateActiveChip();
                renderCards();
            });
            tagChipsContainer.appendChild(btn);
        });
    }

    function updateActiveChip() {
        if (!tagChipsContainer) return;
        const chips = tagChipsContainer.querySelectorAll('.chip-btn');
        chips.forEach(chip => {
            if (chip.getAttribute('data-tag') === currentTag) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    // 4. Trích xuất danh sách phiên bản Minecraft cho mục Fix Lag
    function populateVersions() {
        const versions = new Set();
        allItems.forEach(item => {
            if (item.category === 'fixlag' && item.version && item.version.trim() !== '') {
                versions.add(item.version.trim());
            }
        });

        versionSelect.innerHTML = '<option value="all">Tất cả phiên bản</option>';
        Array.from(versions).sort().reverse().forEach(ver => {
            const opt = document.createElement('option');
            opt.value = ver;
            opt.textContent = `Phiên bản: ${ver}`;
            versionSelect.appendChild(opt);
        });
    }

    // 5. Lọc và Hiển Thị Danh Sách Thẻ Card
    function renderCards() {
        cardsContainer.innerHTML = '';

        // Ẩn dropdown phiên bản nếu người dùng đang ở tab Litematica
        if (currentCategory === 'litematica') {
            versionFilterWrapper.style.display = 'none';
        } else {
            versionFilterWrapper.style.display = 'flex';
        }

        let filtered = allItems.filter(item => {
            // Lọc theo thể loại (Category)
            if (item.category !== currentCategory) {
                return false;
            }

            // Lọc theo phiên bản (Chỉ áp dụng cho Fix Lag)
            if (item.category === 'fixlag' && currentVersion !== 'all' && item.version !== currentVersion) {
                return false;
            }

            // Lọc theo tag
            if (currentTag !== 'all') {
                const itemTags = item.tags || [];
                const hasTag = itemTags.some(t => t.toLowerCase() === currentTag.toLowerCase());
                if (!hasTag) {
                    return false;
                }
            }

            // Tìm kiếm theo từ khóa (Search Query)
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false;
                const descMatch = item.description ? item.description.toLowerCase().includes(q) : false;
                const verMatch = (item.version && item.category === 'fixlag') ? item.version.toLowerCase().includes(q) : false;
                const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
                
                let farmMatch = false;
                if (item.farmInfo) {
                    const farmStr = `${item.farmInfo.profit || ''} ${item.farmInfo.cost || ''} ${item.farmInfo.dimensions || ''} ${item.farmInfo.notes || ''}`.toLowerCase();
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

            // Version badge
            const versionBadgeHTML = isFixlag 
                ? `<span class="badge-version">${item.version || 'Mọi phiên bản'}</span>` 
                : `<span class="badge-version" style="background: rgba(139, 92, 246, 0.2); border-color: var(--primary);"><i class="fa-solid fa-cubes"></i> Bản vẽ</span>`;

            // Xử lý ảnh đại diện
            let imageHTML = '';
            if (item.image && item.image.trim() !== '') {
                imageHTML = `
                    <div class="card-image-wrapper">
                        <img src="${item.image}" alt="${item.title}" class="card-img" loading="lazy" 
                             onerror="this.parentElement.innerHTML='<div class=\\'card-image-wrapper\\'><i class=\\'${isFixlag ? 'fa-solid fa-gauge-high' : 'fa-solid fa-cubes'}\\' style=\\'font-size:3.5rem;color:rgba(255,255,255,0.15)\\'></i></div>'">
                        <div class="card-top-badges">
                            <span class="badge-tag ${tagClass}">${tagLabel}</span>
                            ${versionBadgeHTML}
                        </div>
                    </div>
                `;
            } else {
                imageHTML = `
                    <div class="card-image-wrapper">
                        <i class="${isFixlag ? 'fa-solid fa-gauge-high' : 'fa-solid fa-cubes'} card-placeholder-icon"></i>
                        <div class="card-top-badges">
                            <span class="badge-tag ${tagClass}">${tagLabel}</span>
                            ${versionBadgeHTML}
                        </div>
                    </div>
                `;
            }

            // Xử lý khối thông số máy farm (Lợi nhuận & Vốn vận hành)
            let farmSnippetHTML = '';
            if (item.farmInfo) {
                farmSnippetHTML = `
                    <div class="farm-specs-box">
                        ${item.farmInfo.profit ? `
                        <div class="spec-line">
                            <span class="spec-label"><i class="fa-solid fa-chart-line"></i> Lợi nhuận:</span>
                            <span class="spec-value yield-highlight">${item.farmInfo.profit}</span>
                        </div>` : ''}
                        ${item.farmInfo.cost ? `
                        <div class="spec-line">
                            <span class="spec-label"><i class="fa-solid fa-coins"></i> Vốn vận hành:</span>
                            <span class="spec-value" style="color: var(--amber);">${item.farmInfo.cost}</span>
                        </div>` : ''}
                    </div>
                `;
            }

            // Hiển thị tags trên card nếu có
            let tagsHTML = '';
            if (item.tags && item.tags.length > 0) {
                tagsHTML = `
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                        ${item.tags.map(t => `<span style="background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--text-sub); border: 1px solid rgba(255,255,255,0.06);"><i class="fa-solid fa-tag" style="font-size: 0.65rem; color: var(--secondary);"></i> ${t}</span>`).join('')}
                    </div>
                `;
            }

            cardEl.innerHTML = `
                ${imageHTML}
                <div class="card-body">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-desc">${item.description || 'Chưa có mô tả chi tiết cho mục này.'}</p>
                    
                    ${tagsHTML}
                    ${farmSnippetHTML}

                    <div class="card-meta-bar">
                        <span class="meta-item"><i class="fa-solid fa-hard-drive"></i> ${item.size || 'Dung lượng nhẹ'}</span>
                        <span class="meta-item"><i class="fa-solid fa-shield-check"></i> Đã quét sạch an toàn</span>
                    </div>

                    <div class="card-actions">
                        ${item.farmInfo ? `
                            <button type="button" class="btn-detail btn-open-detail" data-id="${item.id}" title="Xem bảng thông số & lợi nhuận">
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

    // 6. Modal Xem Chi Tiết Bản Vẽ
    function openDetailModal(item) {
        activeModalItem = item;
        modalTitle.textContent = item.title;

        if (item.image && item.image.trim() !== '') {
            modalImg.src = item.image;
            modalImageContainer.style.display = 'flex';
        } else {
            modalImageContainer.style.display = 'none';
        }

        if (item.farmInfo) {
            modalProfit.textContent = item.farmInfo.profit || 'N/A';
            modalCost.textContent = item.farmInfo.cost || 'Miễn phí';
            modalDimensions.textContent = item.farmInfo.dimensions || 'N/A';
            modalNotes.textContent = item.farmInfo.notes || item.description || 'Không có ghi chú thêm.';
        } else {
            modalProfit.textContent = 'Tối ưu hiệu suất';
            modalCost.textContent = 'Miễn phí';
            modalDimensions.textContent = 'Mọi kích thước';
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

    // 7. Xử lý Tab Thể Loại (Chuyển giữa Fix Lag và Litematica)
    categoryTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            currentTag = 'all'; // Reset tag filter khi đổi danh mục
            renderTagChips();
            renderCards();
        });
    });

    // 8. Xử lý Tìm Kiếm Tức Thì (Real-time Instant Search)
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

    // 9. Xử lý Dropdown Phiên Bản & Sắp Xếp
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

    // Lắng nghe sự thay đổi dữ liệu từ tab Admin
    window.addEventListener('storage', (e) => {
        if (e.key === 'mc_custom_resources') {
            allItems = getAllResources();
            updateStats();
            populateVersions();
            renderTagChips();
            renderCards();
        }
    });

    // Khởi chạy ban đầu
    updateStats();
    populateVersions();
    renderTagChips();
    renderCards();
});
