// utils/image/ocr/layout-reconstructor.ts
import { OCRResult, LineWithLayout } from "./ocr";

interface Block {
  lines: LineWithLayout[];
  type: "paragraph" | "heading" | "table";
  tableData?: string[][];
  tableColumnPositions?: number[];
}

export function reconstructDocument(results: OCRResult[]): { html: string; raw: string } {
  let allBlocks: Block[] = [];
  let rawTextAccumulator = "";
  
  for (const result of results) {
    // Ensure stable reading order (top-to-bottom, then left-to-right)
    const lines = [...result.lines].sort((a, b) => {
      const dy = a.bbox.y0 - b.bbox.y0;
      if (Math.abs(dy) > 6) return dy;
      return a.bbox.x0 - b.bbox.x0;
    });
    if (lines.length === 0) continue;
    
    // Group lines into blocks based on vertical gaps
    const blocks: Block[] = [];
    let currentBlockLines: LineWithLayout[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentBlockLines.push(line);
      
      // Check if next line has a large gap (new block)
      if (i < lines.length - 1) {
        const currentBottom = line.bbox.y1;
        const nextTop = lines[i + 1].bbox.y0;
        const gap = nextTop - currentBottom;
        const lineHeight = line.bbox.y1 - line.bbox.y0;
        
        if (gap > lineHeight * 1.5) {
          // End of current block
          if (currentBlockLines.length > 0) {
            blocks.push({ lines: [...currentBlockLines], type: "paragraph" });
            currentBlockLines = [];
          }
        }
      }
    }
    
    if (currentBlockLines.length > 0) {
      blocks.push({ lines: currentBlockLines, type: "paragraph" });
    }
    
    // Classify each block (heading, table, paragraph)
    const classifiedBlocks = blocks.map(block => classifyBlock(block));
    allBlocks = [...allBlocks, ...classifiedBlocks];
    
    // Accumulate raw text
    rawTextAccumulator += result.rawText + "\n\n";
  }
  
  // Generate HTML
  const html = generateHTML(allBlocks);
  return { html, raw: rawTextAccumulator };
}

function classifyBlock(block: { lines: LineWithLayout[]; type: string }): Block {
  const { lines } = block;
  
  // Check for heading: short line, all caps or small length with high confidence
  if (lines.length === 1) {
    const line = lines[0];
    const text = line.text.trim();
    const isAllCaps = text === text.toUpperCase() && text.length > 1;
    const isShort = text.length < 60;
    if ((isAllCaps || isShort) && text.length > 0) {
      return { lines, type: "heading" };
    }
  }
  
  // Check for table
  const tableResult = detectTable(lines);
  if (tableResult.isTable) {
    return {
      lines,
      type: "table",
      tableData: tableResult.data,
      tableColumnPositions: tableResult.columnPositions,
    };
  }
  
  return { lines, type: "paragraph" };
}

function detectTable(lines: LineWithLayout[]): { isTable: boolean; data: string[][]; columnPositions: number[] } {
  if (lines.length < 2) return { isTable: false, data: [], columnPositions: [] };
  
  // Extract word positions for each line
  const linesWords = lines.map(line => line.words);
  
  // Count words per line
  const wordCounts = linesWords.map(words => words.length);
  const minWords = Math.min(...wordCounts);
  const maxWords = Math.max(...wordCounts);
  
  // If word counts vary too much, not a table
  if (maxWords - minWords > 2 || minWords < 2) {
    return { isTable: false, data: [], columnPositions: [] };
  }
  
  // Check column alignment: for each column position, the x-coordinates should be similar across rows
  const numCols = minWords;
  const columnXCenters: number[][] = Array(numCols).fill(null).map(() => []);
  
  for (const words of linesWords) {
    for (let col = 0; col < numCols && col < words.length; col++) {
      const word = words[col];
      const centerX = (word.bbox.x0 + word.bbox.x1) / 2;
      columnXCenters[col].push(centerX);
    }
  }
  
  // Check consistency: standard deviation of column positions should be low
  let isAligned = true;
  for (let col = 0; col < numCols; col++) {
    const centers = columnXCenters[col];
    if (centers.length < 2) continue;
    const mean = centers.reduce((a, b) => a + b, 0) / centers.length;
    const variance = centers.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / centers.length;
    const stdDev = Math.sqrt(variance);
    // If std dev is more than 30px, alignment is poor
    if (stdDev > 30) {
      isAligned = false;
      break;
    }
  }
  
  if (!isAligned && numCols <= 2) {
    // Try heuristic with multiple spaces in text
    let hasMultipleSpaces = false;
    for (const line of lines) {
      if (line.text.match(/\s{3,}/)) {
        hasMultipleSpaces = true;
        break;
      }
    }
    if (!hasMultipleSpaces) return { isTable: false, data: [], columnPositions: [] };
  }
  
  // Build table data
  const tableData: string[][] = [];
  for (const line of lines) {
    const row: string[] = [];
    if (line.words.length >= numCols) {
      for (let i = 0; i < numCols; i++) {
        row.push(line.words[i]?.text || "");
      }
    } else {
      // Fallback: split by multiple spaces
      const parts = line.text.split(/\s{2,}/);
      if (parts.length > 1) {
        tableData.push(parts);
        continue;
      }
      row.push(line.text);
    }
    tableData.push(row);
  }
  
  const columnPositions = columnXCenters.map(centers => 
    centers.reduce((a, b) => a + b, 0) / centers.length
  );
  
  return { isTable: true, data: tableData, columnPositions };
}

function generateHTML(blocks: Block[]): string {
  if (blocks.length === 0) return "<p>No text extracted</p>";
  
  // Find minimum left margin across all lines for pixel-based indentation
  let minLeft = Infinity;
  for (const block of blocks) {
    for (const line of block.lines) {
      if (line.bbox.x0 < minLeft) minLeft = line.bbox.x0;
    }
  }
  if (minLeft === Infinity) minLeft = 0;
  
  const htmlParts: string[] = [];
  htmlParts.push(`<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5;">`);
  
  for (const block of blocks) {
    if (block.type === "heading") {
      const text = block.lines[0].text.trim();
      const leftOffset = block.lines[0].bbox.x0 - minLeft;
      htmlParts.push(
        `<h2 style="margin: 16px 0 8px ${leftOffset}px; font-size: 16pt; font-weight: bold;">${escapeHtml(text)}</h2>`
      );
    } 
    else if (block.type === "table" && block.tableData && block.tableData.length > 0) {
      htmlParts.push(`<table style="border-collapse: collapse; margin: 12px 0; width: auto; min-width: 300px;">`);
      for (let i = 0; i < block.tableData.length; i++) {
        const row = block.tableData[i];
        const tag = i === 0 ? "th" : "td";
        htmlParts.push(`<tr>`);
        for (const cell of row) {
          htmlParts.push(
            `<${tag} style="border: 1px solid #ccc; padding: 6px 12px; text-align: left;">${escapeHtml(cell)}</${tag}>`
          );
        }
        htmlParts.push(`</tr>`);
      }
      htmlParts.push(`</table>`);
    }
    else {
      // Paragraph with pixel-based indentation
      htmlParts.push(`<p style="margin: 0 0 12px 0;">`);
      
      for (let i = 0; i < block.lines.length; i++) {
        const line = block.lines[i];
        const leftIndent = line.bbox.x0 - minLeft;
        // Preserve spacing by using white-space: pre-wrap
        htmlParts.push(
          `<span style="display: block; margin-left: ${leftIndent}px; white-space: pre-wrap;">${escapeHtml(line.text)}</span>`
        );
      }
      htmlParts.push(`</p>`);
    }
  }
  
  htmlParts.push(`</div>`);
  return htmlParts.join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}