document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initApp();
});

const state = {
    currentItem: null,
    menuData: null,
};

async function initApp() {

    document.body.classList.add('loading');
    runLandingAnimation();

    try {
        // Simulate a delay for demonstration purposes
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await fetch('data/menu.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        state.menuData = await response.json();
        renderMenu();
        setupEventListeners();
        setupScrollSpy();
        setupScrollAnimations();
    } catch (error) {
        console.error("Could not load menu data:", error);
        const menuContent = document.getElementById('menu-content');
        if (menuContent) {
            menuContent.innerHTML = '<p class="text-center text-red-500">Failed to load menu. Please try again later.</p>';
        }
    } finally {

        document.body.classList.remove('loading');

    }
}

function renderMenu() {
    const menuContent = document.getElementById('menu-content');
    const categoryLinksContainer = document.getElementById('category-links');
    if (!menuContent || !categoryLinksContainer || !state.menuData) return;

    menuContent.innerHTML = '';
    categoryLinksContainer.innerHTML = '';

    state.menuData.menu_categories.forEach(category => {
        const link = document.createElement('a');
        link.href = `#category-${category.category_name.toLowerCase().replace(/ /g, '-')}`;
        link.textContent = category.category_name;
        link.className = 'category-link text-coffee-light font-medium py-2 px-1 text-lg';
        categoryLinksContainer.appendChild(link);

        const section = document.createElement('section');
        section.id = `category-${category.category_name.toLowerCase().replace(/ /g, '-')}`;
        section.className = 'mb-16';

        const title = document.createElement('h2');
        title.className = 'font-display text-4xl md:text-5xl font-bold text-coffee-dark mb-8 border-b-2 border-tan pb-4';
        title.textContent = category.category_name;
        title.dataset.animation = 'slide-in-left';
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8';
        
        category.items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer flex flex-col';
            card.dataset.itemId = item.id;
            card.dataset.categoryName = category.category_name;
            card.dataset.animation = 'reveal';

            if (item.image) {
                card.innerHTML = `
                    <div class="h-48 bg-tan">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="p-4 flex-grow flex flex-col justify-between">
                        <h3 class="text-xl font-semibold text-coffee-dark">${item.name}</h3>
                    </div>
                `;
            } else {
                 card.innerHTML = `
                    <div class="p-4 flex-grow flex flex-col justify-center text-center h-48">
                        <h3 class="text-xl font-semibold text-coffee-dark">${item.name}</h3>
                    </div>
                `;
            }

            grid.appendChild(card);
        });

        section.appendChild(grid);
        menuContent.appendChild(section);
    });
}

function setupEventListeners() {
    const modal = document.getElementById('item-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const menuContent = document.getElementById('menu-content');
    const viewMenuBtn = document.getElementById('view-menu-btn');

    closeModalBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    menuContent?.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-item-card');
        if (card) {
            const { itemId, categoryName } = card.dataset;
            openModal(itemId, categoryName);
        }
    });

}

function findItemData(itemId, categoryName) {
    if (!state.menuData) return null;
    const category = state.menuData.menu_categories.find(cat => cat.category_name === categoryName);
    return category?.items.find(item => item.id === itemId);
}

function openModal(itemId, categoryName) {
    const item = findItemData(itemId, categoryName);
    if (!item) return;

    state.currentItem = item;

    const modal = document.getElementById('item-modal');
    const modalImageContainer = document.getElementById('modal-image-container');
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalDescription = document.getElementById('modal-description');
    const modalNutrition = document.getElementById('modal-nutrition');

    if (item.image) {
        modalImage.src = item.image;
        modalImage.alt = item.name;
        modalImageContainer.style.display = 'block';
    } else {
        modalImageContainer.style.display = 'none';
    }

    modalName.textContent = item.name;
    modalDescription.textContent = item.description;

    const nutritionList = document.createElement('ul');
    const nutritionParts = item.nutritional_info.split(', ');
    nutritionParts.forEach(part => {
        const [key, value] = part.split(': ');
        const li = document.createElement('li');
        li.innerHTML = `<span>${key}</span><span>${value}</span>`;
        nutritionList.appendChild(li);
    });
    modalNutrition.innerHTML = '';
    modalNutrition.appendChild(nutritionList);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('item-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    state.currentItem = null;
}

function setupScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('#category-links a');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -80% 0px' });

    sections.forEach(section => {
        observer.observe(section);
    });
}


function runLandingAnimation() {
    const elements = document.querySelectorAll('.animate-on-load');
    // A short timeout to ensure elements are rendered before animation starts
    setTimeout(() => {
        elements.forEach(el => el.classList.add('is-visible'));
    }, 100);
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animation]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}
