# Vision Features - Quick Start Guide

## Setup (One-Time)

### 1. Configure Vision Model (Optional but Recommended)
1. Click **Settings** (gear icon)
2. Go to **Connections** tab
3. Find **Image Description** section
4. Click **Select** button
5. Choose a vision model (e.g., "GPT-4o" or "Claude 3.5 Sonnet")
6. ✅ Green dot appears when configured

> **Note**: You need at least one vision-capable model enabled in the Models settings first.

## Using Vision Features

### Quick Upload
1. Click the **+ button** in chat input
2. Select **Add files**
3. Choose one or more images
4. ✓ Thumbnails appear above input

### Three Modes 🎨

The app intelligently defaults to the best mode based on your selected model:
- **If your model supports vision**: Defaults to Vision mode 🔵
- **If your model doesn't support vision**: Defaults to OCR mode 🟢

#### 🔵 **Vision Mode** (Blue Badge)
- **What it does**: AI analyzes the image directly
- **Best for**: Questions about visual content, screenshots, charts, photos
- **Badge**: Blue "VISION"
- **Example**: "What's in this image?" → AI sees and describes it
- **Works with**: Vision-capable models (GPT-4o, Claude 3.5, Gemini, etc.)

#### 🟢 **OCR Mode** (Green Badge)  
- **What it does**: Extracts all visible text from the image
- **Best for**: Screenshots with text, documents, receipts, signs
- **Badge**: Green "OCR"
- **Example**: Screenshot of code → Extracts the code as text
- **Works with**: Any vision-capable model
- **Note**: The extracted text is added to your message context

#### 🟣 **Describe Mode** (Purple Badge)
- **What it does**: Gets a description first, then sends to AI
- **Best for**: Complex images, adding context, cataloging
- **Badge**: Purple "DESCRIBE"
- **Example**: Architecture diagram → "A diagram showing..." → AI explains
- **Works with**: Any vision-capable model

### Cycling Modes
- Click the **mode badge** (bottom-left of thumbnail)
- Cycles through: Vision → OCR → Describe → Vision → ...
- Each image can have its own mode

### Smart Defaults
The app automatically chooses the best default:
- **Vision model selected** → Images default to **Vision mode** 🔵
- **Non-vision model selected** → Images default to **OCR mode** 🟢

You can always click the badge to cycle to a different mode!

### Sending
1. Add images (thumbnails show up)
2. Set modes (click badges to cycle if needed)
3. Type your message (optional)
4. Click **Send**

**Processing indicators**:
- **OCR mode**: "Extracting text..."
- **Describe mode**: "Analyzing images..."
- **Both**: "Analyzing images and extracting text..."

### Viewing Messages
- Your messages show image thumbnails at the top
- Click any thumbnail to view full-size
- **Green "OCR" badge**: Text was extracted
- **Purple "DESCRIBED" badge**: Image was described
- Hover over badge to see the extracted/described text

## Examples

### Example 1: Screenshot with Code (OCR Mode)
```
1. Upload screenshot.png
2. Badge shows green "OCR" (auto-default if non-vision model)
3. Type: "Explain this code and find bugs"
4. Send
→ Text is extracted: "function foo() { consol.log('test'); }"
→ AI analyzes: "There's a typo: 'consol' should be 'console'"
```

### Example 2: Photo Analysis (Vision Mode)
```
1. Upload photo.jpg
2. Keep blue "VISION" badge (auto-default if vision model)
3. Type: "What's the mood of this photo?"
4. Send
→ AI directly analyzes the image colors, composition, subjects
→ AI responds: "The photo has a calm, serene mood with soft lighting..."
```

### Example 3: Mixed Modes
```
1. Upload receipt.jpg → Click badge to set "OCR" (green)
2. Upload product.jpg → Keep "VISION" (blue)
3. Type: "Is this receipt for the product in the photo?"
4. Send
→ Receipt text is extracted
→ Product image is analyzed visually
→ AI cross-references both
```

### Example 4: Complex Diagram (Describe Mode)
```
1. Upload architecture-diagram.png
2. Click badge twice to set "DESCRIBE" (purple)
3. Type: "How would you improve this architecture?"
4. Send
→ Image is described: "A microservices architecture with..."
→ AI uses the description to provide recommendations
```

## Tips & Best Practices

### When to Use Each Mode

**🔵 Use Vision Mode for:**
- Screenshots and UI elements
- Photos and artwork  
- Charts and graphs you want analyzed
- Diagrams with visual relationships
- Handwritten notes or sketches
- Anything where **visual context matters**

**🟢 Use OCR Mode for:**
- Text-heavy screenshots
- Code snippets in images
- Documents, receipts, invoices
- Signs, menus, labels
- Any image where you need the **exact text**
- When using a **non-vision model**

**🟣 Use Describe Mode for:**
- Complex images needing detailed descriptions
- Creating searchable image catalogs
- When you want a **textual summary** of the image
- To save on API costs (describe once, use many times)

### Best Practices
1. **Let the app choose**: Smart defaults work great most of the time
2. **OCR for text extraction**: Use green OCR mode for any text-heavy images
3. **Vision for visual analysis**: Use blue vision mode when you need visual understanding
4. **Mix modes**: Different images can use different modes in the same message
5. **Image quality**: Higher resolution = better results (especially for OCR)
6. **File size**: Keep under 10MB for best performance
7. **Be specific**: Clear questions get better answers

## Workflow Examples

### Code Review Workflow
```
1. Screenshot of code → OCR mode (green)
2. Ask: "Review this code for security issues"
→ AI reads the exact code and provides detailed review
```

### Design Feedback Workflow
```
1. Design mockup → Vision mode (blue)
2. Ask: "What are the UX problems in this design?"
→ AI analyzes visual hierarchy, spacing, colors
```

### Document Processing Workflow
```
1. Receipt/invoice → OCR mode (green)
2. Ask: "Extract the total amount and date"
→ AI reads the text and extracts structured data
```

### Research Workflow
```
1. Multiple images → Mix of Vision & Describe modes
2. Ask: "Compare these research findings"
→ Some images analyzed visually, others described textually
```

## Troubleshooting

### Dropdown Not Opening
**Problem**: Click "Select" but nothing happens  
**Solution**: 
- Check browser console for errors (open with F12)
- Ensure you have vision models enabled in Settings → Models
- Refresh the page
- Check the console log for "[Vision Settings] Vision models:"

### Wrong Default Mode
**Problem**: Images default to OCR when you want Vision  
**Solution**: 
- Your selected model may not support vision
- Go to Settings → Models and select a vision-capable model
- Or manually click the badge to change mode

### OCR Not Extracting Text
**Problem**: OCR mode shows "[No text found]"  
**Solution**:
- Image may actually have no text
- Try higher resolution image
- Ensure text is clearly visible and not too small
- Some fonts/handwriting may be difficult to read

### Vision Mode Not Working
**Problem**: AI doesn't reference the image  
**Solution**:
- Verify your selected model supports vision
- Check that image thumbnail shows in your message
- Try rephrasing your question
- Make sure image uploaded successfully (not corrupted)

### "Extracting text..." Stuck
**Problem**: Processing doesn't complete  
**Solution**: 
- Check internet connection
- Verify API key is valid
- Try a different model
- Image file may be too large

## Keyboard Shortcuts

- **Tab**: Navigate through interface
- **Enter**: Send message
- **Shift+Enter**: New line in message

## Supported Models

Vision-capable models that work with all 3 modes:
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-4 Vision, o1, o3, o4
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku), Claude 4
- **Google**: Gemini models, Gemma
- **Groq**: Vision-enabled models
- **Mistral**: Pixtral
- **OpenRouter**: Various vision models

For **OCR and Describe modes**, any vision model will work.  
For **Vision mode**, the model must support vision and be selected as your active model.

## Mode Comparison Table

| Feature | Vision 🔵 | OCR 🟢 | Describe 🟣 |
|---------|---------|-------|------------|
| **Analyzes visuals** | ✅ Direct | ❌ No | ✅ Yes (then describes) |
| **Extracts text** | ✅ Can see text | ✅ Dedicated text extraction | ⚠️ May include text in description |
| **Works with non-vision models** | ❌ No | ✅ Yes (processes first) | ✅ Yes (processes first) |
| **Best for** | Visual analysis | Text extraction | General descriptions |
| **Processing** | Instant | Extracts then sends | Describes then sends |
| **API calls** | 1 call | 2 calls (extract + chat) | 2 calls (describe + chat) |

## Getting Help

If you encounter issues:
1. Check Settings → Connections for proper configuration
2. Verify API keys are valid
3. Enable at least one vision-capable model
4. Check browser console (F12) for errors
5. Try a different vision model
6. Ensure images are valid formats (PNG, JPG, etc.)

---

**Ready to try?** Go ahead and upload your first image! 📸  
The app will automatically choose the best mode for you! ✨
