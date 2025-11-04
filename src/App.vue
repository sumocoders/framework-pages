<template>
  <pages-app />
</template>

<script>
import PagesApp from '@/components/PagesApp.vue'

export default {
  name: 'App',
  components: {
    PagesApp
  }
}
</script>

<style lang="scss">
@import "bootstrap/scss/bootstrap";
@import "bootstrap-icons/font/bootstrap-icons.css";

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
