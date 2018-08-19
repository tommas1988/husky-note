<template>
    <div ref="editorContainer" :style="{ height: containerHeight, overflow: 'hidden' }"></div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Editor } from '@/editor';

@Component
export default class extends Vue {
    @Prop() height: number;
    @Prop() width: number;

    private editor: Editor;

    get containerHeight(): string {
        return this.height + 'px';
    }

    mounted() {
        this.editor = Editor.create(this.$refs.editorContainer);
    }

    @Watch('width', { immediate: true })
    @Watch('height', { immediate: true })
    onContainerSizeChanged() {
        if (this.editor) {
            this.editor.setSize(this.width, this.height);
        }
    }
}
</script>
