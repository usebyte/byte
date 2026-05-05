import * as pdfjsLib from "pdfjs-dist";

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function convertPdfToMarkdown(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  let markdown = `# ${file.name}\n\n`;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    if (pageNum > 1) {
      markdown += "\n---\n\n";
    }

    markdown += `## Page ${pageNum}\n\n`;

    let lastY: number | null = null;
    for (const item of textContent.items) {
      if ("str" in item) {
        // Check if this is a new line (Y coordinate changed significantly)
        if (lastY !== null && Math.abs((item as any).y - lastY) > 5) {
          markdown += "\n";
        }
        markdown += item.str + " ";
        lastY = (item as any).y;
      }
    }

    markdown += "\n";
  }

  return markdown;
}

export async function convertFileToText(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return convertPdfToMarkdown(file);
  }

  // For text files, just read as text
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      // Wrap content in markdown code block if it's a source file
      const isSourceFile = /\.(ts|tsx|js|jsx|py|java|cpp|go|rb|php)$/i.test(
        file.name,
      );
      if (isSourceFile) {
        const ext = file.name.split(".").pop() || "text";
        resolve(`\`\`\`${ext}\n${content}\n\`\`\``);
      } else {
        resolve(content);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function isTextFile(file: File): boolean {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/pdf" ||
    mimeType === "application/json" ||
    mimeType === "application/x-yaml" ||
    mimeType === "application/xml" ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".csv") ||
    fileName.endsWith(".yaml") ||
    fileName.endsWith(".yml") ||
    fileName.endsWith(".xml") ||
    fileName.endsWith(".json") ||
    fileName.endsWith(".ts") ||
    fileName.endsWith(".tsx") ||
    fileName.endsWith(".js") ||
    fileName.endsWith(".jsx") ||
    fileName.endsWith(".py") ||
    fileName.endsWith(".java") ||
    fileName.endsWith(".cpp") ||
    fileName.endsWith(".go") ||
    fileName.endsWith(".rb") ||
    fileName.endsWith(".php")
  );
}
