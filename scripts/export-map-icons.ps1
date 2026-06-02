param(
  [string]$SourcePath = "$env:USERPROFILE\.codex\generated_images\019e36f6-c69f-7251-a705-31a9fb912e72\ig_0e28321f1f6c6274016a09fc1d82a88191b9154a36df7663a9.png",
  [string]$OutputDirectory = "assets\map-icons",
  [int]$CanvasSize = 256
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$iconRows = @(
  @(
    @{ label = 'Kleiderladen'; file = 'kleiderladen.png' },
    @{ label = 'Schuhladen'; file = 'schuhladen.png' },
    @{ label = 'Schmuckladen'; file = 'schmuckladen.png' },
    @{ label = 'Elektronikladen'; file = 'elektronikladen.png' }
  ),
  @(
    @{ label = 'Buchhandlung'; file = 'buchhandlung.png' },
    @{ label = 'Blumenladen'; file = 'blumenladen.png' },
    @{ label = 'Supermarkt'; file = 'supermarkt.png' },
    @{ label = 'Apotheke'; file = 'apotheke.png' },
    @{ label = 'Heim/Garten'; file = 'heim-garten.png' }
  ),
  @(
    @{ label = 'Tierbedarf'; file = 'tierbedarf.png' },
    @{ label = 'Papeterie'; file = 'papeterie.png' },
    @{ label = 'Brocki'; file = 'brocki.png' },
    @{ label = 'Kosmetik'; file = 'kosmetik.png' },
    @{ label = 'Getränkeladen'; file = 'getraenkeladen.png' }
  ),
  @(
    @{ label = 'Restaurant'; file = 'restaurant.png' },
    @{ label = 'Café'; file = 'cafe.png' },
    @{ label = 'Bar'; file = 'bar.png' },
    @{ label = 'Pizzeria'; file = 'pizzeria.png' },
    @{ label = 'Bäckerei'; file = 'baeckerei.png' }
  ),
  @(
    @{ label = 'Konditorei'; file = 'konditorei.png' },
    @{ label = 'Eisdiele'; file = 'eisdiele.png' },
    @{ label = 'Fast Food'; file = 'fast-food.png' },
    @{ label = 'Coiffeur'; file = 'coiffeur.png' },
    @{ label = 'Nagelstudio'; file = 'nagelstudio.png' }
  ),
  @(
    @{ label = 'Kosmetikstudio'; file = 'kosmetikstudio.png' },
    @{ label = 'Massage'; file = 'massage.png' },
    @{ label = 'Physiotherapie'; file = 'physiotherapie.png' },
    @{ label = 'Fitnessstudio'; file = 'fitnessstudio.png' },
    @{ label = 'Optiker'; file = 'optiker.png' }
  ),
  @(
    @{ label = 'Autowaschanlage'; file = 'autowaschanlage.png' },
    @{ label = 'Konzert'; file = 'konzert.png' },
    @{ label = 'Festival'; file = 'festival.png' },
    @{ label = 'Party'; file = 'party.png' },
    @{ label = 'Markt'; file = 'markt.png' }
  ),
  @(
    @{ label = 'Ausstellung'; file = 'ausstellung.png' },
    @{ label = 'Kino'; file = 'kino.png' },
    @{ label = 'Theater'; file = 'theater.png' },
    @{ label = 'Sportevent'; file = 'sportevent.png' }
  )
)

function Test-IsForeground {
  param([System.Drawing.Color]$Color)
  return -not ($Color.G -gt 200 -and $Color.R -lt 90 -and $Color.B -lt 90)
}

function Get-RowProjection {
  param([System.Drawing.Bitmap]$Bitmap)
  $projection = New-Object int[] $Bitmap.Height
  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    $count = 0
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      if (Test-IsForeground $Bitmap.GetPixel($x, $y)) {
        $count++
      }
    }
    $projection[$y] = $count
  }
  return $projection
}

function Get-ColumnProjection {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$StartY,
    [int]$EndY
  )
  $projection = New-Object int[] $Bitmap.Width
  for ($x = 0; $x -lt $Bitmap.Width; $x++) {
    $count = 0
    for ($y = $StartY; $y -le $EndY; $y++) {
      if (Test-IsForeground $Bitmap.GetPixel($x, $y)) {
        $count++
      }
    }
    $projection[$x] = $count
  }
  return $projection
}

function Find-Bands {
  param(
    [int[]]$Projection,
    [int]$MinCount,
    [int]$MergeGap,
    [int]$MinSize
  )

  $bands = @()
  $start = -1
  for ($index = 0; $index -lt $Projection.Length; $index++) {
    if ($Projection[$index] -ge $MinCount) {
      if ($start -lt 0) {
        $start = $index
      }
      continue
    }

    if ($start -ge 0) {
      $end = $index - 1
      if (($end - $start + 1) -ge $MinSize) {
        $bands += [pscustomobject]@{ start = $start; end = $end }
      }
      $start = -1
    }
  }

  if ($start -ge 0) {
    $end = $Projection.Length - 1
    if (($end - $start + 1) -ge $MinSize) {
      $bands += [pscustomobject]@{ start = $start; end = $end }
    }
  }

  if ($bands.Count -le 1) {
    return $bands
  }

  $merged = @()
  $current = $bands[0]
  for ($index = 1; $index -lt $bands.Count; $index++) {
    $next = $bands[$index]
    $gap = $next.start - $current.end - 1
    if ($gap -le $MergeGap) {
      $current = [pscustomobject]@{ start = $current.start; end = [Math]::Max($current.end, $next.end) }
      continue
    }

    $merged += $current
    $current = $next
  }

  $merged += $current
  return $merged
}

function Get-TightBounds {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$StartX,
    [int]$EndX,
    [int]$StartY,
    [int]$EndY
  )

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = $StartY; $y -le $EndY; $y++) {
    for ($x = $StartX; $x -le $EndX; $x++) {
      if (-not (Test-IsForeground $Bitmap.GetPixel($x, $y))) {
        continue
      }

      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    return $null
  }

  return [pscustomobject]@{ left = $minX; top = $minY; right = $maxX; bottom = $maxY }
}

function New-TransparentCrop {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    $Bounds,
    [int]$Padding
  )

  $left = [Math]::Max(0, $Bounds.left - $Padding)
  $top = [Math]::Max(0, $Bounds.top - $Padding)
  $right = [Math]::Min($Bitmap.Width - 1, $Bounds.right + $Padding)
  $bottom = [Math]::Min($Bitmap.Height - 1, $Bounds.bottom + $Padding)
  $width = $right - $left + 1
  $height = $bottom - $top + 1

  $crop = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      $source = $Bitmap.GetPixel($left + $x, $top + $y)
      if (Test-IsForeground $source) {
        $crop.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $source.R, $source.G, $source.B))
      } else {
        $crop.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      }
    }
  }

  return $crop
}

function Save-RoundIcon {
  param(
    [System.Drawing.Bitmap]$Source,
    [string]$OutputPath,
    [int]$Size
  )

  $output = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($output)
    try {
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.Clear([System.Drawing.Color]::Transparent)

      $borderPadding = [Math]::Max(10, [int]($Size / 26))
      $circleSize = $Size - ($borderPadding * 2)
      $circleRect = New-Object System.Drawing.Rectangle($borderPadding, $borderPadding, $circleSize, $circleSize)

      $fillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 255, 255, 255))
      $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(235, 220, 220, 220), [Math]::Max(2, [int]($Size / 96)))
      try {
        $graphics.FillEllipse($fillBrush, $circleRect)
        $graphics.DrawEllipse($borderPen, $circleRect)
      } finally {
        $fillBrush.Dispose()
        $borderPen.Dispose()
      }

      $maxContent = [int][Math]::Round($circleSize * 0.72)
      $scale = [Math]::Min($maxContent / $Source.Width, $maxContent / $Source.Height)
      $drawWidth = [int][Math]::Round($Source.Width * $scale)
      $drawHeight = [int][Math]::Round($Source.Height * $scale)
      $drawX = [int](($Size - $drawWidth) / 2)
      $drawY = [int](($Size - $drawHeight) / 2)
      $destRect = New-Object System.Drawing.Rectangle($drawX, $drawY, $drawWidth, $drawHeight)
      $graphics.DrawImage($Source, $destRect)

      $output.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
    }
  } finally {
    $output.Dispose()
  }
}

if (-not (Test-Path $SourcePath)) {
  throw "Source image not found: $SourcePath"
}

New-Item -ItemType Directory -Force $OutputDirectory | Out-Null

$bitmap = [System.Drawing.Bitmap]::new($SourcePath)
try {
  $rowProjection = Get-RowProjection -Bitmap $bitmap
  $rowBands = Find-Bands -Projection $rowProjection -MinCount 20 -MergeGap 28 -MinSize 24

  if ($rowBands.Count -ne $iconRows.Count) {
    throw "Expected $($iconRows.Count) row bands, found $($rowBands.Count)."
  }

  $manifest = New-Object System.Collections.Generic.List[object]

  for ($rowIndex = 0; $rowIndex -lt $rowBands.Count; $rowIndex++) {
    $row = $rowBands[$rowIndex]
    $columnProjection = Get-ColumnProjection -Bitmap $bitmap -StartY $row.start -EndY $row.end
    $columnBands = Find-Bands -Projection $columnProjection -MinCount 12 -MergeGap 26 -MinSize 18
    $expectedCount = $iconRows[$rowIndex].Count

    if ($columnBands.Count -ne $expectedCount) {
      throw "Expected $expectedCount icons in row $($rowIndex + 1), found $($columnBands.Count)."
    }

    for ($columnIndex = 0; $columnIndex -lt $columnBands.Count; $columnIndex++) {
      $entry = $iconRows[$rowIndex][$columnIndex]
      $column = $columnBands[$columnIndex]
      $bounds = Get-TightBounds -Bitmap $bitmap -StartX $column.start -EndX $column.end -StartY $row.start -EndY $row.end
      if ($null -eq $bounds) {
        throw "Could not detect icon bounds for $($entry.label)."
      }

      $crop = New-TransparentCrop -Bitmap $bitmap -Bounds $bounds -Padding 8
      try {
        $destination = Join-Path $OutputDirectory $entry.file
        Save-RoundIcon -Source $crop -OutputPath $destination -Size $CanvasSize
        $manifest.Add([pscustomobject]@{
          label = $entry.label
          filename = $entry.file
          relativePath = ($destination -replace '\\', '/')
        }) | Out-Null
      } finally {
        $crop.Dispose()
      }
    }
  }

  $manifestPath = Join-Path $OutputDirectory 'manifest.json'
  $manifest | ConvertTo-Json -Depth 3 | Set-Content -Path $manifestPath -Encoding UTF8
  Write-Output "Exported $($manifest.Count) icons to $OutputDirectory"
  Write-Output "Manifest: $manifestPath"
} finally {
  $bitmap.Dispose()
}
