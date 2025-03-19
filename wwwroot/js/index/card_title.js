// frontend/js/card_title.js
let cardData = []; // Khởi tạo rỗng, sẽ được cập nhật từ API
let currentCardData = null;

document.addEventListener('DOMContentLoaded', async function() {
    if (window.cardInitialized) return;
    window.cardInitialized = true;

    // Lấy dữ liệu cards từ server
    try {
        const response = await fetch('http://localhost:3000/api/cards');
        if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu từ API');
        cardData = await response.json();
        console.log('Card data loaded:', cardData);
        if (cardData.length === 0) console.warn('Không có dữ liệu cards!');
    } catch (error) {
        console.error('Lỗi khi lấy cardData:', error);
        cardData = []; // Đặt mặc định rỗng nếu lỗi
    }

    const cardContainer = document.querySelector('.row.row-cols-1.row-cols-md-6.g-4');
    if (!cardContainer) {
        console.error('Không tìm thấy container cho cards!');
        return;
    }

    const itemsPerPage = 24;
    const totalPages = Math.ceil(cardData.length / itemsPerPage);

    if (document.querySelector('.pagination')) {
        setupCardPagination();
        displayCardsForPage(1);
    } else {
        displayAllCards();
    }

    setupCardModalBehavior();
});

// Hàm hiển thị card cho trang cụ thể
function displayCardsForPage(pageNumber) {
    const itemsPerPage = 24;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = cardData.slice(startIndex, endIndex);

    const cardContainer = document.querySelector('.row.row-cols-1.row-cols-md-6.g-4');
    if (!cardContainer) {
        console.error('Không tìm thấy container cho cards!');
        return;
    }

    cardContainer.innerHTML = '';

    currentPageData.forEach(data => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.src = data.image || ''; // Xử lý nếu image rỗng
        img.alt = data.title;

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = data.title;

        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = data.content;

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);

        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBody);

        cardDiv.style.cursor = 'pointer';
        cardDiv.addEventListener('click', function() {
            openCardModal(data);
        });

        colDiv.appendChild(cardDiv);
        cardContainer.appendChild(colDiv);
    });
}

// Hàm hiển thị tất cả card
function displayAllCards() {
    const cardContainer = document.querySelector('.row.row-cols-1.row-cols-md-6.g-4');
    if (!cardContainer) {
        console.error('Không tìm thấy container cho cards!');
        return;
    }

    cardContainer.innerHTML = '';

    cardData.forEach(data => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.src = data.image || '';
        img.alt = data.title;

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = data.title;

        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = data.content;

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);

        cardDiv.appendChild(img);
        cardDiv.appendChild(cardBody);

        cardDiv.style.cursor = 'pointer';
        cardDiv.addEventListener('click', function() {
            openCardModal(data);
        });

        colDiv.appendChild(cardDiv);
        cardContainer.appendChild(colDiv);
    });
}

// Hàm mở modal và hiển thị thông tin card
function openCardModal(data) {
    currentCardData = data;

    const modal = document.getElementById('card');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = data.title;

    const cardImg = modalBody.querySelector('.img-fluid') || modalBody.querySelector('.card img');
    if (cardImg) {
        cardImg.src = data.image || '';
        cardImg.alt = data.title;
    }

    const cardTitle = modalBody.querySelector('.card-title');
    if (cardTitle) {
        cardTitle.textContent = data.title;
    }

    const cardTexts = modalBody.querySelectorAll('.card-text');
    if (cardTexts.length > 0) {
        cardTexts[0].textContent = data.content;
        if (cardTexts.length > 1) cardTexts[1].textContent = "Thể loại: Truyện tranh";
        if (cardTexts.length > 2) cardTexts[2].textContent = `Nội dung truyện: ${data.content}`;
    }

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Hàm thiết lập phân trang
function setupCardPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) {
        console.error('Không tìm thấy phần tử pagination!');
        return;
    }

    if (paginationContainer.hasCardPaginationSetup) return;
    paginationContainer.hasCardPaginationSetup = true;

    const paginationItems = paginationContainer.querySelectorAll('.page-item');
    const prevButton = paginationContainer.querySelector('.page-item:first-child');
    const nextButton = paginationContainer.querySelector('.page-item:last-child');
    const pageLinks = Array.from(paginationContainer.querySelectorAll('.page-item:not(:first-child):not(:last-child)'));
    const totalPages = Math.ceil(cardData.length / 24);

    pageLinks.forEach((item, index) => {
        const pageLink = item.querySelector('.page-link');
        if (pageLink && !pageLink.hasCardClickEvent) {
            pageLink.hasCardClickEvent = true;
            pageLink.addEventListener('click', function(event) {
                event.preventDefault();
                pageLinks.forEach(pageItem => pageItem.classList.remove('active'));
                item.classList.add('active');
                displayCardsForPage(index + 1);
                updateCardPrevNextState();
            });
        }
    });

    if (prevButton && !prevButton.hasCardClickEvent) {
        prevButton.hasCardClickEvent = true;
        prevButton.addEventListener('click', function(event) {
            event.preventDefault();
            if (!this.classList.contains('disabled')) {
                const activeIndex = pageLinks.findIndex(item => item.classList.contains('active'));
                if (activeIndex > 0) {
                    pageLinks[activeIndex].classList.remove('active');
                    pageLinks[activeIndex - 1].classList.add('active');
                    displayCardsForPage(activeIndex);
                    updateCardPrevNextState();
                }
            }
        });
    }

    if (nextButton && !nextButton.hasCardClickEvent) {
        nextButton.hasCardClickEvent = true;
        nextButton.addEventListener('click', function(event) {
            event.preventDefault();
            if (!this.classList.contains('disabled')) {
                const activeIndex = pageLinks.findIndex(item => item.classList.contains('active'));
                if (activeIndex < pageLinks.length - 1) {
                    pageLinks[activeIndex].classList.remove('active');
                    pageLinks[activeIndex + 1].classList.add('active');
                    displayCardsForPage(activeIndex + 2);
                    updateCardPrevNextState();
                }
            }
        });
    }

    if (pageLinks.length > 0) {
        pageLinks[0].classList.add('active');
        updateCardPrevNextState();
    }

    function updateCardPrevNextState() {
        const activeIndex = pageLinks.findIndex(item => item.classList.contains('active'));
        prevButton.classList.toggle('disabled', activeIndex <= 0);
        nextButton.classList.toggle('disabled', activeIndex >= pageLinks.length - 1);
    }
}

// Hàm thiết lập hành vi modal
function setupCardModalBehavior() {
    const docTruyenModal = document.getElementById('doctruyen');
    const cardModal = document.getElementById('card');

    if (docTruyenModal && !docTruyenModal.hasCardModalListener) {
        docTruyenModal.hasCardModalListener = true;
        docTruyenModal.addEventListener('hidden.bs.modal', function() {
            if (currentCardData) {
                const cardBsModal = new bootstrap.Modal(cardModal);
                cardBsModal.show();
            }
        });
    }

    if (cardModal && !cardModal.hasCardCloseListener) {
        cardModal.hasCardCloseListener = true;
        cardModal.addEventListener('hidden.bs.modal', function() {
            document.body.classList.remove('modal-open');
            const modalBackdrops = document.querySelectorAll('.modal-backdrop');
            modalBackdrops.forEach(backdrop => backdrop.remove());
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    }
}