<style lang="scss">
@import "./styles/app.scss";
</style>

<template>
    <div>
        <div class="header-wrapper">
            <Header />
        </div>
        <div class="main">
            <div class="editor-wrapper">
                <Editor />
            </div>
            <div class="reader-wrapper">
                <Reader />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Header from '@/components/header.vue';
import Editor from '@/components/editor.vue';
import Reader from '@/components/reader.vue';

export default {
    components: {
        Header, Editor, Reader
    }
};
</script>
