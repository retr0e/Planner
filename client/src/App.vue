<script setup lang="ts"></script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>Plan zajęć</h1>
    </header>
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  font-family: 'Arial', sans-serif;
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
  max-width: 800px;
}

.app-header {
  background-color: #27ae60;
  color: white;
  padding: 16px;
  border-radius: 8px;
}

.app-content {
  margin: 16px 0;
}
</style>
