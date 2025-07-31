'use client';
import { useState } from 'react';

type ResultItem = {
  title: string;
  link: string;
  snippet: string;
};

export default function Home() {
  const [form, setForm] = useState({
    city: '',
    from: '',
    to: '',
    music: false,
    festivals: false,
    clubs: false,
    family: false,
  });

  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [gptSummary, setGptSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGptSummary(null);

    const filters = Object.entries(form)
      .filter(([_, value]) => typeof value === 'boolean' && value)
      .map(([key]) => key)
      .join(', ');

    const userQuery = `Events in ${form.city} from ${form.from} to ${form.to} ${
      filters ? 'filtered by ' + filters : ''
    }`;

    // STEP 1: Search API
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery }),
    });
    const data = await res.json();
    setResults(data.results || []);

    // STEP 2: GPT API
    const gpt = await fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawSearchResults: data.results,
        city: form.city,
        from: form.from,
        to: form.to,
      }),
    });
    const summary = await gpt.json();
    setGptSummary(summary.summary);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Поиск событий</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="city"
          placeholder="Город"
          value={form.city}
          onChange={handleChange}
          required
        /><br /><br />
        <label>От: <input type="date" name="from" value={form.from} onChange={handleChange} required /></label><br />
        <label>До: <input type="date" name="to" value={form.to} onChange={handleChange} required /></label><br /><br />
        <label><input type="checkbox" name="music" onChange={handleChange} /> Музыка</label><br />
        <label><input type="checkbox" name="festivals" onChange={handleChange} /> Фестивали</label><br />
        <label><input type="checkbox" name="clubs" onChange={handleChange} /> Клубы</label><br />
        <label><input type="checkbox" name="family" onChange={handleChange} /> Для семьи</label><br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Поиск...' : 'Найти события'}
        </button>
      </form>

      {results && (
        <div style={{ marginTop: '40px' }}>
          <h2>Результаты поиска:</h2>
          <ul>
            {results.map((item, i) => (
              <li key={i}>
                <strong>{item.title}</strong><br />
                <a href={item.link} target="_blank" rel="noopener noreferrer">{item.link}</a><br />
                <em>{item.snippet}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {gptSummary && (
        <div style={{ marginTop: '40px', background: '#f9f9f9', padding: '20px' }}>
          <h2>Подборка от GPT:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{gptSummary}</pre>
        </div>
      )}
    </div>
  );
}
