export default async function handler(req, res) {
  const { foodType } = req.query;
  const apiKey = process.env.SPOONACULAR_API_KEY;
  let endpoint = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${apiKey}`;
  if (foodType) endpoint += `&tags=${encodeURIComponent(foodType)}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    const meal = data.recipes && data.recipes[0] ? data.recipes[0] : null;
    res.status(200).json(meal);
  } catch (error) {
    res.status(500).json({ error: 'Spoonacular API error', details: error.message });
  }
} 