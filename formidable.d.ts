declare module 'formidable' {
    export interface File {
      filepath: string
      originalFilename: string
      mimetype: string
      size: number
    }
  
    export class Formidable {
      constructor(options?: any)
      parse(req: any, callback: (err: any, fields: any, files: { [key: string]: File }) => void): void
      uploadDir: string
      keepExtensions: boolean
    }
  
    export const DEFAULT_OPTIONS: any
  
    export const enabledPlugins: any
  
    export default Formidable
    export { Formidable as IncomingForm }
    export { DEFAULT_OPTIONS as defaultOptions, enabledPlugins }
  }
  