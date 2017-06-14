import Setting from './setting';
import ServiceLocator from '../../service-locator';
import { remote } from 'electron';
import { dirname } from 'path';

export class NoteDirSetting extends Setting {
    init() {
        this._name = 'noteDir';
        this.el.find('input').val(ServiceLocator.config.noteDir);
    }

    registerHandler() {
        let el = this.el;
        let config = ServiceLocator.config;

        el.on('click', 'button', (event) => {
            let dirs = remote.dialog.showOpenDialog({
                title: 'Select note directory',
                defaultPath: config.noteDir ? dirname(config.noteDir) : remote.app.getPath('home'),
                properties: ['openDirectory']
            });

            let newDir: string = (dirs && dirs.length) ? dirs[0] : '';
            if (!newDir) {
                return;
            }

            this.el.find('input').val(newDir);
            config.noteDir = newDir;
        });
    }
}