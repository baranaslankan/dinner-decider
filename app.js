// Fetch all ingredients for dropdown
async function fetchAllIngredients() {
    const endpoint = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data.meals.map(ing => ing.strIngredient);
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        return [];
    }
}

// Fetch meal details by id
async function getMealDetailsById(id) {
    const endpoint = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error fetching meal details:', error);
        return null;
    }
}

// Fetch recipes by a single ingredient
async function getRecipesByIngredient(ingredient) {
    const endpoint = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data.meals;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return null;
    }
}

// Spoonacular API key
// const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Search recipes by ingredients, calories, and type
async function getRecipesByIngredients(ingredients, minCalories, maxCalories, foodType) {
    if (!ingredients.length) return null;
    const params = new URLSearchParams();
    params.append('ingredients', ingredients.join(','));
    if (minCalories) params.append('minCalories', minCalories);
    if (maxCalories) params.append('maxCalories', maxCalories);
    if (foodType) params.append('foodType', foodType);
    const endpoint = `/api/recipes?${params.toString()}`;
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return null;
    }
}

// Get full recipe details (including nutrition)
async function getRecipeDetailsById(id) {
    const endpoint = `/api/recipe-details?id=${id}`;
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

// --- Favorites/Bookmarks ---
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}
function saveFavorites(favs) {
    localStorage.setItem('favorites', JSON.stringify(favs));
}
function isFavorited(id) {
    return getFavorites().some(fav => fav.id === id);
}
function toggleFavorite(meal) {
    let favs = getFavorites();
    if (isFavorited(meal.id)) {
        favs = favs.filter(fav => fav.id !== meal.id);
    } else {
        favs.push({ id: meal.id, title: meal.title, image: meal.image || meal.imageUrl || '', nutrition: meal.nutrition });
    }
    saveFavorites(favs);
    displayRecipes(lastDisplayedRecipes);
}
let lastDisplayedRecipes = [];

// Display recipes as clickable cards (show calories, heart icon)
function displayRecipes(meals) {
    lastDisplayedRecipes = meals;
    const resultsDiv = document.getElementById('recipe-results');
    resultsDiv.innerHTML = '';
    if (!meals || meals.length === 0) {
        resultsDiv.innerHTML = `
            <div style="text-align:center;padding:2rem;opacity:0.8;">
                <div style="font-size:3rem;">🍽️</div>
                <div style="font-size:1.3rem;margin-top:1rem;color:#1b4d2b;">${t('noRecipes')}</div>
            </div>
        `;
        return;
    }
    meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        let calories = '';
        if (meal.nutrition && meal.nutrition.nutrients) {
            const cal = meal.nutrition.nutrients.find(n => n.name === 'Calories');
            if (cal) calories = `<span style='font-size:0.98em;color:#27ae60;font-weight:500;'>${Math.round(cal.amount)} kcal</span>`;
        }
        // Heart icon
        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn' + (isFavorited(meal.id) ? ' favorited' : '');
        favBtn.innerHTML = isFavorited(meal.id) ? '❤️' : '🤍';
        favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(meal);
        };
        card.innerHTML = `
            <img src="${meal.image || meal.imageUrl || ''}" alt="${meal.title}">
            <span>${meal.title}</span>
            ${calories ? `<div style='margin-top:0.3rem;'>${calories}</div>` : ''}
        `;
        card.appendChild(favBtn);
        card.addEventListener('click', async () => {
            const details = await getRecipeDetailsById(meal.id || meal.idMeal);
            showModal(details);
        });
        resultsDiv.appendChild(card);
    });
}

// Show favorites view
const showFavsBtn = document.getElementById('show-favorites-btn');
showFavsBtn.addEventListener('click', () => {
    const favs = getFavorites();
    if (favs.length === 0) {
        document.getElementById('recipe-results').innerHTML = `<div style='text-align:center;padding:2rem;opacity:0.8;'><div style='font-size:2.2rem;'>🤍</div><div style='font-size:1.2rem;margin-top:1rem;color:#1b4d2b;'>No favorites yet. Click the heart on a recipe to add it!</div></div>`;
    } else {
        displayRecipes(favs);
    }
});

// Show modal with nutrition info
function showModal(meal) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    if (!meal) {
        modalBody.innerHTML = `<p style="text-align:center;font-size:1.2rem;">${t('recipeDetailsNotFound')}</p>`;
    } else {
        // Ingredients
        let ingredients = '';
        if (meal.extendedIngredients) {
            ingredients = meal.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('');
        }
        // Nutrition
        let nutrition = '';
        if (meal.nutrition && meal.nutrition.nutrients) {
            const cal = meal.nutrition.nutrients.find(n => n.name === 'Calories');
            nutrition = cal ? `<b>${cal.amount}</b> ${cal.unit} ${cal.name}` : '';
        }
        // Macros
        let macros = '';
        if (meal.nutrition && meal.nutrition.nutrients) {
            const protein = meal.nutrition.nutrients.find(n => n.name === 'Protein');
            const fat = meal.nutrition.nutrients.find(n => n.name === 'Fat');
            const carbs = meal.nutrition.nutrients.find(n => n.name === 'Carbohydrates');
            macros = `<span style='color:#888;font-size:0.98em;'>${protein ? `Protein: ${protein.amount}${protein.unit}` : ''} ${fat ? `Fat: ${fat.amount}${fat.unit}` : ''} ${carbs ? `Carbs: ${carbs.amount}${carbs.unit}` : ''}</span>`;
        }
        modalBody.innerHTML = `
            <h2>${meal.title}</h2>
            <img src="${meal.image}" alt="${meal.title}">
            <div style="margin:1rem 0 0.5rem 0;font-weight:500;font-size:1.1rem;">
                ${nutrition ? `Calories: ${nutrition}` : `<span style='color:#888;'>Calories not available.</span>`}
                <br>${macros}
            </div>
            <h3>${t('ingredients')}</h3>
            <ul>${ingredients}</ul>
            <h3>${t('instructions')}</h3>
            <p>${meal.instructions || meal.summary || ''}</p>
            ${meal.sourceUrl ? `<a href="${meal.sourceUrl}" target="_blank">${t('viewSource')}</a>` : ''}
        `;
    }
    modal.style.display = 'flex';
}

document.querySelector('.close-button').onclick = function() {
    document.getElementById('modal').style.display = 'none';
};
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// On page load, only use custom dropdown logic
window.addEventListener('DOMContentLoaded', async () => {
    allIngredients = await fetchAllIngredients();
    renderSelectedIngredients();
    setupCustomDropdown();
    updateAllTexts();

    // Find Recipe Button
    const findBtn = document.getElementById('find-recipe-btn');
    findBtn.addEventListener('click', async () => {
        const resultsDiv = document.getElementById('recipe-results');
        if (!selectedIngredients.length) {
            showToast(t('pleaseSelect'));
            resultsDiv.textContent = t('pleaseSelect');
            return;
        }
        showSpinner();
        resultsDiv.textContent = t('searching');
        try {
            const meals = await getRecipesByIngredients(selectedIngredients);
            displayRecipes(meals);
            if (!meals || meals.length === 0) {
                showToast(t('noRecipesFound'));
            } else {
                showToast(t('recipesLoaded'));
            }
        } catch (err) {
            showToast(t('errorFetching'));
            resultsDiv.textContent = t('errorFetching');
        } finally {
            hideSpinner();
        }
    });

    // Calorie filter button
    const calorieBtn = document.getElementById('calorie-filter-btn');
    calorieBtn.addEventListener('click', async () => {
        const minCals = document.getElementById('min-calories').value;
        const maxCals = document.getElementById('max-calories').value;
        const foodType = document.getElementById('food-type').value;
        const resultsDiv = document.getElementById('recipe-results');
        if (!selectedIngredients.length) {
            showToast(t('pleaseSelect'));
            resultsDiv.textContent = t('pleaseSelect');
            return;
        }
        showSpinner();
        resultsDiv.textContent = t('searching');
        try {
            let meals = await getRecipesByIngredients(selectedIngredients, minCals, maxCals, foodType);
            if (!meals || meals.length === 0) {
                // Fallback: try again without meal type
                if (foodType) {
                    const fallbackMeals = await getRecipesByIngredients(selectedIngredients, minCals, maxCals, '');
                    if (fallbackMeals && fallbackMeals.length > 0) {
                        showToast('No recipes found for this meal type. Showing all types instead.');
                        displayRecipes(fallbackMeals);
                        return;
                    }
                }
                showToast('No recipes found. Try changing your filters.');
                resultsDiv.textContent = t('noRecipesFound');
            } else {
                displayRecipes(meals);
                showToast(t('recipesLoaded'));
            }
        } catch (err) {
            showToast(t('errorFetching'));
            resultsDiv.textContent = t('errorFetching');
        } finally {
            hideSpinner();
        }
    });

    // Surprise Me button
    document.getElementById('surprise-btn').addEventListener('click', async () => {
        selectedIngredients = [];
        renderSelectedIngredients();
        document.getElementById('ingredient-search-input').value = '';
        const resultsDiv = document.getElementById('recipe-results');
        showSpinner();
        resultsDiv.textContent = t('fetchingSurprise');
        try {
            const foodType = document.getElementById('food-type').value;
            const params = new URLSearchParams();
            params.append('foodType', foodType);
            const response = await fetch(`/api/surprise?${params.toString()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const meal = data ? data : null;
            if (meal) {
                // Fetch full details with nutrition
                const details = await getRecipeDetailsById(meal.id);
                showModal(details);
                resultsDiv.textContent = '';
            } else {
                resultsDiv.textContent = t('failedSurprise');
            }
            showToast(t('surpriseLoaded'));
        } catch (error) {
            resultsDiv.textContent = t('failedSurprise');
            showToast(t('failedSurprise'));
            console.error('Error fetching random meal:', error);
        } finally {
            hideSpinner();
        }
    });

    // Favorites button
    const showFavsBtn = document.getElementById('show-favorites-btn');
    showFavsBtn.addEventListener('click', () => {
        const favs = getFavorites();
        if (favs.length === 0) {
            document.getElementById('recipe-results').innerHTML = `<div style='text-align:center;padding:2rem;opacity:0.8;'><div style='font-size:2.2rem;'>🤍</div><div style='font-size:1.2rem;margin-top:1rem;color:#1b4d2b;'>No favorites yet. Click the heart on a recipe to add it!</div></div>`;
        } else {
            displayRecipes(favs);
        }
    });

    // Dark mode toggle
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    darkModeBtn.onclick = function() {
        document.body.classList.toggle('dark-mode');
        darkModeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        showToast(document.body.classList.contains('dark-mode') ? t('darkMode') : t('lightMode'));
    };
    if (document.body.classList.contains('dark-mode')) {
        darkModeBtn.textContent = '☀️';
    }

    // Language switcher
    const langSwitcher = document.getElementById('lang-switcher');
    langSwitcher.addEventListener('change', function() {
        currentLang = langSwitcher.value;
        updateAllTexts();
        showToast(t('language') + ': ' + langSwitcher.options[langSwitcher.selectedIndex].text);
    });
});

// --- Custom Multi-Select Dropdown Logic ---
let allIngredients = [];
let selectedIngredients = [];

function renderSelectedIngredients() {
    const container = document.getElementById('selected-ingredients');
    container.innerHTML = '';
    selectedIngredients.forEach(ingredient => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = ingredient;
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            selectedIngredients = selectedIngredients.filter(i => i !== ingredient);
            renderSelectedIngredients();
        };
        tag.appendChild(removeBtn);
        container.appendChild(tag);
    });
}

function renderSuggestions(filter = '') {
    const suggestions = document.getElementById('ingredient-suggestions');
    suggestions.innerHTML = '';
    const filtered = allIngredients.filter(ing =>
        ing.toLowerCase().includes(filter.toLowerCase()) && !selectedIngredients.includes(ing)
    );
    if (filtered.length === 0) {
        suggestions.classList.remove('show');
        return;
    }
    filtered.slice(0, 20).forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        li.onclick = () => {
            selectedIngredients.push(ingredient);
            renderSelectedIngredients();
            document.getElementById('ingredient-search-input').value = '';
            renderSuggestions('');
        };
        suggestions.appendChild(li);
    });
    suggestions.classList.add('show');
}

function setupCustomDropdown() {
    const input = document.getElementById('ingredient-search-input');
    const suggestions = document.getElementById('ingredient-suggestions');
    input.addEventListener('input', () => {
        renderSuggestions(input.value);
    });
    input.addEventListener('focus', () => {
        renderSuggestions(input.value);
    });
    input.addEventListener('blur', () => {
        setTimeout(() => suggestions.classList.remove('show'), 150);
    });
    // Allow removing last tag with backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && selectedIngredients.length) {
            selectedIngredients.pop();
            renderSelectedIngredients();
            renderSuggestions(input.value);
        }
    });
}

// --- Loading Spinner ---
function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
}
function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

// --- Toast Notification ---
function showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// --- Keyboard Accessibility for Modal ---
const modal = document.getElementById('modal');
modal.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        modal.style.display = 'none';
    }
});

// --- Keyboard Accessibility for Dropdown ---
const input = document.getElementById('ingredient-search-input');
const suggestions = document.getElementById('ingredient-suggestions');
input.addEventListener('keydown', function(e) {
    const items = Array.from(suggestions.querySelectorAll('li'));
    let idx = items.findIndex(li => li.classList.contains('active'));
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length) {
            if (idx >= 0) items[idx].classList.remove('active');
            idx = (idx + 1) % items.length;
            items[idx].classList.add('active');
            items[idx].scrollIntoView({ block: 'nearest' });
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length) {
            if (idx >= 0) items[idx].classList.remove('active');
            idx = (idx - 1 + items.length) % items.length;
            items[idx].classList.add('active');
            items[idx].scrollIntoView({ block: 'nearest' });
        }
    } else if (e.key === 'Enter') {
        if (idx >= 0 && items[idx]) {
            items[idx].click();
        }
    }
});

// --- i18n Translations ---
const translations = {
    en: {
        title: 'Dinner Decider',
        findRecipe: 'Find a Recipe',
        surpriseMe: 'Surprise Me!',
        searchPlaceholder: 'Type to search ingredients...',
        noRecipes: 'No recipes found for your selected ingredients. Try different or fewer ingredients!',
        pleaseSelect: 'Please select at least one ingredient.',
        searching: 'Searching...',
        fetchingSurprise: 'Fetching a surprise meal...',
        failedSurprise: 'Failed to fetch a surprise meal.',
        recipeDetailsNotFound: 'Recipe details not found.',
        ingredients: 'Ingredients',
        instructions: 'Instructions',
        viewSource: 'View Source',
        darkMode: 'Dark mode enabled',
        lightMode: 'Light mode enabled',
        recipesLoaded: 'Recipes loaded!',
        noRecipesFound: 'No recipes found!',
        surpriseLoaded: 'Surprise meal loaded!',
        errorFetching: 'Error fetching recipes.',
        favorites: 'Favorites',
        addToFavorites: 'Add to Favorites',
        removeFromFavorites: 'Remove from Favorites',
        share: 'Share',
        print: 'Print',
        rateRecipe: 'Rate this recipe',
        comment: 'Comment',
        addComment: 'Add Comment',
        mealPlanner: 'Meal Planner',
        addToPlanner: 'Add to Planner',
        shoppingList: 'Shopping List',
        addToShoppingList: 'Add to Shopping List',
        stepByStep: 'Step-by-Step Mode',
        next: 'Next',
        previous: 'Previous',
        close: 'Close',
        language: 'Language',
    },
    fr: {
        title: 'Décideur de Dîner',
        findRecipe: 'Trouver une recette',
        surpriseMe: 'Surprenez-moi!',
        searchPlaceholder: 'Tapez pour rechercher des ingrédients...',
        noRecipes: "Aucune recette trouvée pour vos ingrédients sélectionnés. Essayez d'autres ou moins d'ingrédients!",
        pleaseSelect: 'Veuillez sélectionner au moins un ingrédient.',
        searching: 'Recherche...',
        fetchingSurprise: "Recherche d'un plat surprise...",
        failedSurprise: "Impossible de trouver un plat surprise.",
        recipeDetailsNotFound: 'Détails de la recette introuvables.',
        ingredients: 'Ingrédients',
        instructions: 'Instructions',
        viewSource: 'Voir la source',
        darkMode: 'Mode sombre activé',
        lightMode: 'Mode clair activé',
        recipesLoaded: 'Recettes chargées!',
        noRecipesFound: 'Aucune recette trouvée!',
        surpriseLoaded: 'Plat surprise chargé!',
        errorFetching: 'Erreur lors de la récupération des recettes.',
        favorites: 'Favoris',
        addToFavorites: 'Ajouter aux favoris',
        removeFromFavorites: 'Retirer des favoris',
        share: 'Partager',
        print: 'Imprimer',
        rateRecipe: 'Notez cette recette',
        comment: 'Commentaire',
        addComment: 'Ajouter un commentaire',
        mealPlanner: 'Planificateur de repas',
        addToPlanner: 'Ajouter au planificateur',
        shoppingList: 'Liste de courses',
        addToShoppingList: 'Ajouter à la liste de courses',
        stepByStep: 'Mode étape par étape',
        next: 'Suivant',
        previous: 'Précédent',
        close: 'Fermer',
        language: 'Langue',
    },
    tr: {
        title: 'Akşam Yemeği Karar Verici',
        findRecipe: 'Tarif Bul',
        surpriseMe: 'Beni Şaşırt!',
        searchPlaceholder: 'Malzeme aramak için yazın...',
        noRecipes: 'Seçtiğiniz malzemeler için tarif bulunamadı. Farklı veya daha az malzeme deneyin!',
        pleaseSelect: 'Lütfen en az bir malzeme seçin.',
        searching: 'Aranıyor...',
        fetchingSurprise: 'Sürpriz yemek getiriliyor...',
        failedSurprise: 'Sürpriz yemek getirilemedi.',
        recipeDetailsNotFound: 'Tarif detayları bulunamadı.',
        ingredients: 'Malzemeler',
        instructions: 'Talimatlar',
        viewSource: 'Kaynağı Görüntüle',
        darkMode: 'Karanlık mod etkin',
        lightMode: 'Aydınlık mod etkin',
        recipesLoaded: 'Tarifler yüklendi!',
        noRecipesFound: 'Tarif bulunamadı!',
        surpriseLoaded: 'Sürpriz yemek yüklendi!',
        errorFetching: 'Tarifler alınırken hata oluştu.',
        favorites: 'Favoriler',
        addToFavorites: 'Favorilere Ekle',
        removeFromFavorites: 'Favorilerden Kaldır',
        share: 'Paylaş',
        print: 'Yazdır',
        rateRecipe: 'Bu tarifi oylayın',
        comment: 'Yorum',
        addComment: 'Yorum Ekle',
        mealPlanner: 'Yemek Planlayıcı',
        addToPlanner: 'Planlayıcıya Ekle',
        shoppingList: 'Alışveriş Listesi',
        addToShoppingList: 'Alışveriş Listesine Ekle',
        stepByStep: 'Adım Adım Modu',
        next: 'İleri',
        previous: 'Geri',
        close: 'Kapat',
        language: 'Dil',
    }
};
let currentLang = 'en';
function t(key) {
    return translations[currentLang][key] || key;
}

// --- Language Switcher Logic ---
function updateAllTexts() {
    document.querySelector('h1').textContent = t('title');
    document.getElementById('find-recipe-btn').textContent = t('findRecipe');
    document.getElementById('surprise-btn').textContent = t('surpriseMe');
    document.getElementById('ingredient-search-input').placeholder = t('searchPlaceholder');
    // Update modal and other dynamic texts as needed
    // ...
} 