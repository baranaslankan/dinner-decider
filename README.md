# Dinner Decider 🍽️

A modern, responsive web app to help you decide what to cook for dinner! Search recipes by ingredients, filter by calories and food type, view nutrition info, and save your favorites. Supports dark mode, multiple languages, and robust error handling.

## Features
- **Ingredient-based recipe search** (multi-select, typeable dropdown)
- **Calorie and food type filtering**
- **Recipe cards** with images, calories, and nutrition info
- **Favorites/bookmarks** (persistent via localStorage)
- **Surprise Me!** random recipe button
- **Dark mode toggle**
- **Language switcher** (English, French, Turkish)
- **Loading spinner & toast notifications**
- **Responsive, professional UI**

## Setup
1. **Clone this repo:**
   ```bash
   git clone <your-repo-url>
   cd dinner-decider
   ```
2. **Get a [Spoonacular API key](https://spoonacular.com/food-api)** (free tier available).
3. **Set your API key:**
   - Open `dinner-decider/app.js` and replace the value of `SPOONACULAR_API_KEY` with your key.
4. **Open `index.html` in your browser.**

## Usage
- **Select ingredients** using the dropdown.
- **Set calorie range and food type** (optional).
- Click **Find a Recipe** or **Surprise Me!**
- Click the heart on any recipe to add/remove from favorites.
- Use the **Favorites** button to view saved recipes.
- Toggle **dark mode** or switch languages at any time.

## Customization
- **Add more languages:** Edit the `translations` object in `app.js`.
- **Change styles:** Edit `style.css` for colors, layout, etc.
- **API limits:** Free Spoonacular keys have daily request limits.

## License
MIT 