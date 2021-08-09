<template>
  <div>{{ statusMessage }}</div>
</template>

<script>
import RuntimeMessage from  '../runtimeMessage';

export default {
  name: 'StatusBar',

  computed: {
    statusMessage: function() {
      return RuntimeMessage.status;
    }
  }
}
</script>
