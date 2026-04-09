"use client";

interface OutputPanelProps {
  html: string;
  rawText: string;
  activeTab: "formatted" | "raw";
}

export function OutputPanel({ html, rawText, activeTab }: OutputPanelProps) {
  if (!html && !rawText) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 border rounded-lg bg-slate-50">
        <div className="text-center">
          <p className="text-lg">No document yet</p>
          <p className="text-sm">Upload images and run OCR to extract text</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {activeTab === "formatted" ? (
        <div
          className="h-96 overflow-y-auto p-4 prose prose-sm max-w-none"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "1rem",
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <textarea
          value={rawText}
          readOnly
          className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none bg-slate-50"
        />
      )}
    </div>
  );
}