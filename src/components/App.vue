<style>
html {
    overflow: hidden;
}

body {
    overflow: hidden
}
</style>

<template>
<v-app>
  <v-app-bar
    app
    color="primary"
    dark
    v-bind:height="headerHeight"
    >
    <div class="d-flex align-center">
      <v-img
        alt="Vuetify Logo"
        class="shrink mr-2"
        contain
        src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
        transition="scale-transition"
        width="40"
        />

      <v-img
        alt="Vuetify Name"
        class="shrink mt-1 hidden-sm-and-down"
        contain
        min-width="100"
        src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
        width="100"
        />
    </div>

    <v-spacer></v-spacer>

    <v-btn
      href="https://github.com/vuetifyjs/vuetify/releases/latest"
      target="_blank"
      text
      >
      <span class="mr-2">Latest Release</span>
      <v-icon>mdi-open-in-new</v-icon>
    </v-btn>
  </v-app-bar>

  <v-main>
    <Editor
      theme="vs-dark"
      v-bind:width="editorWidth"
      v-bind:height="editorHeight"
      ></Editor>
  </v-main>
</v-app>
</template>

<script>
import editorService from '../editor';
import EditorCom from './Editor';
import { throttle } from '../utils.ts';

const headerHeight = 40;

export default {
  name: 'husky-note',

  components: {
    Editor: EditorCom,
  },

  computed: {
    editorWidth: function() {
      return this.width;
    },

    editorHeight: function() {
      return this.height - headerHeight;
    },
  },

  data: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    headerHeight: headerHeight
  }),

  mounted: function() {
    window.onresize = throttle(function() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }, 100, this);
  }
};
</script>
