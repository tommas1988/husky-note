<template>
    <v-toolbar bottom dense floating style="z-index: 1000">
        <v-container fluid>
            <v-textarea
            placeholder="command to execute..."
            rows="1"
            no-resize
            dense
            ></v-textarea>
        </v-container>
    </v-toolbar>
</template>

<script>
export default {
    name: 'CommandBar'
}
</script>