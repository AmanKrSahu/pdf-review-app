"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

// Configure pdf.js worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  src: string;
}

export default function PdfViewer({ src }: PdfViewerProps) {
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.25);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const documentOptions = useMemo(() => ({ withCredentials: true }), []);

  useEffect(() => {
    // reset on new src
    setPageNum(1);
    setNumPages(0);
    setError(null);
  }, [src]);

  const canPrev = pageNum > 1;
  const canNext = pageNum < numPages;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <Button
          variant="outline"
          size="icon"
          onClick={() => canPrev && setPageNum((n) => n - 1)}
          disabled={!canPrev}
          className="rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm tabular-nums">
          Page {pageNum} / {numPages || "-"}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => canNext && setPageNum((n) => n + 1)}
          disabled={!canNext}
          className="rounded-xl"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="mx-2 h-4 w-px bg-border" />
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)))
          }
          className="rounded-xl"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="text-sm w-14 text-center">
          {Math.round(scale * 100)}%
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))}
          className="rounded-xl"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="rounded-xl ml-2"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full h-[70vh] overflow-auto bg-background flex items-start justify-center">
        <Document
          file={src}
          options={documentOptions}
          loading={
            <div className="p-6 text-sm text-muted-foreground">
              Loading PDF…
            </div>
          }
          onLoadSuccess={(pdf) => {
            setNumPages(pdf.numPages);
          }}
          onLoadError={(e) => {
            const message =
              e instanceof Error ? e.message : "Failed to load PDF";
            setError(message);
          }}
          error={
            <div className="p-6 text-sm text-destructive">
              {error || "Failed to load PDF"}
            </div>
          }
          onSourceError={(e) => {
            const message =
              e instanceof Error ? e.message : "Invalid PDF source";
            setError(message);
          }}
        >
          {!error && (
            <Page
              pageNumber={pageNum}
              scale={scale}
              rotate={rotation as 0 | 90 | 180 | 270}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          )}
        </Document>
      </div>
    </div>
  );
}
