"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Upload, CloudUpload, CircleFadingPlus, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadDialogProps {
  onUpload: (file: File) => Promise<void> | void;
  buttonStyle?: "default" | "icon-only" | "text-only";
  disabled?: boolean;
}

export function UploadDialog({
  onUpload,
  buttonStyle = "default",
  disabled = false,
}: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (uploading) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0 || uploading) return;

    const file = files[0];

    // Validation
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25 MB.");
      return;
    }

    try {
      setUploading(true);
      await onUpload(file);
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
      // Error toast is handled by the upload hook
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  // Render different button styles
  const renderButton = () => {
    const isButtonDisabled = disabled || uploading;

    switch (buttonStyle) {
      case "icon-only":
        return (
          <Button
            variant="ghost"
            className="font-medium rounded-xl cursor-pointer h-8 w-8 !p-0 border-2"
            disabled={isButtonDisabled}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CircleFadingPlus className="h-8 w-8" />
            )}
          </Button>
        );
      case "text-only":
        return (
          <Button
            className="font-medium rounded-xl cursor-pointer"
            disabled={isButtonDisabled}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "New Invoice"
            )}
          </Button>
        );
      case "default":
      default:
        return (
          <Button
            className="font-medium rounded-xl cursor-pointer"
            disabled={isButtonDisabled}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                New Invoice
              </>
            )}
          </Button>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{renderButton()}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold">Upload Invoice</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Upload a PDF file to extract and review invoice data
          </DialogDescription>
        </DialogHeader>

        {uploading ? (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
              <p className="font-medium">Processing your PDF...</p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments
              </p>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-accent"
                : "border-border hover:border-primary hover:bg-accent/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudUpload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="font-medium">Drag and drop your PDF here</p>
              <p className="text-sm text-muted-foreground">or</p>
              <label htmlFor="file-upload">
                <Button className="cursor-pointer rounded-xl" asChild>
                  <span>Select File</span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Max 25 MB, PDF only
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
