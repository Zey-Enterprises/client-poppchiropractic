const canonical = document.querySelector('link[rel="canonical"]');
const canonicalOrigin = canonical ? new URL(canonical.href).origin : location.origin;

for (const link of document.querySelectorAll('a[href]')) {
  if (!['http:', 'https:'].includes(link.protocol)) continue;
  if (link.origin === location.origin || link.origin === canonicalOrigin) continue;
  link.target = '_blank';
  link.relList.add('noopener', 'noreferrer');
}

for (const button of document.querySelectorAll('[data-print]')) {
  button.hidden = false;
  button.addEventListener('click', () => window.print());
}
