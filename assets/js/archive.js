const filters = document.querySelector('.archive-filters');
const rows = Array.from(document.querySelectorAll('.article-list li'), row => ({
  row,
  kind: row.dataset.kind,
  month: row.dataset.month,
  category: JSON.parse(row.dataset.categories),
  tag: JSON.parse(row.dataset.tags)
}));
const pagination = document.querySelector('.archive-pagination');
const status = document.querySelector('#archive-status');
const title = document.querySelector('[data-archive-title]');
const pageSize = 10;
const keys = ['category', 'tag', 'month'];
const monthFormat = new Intl.DateTimeFormat(document.documentElement.lang, {
  month: 'long', year: 'numeric', timeZone: 'UTC'
});

function render() {
  const params = new URLSearchParams(location.search);
  const legacyFilter = keys.some(key => params.has(key)) || params.has('page') || params.has('focus');
  const requested = params.get('kind');
  const kind = ['all', 'articles', 'video'].includes(requested) ? requested : (legacyFilter ? 'all' : 'articles');
  title.textContent = {all: 'Post archive', articles: 'Article archive', video: 'Video post archive'}[kind];
  filters.elements.kind.value = kind;
  const byKind = rows.filter(entry => kind === 'all' || (kind === 'video' ? entry.kind === 'video' : entry.kind !== 'video'));
  for (const key of ['category', 'tag', 'month']) {
    const select = filters.elements[key];
    const available = key === 'month' ? byKind.map(entry => entry.month).sort().reverse() : byKind.flatMap(entry => entry[key]).sort();
    const options = [...new Set(available)];
    const label = {category: 'All categories', tag: 'All tags', month: 'All months'}[key];
    select.replaceChildren(new Option(label, ''));
    for (const value of options) select.add(new Option(key === 'month' ? monthFormat.format(new Date(value + '-01T00:00:00Z')) : value, value));
    if (params.has(key) && !options.includes(params.get(key))) select.add(new Option(params.get(key), params.get(key)));
    select.value = params.get(key) || '';
  }
  const matching = byKind.filter(entry => keys.every(key => {
    const value = params.get(key);
    return !value || (key === 'month' ? entry.month === value : entry[key].includes(value));
  }));
  const unit = kind === 'articles' ? 'article' : kind === 'video' ? 'video' : 'post';
  const pages = Math.max(1, Math.ceil(matching.length / pageSize));
  const current = Math.min(pages, Math.max(1, Math.floor(Number(params.get('page')) || 1)));
  const visible = new Set(matching.slice((current - 1) * pageSize, current * pageSize));
  for (const entry of rows) entry.row.hidden = !visible.has(entry);
  status.textContent = matching.length
    ? `${matching.length} ${matching.length === 1 ? unit : unit + 's'} · Page ${current} of ${pages}`
    : 'No results match these filters. Try a different category, tag or month.';

  pagination.replaceChildren();
  pagination.hidden = pages === 1;
  for (let number = 1; number <= pages; number++) {
    const link = document.createElement('a');
    const pageParams = new URLSearchParams(params);
    pageParams.delete('focus');
    pageParams.set('kind', kind);
    if (number === 1) pageParams.delete('page');
    else pageParams.set('page', String(number));
    link.href = pageParams.size ? '?' + pageParams : location.pathname;
    link.textContent = number;
    link.setAttribute('aria-label', 'Page ' + number);
    if (number === current) link.setAttribute('aria-current', 'page');
    pagination.append(link);
  }
}

filters.addEventListener('submit', event => event.preventDefault());
filters.addEventListener('change', () => {
  const params = new URLSearchParams();
  params.set('kind', filters.elements.kind.value || 'articles');
  for (const key of keys) {
    const value = filters.elements[key].value;
    if (value) params.set(key, value);
  }
  history.pushState(null, '', params.size ? '?' + params : location.pathname);
  render();
});
window.addEventListener('popstate', render);
filters.hidden = false;
render();

const requestedControl = new URLSearchParams(location.search).get('focus');
if (keys.includes(requestedControl)) filters.elements[requestedControl].focus({preventScroll: true});
