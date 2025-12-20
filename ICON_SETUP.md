# 🎨 App Icon Quick Setup

## What You Have

✅ `app-icon.svg` - Green circular icon with $ symbol (matches your web app)

## Convert to Android Icons (Choose ONE method)

### Method 1: Icon Kitchen (Recommended - Easiest)

1. Go to: https://icon.kitchen/
2. Click "Upload Image"
3. Select `app-icon.svg` from your project folder
4. On the right panel:
   - Name: Money Manager
   - Platform: Android
   - Shape: Full Bleed (for circular icon)
5. Click "Download" button
6. Extract the ZIP file
7. Copy all folders (mipmap-hdpi, mipmap-mdpi, etc.) to:
   ```
   android/app/src/main/res/
   ```
   (Overwrite existing files)

### Method 2: Android Asset Studio

1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Click "Image" tab (top left)
3. Upload `app-icon.svg`
4. Adjust settings:
   - Padding: 10-15% (to ensure $ doesn't get cut off)
   - Background color: Transparent (our icon already has green background)
5. Click "Download" button
6. Extract ZIP and copy to `android/app/src/main/res/`

### Method 3: Using Capacitor Assets (Automated)

If you have npm installed:

1. Install the tool:
   ```bash
   npm install -g @capacitor/assets
   ```

2. Create `resources` folder structure:
   ```bash
   mkdir -p resources/android
   ```

3. Create icon file:
   - Copy `app-icon.svg` to `resources/android/icon.png` (convert to PNG first)

4. Generate all icons:
   ```bash
   npx capacitor-assets generate
   ```

## After Adding Icons

1. Sync with Android project:
   ```bash
   npx cap sync android
   ```

2. Commit the changes:
   ```bash
   git add android/app/src/main/res/mipmap-*
   git commit -m "Add custom Money Manager app icon"
   git push origin main
   ```

3. Wait for GitHub Actions to build (check Actions tab)

4. Download and install the new APK

## Verify Icon

After installing, you should see:
- 🟢 Green circular icon with white $ symbol on your phone's home screen
- Same branding as your web app

## Icon Sizes Needed

Android requires these sizes (Icon Kitchen/Asset Studio handles this automatically):
- mipmap-mdpi: 48x48px
- mipmap-hdpi: 72x72px
- mipmap-xhdpi: 96x96px
- mipmap-xxhdpi: 144x144px
- mipmap-xxxhdpi: 192x192px

Our SVG is 512x512, so it will scale perfectly to all sizes!

## Troubleshooting

**Icon not showing after install?**
- Restart your phone
- Clear launcher cache: Settings → Apps → Launcher → Clear cache
- Reinstall the app

**Icon looks blurry?**
- Make sure you copied ALL mipmap folders, not just one
- Android picks the right size for each screen density

**Still showing default Capacitor icon?**
- Check AndroidManifest.xml has: `android:icon="@mipmap/ic_launcher"`
- Run: `npx cap sync android` after adding icons
- Rebuild the APK

## Quick Visual Guide

```
Your Project                  Android App
├── app-icon.svg       →      📱 Icon on home screen
└── android/
    └── app/
        └── src/
            └── main/
                └── res/
                    ├── mipmap-mdpi/     48x48
                    ├── mipmap-hdpi/     72x72
                    ├── mipmap-xhdpi/    96x96
                    ├── mipmap-xxhdpi/   144x144
                    └── mipmap-xxxhdpi/  192x192
```

## Time Estimate

- Using Icon Kitchen: ~3 minutes
- Using Asset Studio: ~4 minutes
- Using Capacitor Assets: ~2 minutes (if you have it installed)

Choose Icon Kitchen - it's the fastest and easiest! 🚀
