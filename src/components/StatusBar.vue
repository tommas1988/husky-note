<style lang="sass" scoped>
@import '~vuetify/src/styles/main.sass'

.status-container
  display: flex
  flex-direction: row
  flex-wrap: nowrap
  justify-content: space-between

  width: 100%
  padding: 0 4px
  margin: 0

  .card
    padding: 4px 8px
    color: map-get($blue, lighten-5)
</style>

<template>
  <div class="status-container blue darken-3 elevation-20">
    <div class="status">
      <v-card-text class="card" v-if="statusMessage.length > 0"> {{ statusMessage }} </v-card-text>
    </div>
    <div class="system-info">
      <v-card-text class="card" >context: [{{ contextName }}]</v-card-text>
    </div>
  </div>
</template>

<script>
import RuntimeMessage from "../runtimeMessage";
import { manager as ContextManager } from "../context";

export default {
  name: "StatusBar",

  data: () => ({
    statusMessage: "",
    contextName: "",
  }),

  mounted: function () {
    RuntimeMessage.onStatus((msg) => {
      this.statusMessage = msg;
    });

    ContextManager.onContextChange((context) => {
      this.contextName = context.name;
    });

    this.contextName = ContextManager.getActiveContext().name;
  },
};
</script>
