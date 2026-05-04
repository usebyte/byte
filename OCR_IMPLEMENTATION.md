# OCR Implementation with Tesseract.js

## Overview
OCR (Optical Character Recognition) is now implemented using **Tesseract.js**, which is dynamically loaded only when the user enables it. This keeps the bundle size small and provides on-demand text extraction from images.

## Key Features

### ✅ Dynamic Loading
- **No npm install required** - Tesseract.js loads from CDN only when needed
- **First use**: Downloads ~6MB library from `cdn.jsdelivr.net`
- **Subsequent uses**: Uses cached version
- **Zero impact** on users who don't enable OCR

### ✅ User-Controlled
- **Settings toggle**: Users must enable OCR in Settings → Connections
- **Visual indicator**: Green dot shows when OCR is active
- **Clear messaging**: Shows "Tesseract.js · Active" when enabled

### ✅ Smart Integration
- Works alongside Vision and Describe modes
- Automatically used when:
  - User selects OCR mode (green badge)
  - Non-vision model is selected (smart default)

## How It Works

### 1. Install OCR
```
Settings → Connections → OCR (Text Extraction) → Click "Install"
```
- Shows "Install" button initially
- Click to download Tesseract.js from CDN (~6MB)
- Shows "Installing..." with spinner
- After installation: Shows toggle (ON by default)
- Green dot appears when active

### 2. Enable/Disable OCR (After Installation)
```
Settings → Connections → OCR (Text Extraction) → Toggle ON/OFF
```
- Toggle appears after installation
- ON: "Tesseract.js · Active" + green dot
- OFF: "Tesseract.js · Installed" (no green dot)

### 3. Use OCR
```
1. Upload image
2. Badge shows green "OCR" (default for non-vision models)
3. Send message
4. Tesseract extracts text
5. Text is added to your message context
```

### 4. Processing Flow
```
User uploads image with OCR mode
  ↓
Check if ocrInstalled = true
  ↓
Check if ocrEnabled = true
  ↓
Load Tesseract.js (already cached)
  ↓
Show "Extracting text..." interstitial
  ↓
Tesseract.recognize(image)
  ↓
Extract text with progress updates
  ↓
Store in attachment.description
  ↓
Set describedBy = "Tesseract OCR"
  ↓
Send to AI with extracted text
```

## Files Created/Modified

### New Files
1. **`Byte/src/lib/ocr.ts`** - OCR utility functions
   - `extractTextOCR(imageData, onProgress)` - Main extraction function
   - `loadTesseract()` - Dynamic CDN loader
   - `isTesseractLoaded()` - Check if loaded
   - `getLoadError()` - Get error if loading failed
   - `isLoadingTesseract()` - Check loading status

### Modified Files
1. **`Byte/src/store/useStore.ts`**
   - Added `ocrInstalled: boolean`
   - Added `ocrEnabled: boolean`
   - Added `setOcrInstalled: (installed: boolean) => void`
   - Added `setOcrEnabled: (enabled: boolean) => void`

2. **`Byte/src/components/views/SettingsView.tsx`**
   - Added OCR install button in ConnectionsPanel
   - Shows "Install" button initially
   - Shows "Installing..." with spinner during download
   - Shows toggle after installation
   - Shows "Tesseract.js · Active" when enabled
   - Shows "Tesseract.js · Installed" when disabled
   - Green indicator dot when active
   - Includes `handleInstallOCR` function

3. **`Byte/src/components/views/ChatView.tsx`**
   - Uses `extractTextOCR` from ocr.ts
   - Checks `ocrEnabled` before processing
   - Shows progress during extraction
   - Sets "Tesseract OCR" as describedBy

## Technical Details

### Dynamic Loading Strategy
```typescript
// Loads Tesseract.js from CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
script.async = true;
document.head.appendChild(script);

// Available globally as window.Tesseract
```

### Memory Management
- **Worker lifecycle**: Create → Recognize → Terminate
- **No memory leaks**: Each OCR operation creates and destroys its worker
- **Efficient**: Only one worker at a time

### Progress Tracking
```typescript
extractTextOCR(imageData, (progress) => {
  console.log('OCR progress:', progress); // 0.0 to 1.0
});
```

### Error Handling
- **Load failure**: Shows error message, keeps OCR disabled
- **Recognition failure**: Returns "[No text found]"
- **Network issues**: Graceful degradation

## Comparison: Vision API vs Tesseract OCR

| Feature | Vision API OCR | Tesseract OCR |
|---------|---------------|---------------|
| **Requires API** | ✅ Yes | ❌ No |
| **Cost** | API charges | Free |
| **Speed** | Fast (network) | Medium (client-side) |
| **Accuracy** | Very high | Good |
| **Languages** | Many | English (default, more available) |
| **Privacy** | Sent to server | 100% client-side |
| **Bundle size** | 0 | 0 (loads on-demand) |
| **Works offline** | ❌ No | ✅ Yes (after first download) |
| **Best for** | Quick, accurate results | Privacy, offline, cost-free |

## User Experience

### First-Time Setup
1. User sees "Install" button in OCR section
2. Clicks "Install"
3. Button changes to "Installing..." with spinner
4. Tesseract.js downloads (~6MB, one-time)
5. After install: Toggle appears (ON by default)
6. Green dot appears
7. Can now use OCR mode

### Daily Use
1. Upload image
2. Green "OCR" badge (automatic for non-vision models)
3. Click send
4. Brief "Extracting text..." message
5. Text extracted and sent to AI

### Settings Display
```
OCR (Text Extraction)
├── Not Installed: "Extract text from images using Tesseract.js (~6MB download)" + Install button
├── Installing:    "Installing..." + spinner
├── Installed/OFF:  "Tesseract.js · Installed" + toggle (OFF)
└── Installed/ON:   "Tesseract.js · Active" + toggle (ON) + green dot
```

## Benefits

### For Users
✅ **Privacy**: Text extraction happens 100% on device  
✅ **Free**: No API costs for OCR  
✅ **Offline**: Works without internet (after first download)  
✅ **Optional**: Only downloads if you want it  
✅ **Fast**: Client-side processing, no API latency  

### For Developers
✅ **Zero bundle impact**: Loaded on-demand  
✅ **Simple integration**: Single function call  
✅ **No dependencies**: No npm packages to manage  
✅ **Reliable**: CDN-hosted, well-maintained library  
✅ **Flexible**: Easy to extend with more languages  

## Advanced Configuration

### Language Support
Currently configured for English. To add more languages:

```typescript
// In ocr.ts, modify createWorker call:
const worker = await Tesseract.createWorker('eng+fra+deu', 1, { ... });
// This loads English + French + German
```

Available languages: 100+ via Tesseract

### Performance Tuning
```typescript
// Adjust worker count for parallel processing
const worker = await Tesseract.createWorker('eng', 2); // 2 workers

// Or use scheduler for batch processing
const scheduler = Tesseract.createScheduler();
```

### Custom Recognition Options
```typescript
await worker.recognize(imageData, {
  rotateAuto: true,    // Auto-rotate images
  rectangle: {         // Crop to specific area
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  },
});
```

## Troubleshooting

### OCR Not Working
**Problem**: Toggle enabled but OCR fails  
**Solutions**:
1. Check browser console for errors
2. Verify internet connection (first download)
3. Clear browser cache and re-enable
4. Try different image format

### Poor Text Recognition
**Problem**: Text not extracted accurately  
**Solutions**:
1. Use higher resolution images
2. Ensure good contrast (dark text, light background)
3. Avoid complex fonts or handwriting
4. Try Vision API OCR instead (more accurate)

### Slow Performance
**Problem**: OCR takes too long  
**Solutions**:
1. Reduce image size before uploading
2. Crop to text-only regions
3. Use Vision API OCR for speed

### CDN Loading Failed
**Problem**: "Failed to load OCR library"  
**Solutions**:
1. Check internet connection
2. Try again later (CDN might be down)
3. Check browser console for specific error

## Future Enhancements

### Possible Additions
- [ ] Multiple language selection in settings
- [ ] OCR quality/speed slider
- [ ] Batch OCR for multiple images
- [ ] OCR result preview/editing
- [ ] Save extracted text separately
- [ ] OCR confidence scores
- [ ] Region-of-interest selection
- [ ] Alternative OCR engines

### Integration Ideas
- [ ] Auto-detect text language
- [ ] Translation after extraction
- [ ] Text-to-speech for accessibility
- [ ] Export OCR results to file
- [ ] OCR history/cache

## Cost Analysis

### Tesseract OCR (Current)
- **Setup cost**: $0
- **Per-image cost**: $0
- **Monthly cost**: $0
- **Traffic**: ~6MB one-time download
- **Compute**: Client-side (user's device)

### Vision API OCR (Alternative)
- **Setup cost**: $0
- **Per-image cost**: ~$0.001 - $0.005 (varies by provider)
- **Monthly cost**: Depends on usage
- **Traffic**: Image upload + API response
- **Compute**: Server-side (API provider)

For 100 images/month:
- **Tesseract**: $0
- **Vision API**: $0.10 - $0.50

## Privacy Considerations

### Data Flow
```
Tesseract OCR:
User's image → Browser (local processing) → Extracted text → AI

Vision API OCR:
User's image → Vision API Server → Extracted text → AI
            ↑ Image leaves user's device
```

### Privacy Benefits
✅ Images never leave the user's device during OCR  
✅ No third-party sees the image content  
✅ Works completely offline after initial download  
✅ No logs or tracking during text extraction  

### When Privacy Matters
- Medical documents
- Financial statements
- Personal identification
- Confidential business documents
- Sensitive screenshots

Use **Tesseract OCR** for maximum privacy! 🔒

---

## Quick Reference

### Install OCR
```
Settings → Connections → OCR (Text Extraction) → Click "Install"
```

### Enable/Disable OCR
```
Settings → Connections → OCR (Text Extraction) → Toggle ON/OFF
```

### Use OCR
```
Upload image → Green OCR badge → Send
```

### Check Status
```
Green dot on icon = OCR active
"Tesseract.js · Active" = Ready to use
```

### Disable OCR
```
Settings → Connections → OCR (Text Extraction) → Toggle OFF
```

**Note**: Disabling OCR doesn't remove the downloaded library (stays cached in browser).

---

**Tesseract.js is open source!** 🎉  
GitHub: https://github.com/naptha/tesseract.js
