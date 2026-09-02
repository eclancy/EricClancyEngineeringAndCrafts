#!/usr/bin/env pwsh
# One-off helper: resizes/re-encodes source project screenshots down to web-friendly
# sizes and copies them into src/assets/projects/. Not run in CI; rerun by hand if
# source images change.
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$Source,
        [string]$Dest,
        [int]$MaxDim,
        [ValidateSet('png', 'jpeg')][string]$Format,
        [int]$JpegQuality = 85,
        [int]$FrameIndex = 0,
        [bool]$TransparentWhite = $false
    )
    if (-not (Test-Path $Source)) {
        Write-Warning "Skipping missing source image: $Source"
        return
    }
    $img = [System.Drawing.Image]::FromFile($Source)
    try {
        if ($img.RawFormat.Guid -eq [System.Drawing.Imaging.ImageFormat]::Gif.Guid) {
            $frameDimension = New-Object System.Drawing.Imaging.FrameDimension($img.FrameDimensionsList[0])
            $frameIndex = [Math]::Min($FrameIndex, $img.GetFrameCount($frameDimension) - 1)
            $img.SelectActiveFrame($frameDimension, $frameIndex)
        }
        $scale = [Math]::Min(1.0, $MaxDim / [Math]::Max($img.Width, $img.Height))
        $w = [Math]::Max(1, [int]($img.Width * $scale))
        $h = [Math]::Max(1, [int]($img.Height * $scale))
        $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        if ($Format -eq 'jpeg') {
            $g.Clear([System.Drawing.Color]::White)
        }
        $g.DrawImage($img, 0, 0, $w, $h)
        if ($TransparentWhite) {
            for ($x = 0; $x -lt $w; $x++) {
                for ($y = 0; $y -lt $h; $y++) {
                    $pixel = $bmp.GetPixel($x, $y)
                    if ($pixel.R -ge 245 -and $pixel.G -ge 245 -and $pixel.B -ge 245) {
                        $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
                    }
                }
            }
        }
        if ($Format -eq 'png') {
            $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
        } else {
            $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            $params = New-Object System.Drawing.Imaging.EncoderParameters 1
            $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [int64]$JpegQuality)
            $bmp.Save($Dest, $encoder, $params)
        }
        $g.Dispose()
        $bmp.Dispose()
    } finally {
        $img.Dispose()
    }
}

$root = "C:\Users\ericc\Documents\GitHub"
$dest = "C:\Users\ericc\Documents\GitHub\EricClancyEngineeringAndCrafts\src\assets\projects"

Resize-Image "$root\wizard-survivors\assets\Wizard_Survivors_Title_Screen.png" "$dest\wizard-survivors\title-screen.png" 900 png
Resize-Image "$root\wizard-survivors\assets\wizard_guy1.png" "$dest\wizard-survivors\wizard-sprite.png" 256 png
Resize-Image "$root\wizard-survivors\assets\background.jpg" "$dest\wizard-survivors\meadow-background.jpg" 800 jpeg 85

Resize-Image "$root\WizardsArena\Assets\Textures\UI\Start Screen.png" "$dest\wizard-wars\start-screen.jpg" 1400 jpeg 82
Resize-Image "$root\WizardsArena\Assets\Textures\Wizards\Fire Wizard.png" "$dest\wizard-wars\fire-wizard.png" 500 png
Resize-Image "$root\WizardsArena\Assets\Textures\Wizards\Frost Wizard.png" "$dest\wizard-wars\frost-wizard.png" 500 png
Resize-Image "$root\WizardsArena\Assets\Textures\Wizards\Electricity Wizard.png" "$dest\wizard-wars\electricity-wizard.png" 500 png
Resize-Image "$root\WizardsArena\Assets\Textures\Wizards\Earth Wizard.png" "$dest\wizard-wars\earth-wizard.png" 500 png
Resize-Image "$root\WizardsArena\Assets\Textures\UI\Start Screen.png" "$dest\wizard-wars\start-screen-transparent.png" 1400 png 85 0 $true

Copy-Item "$root\EricsMiniatures\src\Images\Miniatures\Clockwork Dragon\ClockworkDragon1.jpg" "$dest\erics-miniatures\clockwork-dragon.jpg" -Force
Resize-Image "$root\EricsMiniatures\src\Images\BannerImages\FullBannerPurpleWorm.jpg" "$dest\erics-miniatures\purple-worm.jpg" 1400 jpeg 82
Resize-Image "$root\EricsMiniatures\src\Images\Miniatures\MasterLich\MasterLich1.jpg" "$dest\erics-miniatures\master-lich.jpg" 1000 jpeg 82

$screenshots = "C:\Users\ericc\Desktop\screenshots for website"
Copy-Item "$screenshots\wizard wars\start-screen-transparent.png" "$dest\wizard-wars\start-screen-transparent.png" -Force
Resize-Image "$screenshots\wizard survivors\Screenshot 2026-09-02 152129.png" "$dest\wizard-survivors\meadow-battle.jpg" 900 jpeg 85
Resize-Image "$screenshots\wizard survivors\Screenshot 2026-09-02 152408.png" "$dest\wizard-survivors\dungeon-battle.jpg" 900 jpeg 85

Resize-Image "$screenshots\wizard wars\WizardWarsDemoGif.a7e6158d1cefb32a9702.gif" "$dest\wizard-wars\arena-battle.jpg" 900 jpeg 85 30
Resize-Image "$screenshots\wizard wars\WizardWarsFireGif.50175a8b4258a0d4b9d6.gif" "$dest\wizard-wars\fire-spell.jpg" 900 jpeg 85 12

Resize-Image "$screenshots\ericsminiatures\BigLogoColor.1152fe7fb6ed5af49e4f.png" "$dest\erics-miniatures\logo.png" 900 png
Resize-Image "$screenshots\ericsminiatures\Screenshot 2026-09-02 151048.png" "$dest\erics-miniatures\showcase.jpg" 900 jpeg 85
Resize-Image "$screenshots\ericsminiatures\Screenshot 2026-09-02 151145.png" "$dest\erics-miniatures\escape-reality.jpg" 900 jpeg 85
Resize-Image "$screenshots\ericsminiatures\Screenshot 2026-09-02 151218.png" "$dest\erics-miniatures\terrain.jpg" 900 jpeg 85
Resize-Image "$screenshots\ericsminiatures\Screenshot 2026-09-02 155829.png" "$dest\erics-miniatures\escape-reality-feature.jpg" 900 jpeg 85

Write-Output "Done."
