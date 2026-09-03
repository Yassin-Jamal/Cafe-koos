# Bouwt alle pagina's van Cafe Koos.
#
#   parts/_header.html, _mobile.html, _footer.html  = gedeelde onderdelen
#   parts/<pagina>.html                             = de inhoud van die pagina
#   drankenkaart.html                               = gegenereerd uit de kaart hieronder
#
# Draaien:  powershell -ExecutionPolicy Bypass -File build.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$enc  = New-Object System.Text.UTF8Encoding $false

$header = Get-Content (Join-Path $root 'parts\_header.html') -Raw -Encoding UTF8
$mobile = Get-Content (Join-Path $root 'parts\_mobile.html') -Raw -Encoding UTF8
$footer = Get-Content (Join-Path $root 'parts\_footer.html') -Raw -Encoding UTF8

$navOn  = 'px-3 py-2 font-subheading text-sm font-semibold transition-colors border-b-2 text-gold border-accent'
$navOff = 'px-3 py-2 font-subheading text-sm font-semibold transition-colors border-b-2 text-primary-foreground border-transparent hover:border-accent/50'
$mobOn  = 'font-subheading text-2xl font-semibold py-3 border-b border-primary-foreground/15 transition-colors hover:text-gold text-gold'
$mobOff = 'font-subheading text-2xl font-semibold py-3 border-b border-primary-foreground/15 transition-colors hover:text-gold '

function Chrome($file) {
  # alles uit, daarna de huidige pagina aan
  $h = $header.Replace($navOn, $navOff).Replace('"' + $navOff + '" href="' + $file + '"', '"' + $navOn + '" href="' + $file + '"')
  $m = $mobile.Replace($mobOn, $mobOff).Replace('"' + $mobOff + '" href="' + $file + '"', '"' + $mobOn + '" href="' + $file + '"')
  @{ header = $h; mobile = $m }
}

function Build($file, $title, $desc, $body) {
  $c = Chrome $file
  $page = @"
<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$title</title>
<meta name="description" content="$desc">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Zilla+Slab:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css">
</head>
<body>
<div id="root">
<div class="min-h-screen flex flex-col bg-background">

$($c.header)

$($c.mobile)

$body

$footer

</div>
</div>
<script src="js/icons.js"></script>
<script src="js/reviews.js"></script>
<script src="js/events.js"></script>
<script src="js/app.js"></script>
</body>
</html>
"@
  [System.IO.File]::WriteAllText((Join-Path $root $file), $page, $enc)
  Write-Host "  $file"
}

# ---------------------------------------------------------------- drankenkaart
# @('naam','prijs',aanrader)   -  'cols' bepaalt hoe de lijst over kolommen splitst
$cats = @(
  @{ id='tap'; title='Bier op tap'; icon='lucide-beer'; tone='gold'; cols=@(5,5); items=@(
      @('Jupiler / Hertog Jan 20cl','&euro;3,00',$false),
      @('Jupiler / Hertog Jan 25cl','&euro;3,30',$false),
      @('Jupiler / Hertog Jan 33cl','&euro;3,60',$false),
      @('Jupiler / Hertog Jan 50cl','&euro;5,50',$false),
      @('La Chouffe','&euro;4,60',$false),
      @('Karmeliet','&euro;4,80',$true),
      @('Vedett IPA','&euro;4,00',$false),
      @('Corona','&euro;5,50',$false),
      @('Vedett','navragen',$false),
      @('Weizen','navragen',$false)) },
  @{ id='fles'; title='Bier op fles / speciaalbier'; icon='lucide-beer'; tone='accent'; cols=@(8,7,7); items=@(
      @('Hertog Jan','&euro;3,00',$false),
      @('Heineken','&euro;3,00',$false),
      @('Palm','&euro;3,00',$false),
      @('Hoegaarden Wit','&euro;4,00',$false),
      @('Hoegaarden Citrus 2%','&euro;3,50',$false),
      @('Leffe Blond','&euro;4,20',$false),
      @('Leffe Winters Blond','&euro;4,00',$false),
      @('La Trappe Blond','&euro;4,50',$false),
      @('Duvel','&euro;5,20',$true),
      @('Orval','&euro;5,20',$false),
      @('Westmalle Dubbel','&euro;4,70',$false),
      @('Westmalle Tripel','&euro;5,20',$false),
      @('Carolus Classic','&euro;5,20',$false),
      @("Tripel d'Anvers",'&euro;5,20',$false),
      @('Affligem Tripel','&euro;5,20',$false),
      @('St. Bernardus Abt 12','&euro;5,20',$true),
      @('Omer Traditional Blond','&euro;4,50',$false),
      @('Hertog Jan Weizener (fles)','&euro;3,50',$false),
      @('Hertog Jan Herfstbock','&euro;3,50',$false),
      @('Daura Damn (glutenvrij)','&euro;3,50',$false),
      @('Karmeliet 0%','&euro;4,00',$false),
      @('Apple Bandit Cider','&euro;3,50',$false)) },
  @{ id='alcoholvrij'; title='Alcoholvrij bier'; icon='lucide-beer'; tone='secondary'; cols=@(3); items=@(
      @('Jupiler 0.0','&euro;3,00',$false),
      @('Hertog Jan 0.0','&euro;3,00',$false),
      @('Leffe 0.0','&euro;4,00',$false)) },
  @{ id='sterk'; title='Sterke drank'; icon='lucide-martini'; tone='secondary'; cols=@(10); items=@(
      @('Wodka','&euro;4,40',$false),
      @('Rum','&euro;4,40',$false),
      @('Gin','&euro;4,40',$false),
      @('Tequila','&euro;4,50',$false),
      @('Likeur','&euro;4,00',$false),
      @('Jenever','&euro;3,40',$false),
      @('Oude Jenever','&euro;3,90',$false),
      @('Corenwijn','&euro;3,90',$false),
      @('Calvados','&euro;4,90',$false),
      @('Cognac','&euro;6,40',$false)) },
  @{ id='wijn'; title='Wijn &amp; Port'; icon='lucide-wine'; tone='accent'; cols=@(2); items=@(
      @('Wijn (glas)','&euro;3,90',$false),
      @('Port','&euro;3,90',$false)) },
  @{ id='fris'; title='Fris &amp; warme dranken'; icon='lucide-coffee'; tone='gold'; cols=@(6); items=@(
      @('Koffie','&euro;2,00',$false),
      @('Thee','&euro;2,00',$false),
      @('Fris','&euro;2,80',$false),
      @('AA (energy drink)','&euro;3,50',$false),
      @('Redbull','&euro;4,00',$false),
      @('Club Mat&eacute;','&euro;3,50',$false)) }
)

$badge = '<span class="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider bg-gold/15 text-gold px-1.5 py-0.5 rounded shrink-0"><svg class="lucide lucide-star w-2.5 h-2.5" data-icon="lucide-star"></svg> Aanrader</span>'

function Row($item) {
  $label = if ($item[2]) { $badge + '<span class="font-semibold">' + $item[0] + '</span>' }
           else { '<span class="">' + $item[0] + '</span>' }
  '<li class="flex justify-between items-baseline gap-2 py-1.5"><span class="text-sm flex items-center gap-2 min-w-0">' +
  $label + '</span><span class="flex-1 mx-2 border-b border-dotted border-primary/15"></span>' +
  '<span class="font-mono text-sm shrink-0 text-gold font-bold">' + $item[1] + '</span></li>'
}

function Columns($cat) {
  $out = ''; $i = 0
  foreach ($n in $cat.cols) {
    $out += '<ul>'
    for ($k = 0; $k -lt $n; $k++) { $out += (Row $cat.items[$i]); $i++ }
    $out += '</ul>'
  }
  $out
}

function IconBubble($icon, $tone) {
  $bg = switch ($tone) {
    'gold'      { 'bg-gold/15 text-gold' }
    'accent'    { 'bg-accent/10 text-accent' }
    'secondary' { 'bg-secondary/10 text-secondary' }
  }
  '<span class="inline-flex items-center justify-center w-10 h-10 rounded-full ' + $bg +
  ' shrink-0"><svg class="lucide ' + $icon + ' w-5 h-5" data-icon="' + $icon + '"></svg></span>'
}

$pills = ''
foreach ($c in $cats) {
  $pills += '<a href="#' + $c.id + '" class="px-3 py-1.5 rounded-full font-subheading text-sm font-semibold text-primary border border-primary/15 hover:border-accent hover:bg-accent/5 transition-colors whitespace-nowrap">' + $c.title + '</a>'
}

$tap   = $cats | Where-Object { $_.id -eq 'tap' }
$fles  = $cats | Where-Object { $_.id -eq 'fles' }
$small = $cats | Where-Object { $_.id -in @('alcoholvrij','sterk','wijn','fris') }

$smallHtml = ''
foreach ($c in $small) {
  $smallHtml += '<div id="' + $c.id + '" class="bg-card rounded-lg p-6 border-2 border-primary/10 scroll-mt-24">' +
    '<div class="flex items-center gap-3 mb-4">' + (IconBubble $c.icon $c.tone) +
    '<h2 class="font-heading text-xl md:text-2xl text-primary">' + $c.title + '</h2></div>' +
    (Columns $c) + '</div>'
}

$kaart = @"
<main class="flex-1"><div><section class="bg-primary text-primary-foreground py-20 grain border-b-4 border-gold"><div class="max-w-7xl mx-auto px-4 sm:px-6"><span class="label-mono text-gold">De drankenkaart</span><h1 class="font-heading text-4xl md:text-6xl mt-2 leading-[1.05]">Speciaalbier &amp; meer</h1><p class="text-lg text-primary-foreground/85 mt-4 max-w-xl">Speciaalbier is onze specialiteit. Van frisse trappist tot zware abt &mdash; we hebben het getapt of in de koelkast liggen.</p></div></section><nav class="max-w-7xl mx-auto px-4 sm:px-6 pt-10"><div class="flex gap-2 overflow-x-auto pb-2">$pills</div></nav><section id="tap" class="max-w-7xl mx-auto px-4 sm:px-6 py-10 scroll-mt-24"><div class="flex items-center gap-3 mb-6">$(IconBubble $tap.icon $tap.tone)<h2 class="font-heading text-2xl md:text-3xl text-primary">$($tap.title)</h2></div><div class="grid sm:grid-cols-2 gap-x-12">$(Columns $tap)</div></section><section id="fles" class="bg-card grain border-y-2 border-gold/20 scroll-mt-24"><div class="max-w-7xl mx-auto px-4 sm:px-6 py-16"><div class="flex items-center gap-3 mb-2">$(IconBubble $fles.icon $fles.tone)<span class="label-mono text-accent">Onze specialiteit</span></div><h2 class="font-heading text-3xl md:text-5xl text-primary mt-3">$($fles.title)</h2><p class="text-lg text-muted-foreground mt-3 max-w-2xl">Echte bieren van brouwers die het vak verstaan. Vraag gerust een advies &mdash; we vertellen je er graag over.</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 mt-8">$(Columns $fles)</div></div></section><section class="max-w-7xl mx-auto px-4 sm:px-6 py-16"><div class="grid md:grid-cols-2 gap-8">$smallHtml</div></section><div class="max-w-7xl mx-auto px-4 sm:px-6 pb-12"><p class="text-sm font-mono text-muted-foreground text-center italic">Prijzen onder voorbehoud van wijzigingen.</p></div><section class="bg-primary text-primary-foreground py-20 grain border-t-4 border-gold"><div class="max-w-3xl mx-auto px-4 sm:px-6 text-center"><svg class="lucide lucide-party-popper w-12 h-12 text-gold mx-auto mb-4" data-icon="lucide-party-popper"></svg><h2 class="font-heading text-3xl md:text-5xl">Feestje vieren?</h2><p class="text-lg text-primary-foreground/80 mt-3">Van verjaardag tot bedrijfsborrel &mdash; we maken er een mooi feest van. Vraag het aan en we regelen de rest.</p><a href="contact.html"><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 shadow h-9 py-2 bg-gold text-gold-foreground hover:bg-gold/85 mt-6 text-base px-6">Boek je feestje <svg class="lucide lucide-arrow-right w-4 h-4 ml-1" data-icon="lucide-arrow-right"></svg></button></a></div></section></div></main>
"@
[System.IO.File]::WriteAllText((Join-Path $root 'parts\drankenkaart.html'), $kaart, $enc)

# ---------------------------------------------------------------- pagina's
$pages = @(
  @{ file='index.html';        title='Café Koos — Gezellige Kroeg in Den Haag'; desc='Café Koos is een gezellige, vrouwvriendelijke kroeg in de Boekhorststraat in Den Haag. Speciaalbier, alternatieve muziek, livemuziek, exposities, darten en een heerlijk terras.' },
  @{ file='over-ons.html';     title='Over Ons — Café Koos';                    desc='Het verhaal achter Café Koos: een vrouwvriendelijke, alternatieve buurtkroeg in de Boekhorststraat in Den Haag.' },
  @{ file='drankenkaart.html'; title='Drankenkaart — Café Koos';                desc='De drankenkaart van Café Koos: speciaalbier op tap en op fles, sterke drank, wijn, fris en warme dranken.' },
  @{ file='evenementen.html';  title='Evenementen — Café Koos';                 desc='De agenda van Café Koos: live muziek, dj-sets, exposities en meer in Den Haag.' },
  @{ file='fotos.html';        title="Foto's — Café Koos";                      desc='Sfeerbeelden van Café Koos: de bar, het terras, de kunst aan de muur en het dartbord.' },
  @{ file='contact.html';      title='Contact & Route — Café Koos';             desc='Adres, openingstijden en contactgegevens van Café Koos aan de Boekhorststraat 58 in Den Haag.' },
  @{ file='vacatures.html';    title='Vacatures — Café Koos';                   desc='Werken bij Café Koos in Den Haag. Geen ervaring nodig, solliciteer direct.' },
  @{ file='reviews.html';      title='Reviews — Café Koos';                     desc='Wat gasten zeggen over Café Koos in Den Haag. Gemiddeld 4,6 van 5 sterren op Google.' }
)

Write-Host 'Pagina''s bouwen:'
foreach ($p in $pages) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($p.file)
  $body = Get-Content (Join-Path $root "parts\$name.html") -Raw -Encoding UTF8
  Build $p.file $p.title $p.desc $body.Trim()
}
Write-Host 'Klaar.'
