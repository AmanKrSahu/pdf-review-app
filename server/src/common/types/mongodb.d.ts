import { GridFSBucketWriteStream, GridFSBucketReadStream } from 'mongodb';

declare module 'mongodb' {
  interface GridFSBucketWriteStream extends NodeJS.WritableStream {
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'finish', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  
  interface GridFSBucketReadStream extends NodeJS.ReadableStream {
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T;
  }
}
