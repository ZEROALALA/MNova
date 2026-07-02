Write-Host "============================================="
Write-Host "   M NOVA - Development Tools Installer"
Write-Host "============================================="
Write-Host ""
Write-Host "This script will install the required tools with Administrator privileges."
Write-Host ""

Write-Host "1/3 Installing Cursor IDE..."
winget install Anysphere.Cursor --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "2/3 Installing .NET 8 SDK..."
winget install Microsoft.DotNet.SDK.8 --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "3/3 Installing Visual Studio Community 2022 (with WPF)..."
Write-Host "This might take 10-20 minutes depending on your internet speed."
winget install Microsoft.VisualStudio.2022.Community --override "--passive --wait --add Microsoft.VisualStudio.Workload.ManagedDesktop" --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "============================================="
Write-Host "   Installation Complete!"
Write-Host "============================================="
Write-Host "Press any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
