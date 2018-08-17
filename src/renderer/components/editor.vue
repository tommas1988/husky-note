<template>
    <div ref="editorContainer" :style="{ height, width }"></div>
</template>

<script lang="ts">
import * as monaco from 'monaco-editor';

export default {
    mounted() {
        monaco.editor.create(<HTMLElement> this.$refs.editorContainer, {
            theme: 'vs',
            renderLineHighlight: 'none',
            wordWrap: 'on',
            quickSuggestions: false,
            selectionHighlight: false,
            minimap: {
                enabled: false
            },
            scrollbar: {
                horizontalScrollbarSize: 0,
                verticalScrollbarSize: 0
            }
        });
    },

    data() {
        return {
            width: "100%",
            height: "300px",
        }
    }
};

</script>
