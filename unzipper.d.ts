declare module 'unzipper' {
    import { Writable } from 'stream';
  
    // Definición del método Extract (descompresión)
    export function Extract(options: { path: string }): Writable;
  
    // Definición de otros métodos y clases si es necesario...
  }
  