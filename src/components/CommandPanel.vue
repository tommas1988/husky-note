<style lang="sass" scoped>
.command-container
    width: 100%

    .input-container
        display: flex
        flex-direction: row
        flex-wrap: nowrap

        width: 100%
        padding: 0

        .inputted-info
            max-width: 500px
            padding: 0 10px
        .input-area
            flex-grow: 1
</style>

<template>
  <div class="command-container">
    <div v-if="open">
      <div class="input-container">
        <div class="inputted-info">
          <v-card-text style="padding: 9px 4px" v-if="commandName.length > 0">
            {{ inputted }}
          </v-card-text>
        </div>
        <div class="input-area">
          <v-text-field
            placeholder="command to execute..."
            autofocus
            dense
            single-line
            full-width
            hide-details
            solo
            style="margin: 0"
          ></v-text-field>
        </div>
      </div>
      <div class="output-container"></div>
    </div>
  </div>
</template>

<script>
import { ContextManager } from "@/context";
import { CONTEXT_NAME as COMMAND_CONTEXT_NAME } from "@/command";
import ContextableMixin from "./mixins/contextable";

export default {
  name: "CommandPanel",

  contextName: COMMAND_CONTEXT_NAME,

  mixins: [ContextableMixin],

  data: () => {
    return {
      open: false,
      commandName: "",
      args: [],
    };
  },

  computed: {
    inputted: function () {
      if (this.commandName.length == 0) {
        return "";
      }

      let r = this.commandName;
      if (this.args.length > 0) {
        r += ": ";
        r + this.args.join(", ");
      }

      return r;
    },
  },

  mounted() {
    ContextManager.INSTANCE.onContextChange((context) => {
      if (context.name === COMMAND_CONTEXT_NAME) {
        this.open = true;
      } else {
        this.open = false;
      }
    });

    this.commandName = "test-command";
    //this.args = ['arg1', 'arg2'];
  },

  watch: {
    open: function (newVal, oldVal) {
      if (newVal != oldVal) {
        this.$nextTick(function () {
          this.$emit("update-footer-height");
        });
      }
    },
  },
};
</script>