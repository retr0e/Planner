<template>
  <div id="app">
    <HeaderComponent />
    <router-view />
  </div>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue'

export default {
  // eslint-disable-next-line prettier/prettier
  name: 'App',
  components: {
    HeaderComponent
  }
};
</script>

<style>
</style>
