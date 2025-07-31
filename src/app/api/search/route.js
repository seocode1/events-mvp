export async function POST(req: Request) {
  const { query } = await req.json();

  console.log('[QUERY]', query); // ← логируем сам запрос

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&key=${apiKey}&cx=${cx}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log('[RESPONSE]', data); // ← логируем ответ от Google

  const results = (data.items || []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
  }));

  return Response.json({ results });
}
