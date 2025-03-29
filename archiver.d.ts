declare module "archiver" {
    import { Stream, Writable } from "stream";
    import { ZlibOptions } from "zlib";
    import { Stats } from "fs";
  
    type Format = "zip" | "tar";
    
    export interface ArchiverOptions {
      zlib?: ZlibOptions;
      gzip?: boolean;
      gzipOptions?: ZlibOptions;
      store?: boolean;
    }
  
    export interface FileData {
      name: string;
      date?: Date;
      mode?: number;
      prefix?: string;
      stats?: Stats;
    }
  
    export interface EntryData {
      name: string;
      type: "file" | "directory";
      date?: Date;
      mode?: number;
      stats?: Stats;
    }
  
    export interface Archiver extends Stream {
      append(source: string | Buffer | Stream, name?: FileData): this;
      file(filename: string, data?: FileData): this;
      directory(dirpath: string, destpath?: string): this;
      finalize(): Promise<void>;
      on(event: "error", listener: (err: Error) => void): this;
      on(event: "finish" | "close", listener: () => void): this;
    }
  
    export default function archiver(format: Format, options?: ArchiverOptions): Archiver;
  }
  