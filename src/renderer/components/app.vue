<style lang="scss">
@import "./styles/app.scss";
</style>

<template>
    <div>
        <div class="header-wrapper">
            <Header :height="headerHeight" />
        </div>
        <div class="main">
            <div class="notebook-list-wrapper" :style="{ width: notebookListWidthPx }">
                <NotebookList :width="notebookListWidthPx" />
            </div>
            <div class="editor-wrapper">
                <Editor :height="editorHeight" :width="editorWidth" />
            </div>
            <div class="reader-wrapper">
                <Reader />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Header from '@/components/header.vue';
import Editor from '@/components/editor.vue';
import Reader from '@/components/reader.vue';
import NotebookList from '@/components/notebook-list.vue';

@Component({
    components: {
        Header, Editor, Reader, NotebookList
    }
})
export default class extends Vue {
    headerHeight: number = 40;
    notebookListWidth: number = 200;
    windowHeight: number = window.innerHeight;
    windowWidth: number = window.innerWidth;

    get editorHeight(): number {
        return this.windowHeight - this.headerHeight;
    }

    get editorWidth(): number {
        return (this.windowWidth - this.notebookListWidth) / 2;
    }

    get notebookListWidthPx() {
        return `${this.notebookListWidth}px`;
    }

    created() {
        window.onresize = () => {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
        }
    }
}
</script>
