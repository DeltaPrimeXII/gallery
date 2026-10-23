// Categories and respective tags (.png or .gif)
const galleryData = [
    { src: "assets/drawings/space_2.png", category: "drawings", tags: ["pixel-art", "space"] },
    { src: "assets/drawings/space_3.png", category: "drawings", tags: ["pixel-art", "64x64", "space"] },
    { src: "assets/drawings/space_4.png", category: "drawings", tags: ["pixel-art", "64x64", "space"] },
    { src: "assets/drawings/space_7.png", category: "drawings", tags: ["pixel-art", "64x64", "space"] },
    { src: "assets/drawings/space_8.png", category: "drawings", tags: ["pixel-art", "64x64", "space"] },

    { src: "assets/drawings/abcd.png", category: "drawings", tags: ["pixel-art"] },

    { src: "assets/logos/logo_crafting_recipe_exporter.png", category: "logos", tags: ["digital"] },
    { src: "assets/logos/logo_create_encased.png", category: "logos", tags: ["digital"] },
    { src: "assets/logos/logo_create_encased_alt.png", category: "logos", tags: ["digital"] },
    { src: "assets/logos/logo_create_more_recipes.png", category: "logos", tags: ["digital"] },
    { src: "assets/logos/logo_create_more_recipes_alt.png", category: "logos", tags: ["digital"] },
    { src: "assets/logos/logo_create_qol.png", category: "logos", tags: ["digital"] },
    { src: "assets/logos/logo_create_qol_alt.png", category: "logos", tags: ["digital"] },
    { src: "assets/logos/logo_structures_tweaker.png", category: "logos", tags: ["digital"] },

    { src: "assets/minecraft/chicken_skin.png", category: "minecraft", tags: ["16x16"] },
    { src: "assets/minecraft/compacted_chicken.png", category: "minecraft", tags: ["16x16"] },
    { src: "assets/minecraft/totem_of_chickening.png", category: "minecraft", tags: ["16x16"] },
];

let currentCategory = "all";
let activeTags = [];
let currentPage = 1;
let itemsPerPage = 20;
let currentFilteredItems = [];
let currentLightboxIndex = 0;
let randomShuffledItems = [];

// DOM Elements
const grid = document.getElementById("gallery-grid");
const tabButtons = document.querySelectorAll(".tab-btn");
const tagCheckboxes = document.querySelectorAll(".tag-filter");
const sidebar = document.getElementById("filters-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarClose = document.getElementById("sidebar-close");
const themeToggle = document.getElementById("theme-toggle");
const settingsToggle = document.getElementById("settings-toggle");
const settingsModal = document.getElementById("settings-modal");
const settingsSave = document.getElementById("settings-save");
const tabsNav = document.querySelector(".tabs-nav");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

const shuffleBtn = document.createElement("button");
shuffleBtn.className = "tab-btn";
shuffleBtn.id = "shuffle-btn";
shuffleBtn.textContent = "Shuffle 🔀";
shuffleBtn.style.display = "none";
tabsNav.appendChild(shuffleBtn);

// Initialization
function initGallery() {
    setupEventListeners();
    generateRandomShuffle();
    filterAndRender();
}

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generateRandomShuffle() {
    randomShuffledItems = shuffleArray(galleryData);
}

// Filtering and Sorting
function filterAndRender() {
    if (currentCategory === "random") {
        // Random mode
        currentFilteredItems = randomShuffledItems.filter(item => {
            if (activeTags.length > 0) {
                return activeTags.every(tag => item.tags.includes(tag));
            }
            return true;
        });
        shuffleBtn.style.display = "inline-block"; // Display the shuffle button
    } else {
        shuffleBtn.style.display = "none"; // Hides the shuffle button when not using random
        currentFilteredItems = galleryData.filter(item => {
            let matchesCategory = (currentCategory === "all" || item.category === currentCategory);
            let matchesTags = true;
            if (activeTags.length > 0) {
                matchesTags = activeTags.every(tag => item.tags.includes(tag));
            }
            return matchesCategory && matchesTags;
        });
    }

    // Pagination management
    const totalPages = Math.ceil(currentFilteredItems.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    updatePaginationUI(totalPages);
    renderGrid();
}

function renderGrid() {
    grid.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = currentFilteredItems.slice(start, end);

    if (pageItems.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">Aucune image trouvée.</p>`;
        return;
    }

    pageItems.forEach((item, index) => {
        const absoluteIndex = start + index;
        const div = document.createElement("div");
        div.className = "mosaic-item";
        div.innerHTML = `<img src="${item.src}" alt="Artwork" loading="lazy">`;
        div.addEventListener("click", () => openLightbox(absoluteIndex));
        grid.appendChild(div);
    });
}

function updatePaginationUI(totalPages) {
    document.getElementById("current-page").textContent = currentPage;
    document.getElementById("total-pages").textContent = totalPages;
    document.getElementById("current-page-bottom").textContent = currentPage;
    document.getElementById("total-pages-bottom").textContent = totalPages;

    const prevDisabled = currentPage === 1;
    const nextDisabled = currentPage === totalPages || totalPages === 0;

    document.querySelectorAll(".prev-page").forEach(btn => btn.disabled = prevDisabled);
    document.querySelectorAll(".next-page").forEach(btn => btn.disabled = nextDisabled);
}

// Event Listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            tabButtons.forEach(b => b.classList.remove("active"));
            shuffleBtn.classList.remove("active");
            e.target.classList.add("active");
            currentCategory = e.target.dataset.category;
            currentPage = 1;
            filterAndRender();
        });
    });

    // Clic sur le bouton Shuffle
    shuffleBtn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        shuffleBtn.classList.add("active");
        currentCategory = "random";
        generateRandomShuffle(); // Remélange les images
        currentPage = 1;
        filterAndRender();
    });

    // Sidebar filters (Tags)
    tagCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            activeTags = Array.from(tagCheckboxes)
                .filter(i => i.checked)
                .map(i => i.value);
            currentPage = 1;
            filterAndRender();
        });
    });

    // Open/Close Sidebar
    sidebarToggle.addEventListener("click", () => sidebar.classList.add("open"));
    sidebarClose.addEventListener("click", () => sidebar.classList.remove("open"));

    // Pagination buttons
    document.querySelectorAll(".prev-page").forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderGrid();
                updatePaginationUI(Math.ceil(currentFilteredItems.length / itemsPerPage));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll(".next-page").forEach(btn => {
        btn.addEventListener("click", () => {
            const totalPages = Math.ceil(currentFilteredItems.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderGrid();
                updatePaginationUI(totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Quick Dark / Light mode toggle
    themeToggle.addEventListener("click", () => {
        const html = document.documentElement;
        html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    });

    // Settings Modal
    settingsToggle.addEventListener("click", () => settingsModal.classList.add("active"));
    settingsModal.addEventListener("click", (e) => {
        if (e.target === settingsModal) settingsModal.classList.remove("active");
    });

    settingsSave.addEventListener("click", () => {
        const customColor = document.getElementById("setting-accent-color").value;
        const perPageInput = parseInt(document.getElementById("setting-per-page").value);
        
        document.documentElement.style.setProperty("--accent-color", customColor);
        if (perPageInput && perPageInput > 0) {
            itemsPerPage = perPageInput;
        }
        currentPage = 1;
        settingsModal.classList.remove("active");
        filterAndRender();
    });

    // Lightbox (Large format viewer)
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    lightboxPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        currentLightboxIndex = (currentLightboxIndex - 1 + currentFilteredItems.length) % currentFilteredItems.length;
        updateLightboxImage();
    });

    lightboxNext.addEventListener("click", (e) => {
        e.stopPropagation();
        currentLightboxIndex = (currentLightboxIndex + 1) % currentFilteredItems.length;
        updateLightboxImage();
    });

    // Keyboard navigation (Left/Right arrows and Escape)
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") lightboxPrev.click();
        if (e.key === "ArrowRight") lightboxNext.click();
    });
}

function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add("active");
}

function closeLightbox() {
    lightbox.classList.remove("active");
}

function updateLightboxImage() {
    const item = currentFilteredItems[currentLightboxIndex];
    if (item) {
        lightboxImg.src = item.src;
        lightboxImg.className = "";

        const tempImg = new Image();
        tempImg.src = item.src;
        tempImg.onload = () => {
            const maxDim = Math.max(tempImg.naturalWidth, tempImg.naturalHeight);
            
            if (maxDim >= 129 && maxDim <= 256) {
                lightboxImg.classList.add("pixelated-upscale", "scale-x2");
            } else if (maxDim >= 65 && maxDim <= 128) {
                lightboxImg.classList.add("pixelated-upscale", "scale-x4");
            } else if (maxDim >= 32 && maxDim <= 64) {
                lightboxImg.classList.add("pixelated-upscale", "scale-x8");
            } else if (maxDim >= 1 && maxDim <= 31) {
                lightboxImg.classList.add("pixelated-upscale", "scale-x16");
            }
        };
    }
}

// Launch on page load
window.addEventListener("DOMContentLoaded", initGallery);