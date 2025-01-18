<template>
  <div class="login">
    <div class="login-card">
      <h1>Logowanie</h1>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <input
            v-model="loginData.login"
            placeholder="Login"
            type="text"
            required
            class="form-input"
          />
        </div>
        <div class="form-group">
          <input
            v-model="loginData.password"
            placeholder="Hasło"
            type="password"
            required
            class="form-input"
          />
        </div>
        <button type="submit" class="btn btn-primary">Zaloguj</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loginData: { login: '', password: '' },
      error: null,
    };
  },
  methods: {
    async login() {
      try {
        const res = await axios.post(
          'https://localhost/login',
          this.loginData,
          {
            withCredentials: true,
          }
        );
        console.log(res.data);
        localStorage.setItem('authToken', JSON.stringify(res.data.token));
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('userRole', JSON.stringify(res.data.userRole));
        localStorage.setItem('userId', JSON.stringify(res.data.id));
        
        open("/", '_self').close();
        this.$router.push('/');
      } catch (err) {
        //this.error = 'Błędny login lub hasło';
        this.error = err.response.data.reason;
      }
    },
  },
};
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
}

.login-card {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

h1 {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #2d3436;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 0.8rem;
  border: 1px solid #dfe6e9;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #0984e3;
}

.btn {
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #0984e3;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #74b9ff;
}

.error {
  margin-top: 1rem;
  color: #d63031;
  font-size: 0.9rem;
}
</style>
