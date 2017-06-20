import { ModalView } from '../modal';
import ServiceLoactor from '../../service-locator';

export default function(el: JQuery, modalView: ModalView) {
    let config = ServiceLoactor.config.git.remoteAuth;

    function selectAuthType(type: 'ssh' | 'password') {
        el.find('.auth-body').hide();
        el.find(`.${type}`).show();
    }

    let $authType = el.find('.auth-type');
    $authType.css({
        "text-align": "center",
        "margin-bottom": "10px",
    });

    $authType.on('click', 'input', function() {
        selectAuthType($(this).val());
    });

    let authType = config ? config.type : 'ssh';
    el.find("input[name=auth-type]").val([authType]);
    selectAuthType(authType);
}