/* =========================================================
   ADMIN.JS - Xử lý Quản Trị Hệ Thống & Tự Động Hóa
   Minecraft Resource Hub
   ========================================================= */

const STORAGE_KEY = 'mc_resource_hub_v3';

document.addEventListener('DOMContentLoaded', () => {
    const SECRET_PASSCODE = 'kietgottop2';

    // Elements
    const lockScreen = document.getElementById('admin-lock-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const lockForm = document.getElementById('lock-form');
    const adminPasscode = document.getElementById('admin-passcode');
    const btnAdminLogout = document.getElementById('btn-admin-logout');

    // Admin Navigation
    const adminNavBtns = document.querySelectorAll('.admin-nav-btn[data-tab]');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    // Stats Elements
    const admTotal = document.getElementById('adm-total');
    const admFixlag = document.getElementById('adm-fixlag');
    const admLitematica = document.getElementById('adm-litematica');

    // Table & Search
    const adminItemsTbody = document.getElementById('admin-items-tbody');
    const adminSearchInput = document.getElementById('admin-search-input');

    // Action Buttons
    const btnOpenAddModal = document.getElementById('btn-open-add-modal');
    const btnExportDatajs = document.getElementById('btn-export-datajs');
    const btnCopyDatajs = document.getElementById('btn-copy-datajs');

    // Resource Modal Elements
    const resourceModal = document.getElementById('resource-modal');
    const btnCloseResourceModal = document.getElementById('btn-close-resource-modal');
    const btnCancelForm = document.getElementById('btn-cancel-form');
    const resourceForm = document.getElementById('resource-form');
    const formModalTitle = document.getElementById('form-modal-title');
    const itemIdInput = document.getElementById('item-id');

    // 1-Click Category Selector Elements
    const btnCatFixlag = document.getElementById('btn-cat-fixlag');
    const btnCatLitematica = document.getElementById('btn-cat-litematica');
    const formGroupVersion = document.getElementById('form-group-version');
    const farmInfoSection = document.getElementById('farm-info-section');
    let selectedCategory = 'fixlag';

    // Form Field Elements
    const itemTitle = document.getElementById('item-title');
    const itemVersion = document.getElementById('item-version');
    const itemSize = document.getElementById('item-size');
    const itemTags = document.getElementById('item-tags');
    const suggestedTagsContainer = document.getElementById('suggested-tags-container');
    const itemImage = document.getElementById('item-image');
    const itemLink = document.getElementById('item-link');
    const itemDesc = document.getElementById('item-desc');
    const farmProfit = document.getElementById('farm-profit');
    const farmCost = document.getElementById('farm-cost');
    const farmDimensions = document.getElementById('farm-dimensions');
    const farmNotes = document.getElementById('farm-notes');

    // Preview Frame Elements
    const previewIframe = document.getElementById('preview-iframe');
    const previewFrameWrapper = document.getElementById('preview-frame-wrapper');
    const btnViewDesktop = document.getElementById('btn-view-desktop');
    const btnViewMobile = document.getElementById('btn-view-mobile');
    const btnRefreshPreview = document.getElementById('btn-refresh-preview');

    // GitHub Settings Elements
    const ghRepo = document.getElementById('gh-repo');
    const ghBranch = document.getElementById('gh-branch');
    const ghToken = document.getElementById('gh-token');
    const btnToggleTokenVisibility = document.getElementById('btn-toggle-token-visibility');
    const btnSaveGhSettings = document.getElementById('btn-save-gh-settings');
    const btnPushNow = document.getElementById('btn-push-now');

    const toastContainer = document.getElementById('toast-container');

    // =========================================================
    // 1. HỆ THỐNG XÁC THỰC BẢO MẬT (AUTHENTICATION)
    // =========================================================
    function checkAuth() {
        const isAuth = sessionStorage.getItem('mc_admin_authenticated');
        if (isAuth === 'true') {
            lockScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            loadGitHubSettings();
            renderAdminDashboard();
        } else {
            lockScreen.classList.remove('hidden');
            adminDashboard.classList.add('hidden');
        }
    }

    lockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPin = adminPasscode.value.trim();

        if (enteredPin === SECRET_PASSCODE) {
            sessionStorage.setItem('mc_admin_authenticated', 'true');
            showToast('Mở khóa quản trị thành công! Chào mừng bạn.', 'success');
            checkAuth();
        } else {
            adminPasscode.classList.add('shake-error');
            showToast('Mã bảo mật không đúng! Vui lòng thử lại.', 'error');
            setTimeout(() => {
                adminPasscode.classList.remove('shake-error');
            }, 600);
        }
    });

    btnAdminLogout.addEventListener('click', () => {
        sessionStorage.removeItem('mc_admin_authenticated');
        adminPasscode.value = '';
        checkAuth();
        showToast('Đã đăng xuất an toàn.');
    });

    // =========================================================
    // 2. TOAST NOTIFICATION
    // =========================================================
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

    // =========================================================
    // 3. QUẢN LÝ DỮ LIỆU (LOCAL STORAGE & DATA.JS)
    // =========================================================
    function getResources() {
        try {
            const local = localStorage.getItem(STORAGE_KEY);
            if (local) {
                const parsed = JSON.parse(local);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Lỗi đọc local data:', e);
        }
        return typeof resourceData !== 'undefined' ? JSON.parse(JSON.stringify(resourceData)) : [];
    }

    function saveResources(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event('storage'));
        refreshPreviewFrame();
    }

    let currentItems = getResources();

    // =========================================================
    // 4. CHUYỂN TAB ADMIN
    // =========================================================
    adminNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            adminTabContents.forEach(tab => {
                if (tab.id === targetTab) {
                    tab.classList.remove('hidden');
                } else {
                    tab.classList.add('hidden');
                }
            });

            if (targetTab === 'tab-preview') {
                refreshPreviewFrame();
            }
        });
    });

    // =========================================================
    // 5. 1-CHẠM CHỌN THỂ LOẠI (1-CLICK CATEGORY SELECTOR)
    // =========================================================
    function setCategory(cat) {
        selectedCategory = cat;
        if (cat === 'fixlag') {
            btnCatFixlag.classList.add('active');
            btnCatLitematica.classList.remove('active');
            if (formGroupVersion) formGroupVersion.style.display = 'block';
            farmInfoSection.style.display = 'none';
        } else {
            btnCatLitematica.classList.add('active');
            btnCatFixlag.classList.remove('active');
            if (formGroupVersion) formGroupVersion.style.display = 'none';
            farmInfoSection.style.display = 'block';
        }
        renderSuggestedTags();
    }

    btnCatFixlag.addEventListener('click', () => setCategory('fixlag'));
    btnCatLitematica.addEventListener('click', () => setCategory('litematica'));

    // Gợi ý thẻ tags: Chỉ hiển thị các thẻ do bạn tự tạo
    function renderSuggestedTags() {
        if (!suggestedTagsContainer) return;
        suggestedTagsContainer.innerHTML = '';

        const tags = new Set();
        currentItems.filter(i => i.category === selectedCategory).forEach(i => {
            (i.tags || []).forEach(t => {
                if (t && t.trim() !== '') tags.add(t.trim());
            });
        });

        if (tags.size === 0) {
            const label = document.createElement('span');
            label.style.fontSize = '0.8rem';
            label.style.color = 'var(--text-muted)';
            label.textContent = 'Chưa có thẻ nào. Nhập tên thẻ vào ô bên trên để tự tạo thẻ mới!';
            suggestedTagsContainer.appendChild(label);
            return;
        }

        const label = document.createElement('span');
        label.style.fontSize = '0.75rem';
        label.style.color = 'var(--text-muted)';
        label.textContent = 'Bấm nhanh các thẻ bạn đã tạo:';
        suggestedTagsContainer.appendChild(label);

        Array.from(tags).forEach(tag => {
            const chip = document.createElement('span');
            chip.style.cursor = 'pointer';
            chip.style.background = 'rgba(255,255,255,0.06)';
            chip.style.border = '1px solid rgba(255,255,255,0.1)';
            chip.style.padding = '2px 8px';
            chip.style.borderRadius = '4px';
            chip.style.fontSize = '0.75rem';
            chip.style.color = 'var(--secondary)';
            chip.textContent = `+ ${tag}`;
            chip.addEventListener('click', () => {
                const currentVals = itemTags.value.split(',').map(s => s.trim()).filter(s => s !== '');
                if (!currentVals.includes(tag)) {
                    currentVals.push(tag);
                    itemTags.value = currentVals.join(', ');
                }
            });
            suggestedTagsContainer.appendChild(chip);
        });
    }

    // =========================================================
    // 6. RENDER BẢNG QUẢN LÝ TÀI NGUYÊN
    // =========================================================
    function renderAdminDashboard() {
        currentItems = getResources();
        
        // Cập nhật thống kê
        admTotal.textContent = currentItems.length;
        admFixlag.textContent = currentItems.filter(i => i.category === 'fixlag').length;
        admLitematica.textContent = currentItems.filter(i => i.category === 'litematica').length;

        // Render Table
        renderAdminTable();
    }

    function renderAdminTable(filterKeyword = '') {
        adminItemsTbody.innerHTML = '';

        let filtered = currentItems;
        if (filterKeyword.trim() !== '') {
            const q = filterKeyword.toLowerCase();
            filtered = currentItems.filter(i => 
                (i.title && i.title.toLowerCase().includes(q)) ||
                (i.category && i.category.toLowerCase().includes(q)) ||
                (i.link && i.link.toLowerCase().includes(q)) ||
                ((i.tags || []).some(t => t.toLowerCase().includes(q)))
            );
        }

        if (filtered.length === 0) {
            adminItemsTbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Không tìm thấy tài nguyên nào phù hợp.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');

            const isFixlag = item.category === 'fixlag';
            const badgeClass = isFixlag ? 'tag-fixlag' : 'tag-litematica';
            const badgeText = isFixlag ? 'Fix Lag' : 'Litematica';

            const imgHtml = item.image && item.image.trim() !== ''
                ? `<img src="${item.image}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" onerror="this.src='https://placehold.co/48x48/1e293b/white?text=MC'">`
                : `<div style="width:48px;height:48px;border-radius:8px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;"><i class="${isFixlag ? 'fa-solid fa-gauge-high' : 'fa-solid fa-cubes'}" style="color:var(--text-muted);"></i></div>`;

            // Tags display
            const tagsHtml = (item.tags && item.tags.length > 0)
                ? item.tags.map(t => `<span style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;font-size:0.75rem;color:var(--secondary);margin-right:4px;">#${t}</span>`).join('')
                : `<span style="color:var(--text-muted);font-size:0.8rem;">Chưa gắn thẻ</span>`;

            const infoText = item.farmInfo && item.farmInfo.profit 
                ? `<div><span style="color:var(--emerald);font-weight:700;">${item.farmInfo.profit}</span>${item.farmInfo.cost ? `<div style="color:var(--amber);font-size:0.78rem;">Vốn: ${item.farmInfo.cost}</div>` : ''}</div>` 
                : `<span style="color:var(--text-muted);">${item.size || (item.version ? `Bản ${item.version}` : 'Mặc định')}</span>`;

            tr.innerHTML = `
                <td>${imgHtml}</td>
                <td>
                    <strong style="color:var(--text-main);font-size:0.95rem;">${item.title}</strong>
                </td>
                <td>
                    <span class="badge-tag ${badgeClass}">${badgeText}</span>
                </td>
                <td>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">${tagsHtml}</div>
                </td>
                <td>${infoText}</td>
                <td>
                    <a href="${item.link}" target="_blank" style="color:var(--secondary);font-size:0.85rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Link rút gọn
                    </a>
                </td>
                <td style="text-align: right;">
                    <div class="action-btn-group" style="justify-content: flex-end;">
                        <button type="button" class="btn-table-edit" data-id="${item.id}" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn-table-delete" data-id="${item.id}" title="Xóa tài nguyên">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            adminItemsTbody.appendChild(tr);
        });

        // Gán sự kiện Sửa
        document.querySelectorAll('.btn-table-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const item = currentItems.find(i => i.id === id);
                if (item) openEditModal(item);
            });
        });

        // Gán sự kiện Xóa
        document.querySelectorAll('.btn-table-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteItem(id);
            });
        });
    }

    // Tìm kiếm trong bảng quản trị
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', (e) => {
            renderAdminTable(e.target.value);
        });
    }

    // =========================================================
    // 7. FORM THÊM / SỬA TÀI NGUYÊN
    // =========================================================
    function openAddModal() {
        formModalTitle.textContent = 'Thêm Tài Nguyên Mới';
        itemIdInput.value = '';
        resourceForm.reset();
        setCategory('fixlag');
        renderSuggestedTags();
        resourceModal.classList.add('active');
    }

    function openEditModal(item) {
        formModalTitle.textContent = 'Chỉnh Sửa Tài Nguyên';
        itemIdInput.value = item.id;
        
        setCategory(item.category || 'fixlag');
        itemTitle.value = item.title || '';
        itemVersion.value = item.version || '';
        itemSize.value = item.size || '';
        itemTags.value = (item.tags || []).join(', ');
        itemImage.value = item.image || '';
        itemLink.value = item.link || '';
        itemDesc.value = item.description || '';

        if (item.farmInfo) {
            farmProfit.value = item.farmInfo.profit || '';
            farmCost.value = item.farmInfo.cost || '';
            farmDimensions.value = item.farmInfo.dimensions || '';
            farmNotes.value = item.farmInfo.notes || '';
        } else {
            farmProfit.value = '';
            farmCost.value = '';
            farmDimensions.value = '';
            farmNotes.value = '';
        }

        renderSuggestedTags();
        resourceModal.classList.add('active');
    }

    function closeResourceModal() {
        resourceModal.classList.remove('active');
    }

    btnOpenAddModal.addEventListener('click', openAddModal);
    btnCloseResourceModal.addEventListener('click', closeResourceModal);
    btnCancelForm.addEventListener('click', closeResourceModal);

    // Xử lý Lưu Form
    resourceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = itemIdInput.value.trim() || `${selectedCategory}-${Date.now()}`;
        const title = itemTitle.value.trim();
        const version = selectedCategory === 'fixlag' ? itemVersion.value.trim() : '';
        const size = itemSize.value.trim();
        const image = itemImage.value.trim();
        const link = itemLink.value.trim();
        const description = itemDesc.value.trim();

        // Tách danh sách tags do người dùng tự nhập
        const tags = itemTags.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t !== '');

        let farmInfo = null;
        if (selectedCategory === 'litematica') {
            farmInfo = {
                profit: farmProfit.value.trim() || 'N/A',
                cost: farmCost.value.trim() || '0đ (Miễn phí)',
                dimensions: farmDimensions.value.trim() || 'N/A',
                notes: farmNotes.value.trim() || description
            };
        }

        const resourceObj = {
            id,
            category: selectedCategory,
            title,
            description,
            size,
            image,
            link,
            tags: tags // Chỉ nhận các tag người dùng tự nhập
        };

        if (selectedCategory === 'fixlag' && version) {
            resourceObj.version = version;
        }

        if (farmInfo) {
            resourceObj.farmInfo = farmInfo;
        }

        const existingIndex = currentItems.findIndex(i => i.id === id);
        if (existingIndex > -1) {
            currentItems[existingIndex] = resourceObj;
            showToast('Đã cập nhật thông tin tài nguyên thành công!');
        } else {
            currentItems.unshift(resourceObj);
            showToast('Đã thêm tài nguyên mới thành công!');
        }

        saveResources(currentItems);
        renderAdminDashboard();
        closeResourceModal();
    });

    // Xóa item
    function deleteItem(id) {
        const item = currentItems.find(i => i.id === id);
        if (!item) return;

        if (confirm(`Bạn có chắc chắn muốn xóa "${item.title}" khỏi hệ thống không?`)) {
            currentItems = currentItems.filter(i => i.id !== id);
            saveResources(currentItems);
            renderAdminDashboard();
            showToast(`Đã xóa "${item.title}"!`);
        }
    }

    // =========================================================
    // 8. XUẤT VÀ SAO CHÉP FILE DATA.JS (EXPORT DATA.JS)
    // =========================================================
    function generateDataJsContent() {
        return `/* =========================================================
   DATA.JS - Cơ sở dữ liệu Resource Hub
   Minecraft Fix Lag & Bản vẽ Litematica
   Được cập nhật tự động bởi Minecraft Admin Portal
   ========================================================= */

const resourceData = ${JSON.stringify(currentItems, null, 4)};

// Xuất biến cho các module khác nếu cần
if (typeof module !== 'undefined' && module.exports) {
    module.exports = resourceData;
}
`;
    }

    btnExportDatajs.addEventListener('click', () => {
        const content = generateDataJsContent();
        const blob = new Blob([content], { type: 'text/javascript;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Đã tải xuống file data.js thành công!');
    });

    btnCopyDatajs.addEventListener('click', () => {
        const content = generateDataJsContent();
        navigator.clipboard.writeText(content).then(() => {
            showToast('Đã sao chép toàn bộ mã data.js vào clipboard!');
        }).catch(() => {
            showToast('Không thể tự động sao chép mã!', 'error');
        });
    });

    // =========================================================
    // 9. XEM TRƯỚC TRANG KHÁCH (LIVE CLIENT PREVIEW)
    // =========================================================
    function refreshPreviewFrame() {
        if (previewIframe) {
            previewIframe.src = 'index.html?v=' + Date.now();
        }
    }

    btnRefreshPreview.addEventListener('click', () => {
        refreshPreviewFrame();
        showToast('Đã làm mới giao diện xem trước!');
    });

    btnViewDesktop.addEventListener('click', () => {
        btnViewDesktop.classList.add('active');
        btnViewMobile.classList.remove('active');
        previewFrameWrapper.classList.remove('mobile-view');
    });

    btnViewMobile.addEventListener('click', () => {
        btnViewMobile.classList.add('active');
        btnViewDesktop.classList.remove('active');
        previewFrameWrapper.classList.add('mobile-view');
    });

    // =========================================================
    // 10. TỰ ĐỘNG ĐẨY LÊN GITHUB & VERCEL (GITHUB API AUTO-SYNC)
    // =========================================================
    function loadGitHubSettings() {
        ghRepo.value = localStorage.getItem('mc_gh_repo') || 'shopwarlergen/mc';
        ghBranch.value = localStorage.getItem('mc_gh_branch') || 'main';
        ghToken.value = localStorage.getItem('mc_gh_token') || '';
    }

    btnSaveGhSettings.addEventListener('click', () => {
        localStorage.setItem('mc_gh_repo', ghRepo.value.trim());
        localStorage.setItem('mc_gh_branch', ghBranch.value.trim());
        localStorage.setItem('mc_gh_token', ghToken.value.trim());
        showToast('Đã lưu cấu hình GitHub Token an toàn!');
    });

    btnToggleTokenVisibility.addEventListener('click', () => {
        if (ghToken.type === 'password') {
            ghToken.type = 'text';
            btnToggleTokenVisibility.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
            ghToken.type = 'password';
            btnToggleTokenVisibility.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    });

    // Hàm gọi GitHub REST API để tự động Commit file data.js
    async function pushToGitHub() {
        const repo = ghRepo.value.trim();
        const branch = ghBranch.value.trim();
        const token = ghToken.value.trim();

        if (!token) {
            showToast('Vui lòng nhập GitHub Personal Access Token trước!', 'error');
            return;
        }

        const filePath = 'data.js';
        const fileContent = generateDataJsContent();
        
        // Encode utf-8 to base64
        const contentBase64 = btoa(unescape(encodeURIComponent(fileContent)));

        showToast('Đang kết nối và đẩy dữ liệu lên GitHub...');

        try {
            // Bước 1: Lấy file SHA hiện tại từ GitHub
            let currentSha = null;
            const getFileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}&_t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (getFileRes.ok) {
                const fileData = await getFileRes.json();
                currentSha = fileData.sha;
            }

            // Bước 2: Gửi request PUT để tạo commit mới
            const payload = {
                message: `Cập nhật Resource Hub [${new Date().toLocaleString('vi-VN')}]`,
                content: contentBase64,
                branch: branch
            };

            if (currentSha) {
                payload.sha = currentSha;
            }

            const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            });

            if (putRes.ok) {
                showToast('🚀 Đã đẩy lên GitHub thành công! Vercel đang cập nhật website tự động.', 'success');
            } else {
                const errData = await putRes.json();
                console.error('GitHub API Error:', errData);
                showToast(`Lỗi GitHub: ${errData.message || 'Không thể commit file'}`, 'error');
            }
        } catch (err) {
            console.error('Lỗi khi đẩy lên GitHub:', err);
            showToast('Lỗi mạng hoặc không thể kết nối tới GitHub API!', 'error');
        }
    }

    btnPushNow.addEventListener('click', pushToGitHub);

    // Khởi chạy kiểm tra đăng nhập
    checkAuth();
});
