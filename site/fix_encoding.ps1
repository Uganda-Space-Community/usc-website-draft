$filePath = 'M:\Dev\projects\New folder\uas\usc\site\community.html'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Check if em dashes are broken
if ($content.Contains([char]0x2014)) {
    Write-Host "Em dashes OK"
} elseif ($content.Contains('â€"')) {
    Write-Host "Em dashes broken, fixing..."
    $content = $content.Replace([System.Text.Encoding]::GetEncoding('iso-8859-1').GetString([System.Text.Encoding]::UTF8.GetBytes([char]0x2014)), [char]0x2014)
}

# Write back as UTF-8 with BOM
$utf8Bom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($filePath, $content, $utf8Bom)
Write-Host "File written with UTF-8 BOM encoding."
