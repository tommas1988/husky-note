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
      let notes = [];
      for (let i = 0; i < notebook.rootNote.notes.length; i++) {
        notes.push(buildTreeViewNotes(notebook.rootNote.notes[i], '_ROOT_'));
      }
      this.notes = notes;
    }
  },

  methods: {
    isNoteFile: function(item) {
      return item.notes != undefined;
    },
  },
};

const md5 = window.nodeApi.crypto.md5;
function buildTreeViewNotes(note, parentName) {
  let noteName = `${parentName}#${note.name}`;
  let id = md5(noteName);
  let result = {
    id: id,
    name: note.name,
  };
  if (note.type == NoteType.Group) {
    let notes = [];
    for (let i = 0; i < note.notes.length; i++) {
      notes.push(buildTreeViewNotes(note.notes[i], noteName));
    }

    result.notes = notes;

  }

  return result;
}
</script>
