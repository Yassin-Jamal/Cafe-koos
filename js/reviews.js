/* Reviews, rendered into any [data-reviews] grid. */

const REVIEWS = [
  { name: 'Tim',     stars: 5, text: 'Het bier behoort tot het beste van Den Haag. Personeel is vriendelijk, de sfeer is light punky en het voelt altijd als thuiskomen. Mijn favoriete plek in de stad.' },
  { name: 'Emma',    stars: 5, text: 'Als vrouw voel ik me hier helemaal op mijn gemak. Dat is niet vanzelfsprekend in elke kroeg, maar bij Koos wel. De sfeer is warm, de mensen zijn aardig en iedereen is welkom.' },
  { name: 'Lars',    stars: 4, text: 'Echte buurtkroeg waar je zo een praatje maakt. De prijzen zijn eerlijk en het bier is goed. Precies hoe een kroeg hoort te zijn.' },
  { name: 'Sophie',  stars: 5, text: 'Echt een plek voor iedereen. Brede drankenkaart, gezellig darten en een familiaire vibe. Kom hier al jaren en het voelt als een tweede huiskamer.' },
  { name: 'Daan',    stars: 5, text: 'Liep toevallig naar binnen en het is meteen een pareltje. Eerlijke eigenaar, goede muziek en je mag zelf een nummer aanvragen. Kwaliteit voor een eerlijke prijs.' },
  { name: 'Marieke', stars: 4, text: 'Iedereen is hier welkom en dat merk je. Al jaren een vaste plek in de buurt. Gezellig, ongepolijst en gewoon goed. Zoals een kroeg hoort te zijn.' }
];

function starRow(filled) {
  let out = '';
  for (let i = 1; i <= 5; i++) {
    const cls = i <= filled ? 'fill-gold text-gold' : 'text-muted-foreground/30';
    out += '<svg class="lucide lucide-star ' + cls + '" style="width: 16px; height: 16px;" data-icon="lucide-star"></svg>';
  }
  return '<div class="flex items-center gap-0.5">' + out + '</div>';
}

/* The "rotated" variant tilts each polaroid, like on Over Ons and Reviews. */
const TILT = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg'];

function render(rotated) {
  return REVIEWS.map((r, i) => {
    const cls = rotated ? 'polaroid mx-auto max-w-sm' : 'polaroid ';
    const style = rotated ? ' style="transform: rotate(' + TILT[i % TILT.length] + ');"' : '';
    return '<div class="' + cls + '"' + style + '>' + starRow(r.stars) +
      '<p class="mt-3 text-sm font-body italic text-foreground/80">"' + r.text + '"</p>' +
      '<p class="mt-4 font-subheading font-bold text-primary">— ' + r.name + '</p>' +
      '<p class="text-xs font-mono text-muted-foreground mt-1">Google Reviews</p></div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const grids = document.querySelectorAll('[data-reviews]');
  if (!grids.length) return;
  grids.forEach(g => { g.innerHTML = render(g.dataset.reviews === 'rotated'); });
  if (window.inflateIcons) inflateIcons();
});
