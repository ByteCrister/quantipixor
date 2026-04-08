// utils/image/ocr/docx-generator.ts
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";

export async function generateDocx(htmlContent: string, rawText: string): Promise<Blob> {
  // Parse HTML and convert to DOCX elements
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const container = doc.body.firstChild as HTMLElement;
  
  const children: Array<Paragraph | Table> = [];
  
  if (container) {
    for (const node of container.children) {
      const element = node as HTMLElement;
      if (element.tagName === "H2") {
        children.push(
          new Paragraph({
            text: element.textContent || "",
            heading: "Heading1",
            spacing: { before: 240, after: 120 },
          })
        );
      } 
      else if (element.tagName === "TABLE") {
        const rows = element.querySelectorAll("tr");
        const tableRows: TableRow[] = [];
        
        for (const row of rows) {
          const cells = row.querySelectorAll("th, td");
          const tableCells: TableCell[] = [];
          
          for (const cell of cells) {
            tableCells.push(
              new TableCell({
                children: [new Paragraph({ text: cell.textContent || "" })],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                },
              })
            );
          }
          tableRows.push(new TableRow({ children: tableCells }));
        }
        
        children.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
      }
      else if (element.tagName === "P") {
        const lines = element.querySelectorAll("span");
        if (lines.length > 0) {
          for (const lineSpan of lines) {
            const text = lineSpan.textContent || "";
            const marginLeft = parseInt(lineSpan.style.marginLeft) || 0;
            children.push(
              new Paragraph({
                children: [new TextRun({ text, size: 22 })],
                indent: { left: marginLeft * 20 }, // Convert px to twips approx
                spacing: { after: 120 },
              })
            );
          }
        } else {
          children.push(
            new Paragraph({
              text: element.textContent || "",
              spacing: { after: 120 },
            })
          );
        }
      }
    }
  }
  
  if (children.length === 0) {
    // Fallback to raw text
    children.push(
      new Paragraph({
        text: rawText,
        spacing: { after: 120 },
      })
    );
  }
  
  const docxDocument = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
  
  const blob = await Packer.toBlob(docxDocument);
  return blob;
}