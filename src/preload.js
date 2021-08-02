import { contextBridge } from 'electron';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';

contextBridge.exposeInMainWorld(
  'nodeApi',
  {
    fs: {
      readFileSync,
      writeFileSync,
    },

    crypto: {
      createHash,
    },
  }
);
