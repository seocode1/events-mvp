import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { rawSearchResults, city, from, to } = await req.json();

  const systemPrompt = `
Ты туристический ассистент. На основе списка реальных событий, найденных в интернете, составь подборку мероприятий для пользователя. Не выдумывай, используй только то, что есть в описаниях. Структурируй по дате или типу. Ответ пиши на русском.`;

  const userContent = `
Город: ${city}
Даты: ${from} — ${to}

Результаты поиска:
${(rawSearchResults as { title: string; link: string; snippet: string }[]).map((r, i) => `${i + 1}. ${r.title}\n${r.snippet}\n${r.link}`).join('\n\n')}
`;



  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.7,
  });

  const answer = completion.choices[0].message?.content;
  return Response.json({ summary: answer });
}
