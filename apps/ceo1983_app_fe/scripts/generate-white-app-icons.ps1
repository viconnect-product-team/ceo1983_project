Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = "d:\download\VICONNECT\CEO_VIONE_PROJECT\ceo1983_project\apps\ceo1983_app_fe\public"
$src = [System.Drawing.Bitmap]::FromFile("$root\ceo1983-official-logo.png")

# Bounding box of the "8" mark (left part, x < 365), alpha-based
$minX = 9999; $minY = 9999; $maxX = 0; $maxY = 0
for ($x = 0; $x -lt 365; $x++) {
  for ($y = 0; $y -lt $src.Height; $y++) {
    if ($src.GetPixel($x, $y).A -gt 25) {
      if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$mw = $maxX - $minX + 1; $mh = $maxY - $minY + 1
Write-Output "mark bbox: x=$minX..$maxX y=$minY..$maxY ($mw x $mh)"

function New-Icon([int]$size, [string]$path, [double]$markRatio) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "HighQuality"; $g.InterpolationMode = "HighQualityBicubic"
  $g.PixelOffsetMode = "HighQuality"; $g.CompositingQuality = "HighQuality"
  $g.Clear([System.Drawing.Color]::White)
  $targetH = [int]([math]::Round($size * $markRatio))
  $targetW = [int]([math]::Round($targetH * $script:mw / $script:mh))
  $dx = [int](($size - $targetW) / 2); $dy = [int](($size - $targetH) / 2)
  $srcRect = New-Object System.Drawing.Rectangle($script:minX, $script:minY, $script:mw, $script:mh)
  $dstRect = New-Object System.Drawing.Rectangle($dx, $dy, $targetW, $targetH)
  $g.DrawImage($script:src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("{0} -> {1}x{1}" -f (Split-Path $path -Leaf), $size)
}

# "any" icons: mark ~62% of height; maskable: ~48% (inside Android safe zone)
foreach ($s in 120, 152, 167, 180) { New-Icon $s "$root\apple-touch-icon-${s}x${s}.png" 0.62 }
New-Icon 180 "$root\apple-touch-icon.png" 0.62
New-Icon 180 "$root\apple-touch-icon-precomposed.png" 0.62
New-Icon 192 "$root\app-icon-192.png" 0.62
New-Icon 512 "$root\app-icon-512.png" 0.62
New-Icon 512 "$root\app-icon.png" 0.62
New-Icon 192 "$root\app-icon-maskable-192.png" 0.48
New-Icon 512 "$root\app-icon-maskable-512.png" 0.48
$src.Dispose()
