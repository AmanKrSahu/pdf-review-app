import pdf from "pdf-parse";
import { Readable } from "stream";

import { getGridFSBucket } from "../common/config/database";

export class PDFService {
  async extractTextFromPDF(fileId: string): Promise<string> {
    try {
      const bucket = getGridFSBucket();

      // Create a readable stream from GridFS
      const downloadStream = bucket.openDownloadStreamByName(fileId);

      // Convert stream to buffer
      const buffer = await this.streamToBuffer(downloadStream);

      // Extract text using pdf-parse
      const data = await pdf(buffer);

      if (!data.text || data.text.trim().length === 0) {
        throw new Error("No text could be extracted from PDF");
      }

      return data.text;
    } catch (error) {
      console.error("PDF text extraction error:", error);
      throw new Error(
        `Failed to extract text from PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }

  async checkFileExists(fileId: string): Promise<boolean> {
    try {
      const bucket = getGridFSBucket();
      const files = await bucket.find({ filename: fileId }).toArray();
      return files.length > 0;
    } catch (error) {
      console.error("File existence check error:", error);
      return false;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const bucket = getGridFSBucket();
      const files = await bucket.find({ filename: fileId }).toArray();

      if (files.length > 0) {
        await bucket.delete(files[0]._id);
      }
    } catch (error) {
      console.error("File deletion error:", error);
      throw new Error(
        `Failed to delete file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
