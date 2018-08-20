<template>
    <div>
        <Menu v-for="(notes, notebook) in noteIndex" :key="notebook">
            <Submenu :name="notebook">
                <template slot="title">
                    <Icon type="md-bookmarks" />
                    {{ notebook }}
                </template>
                <MenuItem v-for="note in notes" :name="note" :key="`${notebook}-${note}`">
                    <Icon type="ios-paper" />
                    {{ note }}
                </MenuItem>
            </Submenu>
        </Menu>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

const noteIndex = {
  "C/C++": [
    "GDB",
    "Makefile",
    "Standard Library",
    "algorithms",
    "codes",
    "gcc",
    "语法",
    "预编译指令"
  ],
  "Emacs": [
    "misc.",
    "modes"
  ],
  "Linux": [
    "Shell",
    "使用技巧",
    "常用命令",
    "环境设置"
  ],
  "PHP": [
    "Install&Config",
    "源码研究"
  ],
  "Tools": [
    "git"
  ]
}

@Component
export default class extends Vue {
    noteIndex = noteIndex;
}
</script>
