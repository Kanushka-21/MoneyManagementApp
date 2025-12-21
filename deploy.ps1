# Quick Deployment Script for Windows PowerShell
# Run this script to build and prepare for all platforms

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Money Manager - Multi-Platform Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build web app
Write-Host "Step 1: Building web application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web build complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Sync with Capacitor Android
Write-Host "Step 2: Syncing with Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Android sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Android sync complete!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete! Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 For Android APK:" -ForegroundColor Yellow
Write-Host "   cd android" -ForegroundColor Gray
Write-Host "   .\gradlew assembleDebug" -ForegroundColor Gray
Write-Host "   cd .." -ForegroundColor Gray
Write-Host "   APK: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 For Firebase Hosting:" -ForegroundColor Yellow
Write-Host "   firebase deploy --only hosting" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 For Netlify:" -ForegroundColor Yellow
Write-Host "   netlify deploy --prod --dir=dist" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANT: Before testing, update Firebase Console!" -ForegroundColor Red
Write-Host "   See COMPLETE_DEPLOYMENT_FIX.md for detailed instructions" -ForegroundColor Red
Write-Host ""
