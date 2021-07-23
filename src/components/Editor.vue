<template>
<div id="editor" style="height: 100%; width: 100%">
  <MonacoEditor
    v-model="getValue"
    theme="vs-dark"
    language="json"
    :options="options"
    @change="onChange"
    ></MonacoEditor>
</div>
</template>

<script>
import MonacoEditor from 'monaco-editor-vue'
export default {
  name: 'Editor',
  components: {
    MonacoEditor
  },
  data() {
    return {
      defaultValue: [
        '{',
        '\t"type": "form",',
        '\t"title": "表单",',
        '\t"controls": [',
        '\t\t{',
        '\t\t\t"label": "文本框",',
        '\t\t\t"type": "text",',
        '\t\t\t"name": "text"',
        '\t\t},',
        '\t\t{',
        '\t\t\t"type": "select",',
        '\t\t\t"label": "选项",',
        '\t\t\t"name": "select",',
        '\t\t\t"options": [',
        '\t\t\t\t{',
        '\t\t\t\t\t"label": "选项A",',
        '\t\t\t\t\t"value": "A"',
        '\t\t\t\t},',
        '\t\t\t\t{',
        '\t\t\t\t\t"label": "选项B",',
        '\t\t\t\t\t"value": "B"',
        '\t\t\t\t}',
        '\t\t\t]',
        '\t\t}',
        '\t]',
        '}'
      ],
      options: {
        //Monaco Editor Options
        minimap: {
          enabled: false
        }
      }
    }
  },
  computed: {
    getValue() {
      return this.defaultValue.join('\n')
    }
  },
  methods: {
    onChange(value) {
      console.log(value);
    }
  }
}
</script>
