<template>
  <div ref="editor" style="height: 100%; width: 100%"></div>
</template>

<script>
import editor from '../editor';

function noop() {}

export default {
  name: 'Editor',
  props: {
    width: {type: [String, Number], default: '100%'},
    height: {type: [String, Number], default: '100%'},
    theme: {type: String, default: 'vs'},
    options: {type: Object, default() {return {};}},
    editorMounted: {type: Function, default: noop},
    editorBeforeMount: {type: Function, default: noop}
  },

  watch: {
    options: {
      deep: true,
      handler(options) {
        this.editor && this.editor.updateOptions(options);
      }
    },

    value() {
      this.editor && this.value !== this._getValue() && this._setValue(this.value);
    },

    style() {
      this.editor && this.$nextTick(() => {
        this.editor.layout();
      });
    }
  },

  computed: {
    style() {
      return {
        width: !/^\d+$/.test(this.width) ? this.width : `${this.width}px`,
        height: !/^\d+$/.test(this.height) ? this.height : `${this.height}px`
      }
    }
  },

  mounted () {
    this.initEditor();
  },

  beforeDestroy() {
    this.editor && this.editor.dispose();
  },

  methods: {
    initEditor() {
      const { theme, options } = this;
      Object.assign(options, this._editorBeforeMount());
      editor.attatchOnDom(this.$el, {
        theme: theme,
        ...options
      });
      this.editor = editor.getEngine();
      this._editorMounted(this.editor);

      let self = this;
      window.onresize = function() {
        console.log(window.getComputedStyle(self.$refs.editor).height);
        //console.log(self.$refs.editor.offsetHeight);
        //self.editor.layout();
      };
    },

    _getEditor() {
      if(!this.editor) return null;
      return this.editor;
    },

    _editorBeforeMount() {
      const options = this.editorBeforeMount();
      return options || {};
    },

    _editorMounted(editor) {
      this.editorMounted(editor);
      editor.onDidChangeModelContent(event => {
          const value = this._getValue();
          this._emitChange(value, event);
        });
    },

    _emitChange(value, event) {
      this.$emit('change', value, event);
      this.$emit('input', value);
    }
  }
}
</script>
