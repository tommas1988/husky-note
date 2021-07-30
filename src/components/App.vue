<style>
html {
    overflow: hidden;
}

body {
    overflow: hidden;
}

.nav-bar-list {
    padding: 0!important
}

.nav-bar-list-item {
    padding: 0 4px!important
}

.nav-bar-list-item-icon {
    margin-right: 4px!important;
    margin-left: 4px!important;
    min-width: 32px!important;
}
</style>

<template>
<v-app>
  <v-navigation-drawer
    app
    :mini-variant="miniNavBar"
    permanent
    mini-variant-width="48"
    >
    <v-list
      class="nav-bar-list"
      v-bind:height="headerHeight"
      >
      <v-list-item
        class="nav-bar-list-item"
        style="height: 100%"
        >
        <v-list-item-icon
          class="nav-bar-list-item-icon"
          v-bind:style="notebookIconStyle"
          >
          <v-icon
            color="indigo darken-4"
            v-bind:size="notebookIconSize"
            @click.stop="miniNavBar = !miniNavBar"
            >
            mdi-book
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title
          style="font-size: 22px; font-weight: 300; padding-left: 20px"
          >
          Notebook
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list
      v-bind:height="navBarContentHeight"
      class="nav-bar-list"
      >

      <v-list-item
        class="nav-bar-list-item"
        >
        <v-list-item-icon class="nav-bar-list-item-icon"></v-list-item-icon>
        <v-divider vertical></v-divider>

        <v-list-item-content
          style="padding: 0"
          >
          <v-treeview
            v-bind:style="noteTreeViewStyle"
            v-model="tree"
            :open="initiallyOpen"
            :items="items"
            activatable
            item-key="name"
            open-on-click
            dense
            >
            <template v-slot:prepend="{ item, open }">
              <v-icon v-if="!item.file">
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
              <v-icon v-else>
                {{ files[item.file] }}
              </v-icon>
            </template>
          </v-treeview>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-app-bar
    app
    color="primary"
    dark
    dense
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

  <v-main v-bind:style="mainStyle">
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

const NOTEBOOK_ICON_SIZE = 32;

export default {
  name: 'husky-note',

  components: {
    Editor: EditorCom,
  },

  computed: {
    editorWidth: function() {
      return this.width - this.navBarWidth;
    },

    editorHeight: function() {
      return this.height - this.headerHeight;
    },
    navBarContentHeight: function() {
      return this.height - this.headerHeight - 1;
    },
    notebookIconStyle: function() {
      let margin = `${(this.headerHeight - NOTEBOOK_ICON_SIZE)/2}px`;
      return {
        "margin-top": margin,
        "margin-bottom": margin
      }
    },
    noteTreeViewStyle: function() {
      return {
        height: `${this.navBarContentHeight}px`,
        overflow: 'auto',
      }
    },
    mainStyle: function() {
      return {
        "background-color": '#1e1e1e',
      };
    },
  },

  watch: {
    '$vuetify.application.top': function(newVal, oldVal) {
      this.headerHeight = newVal;
    },
    '$vuetify.application.left': function(newVal, oldVal) {
      this.navBarWidth = newVal;
    }
  },

  data: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    headerHeight: 0,
    navBarWidth: 0,
    miniNavBar: true,
    notebookIconSize: NOTEBOOK_ICON_SIZE,

    initiallyOpen: ['public'],
    files: {
      html: 'mdi-language-html5',
      js: 'mdi-nodejs',
      json: 'mdi-code-json',
      md: 'mdi-language-markdown',
      pdf: 'mdi-file-pdf',
      png: 'mdi-file-image',
      txt: 'mdi-file-document-outline',
      xls: 'mdi-file-excel',
    },
    tree: [],
    items: [
      {
        name: '.git',
      },
      {
        name: 'node_modules',
      },
      {
        name: 'public',
        children: [
          {
            name: 'static',
            children: [{
              name: 'logo.png',
              file: 'png',
            }],
          },
          {
            name: 'favicon.ico',
            file: 'png',
          },
          {
            name: 'index.html',
            file: 'html',
          },
        ],
      },
      {
        name: '.gitignore',
        file: 'txt',
      },
      {
        name: 'babel.config.js',
        file: 'js',
      },
        {
          name: 'package.json',
          file: 'json',
        },
        {
          name: 'README.md',
          file: 'md',
        },
        {
          name: 'vue.config.js',
          file: 'js',
        },
        {
          name: 'yarn.lock',
          file: 'txt',
        },
      ],
  }),

  mounted: function() {
    window.onresize = throttle(function() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }, 100, this);
  },

  methods: {
  },
};
</script>
