<script setup lang="ts">
import { ref } from 'vue';

  function getDirections() {

    fetch("http://localhost:8080/select", {
      method: "post",
      headers: {
            "Content-Type": "application/json"
        },
      body: JSON.stringify({
        "key": "asdfghjkl",
        "table": "Direction"
      })
    })
    .then(
       res => {
         return res.json();
       })
    .then(
      data => {
        response.value = data;
      })
    .catch(
      err => {
       console.error(err);
      });
  }

  const response = ref();
</script>

<template>
  <main>
    <input type="button" v-on:click="getDirections()" value="Get Directions" /></br>
    <div v-for="dir in response" >
      {{ dir.direction_name }}
    </div>
  </main>
</template>
