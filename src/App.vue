<template>
  <div>
    <router-view />
    <push-notifications v-once namespace="browser" />
  </div>
</template>

<script>
  import PushNotifications from './components/PushNotifications';

  export default {
    name: 'application',
    components: {PushNotifications},
  };
</script>
