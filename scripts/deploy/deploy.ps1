# deploy.ps1 -- builds and deploys this angular project to azure

# TODO: make a new copy with only the infrastructure and no code deployment (use github actions)

# Define parameters for the script
param(
    [string]$resourceGroupName = "vorba-web-rg", # Azure Resource Group Name
    [string]$appServicePlanName = "vorba-web-asp-linux", # Azure App Service Plan Name
    [string]$webAppName = "vorba-web-3", # Name of the Azure Web App
    [string]$location = "canadaeast", # Azure region (e.g., eastus, westus)
    [string]$projectName = "vorba-web", # Name of the Angular Project
    [string]$distFolder = "dist", # Location of the Angular build folder
    [string]$runtime = "NODE:22-lts", # Web App run-time
    [switch]$UseServicePrincipal, # Use service principal authentication
    [string]$ServicePrincipalId, # Service Principal ID
    [string]$ServicePrincipalSecret, # Service Principal Secret
    # Tenant ID for the Azure subscription adam.cox@vorba.com | Vorba | Vorba.onmicrosoft.com
    [string]$TenantId = "a7f7a08d-4e79-4d3d-812f-10bd18abbcfb"
)

# Troubleshooting (logs) cmd to get the log config:
# az webapp log show --name "vorba-web-2" --resource-group "vorba-web-rg"
# The log config cmd response output:
$logConfigJsonString = @'
{
  "applicationLogs": {
    "azureBlobStorage": {
      "level": "Off",
      "retentionInDays": null,
      "sasUrl": null
    },
    "azureTableStorage": {
      "level": "Off",
      "sasUrl": null
    },
    "fileSystem": {
      "level": "Off"
    }
  },
  "detailedErrorMessages": {
    "enabled": false
  },
  "failedRequestsTracing": {
    "enabled": false
  },
  "httpLogs": {
    "azureBlobStorage": {
      "enabled": false,
      "retentionInDays": 3,
      "sasUrl": null
    },
    "fileSystem": {
      "enabled": true,
      "retentionInDays": 3,
      "retentionInMb": 100
    }
  },
  "id": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/sites/vorba-web-2/config/logs",
  "kind": null,
  "location": "Canada East",
  "name": "logs",
  "resourceGroup": "vorba-web-rg",
  "type": "Microsoft.Web/sites/config"
}
'@
az webapp log config `
    --name "vorba-web-2" `
    --resource-group "vorba-web-rg" `
    --application-logging filesystem `
    --level information `
    --detailed-error-messages true `
    --failed-request-tracing true

# How-to restart the Web App
#az webapp restart --name "vorba-web-2" --resource-group "vorba-web-rg"

# How-to tail the logs:
#az webapp log tail --name "vorba-web-2" --resource-group "vorba-web-rg"

# Web App Config JSON string
# powershell command: az webapp show --name vorba-web-2 --resource-group vorba-web-rg
$webAppConfigJsonString = @'
{                  
  "appServicePlanId": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/serverfarms/vorba-web-asp-linux",
  "availabilityState": "Normal",
  "clientAffinityEnabled": true,
  "clientCertEnabled": false,
  "clientCertExclusionPaths": null,
  "clientCertMode": "Required",
  "cloningInfo": null,
  "containerSize": 0,
  "customDomainVerificationId": "F9223DA5529E763AB275D9859654562C8539E494D29813EE6D90BDB6AB3C9BD2",
  "dailyMemoryTimeQuota": 0,
  "daprConfig": null,
  "defaultHostName": "vorba-web-2.azurewebsites.net",
  "enabled": true,
  "enabledHostNames": [
    "adamcox.net",
    "vorba.com",
    "www.adamcox.net",
    "www.vorba.com",
    "vorba-web-2.azurewebsites.net",
    "vorba-web-2.scm.azurewebsites.net"
  ],
  "extendedLocation": null,
  "ftpPublishingUrl": "ftps://waws-prod-yq1-013.ftp.azurewebsites.windows.net/site/wwwroot",
  "hostNameSslStates": [
    {
      "certificateResourceId": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/certificates/adamcox.net-vorba-web-2",
      "hostType": "Standard",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "adamcox.net",
      "sslState": "SniEnabled",
      "thumbprint": "1E0A9E145292C3CFA65ADBEA4D6A76584CBE672C",    
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIPv6": null,
      "virtualIp": null
    },
    {
      "certificateResourceId": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/certificates/vorba.com-vorba-web-2",
      "hostType": "Standard",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "vorba.com",
      "sslState": "SniEnabled",
      "thumbprint": "B1FB938D1CB94F19698A9CE1347CCA99D832FC43",    
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIPv6": null,
      "virtualIp": null
    },
    {
      "certificateResourceId": null,
      "hostType": "Standard",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "vorba-web-2.azurewebsites.net",
      "sslState": "Disabled",
      "thumbprint": null,
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIPv6": null,
      "virtualIp": null
    },
    {
      "certificateResourceId": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/certificates/www.adamcox.net-vorba-web-2",
      "hostType": "Standard",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "www.adamcox.net",
      "sslState": "SniEnabled",
      "thumbprint": "3BB46C0F73415035E1BB2371324E467FBE05B95C",    
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIPv6": null,
      "virtualIp": null
    },
    {
      "certificateResourceId": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/certificates/www.vorba.com-vorba-web-2",
      "hostType": "Standard",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "www.vorba.com",
      "sslState": "SniEnabled",
      "thumbprint": "1D29E9F636828A6BD54CD4691BFEEBD6580FF1BE",    
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIPv6": null,
      "virtualIp": null
    },
    {
      "certificateResourceId": null,
      "hostType": "Repository",
      "ipBasedSslResult": null,
      "ipBasedSslState": "NotConfigured",
      "name": "vorba-web-2.scm.azurewebsites.net",
      "sslState": "Disabled",
      "thumbprint": null,
      "toUpdate": null,
      "toUpdateIpBasedSsl": null,
      "virtualIPv6": null,
      "virtualIp": null
    }
  ],
  "hostNames": [
    "www.adamcox.net",
    "adamcox.net",
    "www.vorba.com",
    "vorba.com",
    "vorba-web-2.azurewebsites.net"
  ],
  "hostNamesDisabled": false,
  "hostingEnvironmentProfile": null,
  "httpsOnly": true,
  "hyperV": false,
  "id": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/sites/vorba-web-2",  
  "identity": null,
  "inProgressOperationId": null,
  "isDefaultContainer": null,
  "isXenon": false,
  "keyVaultReferenceIdentity": "SystemAssigned",
  "kind": "app,linux",
  "lastModifiedTimeUtc": "2025-05-10T21:33:16.583333",
  "location": "Canada East",
  "managedEnvironmentId": null,
  "maxNumberOfWorkers": null,
  "name": "vorba-web-2",
  "outboundIpAddresses": "52.155.27.16,52.155.27.22,52.155.27.39,52.155.27.67,52.155.27.28,52.155.27.29,40.89.19.0",
  "possibleOutboundIpAddresses": "20.104.128.114,20.104.136.232,20.104.169.73,20.104.170.89,20.175.53.186,20.220.116.129,40.69.96.182,40.69.97.61,40.86.219.167,40.89.19.0,52.155.27.16,52.155.27.22,52.155.27.28,52.155.27.29,52.155.27.39,52.155.27.44,52.155.27.45,52.155.27.64,52.155.27.65,52.155.27.67,52.155.27.70,52.155.27.71,52.235.29.35,52.235.31.86,52.235.33.3",
  "publicNetworkAccess": null,
  "redundancyMode": "None",
  "repositorySiteName": "vorba-web-2",
  "reserved": true,
  "resourceConfig": null,
  "resourceGroup": "vorba-web-rg",
  "scmSiteAlsoStopped": false,
  "siteConfig": {
    "acrUseManagedIdentityCreds": false,
    "acrUserManagedIdentityId": null,
    "alwaysOn": true,
    "apiDefinition": null,
    "apiManagementConfig": null,
    "appCommandLine": "pm2 serve /home/site/wwwroot --no-daemon --spa",
    "appSettings": null,
    "autoHealEnabled": false,
    "autoHealRules": null,
    "autoSwapSlotName": null,
    "azureStorageAccounts": {},
    "connectionStrings": null,
    "cors": null,
    "defaultDocuments": [
      "Default.htm",
      "Default.html",
      "Default.asp",
      "index.htm",
      "index.html",
      "iisstart.htm",
      "default.aspx",
      "index.php",
      "hostingstart.html"
    ],
    "detailedErrorLoggingEnabled": false,
    "documentRoot": null,
    "elasticWebAppScaleLimit": 0,
    "experiments": {
      "rampUpRules": []
    },
    "ftpsState": "FtpsOnly",
    "functionAppScaleLimit": null,
    "functionsRuntimeScaleMonitoringEnabled": false,
    "handlerMappings": null,
    "healthCheckPath": null,
    "http20Enabled": true,
    "httpLoggingEnabled": true,
    "id": "/subscriptions/236217f7-0ad4-4dd6-8553-dc4b574fd2c5/resourceGroups/vorba-web-rg/providers/Microsoft.Web/sites/vorba-web-2/config/web",
    "ipSecurityRestrictions": [
      {
        "action": "Allow",
        "description": "Allow all access",
        "headers": null,
        "ipAddress": "Any",
        "name": "Allow all",
        "priority": 2147483647,
        "subnetMask": null,
        "subnetTrafficTag": null,
        "tag": null,
        "vnetSubnetResourceId": null,
        "vnetTrafficTag": null
      }
    ],
    "ipSecurityRestrictionsDefaultAction": null,
    "javaContainer": null,
    "javaContainerVersion": null,
    "javaVersion": null,
    "keyVaultReferenceIdentity": null,
    "kind": null,
    "limits": null,
    "linuxFxVersion": "NODE|18-lts",
    "loadBalancing": "LeastRequests",
    "localMySqlEnabled": false,
    "location": "Canada East",
    "logsDirectorySizeLimit": 100,
    "machineKey": null,
    "managedPipelineMode": "Integrated",
    "managedServiceIdentityId": null,
    "metadata": null,
    "minTlsCipherSuite": null,
    "minTlsVersion": "1.2",
    "minimumElasticInstanceCount": 1,
    "name": "vorba-web-2",
    "netFrameworkVersion": "v4.0",
    "nodeVersion": "",
    "numberOfWorkers": 1,
    "phpVersion": "",
    "powerShellVersion": "",
    "preWarmedInstanceCount": 0,
    "publicNetworkAccess": null,
    "publishingUsername": "$vorba-web-2",
    "push": null,
    "pythonVersion": "",
    "remoteDebuggingEnabled": false,
    "remoteDebuggingVersion": null,
    "requestTracingEnabled": false,
    "requestTracingExpirationTime": null,
    "resourceGroup": "vorba-web-rg",
    "scmIpSecurityRestrictions": [
      {
        "action": "Allow",
        "description": "Allow all access",
        "headers": null,
        "ipAddress": "Any",
        "name": "Allow all",
        "priority": 2147483647,
        "subnetMask": null,
        "subnetTrafficTag": null,
        "tag": null,
        "vnetSubnetResourceId": null,
        "vnetTrafficTag": null
      }
    ],
    "scmIpSecurityRestrictionsDefaultAction": null,
    "scmIpSecurityRestrictionsUseMain": false,
    "scmMinTlsVersion": "1.2",
    "scmType": "None",
    "tracingOptions": null,
    "type": "Microsoft.Web/sites/config",
    "use32BitWorkerProcess": true,
    "virtualApplications": [
      {
        "physicalPath": "site\\wwwroot",
        "preloadEnabled": true,
        "virtualDirectories": null,
        "virtualPath": "/"
      }
    ],
    "vnetName": "",
    "vnetPrivatePortsCount": 0,
    "vnetRouteAllEnabled": false,
    "webSocketsEnabled": false,
    "websiteTimeZone": null,
    "windowsFxVersion": null,
    "xManagedServiceIdentityId": null
  },
  "slotSwapStatus": null,
  "state": "Running",
  "storageAccountRequired": false,
  "suspendedTill": null,
  "tags": null,
  "targetSwapSlot": null,
  "trafficManagerHostNames": null,
  "type": "Microsoft.Web/sites",
  "usageState": "Normal",
  "virtualNetworkSubnetId": null,
  "vnetContentShareEnabled": false,
  "vnetImagePullEnabled": false,
  "vnetRouteAllEnabled": false,
  "workloadProfileName": null
}
'@

$webAppConfigJson = $webAppConfigJsonString | ConvertFrom-Json

Write-Host "Web App Config for httpsOnly: $($webAppConfigJson.httpsOnly)"

# Step 1: Build the Angular app for production
Write-Host "Building the Angular project $projectName."
# Run the Angular build command
ng build --configuration production
# Check if the build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Angular build succeeded."
}
else {
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
    }
    else {
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
    }
    else {
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
}
else {
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
}
else {
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
}
else {
    Write-Host "Web App $webAppName exists."
}

# Step 5.1: Configure HTTPS and SSL
Write-Host "Configuring HTTPS and SSL settings..."
# Force HTTPS
#az webapp config set --name $webAppName --resource-group $resourceGroupName --min-tls-version 1.2
az webapp update --name $webAppName --resource-group $resourceGroupName --https-only $webAppConfigJson.httpsOnly

# Step 5.2: Configure custom domain (if not already configured)
Write-Host "Checking custom domain configuration..."
$customDomain = "adamcox.net"
$domainConfig = az webapp config hostname list --webapp-name $webAppName --resource-group $resourceGroupName --query "[?name=='$customDomain']" --output json
if ($domainConfig -eq "[]") {
    Write-Host "Custom domain $customDomain not configured. Please configure it in the Azure Portal:"
    Write-Host "1. Go to your App Service in Azure Portal"
    Write-Host "2. Navigate to 'Custom domains'"
    Write-Host "3. Add your domain and follow the DNS configuration instructions"
    Write-Host "4. Once DNS is configured, add the domain to your App Service"
}
else {
    Write-Host "Custom domain $customDomain is configured."
}

# Step 5.3: Configure App Settings
Write-Host "Configuring App Settings..."
<# az webapp config appsettings set `
  --resource-group $resourceGroupName `
  --name $webAppName `
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true #>
az webapp config set `
    --name "vorba-web-2" `
    --resource-group "vorba-web-rg" `
    --startup-file "node server.js"
    #--startup-file "pm2 serve /home/site/wwwroot `$PORT --no-daemon --spa"

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
