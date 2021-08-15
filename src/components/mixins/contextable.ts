import { manager as ContextManager } from '../../context';
import Vue from 'vue';

export default {
    mounted: function(this: Vue) {
        let contextName: string;
        if (!this.$options || !(contextName = <string> (<any>this.$options).contextName)) {
            throw new Error('Contextable component must be privide contextName options');
        }

        this.$el.addEventListener('click', (e) => {
            ContextManager.setActiveContext(contextName);
            e.stopPropagation();
        });
    }
}
