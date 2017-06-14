import Setting from './setting';
import ServiceLocator from '../../service-locator';
import { remote } from 'electron';
import { dirname } from 'path';

export class GitPrivateKeySetting extends Setting {
    init() {
        this._name = 'git.sshPrivKey';
        this.el.find('input').val(ServiceLocator.config.git.sshPrivKey);
    }

    registerHandler() {
        let el = this.el;
        let config = ServiceLocator.config.git;

        el.on('click', 'button', (event) => {
            let files = remote.dialog.showOpenDialog({
                title: 'Select private key file',
                defaultPath: config.sshPrivKey ? dirname(config.sshPrivKey) : remote.app.getPath('home'),
                properties: ['openFile']
            });

            let filename: string = (files && files.length) ? files[0] : '';
            this.el.find('input').val(filename);
            config.sshPrivKey = filename;
        });
    }
}