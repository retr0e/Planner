<template>
  <header class="header">
    <!-- Logo -->
    <div class="logo">
      <router-link to="/">Plan<span class="highlight">Lekcji</span></router-link>
    </div>

    <nav class="nav">
      <div class="burger-menu" @click="toggleMenu">
        <span :class="{ active: isMenuOpen }"></span>
        <span :class="{ active: isMenuOpen }"></span>
        <span :class="{ active: isMenuOpen }"></span>
      </div>

      <transition name="menu-fade">
        <ul v-if="isMenuOpen" class="menu-dropdown" @click="toggleMenu">
          <li v-if="!isLoggedIn">
            <router-link  to="/login" class="dropdown-link">Logowanie</router-link>
          </li>
          <li v-else>
            <a @click="logout" class="dropdown-link">Wyloguj</a>
          </li>
          
          <li v-if="isUser"><router-link to="/admin/editClass" class="dropdown-link">Edycja zajęć</router-link></li>

          <li v-if="isAdmin"><router-link to="/admin/editClass" class="dropdown-link">Edycja zajęć</router-link></li>
          <li v-if="isAdmin"><router-link to="/departments" class="dropdown-link">Wydziały</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/users" class="dropdown-link">Użytkownicy</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/employees" class="dropdown-link">Pracownicy</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/user-types" class="dropdown-link">Typy użytkowników</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/rooms" class="dropdown-link">Pokoje</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/semesters" class="dropdown-link">Semestry</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/groups" class="dropdown-link">Grupy i przedmioty</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/directions" class="dropdown-link">Kierunki</router-link></li>
          <li v-if="isAdmin"><router-link to="/admin/classessState" class="dropdown-link">Stany zajęć</router-link></li>
        </ul>
      </transition>
    </nav>
  </header>
</template>

<script>
export default {
  name: "HeaderComponent",
  data() {
    return {
      isMenuOpen: false,
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('authToken');
    },
    isUser() {
      return localStorage.getItem('userRole') > 1;
    },
    isAdmin() {
      return localStorage.getItem('userRole') == 1;
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    async logout() {
      try {
        await axios.post(
          'https://localhost/logout',
          { uuid: JSON.parse(localStorage.getItem('authToken')) },
          {
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error("Logout failed");
      }
      localStorage.clear();
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #212121;
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}

/* LOGO */
.logo a {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
}

.logo .highlight {
  color: #9285d9;
}

/* BURGER MENU */
.burger-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  cursor: pointer;
}

.burger-menu span {
  width: 100%;
  height: 3px;
  background: #ffffff;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

.burger-menu span.active:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.burger-menu span.active:nth-child(2) {
  opacity: 0;
}

.burger-menu span.active:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* MENU DROPDOWN */
.menu-dropdown {
  position: absolute;
  top: 80px;
  right: 20px;
  background: #ffffff;
  color: #212121;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 200px;
  z-index: 9999;
}

.dropdown-link {
  text-decoration: none;
  color: #212121;
  font-size: 1rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.dropdown-link:hover {
  color: #f39c12;
}

/* ANIMATIONS */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.3s ease;
}

.menu-fade-enter, 
.menu-fade-leave-to {
  opacity: 0;
}
</style>
