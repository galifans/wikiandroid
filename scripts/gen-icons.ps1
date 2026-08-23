# 生成与 favicon.svg 一致的 PNG 图标（favicon-32.png / apple-touch-icon.png）
Add-Type -AssemblyName System.Drawing

function Add-RoundedRectPath {
    param($Path, $x, $y, $w, $h, $r)
    $d = 2 * $r
    $Path.AddArc($x, $y, $d, $d, 180, 90)
    $Path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $Path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $Path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $Path.CloseFigure()
}

function New-WikiIcon {
    param([int]$Size, [string]$OutPath)
    $scale = [double]$Size / 128.0
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # 背景：圆角矩形 + 绿色渐变
    $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $c1 = [System.Drawing.Color]::FromArgb(255, 61, 220, 132)
    $c2 = [System.Drawing.Color]::FromArgb(255, 11, 122, 59)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $radius = [int][Math]::Max(4, 28 * $scale)
    $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    Add-RoundedRectPath -Path $bgPath -x 0 -y 0 -w $Size -h $Size -r $radius
    $g.FillPath($brush, $bgPath)

    # W 字母：5 个顶点连成 4 条线段
    $penWidth = [single][Math]::Max(1.5, 11 * $scale)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $penWidth)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $wx = @(26, 41, 64, 87, 102)
    $wy = @(40, 90, 62, 90, 40)
    for ($i = 0; $i -lt 4; $i++) {
        $x1 = [single]($wx[$i] * $scale)
        $y1 = [single]($wy[$i] * $scale)
        $x2 = [single]($wx[$i + 1] * $scale)
        $y2 = [single]($wy[$i + 1] * $scale)
        $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    }

    # 知识库下划线
    $uBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
    $uY = [single](101 * $scale)
    $uH = [single][Math]::Max(2, 6 * $scale)
    $g.FillRectangle($uBrush, [single](36 * $scale), $uY, [single](56 * $scale), $uH)

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $uBrush.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    $bgPath.Dispose()
    $g.Dispose()
    $bmp.Dispose()
}

$pub = "d:\CodeStuff\galifans_vibe_coding\src\.vuepress\public"
New-WikiIcon -Size 32 -OutPath "$pub\favicon-32.png"
New-WikiIcon -Size 180 -OutPath "$pub\apple-touch-icon.png"
Write-Host "PNG icons generated:"
Get-ChildItem "$pub\favicon-32.png", "$pub\apple-touch-icon.png" | Select-Object Name, Length
