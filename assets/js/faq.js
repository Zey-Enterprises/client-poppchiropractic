const library = document.querySelector('[data-faq-library]');
const filters = library.querySelector('form');
const search = filters.elements.q;
const topic = filters.elements.topic;
const sort = filters.elements.sort;
const list = library.querySelector("#faq-results");
const status = library.querySelector('[data-faq-status]');
const empty = library.querySelector('[data-faq-empty]');
const entries = Array.from(library.querySelectorAll('[data-answer]'), item => ({
  item,
  title: item.querySelector("strong").textContent,
  text: words(item.textContent + ' ' + item.dataset.answer)
}));

function words(text) {
  return text.normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '').match(/[\p{L}\p{N}]+/gu) || [];
}

function render() {
  const terms = words(search.value);
  let count = 0;
  const alphabetical = (a, b) => a.title.localeCompare(b.title);
  const ordered = [...entries].sort((a, b) => {
    if (sort.value === 'topic') return a.item.dataset.topic.localeCompare(b.item.dataset.topic) || alphabetical(a, b);
    return sort.value === 'title-desc' ? alphabetical(b, a) : alphabetical(a, b);
  });
  for (const entry of ordered) list.append(entry.item);
  for (const {item, text} of entries) {
    const matches = (!topic.value || item.dataset.topic === topic.value) &&
      terms.every(term => text.some(word => word.startsWith(term)));
    item.hidden = !matches;
    if (matches) count++;
  }
  status.textContent = count === 1 ? '1 question' : count + ' questions';
  empty.hidden = count !== 0;
}

function update() {
  const url = new URL(location.href);
  for (const field of [search, topic, sort]) {
    if (field.value.trim()) url.searchParams.set(field.name, field.value.trim());
    else url.searchParams.delete(field.name);
  }
  history.replaceState(null, '', url);
  render();
}

function restore() {
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  topic.value = params.get('topic') || '';
  sort.value = params.get('sort') || '';
  if (sort.selectedIndex === -1) sort.value = '';
  if (topic.selectedIndex === -1) topic.value = '';
  render();
}

filters.addEventListener('submit', event => { event.preventDefault(); update(); });
search.addEventListener('input', update);
topic.addEventListener('change', update);
sort.addEventListener('change', update);
filters.addEventListener('reset', () => setTimeout(update, 0));
window.addEventListener('popstate', restore);
restore();
filters.hidden = false;
