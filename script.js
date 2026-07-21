/* =========================================================
   SCRIPT.JS - Logic hiển thị, chuyển tab & chuyển hướng Link
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    let currentCategory = 'fixlag';

    const cardsContainer = document.getElementById('cards-container');
    const emptyState = document.getElementById('empty-state');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const countFixlag = document.getElementById('count-fixlag');
    const countLitematica = document.getElementById('count-litematica');

    // Cập nhật số lượng badge
    function updateCounts() {
        const fixlagCount = resourceData.filter(item => item.category === 'fixlag').length;
        const litematicaCount = resourceData.filter(item => item.category === 'litematica').length;
        
        countFixlag.textContent = fixlagCount;
        countLitematica.textContent = litematicaCount;
    }

    // Render danh sách các Card
    function renderCards(category) {
        cardsContainer.innerHTML = '';
        const filteredData = resourceData.filter(item => item.category === category);

        if (filteredData.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        filteredData.forEach(item => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';

            // Kiểm tra xem có ảnh hay không
            let imageHTML = '';
            if (item.image && item.image.trim() !== '') {
                imageHTML = `
                    <div class="card-image-wrapper">
                        <img src="${item.image}" alt="${item.title}" class="card-img" onerror="this.parentElement.innerHTML='<div class=\'card-image-wrapper\'><i class=\'fa-solid fa-file-code card-placeholder-icon\'></i></div>'">
                    </div>
                `;
            } else {
                const iconClass = item.category === 'fixlag' ? 'fa-solid fa-gauge-high' : 'fa-solid fa-cubes';
                imageHTML = `
                    <div class="card-image-wrapper">
                        <i class="${iconClass} card-placeholder-icon"></i>
                    </div>
                `;
            }

            const tagClass = item.category === 'fixlag' ? 'tag-fixlag' : 'tag-litematica';
            const tagLabel = item.category === 'fixlag' ? 'FIX LAG' : 'LITEMATICA';

            cardEl.innerHTML = `
                ${imageHTML}
                <div class="card-body">
                    <div class="card-header">
                        <h3 class="card-title">${item.title}</h3>
                        <span class="card-tag ${tagClass}">${tagLabel}</span>
                    </div>
                    <p class="card-desc">${item.description}</p>
                    <div class="card-info">
                        <div class="info-item"><i class="fa-solid fa-code-branch"></i> ${item.version || 'Mọi phiên bản'}</div>
                        <div class="info-item"><i class="fa-solid fa-hard-drive"></i> ${item.size || 'N/A'}</div>
                    </div>
                    <button class="btn-download" data-link="${item.link}">
                        <i class="fa-solid fa-download"></i> Tải Về Ngay
                    </button>
                </div>
            `;

            cardsContainer.appendChild(cardEl);
        });

        // Gán sự kiện click nút Tải Về mở link rút gọn ngay tại tab hiện tại
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const link = e.currentTarget.getAttribute('data-link');
                if (link && link !== '') {
                    // Chuyển hướng trực tiếp không mở tab mới theo yêu cầu
                    window.location.href = link;
                } else {
                    alert('Chưa cấu hình link tải cho file này!');
                }
            });
        });
    }

    // Sự kiện chuyển Tab
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderCards(currentCategory);
        });
    });

    // Khởi tạo
    updateCounts();
    renderCards(currentCategory);
});
