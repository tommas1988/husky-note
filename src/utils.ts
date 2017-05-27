import { type as processType } from 'process';

const utils = {
    isRendererProcess: processType === 'renderer',
    isMainProcess: processType === 'browser',
};

export default utils;