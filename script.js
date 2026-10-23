//VIBECODED
let galleryData = [];
let currentCategory = "all";
let activeTags = [];
let currentPage = 1;
let itemsPerPage = 20;
let currentFilteredItems = [];
let currentLightboxIndex = 0;
let randomShuffledItems = [];

const grid = document.getElementById("gallery-grid");
const tabButtons = document.querySelectorAll(".tab-btn[data-category]");
const tagCheckboxes = document.querySelectorAll(".tag-filter");
const sidebar = document.getElementById("filters-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarClose = document.getElementById("sidebar-close");
const themeToggle = document.getElementById("theme-toggle");
const settingsToggle = document.getElementById("settings-toggle");
const settingsModal = document.getElementById("settings-modal");
const settingsSave = document.getElementById("settings-save");
const clearFiltersBtn = document.getElementById("clear-filters");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const shuffleBtn = document.getElementById("shuffle-btn");

function parseNestedJson(node, currentPath = "assets") {
    for (const [key, value] of Object.entries(node)) {
        if (Array.isArray(value)) {
            const filePath = `${currentPath}/${key}`;
            const pathParts = currentPath.split("/");
            const category = pathParts.length > 1 ? pathParts[1] : "general";
            
            galleryData.push({
                src: filePath,
                filename: key,
                category: category,
                tags: value
            });
        } else if (typeof value === "object" && value !== null) {
            parseNestedJson(value, `${currentPath}/${key}`);
        }
    }
}

async function initGallery() {
    try {
        const response = await fetch("gallery.json");
        const jsonData = await response.json();
        
        galleryData = [];
        parseNestedJson(jsonData, "assets");

        setupEventListeners();
        generateRandomShuffle();
        filterAndRender();
    } catch (error) {
        console.error("Error loading gallery.json:", error);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red;">Error: Cannot load gallery.json</p>`;
    }
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

function filterAndRender() {
    if (currentCategory === "random") {
        currentFilteredItems = randomShuffledItems.filter(item => {
            if (activeTags.length > 0) {
                return activeTags.every(tag => item.tags.includes(tag));
            }
            return true;
        });
        shuffleBtn.style.display = "inline-block";
    } else {
        shuffleBtn.style.display = "none";
        currentFilteredItems = galleryData.filter(item => {
            let matchesCategory = (currentCategory === "all" || item.category === currentCategory);
            let matchesTags = true;
            if (activeTags.length > 0) {
                matchesTags = activeTags.every(tag => item.tags.includes(tag));
            }
            return matchesCategory && matchesTags;
        });
    }

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
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">No image found</p>`;
        return;
    }

    pageItems.forEach((item, index) => {
        const absoluteIndex = start + index;
        const div = document.createElement("div");
        div.className = "mosaic-item";
        div.innerHTML = `<img src="${item.src}" alt="${item.filename}" loading="lazy">`;
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

function setupEventListeners() {
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

    shuffleBtn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        document.querySelector('.tab-btn[data-category="random"]').classList.add("active");
        shuffleBtn.classList.remove("active"); // Removes active state so shuffle doesn't stay highlighted

        currentCategory = "random";
        generateRandomShuffle();
        currentPage = 1;
        filterAndRender();
    });

    tagCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            activeTags = Array.from(tagCheckboxes)
                .filter(i => i.checked)
                .map(i => i.value);
            currentPage = 1;
            filterAndRender();
        });
    });

    clearFiltersBtn.addEventListener("click", () => {
        tagCheckboxes.forEach(cb => cb.checked = false);
        activeTags = [];
        currentPage = 1;
        filterAndRender();
    });

    sidebarToggle.addEventListener("click", () => sidebar.classList.add("open"));
    sidebarClose.addEventListener("click", () => sidebar.classList.remove("open"));

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

    themeToggle.addEventListener("click", () => {
        const html = document.documentElement;
        html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    });

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
        lightboxCaption.textContent = item.filename;
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

window.addEventListener("DOMContentLoaded", initGallery);