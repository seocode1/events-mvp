'use client';
import { useState } from 'react';

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

  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filters = Object.entries(form)
      .filter(([_, value]) => typeof value === 'boolean' && value)
      .map(([key]) => key)
      .join(', ');

    const userQuery = `Events in ${form.city} from ${form.from} to ${form.to} ${
      filters ? 'filtered by ' + filters : ''
    }`;

    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery }),
    });

    const data = await res.json();
    setResults(data.results || []);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Поиск событий</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="city" placeholder="Город" value={form.city} onChange={handleChange} required /><br />
        <input type="date" name="from" value={form.from} onChange={handleChange} required /><br />
        <input type="date" name="to" value={form.to} onChange={handleChange} required /><br />
        <label><input type="checkbox" name="music" onChange={handleChange} /> Музыка</label><br />
        <label><input type="checkbox" name="festivals" onChange={handleChange} /> Фестивали</label><br />
        <label><input type="checkbox" name="clubs" onChange={handleChange} /> Клубы</label><br />
        <label><input type="checkbox" name="family" onChange={handleChange} /> Для семьи</label><br />
        <button type="submit">Найти события</button>
      </form>

      {results && (
        <div style={{ marginTop: '30px' }}>
          <h2>Результаты:</h2>
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
    </div>
  );
}
