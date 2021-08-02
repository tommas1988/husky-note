<template>
<v-treeview
  v-bind:style="style"
  :open="initiallyOpen"
  :items="notes"
  activatable
  item-key="name"
  item-children="notes"
  open-on-click
  dense
  expand-icon=""
  transition
  >
  <template v-slot:prepend="{ item, open }">
    <v-icon v-if="!isNoteFile(item)">
      mdi-note-text
    </v-icon>
    <v-icon v-else>
      {{ open ? 'mdi-chevron-down' :  'mdi-chevron-right'}}
    </v-icon>
  </template>
</v-treeview>
</template>

<script>
import { instance as notebook, NoteType } from  '../notebook';

export default {
  name: 'Notebook',
  
  props: {
    height: {type: Number},
  },
  
  computed: {
    style: function() {
      return {
        height: `${this.height}px`,
        overflow: 'auto',
        "margin-left": '-24px',
      }
    },
  },
  
  data: () => ({
    notes: [],
    initiallyOpen: [],
  }),

  created: function() {
    if (notebook.load()) {
      this.notes = notebook.rootNote.notes;
    }
  },

  methods: {
    isNoteFile: function(item) {
      return item.notes != undefined;
    },
  },
};

// const sha1Hash = createHash('sha1');
// function buildTreeViewItems(note, parentName) {
//   let id = sha1Hash.update(`${parentName}#${note.name}`).digest('base64');
//   if (note.type == NoteType.File) {
//     return {
      
//     }
//   }
// }
</script>
