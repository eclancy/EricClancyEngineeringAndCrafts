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
        [int]$JpegQuality = 85
    )
    $img = [System.Drawing.Image]::FromFile($Source)
    try {
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

Copy-Item "$root\EricsMiniatures\src\Images\Miniatures\Clockwork Dragon\ClockworkDragon1.jpg" "$dest\erics-miniatures\clockwork-dragon.jpg" -Force
Resize-Image "$root\EricsMiniatures\src\Images\BannerImages\FullBannerPurpleWorm.jpg" "$dest\erics-miniatures\purple-worm.jpg" 1400 jpeg 82
Resize-Image "$root\EricsMiniatures\src\Images\Miniatures\MasterLich\MasterLich1.jpg" "$dest\erics-miniatures\master-lich.jpg" 1000 jpeg 82

Write-Output "Done."
