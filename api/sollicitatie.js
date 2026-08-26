// Sollicitatieformulier op de vacaturepagina.
const { LIMITS, clean, isEmail, handler, invalid } = require('./_mail');

module.exports = handler((data) => {
  const naam = clean(data.naam, LIMITS.naam);
  const email = clean(data.email, LIMITS.email);
  const telefoon = clean(data.telefoon, LIMITS.telefoon);
  const bericht = clean(data.bericht, LIMITS.bericht);
  const functie = clean(data.functie, LIMITS.functie) || 'Open sollicitatie';

  if (!naam) throw invalid('Vul je naam in.');
  if (!email) throw invalid('Vul je e-mailadres in.');
  if (!isEmail(email)) throw invalid('Dat e-mailadres klopt niet.');
  if (!bericht) throw invalid('Vertel even iets over jezelf.');

  return {
    subject: `[Sollicitatie] ${naam} — ${functie}`,
    title: 'Sollicitatie',
    replyTo: email,
    fields: [
      ['Functie', functie],
      ['Naam', naam],
      ['E-mail', email],
      ['Telefoon', telefoon]
    ],
    message: bericht
  };
});
