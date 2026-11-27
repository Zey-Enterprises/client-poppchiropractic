const dialog = document.querySelector('.patient-dialog');
const frame = dialog.querySelector('iframe');
const title = dialog.querySelector('h2');
const external = dialog.querySelector('[data-form-external]');
const desktop = matchMedia('(min-width: 768px) and (pointer: fine)');
let opener;

for (const link of document.querySelectorAll('[data-patient-form]')) {
  link.addEventListener('click', event => {
    if (!desktop.matches || !dialog.showModal || event.defaultPrevented ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    opener = link;
    title.textContent = link.dataset.formTitle;
    frame.title = link.dataset.formTitle;
    frame.src = external.href = link.href;
    dialog.showModal();
    document.documentElement.classList.add('patient-dialog-open');
  });
}

dialog.addEventListener('close', () => {
  frame.removeAttribute('src');
  external.removeAttribute('href');
  document.documentElement.classList.remove('patient-dialog-open');
  opener?.focus({preventScroll: true});
});
