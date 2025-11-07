import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const response = await fetch(`https://statsapi.mlb.com/api/v1/teams/${id}/roster`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team roster' });
  }
}

