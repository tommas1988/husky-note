import { readFileSync, writeFileSync } from 'fs';

declare global {
  interface Window {
      readFileSync: typeof readFileSync;
      writeFileSync: typeof writeFileSync;
  }
}
