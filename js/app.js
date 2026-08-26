/* Behaviour that the original site handled in React:
   mobile menu, opening-hours line, drankenkaart tabs, forms, photo lightbox. */

const OPENING_HOURS = [
  { day: 'Zondag',    label: '15:00 – 22:00', closed: false },
  { day: 'Maandag',   label: 'Gesloten',      closed: true  },
  { day: 'Dinsdag',   label: '15:00 – 01:00', closed: false },
  { day: 'Woensdag',  label: '15:00 – 01:00', closed: false },
  { day: 'Donderdag', label: '15:00 – 01:00', closed: false },
  { day: 'Vrijdag',   label: '15:00 – 02:00', closed: false },
  { day: 'Zaterdag',  label: '15:00 – 02:00', closed: false }
];

function initMobileMenu() {
  const panel = document.querySelector('[data-mobile-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  if (!panel || !openBtn) return;

  const set = open => {
    panel.classList.toggle('hidden', !open);
    panel.classList.toggle('flex', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  openBtn.addEventListener('click', () => set(true));
  if (closeBtn) closeBtn.addEventListener('click', () => set(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
}

function initTodayHours() {
  const today = OPENING_HOURS[new Date().getDay()];
  const text = today.closed ? 'Vandaag gesloten' : 'Vandaag geopend: ' + today.label;
  document.querySelectorAll('[data-today-hours]').forEach(el => { el.textContent = text; });

  // op de contactpagina krijgt de dag van vandaag de accentkleur
  document.querySelectorAll('[data-day]').forEach(row => {
    const isToday = row.dataset.day === today.day;
    row.classList.toggle('text-muted-foreground', !isToday);
    row.classList.toggle('text-accent', isToday);
    row.classList.toggle('font-bold', isToday);
  });
}

function initYear() {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* Drankenkaart: the category buttons filter the sections, like the original tabs. */
function initMenuTabs() {
  const tabs = document.querySelectorAll('[data-cat]');
  const blocks = document.querySelectorAll('[data-cat-block]');
  if (!tabs.length || !blocks.length) return;

  const activeCls = ['bg-primary', 'text-primary-foreground', 'border-primary'];
  const idleCls = ['bg-transparent', 'border-border'];

  const select = cat => {
    tabs.forEach(t => {
      const on = t.dataset.cat === cat;
      t.classList.toggle('ring-2', on);
      activeCls.forEach(c => t.classList.toggle(c, on));
      idleCls.forEach(c => t.classList.toggle(c, !on));
    });
    blocks.forEach(b => {
      b.classList.toggle('hidden', b.dataset.catBlock !== cat);
    });
  };

  tabs.forEach(t => t.addEventListener('click', () => select(t.dataset.cat)));
  select(tabs[0].dataset.cat);
}

/* Contact page: the three form types swap the subject line. */
function initFormTypes() {
  const tabs = document.querySelectorAll('[data-form-type]');
  const subject = document.getElementById('onderwerp');
  if (!tabs.length) return;

  const on = ['bg-primary', 'text-primary-foreground', 'border-primary'];
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => on.forEach(c => t.classList.toggle(c, t === tab)));
      if (subject) subject.value = tab.dataset.formType;
    });
  });
}

/* Formulieren versturen naar de API-functies in api/. */
function initForms() {
  document.querySelectorAll('form[data-form]').forEach(form => {
    const endpoint = form.dataset.form;
    if (!endpoint) return;

    const ok = form.querySelector('[data-form-ok]');
    const error = form.querySelector('[data-form-error]');
    const button = form.querySelector('button[type="submit"]');
    const buttonLabel = button ? button.innerHTML : '';

    const show = (el, message) => {
      if (!el) return;
      if (message) el.textContent = message;
      el.classList.remove('hidden');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const hide = el => el && el.classList.add('hidden');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      hide(ok);
      hide(error);

      if (!form.reportValidity()) return;

      if (button) {
        button.disabled = true;
        button.textContent = 'Versturen…';
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
        });

        let result = {};
        try { result = await response.json(); } catch { /* geen json terug */ }

        if (response.ok && result.ok) {
          form.reset();
          // de onderwerpregel hoort weer op het gekozen type te staan
          const active = form.parentElement?.querySelector('[data-form-type].bg-primary');
          const subject = form.querySelector('#onderwerp');
          if (active && subject) subject.value = active.dataset.formType;
          show(ok);
        } else {
          show(error, result.error || 'Versturen lukte niet. Probeer het later nog eens, of mail ons direct op bakkerlianne@live.nl.');
        }
      } catch {
        show(error, 'Geen verbinding. Controleer je internet en probeer het opnieuw.');
      } finally {
        if (button) {
          button.disabled = false;
          button.innerHTML = buttonLabel;
        }
      }
    });
  });
}

/* Foto's: click a photo to see it large. */
function initLightbox() {
  const shots = document.querySelectorAll('[data-shot]');
  if (!shots.length) return;

  const box = document.createElement('div');
  box.className = 'fixed inset-0 z-[60] hidden items-center justify-center bg-primary/95 p-6';
  box.innerHTML =
    '<button class="absolute top-5 right-6 text-primary-foreground" aria-label="Sluiten">' +
    '<svg class="lucide lucide-x w-8 h-8" data-icon="lucide-x"></svg></button>' +
    '<img class="max-h-[85vh] max-w-full object-contain rounded border-2 border-gold" alt="">';
  document.body.appendChild(box);
  if (window.inflateIcons) inflateIcons(box);

  const img = box.querySelector('img');
  const close = () => { box.classList.remove('flex'); box.classList.add('hidden'); };

  shots.forEach(shot => {
    shot.addEventListener('click', () => {
      const source = shot.querySelector('img');
      if (!source) return;
      img.src = source.src;
      img.alt = source.alt;
      box.classList.remove('hidden');
      box.classList.add('flex');
    });
  });
  box.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTodayHours();
  initYear();
  initMenuTabs();
  initFormTypes();
  initForms();
  initLightbox();
});
