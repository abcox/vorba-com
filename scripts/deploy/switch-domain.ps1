<#
.SYNOPSIS
    Switches custom domains between Azure Web Apps.

.DESCRIPTION
    Moves vorba.com and www.vorba.com (and optionally adamcox.net domains) 
    between vorba-web-2 and vorba-web-app-demo-2.

.PARAMETER TargetApp
    The web app to move domains TO. Valid values: 'vorba-web-2', 'vorba-web-app-demo-2'

.PARAMETER IncludeAdamcox
    Include adamcox.net and www.adamcox.net domains in the switch.

.PARAMETER WhatIf
    Show what would happen without making changes.

.EXAMPLE
    .\switch-domain.ps1 -TargetApp vorba-web-app-demo-2
    
.EXAMPLE
    .\switch-domain.ps1 -TargetApp vorba-web-2 -IncludeAdamcox -WhatIf
#>

param(
    [Parameter(Mandatory)]
    [ValidateSet('vorba-web-2', 'vorba-web-app-demo-2')]
    [string]$TargetApp,

    [switch]$IncludeAdamcox,
    
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

# App configurations
$appConfig = @{
    'vorba-web-2' = @{
        ResourceGroup = 'vorba-web-rg'
    }
    'vorba-web-app-demo-2' = @{
        ResourceGroup = 'vorba-file-service-rg'
    }
}

# Determine source and target
$sourceApp = if ($TargetApp -eq 'vorba-web-2') { 'vorba-web-app-demo-2' } else { 'vorba-web-2' }
$sourceRg = $appConfig[$sourceApp].ResourceGroup
$targetRg = $appConfig[$TargetApp].ResourceGroup

# Domains to move
$domains = @('vorba.com', 'www.vorba.com')
if ($IncludeAdamcox) {
    $domains += @('adamcox.net', 'www.adamcox.net')
}

Write-Host "`n=== Domain Switch Script ===" -ForegroundColor Cyan
Write-Host "Source: $sourceApp ($sourceRg)" -ForegroundColor Yellow
Write-Host "Target: $TargetApp ($targetRg)" -ForegroundColor Green
Write-Host "Domains: $($domains -join ', ')" -ForegroundColor White

if ($WhatIf) {
    Write-Host "`n[WhatIf Mode - No changes will be made]" -ForegroundColor Magenta
}

Write-Host "`n"

foreach ($domain in $domains) {
    Write-Host "Processing: $domain" -ForegroundColor Cyan
    
    # Step 1: Remove hostname from source app
    Write-Host "  [1/3] Removing from $sourceApp..." -ForegroundColor Yellow
    if (-not $WhatIf) {
        try {
            az webapp config hostname delete `
                --webapp-name $sourceApp `
                --resource-group $sourceRg `
                --hostname $domain `
                --yes 2>&1 | Out-Null
            Write-Host "       Removed" -ForegroundColor Green
        }
        catch {
            Write-Host "       Not found or already removed" -ForegroundColor DarkGray
        }
    }
    else {
        Write-Host "       Would remove from $sourceApp" -ForegroundColor Magenta
    }

    # Step 2: Add hostname to target app
    Write-Host "  [2/3] Adding to $TargetApp..." -ForegroundColor Yellow
    if (-not $WhatIf) {
        az webapp config hostname add `
            --webapp-name $TargetApp `
            --resource-group $targetRg `
            --hostname $domain | Out-Null
        Write-Host "       Added" -ForegroundColor Green
    }
    else {
        Write-Host "       Would add to $TargetApp" -ForegroundColor Magenta
    }

    # Step 3: Create managed SSL certificate
    Write-Host "  [3/3] Creating managed SSL cert..." -ForegroundColor Yellow
    if (-not $WhatIf) {
        $cert = az webapp config ssl create `
            --name $TargetApp `
            --resource-group $targetRg `
            --hostname $domain | ConvertFrom-Json
        
        # Bind the certificate
        az webapp config ssl bind `
            --name $TargetApp `
            --resource-group $targetRg `
            --certificate-thumbprint $cert.thumbprint `
            --ssl-type SNI | Out-Null
        
        Write-Host "       SSL bound (thumbprint: $($cert.thumbprint.Substring(0,8))...)" -ForegroundColor Green
    }
    else {
        Write-Host "       Would create and bind SSL cert" -ForegroundColor Magenta
    }

    Write-Host ""
}

Write-Host "=== Complete ===" -ForegroundColor Cyan

if (-not $WhatIf) {
    Write-Host "`nDomains are now pointing to: $TargetApp" -ForegroundColor Green
    Write-Host "SSL certificates will be fully provisioned within a few minutes.`n" -ForegroundColor White
}
