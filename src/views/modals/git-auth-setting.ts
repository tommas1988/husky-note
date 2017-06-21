import { ModalView } from '../modal';
import ServiceLoactor from '../../service-locator';
import { remote } from 'electron';
import { dirname } from 'path';

export default function (el: JQuery, modalView: ModalView) {
    let config = ServiceLoactor.config.git.remoteAuth || {
        type: 'ssh',
        publicKey: '',
        privateKey: '',
        username: '',
        password: '',
    };

    let authType = config ? config.type : 'ssh';
    let $publicKey = el.find('input.public-key');
    let $privateKey = el.find('input.private-key');
    let $username = el.find('input.username');
    let $password = el.find('input.password');

    function selectAuthType(type: 'ssh' | 'password') {
        el.find('.auth-body').hide();
        el.find(`.${type}`).show();
    }

    function saveConfig(): boolean {
        let type = el.find("input[name=auth-type]:checked").val();
        let publicKey = $publicKey.val();
        let privateKey = $privateKey.val();
        let username = $username.val();
        let password = $password.val();

        if (type === 'ssh' && (!publicKey || !privateKey) ||
            type === 'password' && (!username || !password)
        ) {
            ServiceLoactor.alerter.warn('Missing required information!');
            return false;
        }

        ServiceLoactor.config.git.remoteAuth = {
            type,
            publicKey,
            privateKey,
            username,
            password
        };
        return true;
    }

    function selectKeyFile(type: 'public' | 'private') {
        let title;
        let oldVal;
        let el;

        if (type === 'public') {
            title = 'Select Public Key File';
            oldVal = config.publicKey;
            el = $publicKey;
        } else {
            title = 'Select Private Key File';
            oldVal = config.privateKey;
            el = $privateKey;
        }

        let files = remote.dialog.showOpenDialog({
            title: title,
            defaultPath: oldVal ? dirname(oldVal) : remote.app.getPath('home'),
            properties: ['openFile']
        });

        let keyFile = (files && files.length) ? files[0] : '';
        if (keyFile) {
            el.val(keyFile);
        }
    }

    el.find('.auth-type').css({
        "text-align": "center",
        "margin-bottom": "10px",
    }).on('click', 'input', function () {
        selectAuthType($(this).val());
    });

    el.on('click', 'button.public-key', () => {
        selectKeyFile('public');
    });
    el.on('click', 'button.private-key', () => {
        selectKeyFile('private');
    });

    el.on('click', 'button.save', () => {
        if (saveConfig()) {
            modalView.close();
        }
    });

    $publicKey.val(config.publicKey);
    $privateKey.val(config.privateKey);
    $username.val(config.username);
    $password.val(config.password);

    el.find("input[name=auth-type]").val([authType]);
    selectAuthType(authType);
}