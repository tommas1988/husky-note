<template>
  <v-toolbar tag="div" bottom dense width="100%" style="">
    <template v-slot:extension>
      <v-container fluid>
        <v-textarea
          placeholder="command to execute..."
          rows="1"
          no-resize
          dense
        ></v-textarea>
      </v-container>
    </template>
  </v-toolbar>
</template>

<script>
export default {
  name: "CommandBar",
};
</script>