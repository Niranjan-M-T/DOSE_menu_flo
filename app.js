import { menuData, imageMap } from './data/menu_data.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initApp();
});

const state = {
    currentItem: null,
};

function initApp() {
    renderMenu();
    setupEventListeners();
    setupScrollSpy();
}

function renderMenu() {
    const menuContent = document.getElementById('menu-content');
    const categoryLinksContainer = document.getElementById('category-links');
    if (!menuContent || !categoryLinksContainer) return;

    menuContent.innerHTML = '';
    categoryLinksContainer.innerHTML = '';

    menuData.menu_categories.forEach(category => {

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
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8';
        
        category.items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer flex flex-col';
            card.dataset.itemId = item.id;
            card.dataset.categoryName = category.category_name;

            const hasImage = imageMap[item.id];
            
            if (hasImage) {
                card.innerHTML = `
                    <div class="h-48 bg-tan">
                        <img src="${imageMap[item.id]}" alt="${item.name}" class="w-full h-full object-cover">
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
    const category = menuData.menu_categories.find(cat => cat.category_name === categoryName);
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

    const imageUrl = imageMap[item.id];
    if (imageUrl) {
        modalImage.src = imageUrl;
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
    }, { rootMargin: '-20% 0px -80% 0px' }); // Activates when the section title is in the top 20% of the viewport

    sections.forEach(section => {
        observer.observe(section);
    });
}
