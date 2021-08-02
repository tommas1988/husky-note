<template>
  <div class="editor-container"></div>
</template>

<script>
import { instance as editor } from '../editor';

export default {
  name: 'Editor',
  props: {
    width: {type: Number},
    height: {type: Number},
    theme: {type: String, default: 'vs'}
  },

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
