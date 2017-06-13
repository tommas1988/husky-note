import { type as processType } from 'process';

export const isRendererProcess: boolean = processType === 'renderer';
export const isMainProcess: boolean = processType === 'browser';

export function noop(...args): any {}

export function checkRendererProcess() {
    if (!isRendererProcess) {
        throw new Error('Run in main process');
    }
}

export function checkMainProcess() {
    if (!isMainProcess) {
        throw new Error('Run in renderer process');
    }
}