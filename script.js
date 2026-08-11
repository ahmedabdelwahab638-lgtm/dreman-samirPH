const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const whatsappForm = document.querySelector('#whatsapp-form');
const formStatus = document.querySelector('#form-status');
const drugSearchInput = document.querySelector('#drug-search-input');
const drugSearchClear = document.querySelector('#drug-search-clear');
const drugSearchResults = document.querySelector('#drug-search-results');
const inventoryUpdateDate = document.querySelector('#inventory-update-date');

function updateThemeButton() {
  const isDark = root.dataset.theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  themeToggle?.setAttribute('aria-label', isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
}

updateThemeButton();

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  try { localStorage.setItem('eman-pharmacy-theme', nextTheme); } catch (error) {}
  updateThemeButton();
});

function closeMenu() {
  mainNav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'فتح القائمة');
  document.body.classList.remove('nav-open');
}

menuToggle?.addEventListener('click', () => {
  const willOpen = !mainNav?.classList.contains('is-open');
  mainNav?.classList.toggle('is-open', willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'إغلاق القائمة' : 'فتح القائمة');
  document.body.classList.toggle('nav-open', willOpen);
});

mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('resize', () => {
  if (window.innerWidth > 1040) closeMenu();
});

document.querySelectorAll('[data-delay]').forEach((element) => {
  element.style.setProperty('--reveal-delay', `${element.dataset.delay}ms`);
});

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -45px' });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

whatsappForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!whatsappForm.checkValidity()) {
    whatsappForm.reportValidity();
    return;
  }

  const data = new FormData(whatsappForm);
  const message = [
    'السلام عليكم، أريد التواصل مع صيدلية دكتورة إيمان سمير الصاوي.',
    '',
    `الاسم: ${data.get('name')}`,
    `رقم واتساب: ${data.get('whatsapp')}`,
    `العنوان: ${data.get('address')}`,
    `الخدمة المطلوبة: ${data.get('service')}`,
    `التفاصيل: ${data.get('details')}`
  ].join('\n');

  formStatus.textContent = 'تم تجهيز الرسالة. سيتم فتح واتساب الآن.';
  const whatsappUrl = `https://wa.me/201055283966?text=${encodeURIComponent(message)}`;
  window.location.assign(whatsappUrl);
});

const normalizeDrugName = (value) => String(value ?? '')
  .normalize('NFKC')
  .toLocaleLowerCase('ar-EG')
  .replace(/[\u064b-\u065f\u0670]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function createWhatsAppLink(drugName, available) {
  const availabilityLine = available
    ? 'ظهر في الموقع أنه متوفر حسب آخر تحديث، وأريد تأكيد التوفر قبل الحضور.'
    : 'ظهر في الموقع أنه غير متوفر حاليًا، وأريد طلب توفيره.';
  const message = [
    'السلام عليكم، أريد الاستفسار عن الدواء التالي:',
    drugName,
    availabilityLine
  ].join('\n');
  return `https://wa.me/201055283966?text=${encodeURIComponent(message)}`;
}

function createDrugResult(item) {
  const article = document.createElement('article');
  article.className = 'drug-result';

  const info = document.createElement('div');
  info.className = 'drug-result-info';

  const name = document.createElement('strong');
  name.className = 'drug-result-name';
  name.dir = 'auto';
  name.textContent = item.name;

  const status = document.createElement('span');
  status.className = `drug-status ${item.available ? 'available' : 'unavailable'}`;
  status.textContent = item.available ? 'متوفر حسب آخر تحديث' : 'غير متوفر حاليًا';

  const action = document.createElement('a');
  action.className = 'drug-result-action';
  action.href = createWhatsAppLink(item.name, item.available);
  action.target = '_blank';
  action.rel = 'noopener';
  action.textContent = 'اطلب توفيره عبر واتساب';
  action.setAttribute('aria-label', `اطلب ${item.name} عبر واتساب`);

  info.append(name, status);
  article.append(info, action);
  return article;
}

function createEmptySearchState(message, query = '') {
  const empty = document.createElement('div');
  empty.className = 'drug-search-empty';

  const text = document.createElement('span');
  text.textContent = message;
  empty.append(text);

  if (query) {
    const action = document.createElement('a');
    action.className = 'drug-result-action';
    action.href = createWhatsAppLink(query, false);
    action.target = '_blank';
    action.rel = 'noopener';
    action.textContent = 'اطلب توفيره عبر واتساب';
    action.style.marginTop = '14px';
    empty.append(action);
  }

  return empty;
}

if (drugSearchInput && drugSearchResults) {
  fetch('assets/inventory-public.json?v=20260810', { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error('Inventory could not be loaded');
      return response.json();
    })
    .then((data) => {
      const inventory = Array.isArray(data.items)
        ? data.items.map((item) => ({ ...item, searchName: normalizeDrugName(item.name) }))
        : [];

      if (inventoryUpdateDate && data.updatedAt) inventoryUpdateDate.textContent = data.updatedAt;
      drugSearchInput.disabled = false;
      drugSearchInput.placeholder = 'مثال: بانادول أو Panadol';
      drugSearchResults.setAttribute('aria-busy', 'false');
      drugSearchResults.replaceChildren(createEmptySearchState('اكتب حرفين على الأقل لبدء البحث.'));

      function renderDrugSearch() {
        const rawQuery = drugSearchInput.value.trim();
        const query = normalizeDrugName(rawQuery);
        drugSearchClear.hidden = rawQuery.length === 0;

        if (query.length < 2) {
          drugSearchResults.replaceChildren(createEmptySearchState('اكتب حرفين على الأقل لبدء البحث.'));
          return;
        }

        const queryParts = query.split(' ');
        const matches = inventory
          .filter((item) => queryParts.every((part) => item.searchName.includes(part)))
          .sort((first, second) => {
            const firstRank = first.searchName === query ? 0 : first.searchName.startsWith(query) ? 1 : 2;
            const secondRank = second.searchName === query ? 0 : second.searchName.startsWith(query) ? 1 : 2;
            return firstRank - secondRank || first.name.localeCompare(second.name, 'ar-EG', { numeric: true });
          });

        if (!matches.length) {
          drugSearchResults.replaceChildren(createEmptySearchState('لم نجد الاسم في آخر تحديث. يمكنك طلب توفيره مباشرةً.', rawQuery));
          return;
        }

        const visibleMatches = matches.slice(0, 10);
        const fragment = document.createDocumentFragment();
        visibleMatches.forEach((item) => fragment.append(createDrugResult(item)));

        if (matches.length > visibleMatches.length) {
          const more = document.createElement('p');
          more.className = 'drug-search-more';
          more.textContent = `يوجد ${matches.length - visibleMatches.length} نتيجة إضافية — اكتب اسمًا أدق.`;
          fragment.append(more);
        }

        drugSearchResults.replaceChildren(fragment);
      }

      drugSearchInput.addEventListener('input', renderDrugSearch);
      drugSearchClear?.addEventListener('click', () => {
        drugSearchInput.value = '';
        renderDrugSearch();
        drugSearchInput.focus();
      });
    })
    .catch(() => {
      drugSearchInput.disabled = false;
      drugSearchInput.placeholder = 'اكتب اسم الدواء';
      drugSearchResults.setAttribute('aria-busy', 'false');
      drugSearchResults.replaceChildren(createEmptySearchState('تعذر تحديث البحث الآن. اكتب اسم الدواء وأرسله لنا على واتساب.'));
    });
}
