<template>
<!-- TODO: use a flex instead of table -->
<table style="height: 28px; width: 100%">
  <tr>
    <td style="width: 40%;">
      {{ statusMessage }}
    </td>
    <td style="text-align: center">
      {{ contextName }}
    </td>

    <td style="width: 40%"></td>
  </tr>
</table>
</template>

<script>
import RuntimeMessage from  '../runtimeMessage';
import { manager as ContextManager } from '../context';

export default {
  name: 'StatusBar',
  
  data: () => ({
    statusMessage: '',
    contextName: '',
  }),

  mounted: function() {
    RuntimeMessage.onStatus((msg) => {
        this.statusMessage = msg;
    });

    ContextManager.onContextChange((context) => {
      this.contextName = context.name;
    });

    this.contextName = ContextManager.getActiveContext().name;
  }
}
</script>
