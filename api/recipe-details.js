export default async function handler(req, res) {
  const { id } = req.query;
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!id) {
    res.status(400).json({ error: 'Missing id parameter' });
    return;
  }
  const endpoint = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Spoonacular API error', details: error.message });
  }
} 