export async function POST(req) {
  const { query } = await req.json();

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  const response = await fetch(url);
  const data = await response.json();

  const results = (data.items || []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
  }));

  return Response.json({ results });
}
