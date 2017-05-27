import { dialog, remote, BrowserWindow } from 'electron';
import { APP_NAME } from './app';
import utils from './utils';

export class Dialog {
    private _dialog: Electron.Dialog;

    constructor() {
        if (utils.isMainProcess) {
            this._dialog = dialog;
        } else {
            this._dialog = remote.dialog;
        }
    }

    messsageBox(options: Electron.ShowMessageBoxOptions, callback?: (response: number) => void): number | void
    messsageBox(browserWindow: Electron.BrowserWindow, options: Electron.ShowMessageBoxOptions, callback?: (response: number) => void): number | void
    messsageBox(browserWindow, options, callback?): any {
        let BrowserWindowClass = utils.isMainProcess ? BrowserWindow : remote.BrowserWindow;
        if (!(browserWindow instanceof BrowserWindowClass)) {
            if (utils.isMainProcess) {
                throw new Error('Main process must pass a brower window argument!');
            }

            callback = options;
            options = browserWindow;
            browserWindow = remote.getCurrentWindow();
        }

        if (!options.title) {
            options.title = APP_NAME;
        }
        if (typeof options.noLink === 'undefined') {
            options.noLink = true;
        }

        return this._dialog.showMessageBox(browserWindow, options, callback);
    }
}