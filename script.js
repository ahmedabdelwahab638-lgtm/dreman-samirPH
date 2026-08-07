const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const whatsappForm = document.querySelector('#whatsapp-form');
const formStatus = document.querySelector('#form-status');

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
    `البريد الإلكتروني: ${data.get('email')}`,
    `الخدمة المطلوبة: ${data.get('service')}`,
    `التفاصيل: ${data.get('details')}`
  ].join('\n');

  formStatus.textContent = 'تم تجهيز الرسالة. سيتم فتح واتساب الآن.';
  const whatsappUrl = `https://wa.me/201055283966?text=${encodeURIComponent(message)}`;
  window.location.assign(whatsappUrl);
});