<style lang="scss" scoped>
@import "./styles/variables";

.header {
    width: 100%;
    background-color: $color-header;
}
</style>

<template>
    <div class="header" :style="{ height: headerHeight }">
        This is Header
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class extends Vue {
    @Prop() height: number;

    get headerHeight(): string {
        return this.height + 'px';
    }
}
</script>