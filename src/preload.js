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
      md5 (data) {
        const md5 = createHash('md5');
        md5.update(data);
        return md5.digest('hex');
      }
    },
  }
);
