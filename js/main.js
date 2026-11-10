'use strict';

// Native details remains usable without JavaScript; enhance keyboard closing.
const menu = document.querySelector('.nav-menu');
const menuDesktop = matchMedia('(min-width: 768px)');
const filters = document.querySelector('.filter-panel');
const filtersDesktop = matchMedia('(min-width: 1024px)');
function syncPanels() {
  if (menu) menu.open = menuDesktop.matches;
  if (filters) filters.open = filtersDesktop.matches;
}
syncPanels();
menuDesktop.addEventListener('change', syncPanels);
filtersDesktop.addEventListener('change', syncPanels);
menu?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menuDesktop.matches) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
document.addEventListener('click', (event) => {
  if (menu && !menuDesktop.matches && menu.open && !menu.contains(event.target)) menu.open = false;
});

// Модальное окно: фокус, закрытие Escape и возврат на исходную кнопку.
const dialog = document.getElementById('order-dialog');
let dialogTrigger;
document.querySelectorAll('[data-product]').forEach((button) => {
  button.addEventListener('click', () => {
    dialogTrigger = button;
    dialog.querySelector('form').reset();
    dialog.querySelector('.form-status').textContent = '';
    dialog.querySelector('[name=product]').value = button.dataset.product;
    document.getElementById('dialog-product').textContent = button.dataset.product;
    dialog.showModal();
    dialog.querySelector('[name=name]').focus();
  });
});
dialog?.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => { if (event.target === dialog) {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}});
dialog?.addEventListener('close', () => dialogTrigger?.focus());
// Keep Tab and Shift+Tab within the dialog, including the browser's wrap boundary.
dialog?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button, input:not([type=hidden]), select, textarea, a[href]')]
    .filter((element) => !element.disabled && element.getClientRects().length);
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// Проверка форм средствами браузера и доступные сообщения о результате.
document.querySelectorAll('[data-request-form]').forEach((form) => {
  // Add linked error text without suppressing the browser's validation messages.
  form.querySelectorAll('input:not([type=hidden]), textarea, select').forEach((field, index) => {
    const error = document.createElement('span');
    error.className = 'field-error';
    error.id = `${field.id || form.closest('dialog')?.id || 'form'}-error-${index}`;
    error.hidden = true;
    field.closest('label')?.classList.contains('checkbox')
      ? field.closest('label').after(error)
      : field.after(error);
    field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
    field.addEventListener('invalid', () => {
      field.setAttribute('aria-invalid', 'true');
      error.textContent = field.validationMessage;
      error.hidden = false;
    });
    field.addEventListener('input', () => {
      field.removeAttribute('aria-invalid');
      error.hidden = true;
      error.textContent = '';
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    status.textContent = 'Все обязательные поля заполнены корректно.';
    status.focus();
  });
  form.addEventListener('input', () => { form.querySelector('.form-status').textContent = ''; });
  form.addEventListener('reset', () => {
    form.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach((error) => {
      error.hidden = true;
      error.textContent = '';
    });
    form.querySelector('.form-status').textContent = '';
  });
});
const selected = Number(new URLSearchParams(location.search).get('product'));
const productSelect = document.getElementById('order-product');
if (productSelect && Number.isInteger(selected) && selected >= 1 && selected <= 3) productSelect.selectedIndex = selected;

// Small catalog enhancement; the complete HTML catalog is available without JS.
const filterForm = document.getElementById('filters-form');
const grid = document.getElementById('catalog-grid');
if (filterForm && grid) {
  const cards = Array.from(grid.children);
  const sort = document.getElementById('sort');
  const from = filterForm.elements.min;
  const to = filterForm.elements.max;
  function updateCatalog() {
    const data = new FormData(filterForm);
    const kinds = data.getAll('kind');
    const min = from.value === '' ? 0 : Number(from.value);
    const max = to.value === '' ? Infinity : Number(to.value);
    to.setCustomValidity(max < min ? 'Цена «До» должна быть не меньше цены «От».' : '');
    if (!filterForm.reportValidity()) return;
    const ordered = [...cards];
    if (sort.value !== 'default') ordered.sort((a,b) => (Number(a.dataset.price) - Number(b.dataset.price)) * (sort.value === 'asc' ? 1 : -1));
    let count = 0;
    ordered.forEach((card) => {
      const price = Number(card.dataset.price);
      card.hidden = !(price >= min && price <= max && (!kinds.length || kinds.includes(card.dataset.kind)));
      if (!card.hidden) count++;
      grid.append(card);
    });
    document.getElementById('result-count').textContent = `Найдено моделей: ${count}`;
    document.getElementById('empty-state').hidden = count > 0;
  }
  filterForm.addEventListener('submit', (event) => { event.preventDefault(); updateCatalog(); });
  filterForm.addEventListener('input', () => to.setCustomValidity(''));
  filterForm.addEventListener('reset', () => { to.setCustomValidity(''); setTimeout(updateCatalog, 0); });
  sort.addEventListener('change', updateCatalog);
}
