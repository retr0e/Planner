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
            <label for="room-name">Numer Pokoju</label>
            <input
              id="room-number"
              v-model="roomForm.room_number"
              type="number"
              placeholder="Podaj numer pokoju"
              required
            />
          </div>
          <div class="form-group">
            <label for="room-department">Wydział</label>
            <select v-model="roomForm.department_id" required>
              <option v-for="department in departments" :key="department.department_id" :value="department.department_id">
                {{ department.name }}
              </option>
            </select>
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
          <div v-for="room in rooms" :key="room.room_id" class="room-card">
            <div class="room-info">
              <h3>{{ room.room_number }}</h3>
              <p>Wydział: {{ getDepartmentName(room.department_id) }}</p>
            </div>
            <div class="room-actions">
              <button class="btn btn-edit" @click="editRoom(room)">Edytuj</button>
              <button class="btn btn-delete" @click="deleteRoom(room.room_id)">
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
  import axios from 'axios';
  import { useToast } from 'vue-toastification';
  
  export default {
    name: "RoomsView",
    setup() {
      const toast = useToast();

      const rooms = ref([
        
      ]);

      const departments = ref([
        
      ]);
  
      const roomForm = ref({
        room_id: null,
        room_number: null,
        department_id: null,
      });
  
      const isEditing = ref(false);
  
      const handleSubmit = () => {
        if (isEditing.value) {
          axios.post('https://localhost/rooms/update', {
            key: localStorage.getItem('authToken'),
            id: roomForm.value.room_id,
            room_number: roomForm.value.room_number,
            department_id: roomForm.value.department_id,
          })
            .then((response) => {
              toast.success('Pokój został zaktualizowany pomyślnie.');
              getRoomsFromAPI();
            })
            .catch((error) => {
              console.error('Błąd aktualizacji danych:', error);
              displayError(error.response.data.reason);
            });
          isEditing.value = false;
        } else {
          axios.post('https://localhost/rooms/add', {
            key: localStorage.getItem('authToken'),
            room_number: roomForm.value.room_number,
            department_id: roomForm.value.department_id,
          })
            .then((response) => {
              toast.success('Pokój został dodany pomyślnie.');
              getRoomsFromAPI();
            })
            .catch((error) => {
              console.error('Błąd dodawania danych:', error);
              displayError(error.response.data.reason);
            });
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
        axios.post('https://localhost/rooms/delete', {
        key: localStorage.getItem('authToken'),
        id: id,
      })
        .then((response) => {
          toast.success('Pokój został usunięty pomyślnie.');
          getRoomsFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
          displayError(error.response.data.reason);
        });
      };
  
      const resetForm = () => {
        roomForm.value = {
          room_id: null,
          room_number: null,
          department_id: null,
        };
      };

      const getDepartmentName = (department_id) => {
        const department = departments.value.find((d) => d.department_id === department_id);
        return department ? department.name : "Nieznany";
      };

      const displayError = (message) => {
        toast.error(message);
      };

      const getRoomsFromAPI = () => {
        axios.post('https://localhost/rooms/get-all', {
          key: localStorage.getItem('authToken'),
        })
          .then((response) => {
            rooms.value = response.data.rooms;
          })
          .catch((error) => {
            console.error('Błąd pobierania danych:', error);
            displayError(error.response.data.reason);
          });
      };

      const getDepartmentsFromAPI = () => {
        axios.post('https://localhost/departments/get-all', {
          key: localStorage.getItem('authToken'),
        })
          .then((response) => {
            departments.value = response.data.departments;
          })
          .catch((error) => {
            console.error('Błąd pobierania danych:', error);
            displayError(error.response.data.reason);
          });
      };
  
      return {
        rooms,
        departments,
        roomForm,
        isEditing,
        handleSubmit,
        editRoom,
        deleteRoom,
        cancelEdit,
        displayError,
        getDepartmentName,
        getRoomsFromAPI,
        getDepartmentsFromAPI,
      };
    },
    created() {
      this.getRoomsFromAPI();
      this.getDepartmentsFromAPI();
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
  