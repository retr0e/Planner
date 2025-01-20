<template>
    <div class="rooms-view">
      <header class="header">
        <h1>Lista Pomieszczeń</h1>
      </header>
  
      <!-- Formularz do dodawania/edytowania pokoju -->
      <section class="room-form">
        <h2>{{ isEditing ? "Edytuj Pokój" : "Dodaj Nowy Pokój" }}</h2>
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="room-name">Nazwa Pokoju</label>
            <input
              id="room-name"
              v-model="roomForm.name"
              type="text"
              placeholder="Wpisz nazwę pokoju"
              required
            />
          </div>
          <div class="form-group">
            <label for="room-department">Wydział</label>
            <input
              id="room-department"
              v-model="roomForm.department"
              type="text"
              placeholder="Wpisz wydział"
              required
            />
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">
              {{ isEditing ? "Zapisz Zmiany" : "Dodaj Pokój" }}
            </button>
            <button
              class="btn btn-secondary"
              type="button"
              v-if="isEditing"
              @click="cancelEdit"
            >
              Anuluj
            </button>
          </div>
        </form>
      </section>
  
      <!-- Lista pokoi -->
      <section class="room-list">
        <h2>Pomieszczenia na uczelni</h2>
        <div class="room-cards">
          <div v-for="room in rooms" :key="room.id" class="room-card">
            <div class="room-info">
              <h3>{{ room.name }}</h3>
              <p>Wydział: {{ room.department }}</p>
            </div>
            <div class="room-actions">
              <button class="btn btn-edit" @click="editRoom(room)">Edytuj</button>
              <button class="btn btn-delete" @click="deleteRoom(room.id)">
                Usuń
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  
  export default {
    name: "RoomsView",
    setup() {
      const rooms = ref([
        { id: 1, name: "Pokój konferencyjny", department: "Wydział Zarządzania" },
        { id: 2, name: "Pokój szkoleniowy", department: "Wydział Informatyki" },
        { id: 3, name: "Biuro zarządu", department: "Wydział Finansów" },
      ]);
  
      const roomForm = ref({
        id: null,
        name: "",
        department: "",
      });
  
      const isEditing = ref(false);
  
      const handleSubmit = () => {
        if (isEditing.value) {
          const index = rooms.value.findIndex((r) => r.id === roomForm.value.id);
          if (index !== -1) {
            rooms.value[index] = { ...roomForm.value };
          }
          isEditing.value = false;
        } else {
          const newRoom = {
            ...roomForm.value,
            id: Date.now(),
          };
          rooms.value.push(newRoom);
        }
        resetForm();
      };
  
      const editRoom = (room) => {
        roomForm.value = { ...room };
        isEditing.value = true;
      };
  
      const cancelEdit = () => {
        resetForm();
        isEditing.value = false;
      };
  
      const deleteRoom = (id) => {
        rooms.value = rooms.value.filter((room) => room.id !== id);
      };
  
      const resetForm = () => {
        roomForm.value = {
          id: null,
          name: "",
          department: "",
        };
      };
  
      return {
        rooms,
        roomForm,
        isEditing,
        handleSubmit,
        editRoom,
        deleteRoom,
        cancelEdit,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Ogólne style */
  .rooms-view {
    font-family: "Arial", sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
  }
  
  /* Nagłówki */
  .header h1 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2rem;
    color: #2c3e50;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #34495e;
    margin-bottom: 10px;
  }
  
  /* Formularz */
  .room-form {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
  }
  
  /* Przyciski */
  .btn {
    padding: 10px 15px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .btn-primary {
    background: #3498db;
    color: white;
  }
  
  .btn-secondary {
    background: #95a5a6;
    color: white;
  }
  
  .btn-edit {
    background: #f1c40f;
    color: white;
  }
  
  .btn-delete {
    background: #e74c3c;
    color: white;
  }
  
  /* Lista pokoi */
  .room-list {
    margin-top: 20px;
  }
  
  .room-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .room-card {
    background: #ffffff;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .room-info h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #2c3e50;
  }
  
  .room-info p {
    margin: 5px 0;
    color: #7f8c8d;
  }
  
  .room-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  </style>
  