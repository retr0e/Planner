<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">Strona, której szukasz, nie istnieje.</p>
      <router-link to="/" class="back-home">Wróć do strony głównej</router-link>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff7675, #d63031);
  color: #fff;
  font-family: 'Arial', sans-serif;
  text-align: center;
}

.not-found-content {
  max-width: 400px;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.error-code {
  font-size: 5rem;
  margin: 0;
  font-weight: bold;
}

.error-message {
  font-size: 1.2rem;
  margin: 1rem 0;
}

.back-home {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #d63031;
  background: #fff;
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-home:hover {
  background: #ffeaa7;
  color: #2d3436;
}
</style>
