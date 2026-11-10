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

// Enhance the original KR1 dialog with native focus trapping and Escape support.
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

// Preserve browser validation and clearly identify this as a local demo.
document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    status.textContent = 'Форма заполнена корректно. Это учебная проверка: данные не отправлены и не сохранены.';
    status.focus();
  });
  form.addEventListener('input', () => { form.querySelector('.form-status').textContent = ''; });
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
