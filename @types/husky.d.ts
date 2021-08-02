import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';

declare global {
    interface Window {
        nodeApi: {
            fs: {
                readFileSync: typeof readFileSync;
                writeFileSync: typeof writeFileSync;
            };

            crypto: {
                createHash: typeof createHash;
            }
        }
    }
}
