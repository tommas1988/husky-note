import { type as processType } from 'process';

export const isRendererProcess: boolean = processType === 'renderer';
export const isMainProcess: boolean = processType === 'browser';

export function noop(...args): any {}