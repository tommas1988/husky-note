<template>
  <div>{{ statusMessage }}</div>
</template>

<script>
import RuntimeMessage from  '../runtimeMessage';

export default {
  name: 'StatusBar',

  data: () => ({
    statusMessage: '',
  }),

  mounted: function() {
    RuntimeMessage.onStatus((msg) => {
        this.statusMessage = msg;
    });
  }
}
</script>
