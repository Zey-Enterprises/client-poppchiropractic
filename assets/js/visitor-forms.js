for (const form of document.querySelectorAll('[data-visitor-form]')) {
  const status = form.querySelector('[role="status"]');
  const demo = form.querySelector('[data-demo-fields]');
  if (demo) {
    let toastTimer;
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (form.dataset.visitorForm === 'newsletter') {
        status.textContent = 'This is a demo. Newsletter signup is not connected yet.';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { status.textContent = ''; }, 4500);
      } else {
        status.textContent = 'Your message was not sent. Please call the practice.';
      }
      form.reset();
    });
    continue;
  }

  if (form.dataset.visitorForm !== 'contact') continue;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {Accept: 'application/json'}
      });
      if (!response.ok) throw new Error('Provider rejected message');
      status.textContent = 'Your general question was sent.';
      form.reset();
    } catch {
      status.textContent = 'Your message could not be sent. Try again or call the office.';
    } finally {
      button.disabled = false;
    }
  });
}

