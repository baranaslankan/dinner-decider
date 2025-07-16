export default async function handler(req, res) {
  const { ingredients = '', minCalories, maxCalories, foodType } = req.query;
  const apiKey = process.env.SPOONACULAR_API_KEY;
  let endpoint = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(ingredients)}&addRecipeNutrition=true&number=12&apiKey=${apiKey}`;
  if (minCalories) endpoint += `&minCalories=${minCalories}`;
  if (maxCalories) endpoint += `&maxCalories=${maxCalories}`;
  if (foodType) endpoint += `&type=${encodeURIComponent(foodType)}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    res.status(200).json(data.results || []);
  } catch (error) {
    res.status(500).json({ error: 'Spoonacular API error', details: error.message });
  }
} 