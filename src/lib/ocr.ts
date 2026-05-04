// OCR functionality using Tesseract.js (loaded dynamically)

let tesseractInstance: any = null;
let isLoading = false;
let loadError: string | null = null;

/**
 * Dynamically load Tesseract.js from CDN
 */
async function loadTesseract(): Promise<any> {
  if (tesseractInstance) return tesseractInstance;
  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return tesseractInstance;
  }

  isLoading = true;
  loadError = null;

  try {
    // Load Tesseract.js from CDN
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;

    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // @ts-ignore - Tesseract is loaded globally
    tesseractInstance = window.Tesseract;
    isLoading = false;
    return tesseractInstance;
  } catch (error) {
    isLoading = false;
    loadError = `Failed to load OCR library: ${error}`;
    throw new Error(loadError);
  }
}

/**
 * Extract text from an image using Tesseract.js
 * @param imageData - Data URI or URL of the image
 * @param onProgress - Optional callback for progress updates (0-1)
 * @returns Extracted text
 */
export async function extractTextOCR(
  imageData: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    const Tesseract = await loadTesseract();

    const worker = await Tesseract.createWorker("eng", 1, {
      logger: (m: any) => {
        if (onProgress && m.status === "recognizing text") {
          onProgress(m.progress);
        }
      },
    });

    const {
      data: { text },
    } = await worker.recognize(imageData);

    await worker.terminate();

    return text.trim() || "[No text found]";
  } catch (error) {
    console.error("[OCR] Error:", error);
    throw new Error(
      `OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Check if Tesseract is loaded
 */
export function isTesseractLoaded(): boolean {
  return tesseractInstance !== null;
}

/**
 * Get loading error if any
 */
export function getLoadError(): string | null {
  return loadError;
}

/**
 * Get loading status
 */
export function isLoadingTesseract(): boolean {
  return isLoading;
}

/**
 * Preload Tesseract.js (for explicit installation)
 * Returns true if successful, false otherwise
 */
export async function preloadTesseract(): Promise<boolean> {
  try {
    await loadTesseract();
    return true;
  } catch (error) {
    console.error("[OCR] Failed to preload Tesseract:", error);
    return false;
  }
}
