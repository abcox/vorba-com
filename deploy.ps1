# deploy.ps1 -- builds and deploys this angular project to azure
# Define parameters for the script
param(
    [string]$resourceGroupName = "vorba-web-rg",  # Azure Resource Group Name
    [string]$appServicePlanName = "vorba-web-asp-linux",  # Azure App Service Plan Name
    [string]$webAppName = "vorba-web-2",  # Name of the Azure Web App
    [string]$location = "canadaeast",  # Azure region (e.g., eastus, westus)
    [string]$projectName = "vorba-web",  # Name of the Angular Project
    [string]$distFolder = "dist",  # Location of the Angular build folder
    [string]$runtime = "NODE:18-lts",  # Web App run-time
    [switch]$UseServicePrincipal,  # Use service principal authentication
    [string]$ServicePrincipalId,  # Service Principal ID
    [string]$ServicePrincipalSecret,  # Service Principal Secret
    [string]$TenantId = "a7f7a08d-4e79-4d3d-812f-10bd18abbcfb"  # Azure Tenant ID
)

# Step 1: Build the Angular app for production
Write-Host "Building the Angular project $projectName."
# Run the Angular build command
ng build --configuration production
# Check if the build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Angular build succeeded."
} else {
    Write-Host "Angular build failed (exit)." -ForegroundColor Red
    # Optionally, exit the script with an error code
    exit $LASTEXITCODE
}

# Step 2: Azure Authentication
Write-Host "Authenticating to Azure..." -ForegroundColor Cyan

# First, check if we're already logged in
$loginStatus = az account show --query "user.name" --output tsv 2>$null
if ($loginStatus) {
    Write-Host "Already logged in as: $loginStatus" -ForegroundColor Green
    
    # Check if we have any subscriptions
    $subscriptions = az account list --query "[].{name:name, id:id}" --output json 2>$null
    $subscriptionCount = ($subscriptions | ConvertFrom-Json).Count
    
    if ($subscriptionCount -eq 0) {
        Write-Host "WARNING: No subscriptions found for this account. You may not be able to deploy resources." -ForegroundColor Red
        Write-Host "Let's try logging in with a different account." -ForegroundColor Yellow
        
        # Log out and try again
        az logout
        $loginStatus = $null
    } else {
        Write-Host "Found $subscriptionCount subscription(s)." -ForegroundColor Green
    }
}

# If we're not logged in or have no subscriptions, try to log in
if (-not $loginStatus) {
    Write-Host "Please log in to Azure. You'll be prompted to select an account." -ForegroundColor Yellow
    Write-Host "IMPORTANT: Make sure to select an account that has access to Azure subscriptions." -ForegroundColor Cyan
    
    # Login with the specific tenant ID
    Write-Host "Logging in with tenant ID: $TenantId" -ForegroundColor Cyan
    $loginResult = az login --tenant $TenantId 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed: $loginResult" -ForegroundColor Red
        exit 1
    }
    
    # Check if we have any subscriptions after login
    $subscriptions = az account list --query "[].{name:name, id:id}" --output json 2>$null
    $subscriptionCount = ($subscriptions | ConvertFrom-Json).Count
    
    if ($subscriptionCount -eq 0) {
        Write-Host "ERROR: No subscriptions found for the account you selected." -ForegroundColor Red
        Write-Host "Please try one of the following:" -ForegroundColor Yellow
        Write-Host "1. Use a different account that has subscriptions in Azure" -ForegroundColor Yellow
        Write-Host "2. Create a subscription for your account at portal.azure.com" -ForegroundColor Yellow
        Write-Host "3. Contact your Azure administrator to grant you access to a subscription" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "Successfully logged in with access to $subscriptionCount subscription(s)." -ForegroundColor Green
        
        # Display available subscriptions
        Write-Host "Available subscriptions:" -ForegroundColor Cyan
        $subscriptionList = $subscriptions | ConvertFrom-Json
        for ($i = 0; $i -lt $subscriptionList.Count; $i++) {
            Write-Host "[$($i+1)] $($subscriptionList[$i].name) ($($subscriptionList[$i].id))" -ForegroundColor Yellow
        }
    }
}

# Step 3: Create Resource Group
# Check if the resource group already exists
Write-Host "Checking if resource group $resourceGroupName exists."
$rgExists = az group exists --name $resourceGroupName
# If it doesn't exist, create the resource group
if ($rgExists -eq "false") {
    Write-Host "Creating resource group $resourceGroupName in location $location..."
    az group create --name $resourceGroupName --location $location
} else {
    Write-Host "Resource group $resourceGroupName exists."
}

# Step 4: Create App Service Plan (using Free tier)
# Check if the App Service Plan exists
Write-Host "Checking if App Service Plan $appServicePlanName exists."
$aspExists = az appservice plan show --name $appServicePlanName --resource-group $resourceGroupName --query "name" --output tsv
# If the App Service Plan does not exist, create it
if (-not $aspExists) {
    #Write-Host "App Service Plan $appServicePlanName does not exist. Creating it now..."
    Write-Host "Creating App Service Plan $appServicePlanName for linux in location $location at B1 scale."
    #az appservice plan create --name $appServicePlanName --resource-group $resourceGroupName --sku B1 --is-linux
    az appservice plan create --name $appServicePlanName --resource-group $resourceGroupName --sku B1 --is-linux --location $location
} else {
    Write-Host "App Service Plan $appServicePlanName already exists."
}

# Step 5: Create Web App
# Check if the Web App exists
Write-Host "Checking if Web App $webAppName exists."
$webAppExists = az webapp show --name $webAppName --resource-group $resourceGroupName --query "name" --output tsv
# If the Web App does not exist, create it
if (-not $webAppExists) {
    Write-Host "Creating Web App $webAppName with runtime $runtime"
    az webapp create --name $webAppName --resource-group $resourceGroupName --plan $appServicePlanName --runtime $runtime
} else {
    Write-Host "Web App $webAppName exists."
}

# DEPRECATED -- using zip deploy
# Step 6: Deploy Angular app to Azure
##Write-Host "Deploying the Angular app to Azure Web App $webAppName..."
##azure-static-web-apps-deploy --resource-group $resourceGroupName --name $webAppName --source "$distFolder\$projectName"

# Step 7: Zip the build files for deployment
$zipDestFolder = $env:TEMP
$zipPath = "$zipDestFolder\$($projectName).zip"
Write-Host "Creating archive file $zipPath"
#$tarPathWindows = "$env:TEMP\$($projectName).tar.gz"
## IMPORTANT NOTE:  unsure why angular build is outputting to "browser" subfolder!
#Compress-Archive -Path "$distFolder\$projectName\browser\*" -DestinationPath $zipPath -Force
$zipBin = "C:\Program Files\7-Zip\7z.exe"
#& $zipBin a -tzip -r -o"$env:TEMP" "$projectName" "$distFolder\$projectName\browser" -aoa
# Remove the existing zip file if it exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
$zipSourceFolder = "$distFolder\$projectName\browser"
Set-Location $zipSourceFolder
& $zipBin a -tzip -r -o"$zipDestFolder" "$zipPath" * -aoa
Set-Location -Path $PSScriptRoot  # Change back to the original directory
# a     = archive
# tzip  = normal .zip compression style
# -o    = DestinationPath
# -aoa  = Force

#$tarPathUnix = "/mnt/" + $tarPathWindows -replace ":", "" -replace "\\", "/"
#bash -c "tar -czf $tarPathUnix -C /mnt/c/Users/Lenovo/repo/vorba-web/dist/$projectName ."
#tar -czf tmp.tar.gz -C dist/vorba-web .
#az webapp config appsettings set --resource-group $resourceGroupName --name $webAppName --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Step 8: Deploy the zipped Angular app to Azure Web App
Write-Host "Deploying app to $webAppName..."
#az webapp deploy --resource-group $resourceGroupName --name $webAppName --src-path $zipPath
#az webapp deployment source config-zip --resource-group $resourceGroupName --name $webAppName --src $zipPath
az webapp deploy --resource-group $resourceGroupName --name $webAppName --src-path $zipPath --clean 'true'

# Completion message
Write-Host "Deployment complete. Access your app at: https://$webAppName.azurewebsites.net"
