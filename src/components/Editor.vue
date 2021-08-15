<template>
  <div class="editor-container"></div>
</template>

<script>
import { EDITOR_CONTEXT_NAME, instance as editor } from '../editor';
import ContextableMixin from './mixins/contextable';

export default {
  contextName: EDITOR_CONTEXT_NAME,

  name: 'Editor',
  props: {
    width: {type: Number},
    height: {type: Number},
    theme: {type: String, default: 'vs'}
  },

  mixins: [
    ContextableMixin,
  ],

  watch: {
    size: function() {
      editor.resize(this.size);
    }
  },

  computed: {
    size: function() {
      return {
        width: this.width,
        height: this.height
      }
    }
  },

  mounted () {
    this.initEditor();
  },

  beforeDestroy() {

  },

  methods: {
    initEditor() {
      editor.attatchOnDom(this.$el, {
        theme: this.theme,
      });
      editor.resize(this.size);
    }
  }
}
</script>
