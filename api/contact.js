// Contactformulier: gewone vraag, feestje boeken of exposeren.
const { LIMITS, clean, isEmail, handler, invalid } = require('./_mail');

const SOORTEN = ['Contact', 'Feestje boeken', 'Exposeren'];

module.exports = handler((data) => {
  const naam = clean(data.naam, LIMITS.naam);
  const email = clean(data.email, LIMITS.email);
  const bericht = clean(data.bericht, LIMITS.bericht);
  let onderwerp = clean(data.onderwerp, LIMITS.onderwerp);

  if (!naam) throw invalid('Vul je naam in.');
  if (!email) throw invalid('Vul je e-mailadres in.');
  if (!isEmail(email)) throw invalid('Dat e-mailadres klopt niet.');
  if (!bericht) throw invalid('Schrijf even een bericht.');

  if (!onderwerp) onderwerp = 'Contact';

  // Het soort aanvraag bepaalt de onderwerpregel, zodat je in je inbox
  // meteen ziet of het een feestje, een expositie of een vraag is.
  const soort = SOORTEN.includes(onderwerp) ? onderwerp : 'Contact';
  const titel = soort === 'Contact' ? 'Bericht via de website' : soort;

  return {
    subject: `[${soort}] ${naam}`,
    title: titel,
    replyTo: email,
    fields: [
      ['Soort', soort],
      ['Naam', naam],
      ['E-mail', email],
      ['Onderwerp', onderwerp !== soort ? onderwerp : '']
    ],
    message: bericht
  };
});
