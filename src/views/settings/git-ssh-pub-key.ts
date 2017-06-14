import Setting from './setting';
import ServiceLocator from '../../service-locator';
import { remote } from 'electron';
import { dirname } from 'path';

export class GitPublicKeySetting extends Setting {
    init() {
        this._name = 'git.userEmail';
        this.el.find('input').val(ServiceLocator.config.git.sshPubKey);
    }

    registerHandler() {
        let el = this.el;
        let config = ServiceLocator.config.git;

        el.on('click', 'button', (event) => {
            let files = remote.dialog.showOpenDialog({
                title: 'Select public key file',
                defaultPath: config.sshPubKey ? dirname(config.sshPubKey) : remote.app.getPath('home'),
                properties: ['openFile']
            });

            let filename: string = (files && files.length) ? files[0] : '';
            this.el.find('input').val(filename);
            config.sshPubKey = filename;
        });
    }
}