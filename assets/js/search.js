const form = document.querySelector('.search-form');
const field = form.elements.q;
const status = document.querySelector('#search-status');
const results = document.querySelector('#search-results');
const query = new URLSearchParams(location.search).get('q')?.trim() || '';
field.value = query;

const tokens = (text) => text.toLowerCase().normalize('NFKD')
  .replace(/\p{M}/gu, '').match(/[\p{L}\p{N}]+/gu) || [];

function match(terms, words) {
  return terms.map(term => words.has(term) ? 1 :
    term.length >= 4 && [...words].some(word => word.startsWith(term)) ? 0.5 : 0);
}

function excerpt(body, metadata, terms) {
  const text = tokens(body).some(token => terms.some(term => token.startsWith(term))) ? body : metadata || body;
  const words = text.split(/\s+/);
  const hit = words.findIndex(word => tokens(word).some(
    token => terms.some(term => token === term || term.length >= 4 && token.startsWith(term))));
  const start = Math.max(0, hit - 8);
  return (start ? '… ' : '') + words.slice(start, start + 33).join(' ') +
    (start + 33 < words.length ? ' …' : '');
}

async function search() {
  const terms = [...new Set(tokens(query))];
  if (!terms.length) {
    status.textContent = 'Enter a topic, title, or phrase to search the website.';
    return;
  }
  status.textContent = 'Searching…';
  try {
    const response = await fetch(document.querySelector('[data-search-index]').dataset.searchIndex);
    if (!response.ok) throw new Error('Search index unavailable');
    const entries = await response.json();
    const matches = [];
    const decoder = document.createElement('textarea');
    for (const entry of entries) {
      decoder.innerHTML = entry.body.replace(/</g, '&lt;');
      entry.body = decoder.value;
      const title = match(terms, new Set(tokens(entry.title)));
      const metadata = match(terms, new Set(tokens(entry.metadata + ' ' + entry.type)));
      const body = match(terms, new Set(tokens(entry.body)));
      if (terms.every((_, i) => title[i] || metadata[i] || body[i])) {
        const score = terms.reduce((sum, _, i) => sum + 6 * title[i] + 3 * metadata[i] + body[i], 0);
        matches.push({entry, score});
      }
    }
    matches.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} for “${query}”.` :
      `No results for “${query}”. Try fewer words or a different term.`;
    for (const {entry} of matches) {
      const result = document.createElement('li');
      const title = document.createElement('a');
      title.href = entry.url;
      title.textContent = entry.title;
      const type = document.createElement('small');
      type.textContent = entry.type;
      const snippet = document.createElement('p');
      snippet.textContent = excerpt(entry.body, entry.metadata, terms);
      result.append(type, title, snippet);
      results.append(result);
    }
  } catch {
    status.textContent = 'Search is temporarily unavailable. Try again or browse the Knowledge Base.';
  }
}
search();
