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
const protectedWhatsAppUrls = new WeakMap();

function trackEvent() {}

function protectWhatsAppLink(link, destination = link.href) {
  if (!link || !destination.includes('wa.me/201055283966')) return;
  protectedWhatsAppUrls.set(link, destination);
  link.href = 'https://wa.me/201055283966';
}

document.querySelectorAll('a[href*="wa.me/201055283966"]').forEach((link) => protectWhatsAppLink(link));

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href') ?? '';
  const protectedWhatsAppUrl = protectedWhatsAppUrls.get(link);
  if (protectedWhatsAppUrl) {
    event.preventDefault();
    const context = link.closest('.drug-result') ? 'drug_search_result'
      : link.closest('.shortage-product') ? 'shortage_product'
      : link.classList.contains('whatsapp-float') ? 'floating_button'
      : link.classList.contains('nav-whatsapp') ? 'header_button'
      : link.closest('#contact') ? 'contact_section'
      : 'site_content';
    trackEvent('whatsapp_click', { link_context: context });
    if (link.target === '_blank') window.open(protectedWhatsAppUrl, '_blank', 'noopener');
    else window.location.assign(protectedWhatsAppUrl);
  } else if (href.startsWith('tel:')) {
    trackEvent('phone_click', { link_context: link.closest('footer') ? 'footer' : 'site_content' });
  } else if (link.classList.contains('map-link')) {
    trackEvent('map_click', { link_context: 'location_section' });
  }
});

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
  trackEvent('whatsapp_form_submit', { form_name: 'contact_whatsapp' });
  const whatsappUrl = `https://wa.me/201055283966?text=${encodeURIComponent(message)}`;
  window.location.assign(whatsappUrl);
});

const normalizeDigits = (value) => String(value ?? '')
  .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
  .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));

const normalizeDrugName = (value) => normalizeDigits(value)
  .normalize('NFKC')
  .toLocaleLowerCase('ar-EG')
  .replace(/[\u064b-\u065f\u0670]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const phoneticCharacterMap = {
  a: '', e: '', i: '', o: '', u: '', y: '', w: '',
  b: 'b', p: 'b', f: 'f', v: 'f', t: 't', d: 'd',
  k: 'k', q: 'k', c: 'k', g: 'g', j: 'g',
  s: 's', z: 'z', r: 'r', l: 'l', m: 'm', n: 'n', h: 'h', x: 'ks',
  ا: '', أ: '', إ: '', آ: '', ء: '', ئ: '', ؤ: '', ع: '',
  و: '', ي: '', ى: '', ة: 'h',
  ب: 'b', پ: 'b', ف: 'f', ڤ: 'f', ت: 't', ط: 't', د: 'd', ض: 'd',
  ك: 'k', ق: 'k', ج: 'g', چ: 'g', غ: 'g',
  س: 's', ص: 's', ز: 'z', ذ: 'z', ظ: 'z',
  ش: 'sh', ث: 'th', خ: 'kh', ح: 'h', ه: 'h',
  ر: 'r', ل: 'l', م: 'm', ن: 'n'
};

function buildPhoneticKey(value, { chAs = 'sh', softC = false } = {}) {
  let normalized = normalizeDrugName(value)
    .replace(/ph/g, '\ue000')
    .replace(/sh/g, '\ue001')
    .replace(/th/g, '\ue002')
    .replace(/kh/g, '\ue003')
    .replace(/gh/g, '\ue004')
    .replace(/qu/g, '\ue005')
    .replace(/ck/g, '\ue005')
    .replace(/ch/g, chAs === 'k' ? '\ue005' : '\ue001');

  if (softC) normalized = normalized.replace(/c(?=[eiy])/g, 's');

  return [...normalized]
    .map((character) => {
      if (character === '\ue000') return 'f';
      if (character === '\ue001') return 'sh';
      if (character === '\ue002') return 'th';
      if (character === '\ue003') return 'kh';
      if (character === '\ue004') return 'g';
      if (character === '\ue005') return 'k';
      if (/\d/.test(character)) return character;
      if (/\s/.test(character)) return ' ';
      return phoneticCharacterMap[character] ?? '';
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function createPhoneticKeys(value) {
  return [...new Set([
    buildPhoneticKey(value),
    buildPhoneticKey(value, { chAs: 'k' }),
    buildPhoneticKey(value, { softC: true }),
    buildPhoneticKey(value, { chAs: 'k', softC: true })
  ])].filter(Boolean);
}

function getDrugMatchRank(item, query, queryParts, queryPhoneticKeys, usePhoneticSearch) {
  if (item.searchName === query) return 0;
  if (item.searchName.startsWith(query)) return 1;
  if (queryParts.every((part) => item.searchName.includes(part))) return 2;
  if (!usePhoneticSearch) return Number.POSITIVE_INFINITY;

  let bestPhoneticRank = Number.POSITIVE_INFINITY;
  for (const queryKey of queryPhoneticKeys) {
    for (const itemKey of item.phoneticKeys) {
      if (itemKey === queryKey) bestPhoneticRank = Math.min(bestPhoneticRank, 3);
      else if (itemKey.startsWith(queryKey)) bestPhoneticRank = Math.min(bestPhoneticRank, 4);
      else if (itemKey.includes(queryKey)) bestPhoneticRank = Math.min(bestPhoneticRank, 5);
      else {
        const phoneticParts = queryKey.split(' ');
        if (phoneticParts.every((part) => itemKey.includes(part))) {
          bestPhoneticRank = Math.min(bestPhoneticRank, 6);
        }
      }
    }
  }
  return bestPhoneticRank;
}

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
  protectWhatsAppLink(action, createWhatsAppLink(item.name, item.available));
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
    protectWhatsAppLink(action, createWhatsAppLink(query, false));
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
        ? data.items.map((item) => ({
          ...item,
          searchName: normalizeDrugName(item.name),
          phoneticKeys: createPhoneticKeys(item.name)
        }))
        : [];

      if (inventoryUpdateDate && data.updatedAt) inventoryUpdateDate.textContent = data.updatedAt;
      drugSearchInput.disabled = false;
      drugSearchInput.placeholder = 'مثال: بانادول أو Panadol';
      drugSearchResults.setAttribute('aria-busy', 'false');
      drugSearchResults.replaceChildren(createEmptySearchState('اكتب حرفين على الأقل لبدء البحث.'));

      function renderDrugSearch() {
        const rawQuery = drugSearchInput.value.trim();
        const query = normalizeDrugName(rawQuery);
        const isArabicQuery = /[\u0600-\u06ff]/.test(query);
        const queryPhoneticKeys = createPhoneticKeys(query);
        const phoneticLength = (queryPhoneticKeys[0] ?? '').replace(/\s/g, '').length;
        const usePhoneticSearch = isArabicQuery && phoneticLength >= 3;
        drugSearchClear.hidden = rawQuery.length === 0;

        if (query.length < 2) {
          drugSearchResults.replaceChildren(createEmptySearchState('اكتب حرفين على الأقل لبدء البحث.'));
          return;
        }

        const queryParts = query.split(' ');
        const matches = inventory
          .map((item) => ({
            item,
            rank: getDrugMatchRank(item, query, queryParts, queryPhoneticKeys, usePhoneticSearch)
          }))
          .filter(({ rank }) => Number.isFinite(rank))
          .sort((first, second) => first.rank - second.rank || first.item.name.localeCompare(second.item.name, 'ar-EG', { numeric: true }))
          .map(({ item }) => item);

        if (!matches.length) {
          const missingMessage = isArabicQuery
            ? 'لم نجد الاسم بهذه الكتابة. جرّب كتابته بالإنجليزية كما هو على العبوة، أو اطلب توفيره مباشرةً.'
            : 'لم نجد الاسم في آخر تحديث. يمكنك طلب توفيره مباشرةً.';
          drugSearchResults.replaceChildren(createEmptySearchState(missingMessage, rawQuery));
          scheduleSearchAnalytics('not_found', 0);
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
        scheduleSearchAnalytics('found', matches.length);
      }

      let searchAnalyticsTimer;
      function scheduleSearchAnalytics(resultStatus, resultCount) {
        window.clearTimeout(searchAnalyticsTimer);
        searchAnalyticsTimer = window.setTimeout(() => {
          trackEvent('drug_search', {
            search_result: resultStatus,
            result_count: Math.min(resultCount, 100)
          });
        }, 700);
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
