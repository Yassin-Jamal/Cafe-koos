# Static file server for local preview (+ a POST endpoint used to capture pages).
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Then open http://localhost:8080/

param([int]$Port = 8080)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Cafe Koos draait op http://localhost:$Port/  (Ctrl+C om te stoppen)"

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.webp' = 'image/webp'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.woff2'= 'font/woff2'
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))

  # allow the capture script (running on the live site) to talk to us
  $ctx.Response.Headers.Add('Access-Control-Allow-Origin', '*')
  $ctx.Response.Headers.Add('Access-Control-Allow-Headers', '*')
  $ctx.Response.Headers.Add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')

  if ($req.HttpMethod -eq 'OPTIONS') {
    $ctx.Response.StatusCode = 204
    $ctx.Response.OutputStream.Close()
    continue
  }

  # POST /save/<name>  ->  writes capture/<name>
  if ($req.HttpMethod -eq 'POST' -and $path -like 'save/*') {
    $name = Split-Path $path -Leaf
    $dir  = Join-Path $root 'capture'
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory $dir | Out-Null }
    $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
    $body = $reader.ReadToEnd()
    $reader.Close()
    [System.IO.File]::WriteAllText((Join-Path $dir $name), $body, (New-Object System.Text.UTF8Encoding $false))
    Write-Host ("captured {0} ({1} bytes)" -f $name, $body.Length)
    $ctx.Response.StatusCode = 200
    $bytes = [System.Text.Encoding]::UTF8.GetBytes('ok')
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.OutputStream.Close()
    continue
  }

  if ($path -eq '') { $path = 'index.html' }
  $file = Join-Path $root $path

  if (Test-Path $file -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
    $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 - niet gevonden')
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  }
  $ctx.Response.OutputStream.Close()
}
