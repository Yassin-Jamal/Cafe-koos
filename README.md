# Café Koos — statische site

Een kopie van cafekoos.com als gewone HTML, CSS en JavaScript. Geen React, geen Base44, geen
dependencies — je kunt de map op elke webhost zetten en het werkt.

De opmaak komt letterlijk van de originele site: `css/site.css` is de echte stylesheet van
cafekoos.com en de pagina's gebruiken dezelfde klassen en structuur. Daardoor rendert de kopie
identiek in plaats van "erop lijkend".

## Bekijken

Start het meegeleverde servertje (aanbevolen — dan werken de scripts zoals online):

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Open daarna http://localhost:8080/

## Structuur

```
index.html … reviews.html   De 8 pagina's (gegenereerd — niet met de hand bewerken)

parts/_header.html          Header + navigatie      \
parts/_mobile.html          Mobiel menu             |  gedeeld door alle pagina's
parts/_footer.html          Footer                  /
parts/<pagina>.html         De inhoud van die pagina

build.ps1                   Bouwt de 8 pagina's uit parts/. Bevat ook de drankenkaart-gegevens.
serve.ps1                   Lokaal previewservertje

css/site.css                De stylesheet van de originele site
js/icons.js                 De icoontjes (svg data-icon="…" wordt hiermee ingevuld)
js/reviews.js               De reviews, gedeeld door home, Over Ons en Reviews
js/app.js                   Mobiel menu, openingstijden, formulieren, lightbox
images/                     De foto's
```

## Iets aanpassen

**Belangrijk:** bewerk `parts/`, niet de HTML in de hoofdmap. Draai daarna `build.ps1` — dat
overschrijft de acht pagina's. Zo hoef je header en footer maar op één plek te wijzigen.

```bash
powershell -ExecutionPolicy Bypass -File build.ps1
```

**Teksten en secties** — in `parts/<pagina>.html`.

**Header, footer of navigatie** — in `parts/_header.html`, `_mobile.html` of `_footer.html`.
Welk menu-item oplicht bepaalt `build.ps1` per pagina automatisch.

**Drankenkaart** — die staat als gegevens in `build.ps1` (`$cats`): naam, prijs en of het een
aanrader is. `cols` bepaalt hoe de lijst over de kolommen verdeeld wordt. `parts/drankenkaart.html`
wordt daaruit gegenereerd, dus die niet met de hand bewerken.

**Reviews** — de lijst `REVIEWS` in `js/reviews.js`, met een `stars`-waarde per review.

**Openingstijden** — op twee plekken: `parts/contact.html` (de tabel) en `OPENING_HOURS` in
`js/app.js`. Die array voedt de "Vandaag geopend"-regel in de hero en de footer, en markeert de
juiste dag op de contactpagina. Pas ze allebei aan.

**Evenementen** — `parts/evenementen.html` toont nu de lege staat, net als de originele site.

## De mailfunctie

De formulieren op Contact en Vacatures versturen echt, via twee serverless functies op Vercel:

```
api/contact.js       contactformulier (Contact / Feestje boeken / Exposeren)
api/sollicitatie.js  sollicitatieformulier
api/_mail.js         gedeelde validatie, opmaak en verzending via Resend
```

Zo gaat een bericht de deur uit:

| | |
|---|---|
| **From** | `Café Koos <noreply@mail.permaflare.com>` |
| **To** | `bakkerlianne@live.nl` |
| **Reply-To** | het adres dat de bezoeker invulde |

Door die Reply-To kun je in je mailprogramma gewoon op "Beantwoorden" drukken — je antwoord gaat
dan naar de bezoeker, niet naar het noreply-adres.

### Instellen (eenmalig)

1. Maak een gratis account op [resend.com](https://resend.com) — 3.000 mails per maand
2. Voeg **`mail.permaflare.com`** toe als domein in Resend en zet de DNS-records die Resend geeft
   bij dat domein neer. Let op: het verzenddomein is permaflare.com, dus op cafekoos.com hoef je
   voor de mail niets te wijzigen.
3. Maak een API-key aan
4. Zet in Vercel onder **Settings → Environment Variables**:

| Variabele | Waarde | Verplicht |
|---|---|---|
| `RESEND_API_KEY` | je sleutel van Resend | ja |
| `MAIL_TO` | andere ontvanger | nee (standaard `bakkerlianne@live.nl`) |
| `MAIL_FROM` | andere afzender | nee (standaard `Café Koos <noreply@mail.permaflare.com>`) |

Afzender en ontvanger staan al goed in de code, dus alleen `RESEND_API_KEY` is nodig. De andere
twee zijn er voor als je later wilt wisselen zonder de code aan te passen.

Na het toevoegen van de variabelen moet je één keer opnieuw deployen, anders kent de functie ze nog niet.

### Lokaal testen

`serve.ps1` beantwoordt POST-verzoeken naar `/api/...` met een nep-succes, zodat je de formulieren
kunt uitproberen zonder Node en zonder dat er mail verstuurd wordt. Wil je de echte functies
draaien, gebruik dan `vercel dev`.

### Spam

Beide formulieren hebben een verborgen veld (`website`). Vullen bots dat in, dan doet de server
alsof het gelukt is en verstuurt niets. Loop je later toch tegen spam aan, dan is een captcha
(bijvoorbeeld Cloudflare Turnstile) de volgende stap.

## Let op

`css/site.css` is de gecompileerde stylesheet van de originele site (Tailwind). Losse klassen
aanpassen werkt daarom niet zoals in een normaal CSS-bestand; de kleuren staan wel bovenaan als
CSS-variabelen en die kun je gewoon wijzigen.
