/* De agenda. Nieuwe optredens voeg je hieronder toe — de volgorde maakt niet uit,
   de lijst wordt op datum gesorteerd. Voorbije data verdwijnen vanzelf, dus je
   hoeft niets op te ruimen.

   datum   'JJJJ-MM-DD'
   tijd    zoals het op de poster staat, bijvoorbeeld '18.00'
   soort   'Live', 'DJ', 'Expositie', 'Pubquiz' — wordt het gouden labeltje
   naam    de band of de act
   wat     korte omschrijving, mag leeg                                        */

const EVENTS = [
  {
    datum: '2026-09-05',
    tijd: '18.00',
    soort: 'Live',
    naam: 'THE ACETONES',
    wat: '60ties garagerock/punk'
  },
  {
    datum: '2026-09-27',
    tijd: '17.00',
    soort: 'Live',
    naam: 'BLACK DIAMOND APPLE',
    wat: 'blues rock covers'
  }
];

const DAGEN = ['zon', 'maa', 'din', 'woe', 'don', 'vri', 'zat'];
const MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const MAANDEN_VOLUIT = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

function komendeEvents() {
  // middernacht vandaag: een optreden van vanavond hoort er nog bij te staan
  const vandaag = new Date();
  vandaag.setHours(0, 0, 0, 0);

  return EVENTS
    .map(e => ({ ...e, date: new Date(e.datum + 'T00:00:00') }))
    .filter(e => !isNaN(e.date) && e.date >= vandaag)
    .sort((a, b) => a.date - b.date);
}

function eventKaart(e) {
  const dag = DAGEN[e.date.getDay()];
  const nummer = e.date.getDate();
  const maand = MAANDEN[e.date.getMonth()];
  const volledig = `${nummer} ${MAANDEN_VOLUIT[e.date.getMonth()]} ${e.date.getFullYear()}`;

  return `
    <article class="bg-card rounded-lg border-2 border-primary/10 hover:border-gold transition-colors p-6 flex gap-5 items-start">
      <div class="shrink-0 w-16 text-center" title="${volledig}">
        <div class="label-mono text-accent">${dag}</div>
        <div class="font-heading text-4xl text-primary leading-none mt-1">${nummer}</div>
        <div class="label-mono text-muted-foreground mt-1">${maand}</div>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider bg-gold/15 text-gold px-1.5 py-0.5 rounded">${e.soort}</span>
          <span class="font-mono text-xs text-muted-foreground">${e.tijd} uur</span>
        </div>
        <h3 class="font-heading text-2xl md:text-3xl text-primary mt-2 leading-tight">${e.naam}</h3>
        ${e.wat ? `<p class="text-sm text-muted-foreground mt-1">${e.wat}</p>` : ''}
      </div>
    </article>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const lijsten = document.querySelectorAll('[data-events]');
  if (!lijsten.length) return;

  const komend = komendeEvents();

  lijsten.forEach(lijst => {
    const limiet = parseInt(lijst.dataset.events, 10);
    const tonen = limiet > 0 ? komend.slice(0, limiet) : komend;
    lijst.innerHTML = tonen.map(eventKaart).join('');
    lijst.classList.toggle('hidden', tonen.length === 0);
  });

  // de "geen evenementen"-tekst alleen laten staan als er echt niets is
  document.querySelectorAll('[data-events-empty]').forEach(el => {
    el.classList.toggle('hidden', komend.length > 0);
  });
});
