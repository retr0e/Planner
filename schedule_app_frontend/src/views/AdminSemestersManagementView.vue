<template>
    <div class="semester-management">
      <header>
        <h1>Zarządzanie Semestrami</h1>
        <div>
          <button class="add-button" @click="openAddModal">Dodaj Semestr</button>
          <button class="manage-types-button" @click="openTypesModal">Zarządzaj Typami Semestrów</button>
        </div>
      </header>
  
      <table class="semester-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Rok Akademicki</th>
            <th>Numer Semestru</th>
            <th>Typ Semestru</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="semester in semesters" :key="semester.semester_id">
            <td>{{ semester.semester_id }}</td>
            <td>{{ semester.year_id }}</td>
            <td>{{ semester.nr_semester }}</td>
            <td>{{ getSemesterType(semester.typ_semestru) }}</td>
            <td>
              <button class="edit-button" @click="editSemester(semester)">Edytuj</button>
              <button class="delete-button" @click="deleteSemester(semester.semester_id)">Usuń</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Modal for Adding/Editing Semesters -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Edytuj Semestr' : 'Dodaj Semestr' }}</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="year_id">Rok Akademicki:</label>
              <input type="number" v-model="form.year_id" required />
            </div>
            <div class="form-group">
              <label for="nr_semestru">Numer Semestru:</label>
              <input type="number" v-model="form.nr_semester" required />
            </div>
            <div class="form-group">
              <label for="typ_semestru">Typ Semestru:</label>
              <select v-model="form.typ_semestru" required>
                <option v-for="type in semesterTypes" :key="type.type_id" :value="type.type_id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="save-button">Zapisz</button>
              <button type="button" class="cancel-button" @click="closeModal">Anuluj</button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Modal for Managing Semester Types -->
      <div v-if="showTypesModal" class="modal">
        <div class="modal-content">
          <h2>Zarządzanie Typami Semestrów</h2>
          <table class="types-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nazwa Typu</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="type in semesterTypes" :key="type.type_id">
                <td>{{ type.type_id }}</td>
                <td>{{ type.name }}</td>
                <td>
                  <button class="edit-button" @click="editType(type)">Edytuj</button>
                  <button class="delete-button" @click="deleteType(type.type_id)">Usuń</button>
                </td>
              </tr>
            </tbody>
          </table>
          <form @submit.prevent="handleTypeSubmit">
            <div class="form-group">
              <label for="type_name">Nazwa Typu:</label>
              <input type="text" v-model="typeForm.name" required />
            </div>
            <div class="form-actions">
              <button type="submit" class="save-button">{{ isEditingType ? 'Zapisz' : 'Dodaj' }}</button>
              <button type="button" class="cancel-button" @click="closeTypesModal">Zamknij</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';

  export default {
    data() {
      return {
        // Semesters Data
        semesters: [
          
        ],
        semesterTypes: [
          { type_id: 1, name: 'Zimowy' },
          { type_id: 2, name: 'Letni' },
        ],
        // Modal States
        showModal: false,
        showTypesModal: false,
        isEditing: false,
        isEditingType: false,
        // Forms
        form: {
          semester_id: null,
          year_id: null,
          nr_semester: null,
          typ_semestru: null,
        },
        typeForm: {
          type_id: null,
          name: '',
        },
      };
    },
    methods: {
      openAddModal() {
        this.isEditing = false;
        this.form = { semester_id: null, year_id: null, nr_semester: null, typ_semestru: null };
        this.showModal = true;
      },
      editSemester(semester) {
        this.isEditing = true;
        this.form = { ...semester };
        this.showModal = true;
      },
      deleteSemester(id) {
        axios.post('https://localhost/semesters/delete', {
        key: localStorage.getItem('authToken'),
        id: id,
      })
        .then((response) => {
          this.$toast.success('Semestr został usunięty pomyślnie.');
          this.getSemestersFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
          this.displayError(error.response.data.reason);
        });
      },
      handleSubmit() {
        if (this.isEditing) {
          axios.post('https://localhost/semesters/update', {
            key: localStorage.getItem('authToken'),
            id: this.form.semester_id,
            year_id: this.form.year_id,
            nr_semester: this.form.nr_semester,
            typ_semestru: this.form.typ_semestru,
          })
            .then((response) => {
              this.$toast.success('Semestr został zaktualizowany pomyślnie.');
              this.getSemestersFromAPI();
            })
            .catch((error) => {
              console.error('Błąd aktualizacji danych:', error);
              this.displayError(error.response.data.reason);
            });
        } else {
          axios.post('https://localhost/semesters/add', {
            key: localStorage.getItem('authToken'),
            year_id: this.form.year_id,
            nr_semester: this.form.nr_semester,
            typ_semestru: this.form.typ_semestru,
          })
            .then((response) => {
              this.$toast.success('Semestr został dodany pomyślnie.');
              this.getSemestersFromAPI();
            })
            .catch((error) => {
              console.error('Błąd dodawania danych:', error);
              this.displayError(error.response.data.reason);
            });
        }
        this.closeModal();
      },
      closeModal() {
        this.showModal = false;
      },
      openTypesModal() {
        this.showTypesModal = true;
      },
      closeTypesModal() {
        this.showTypesModal = false;
        this.typeForm = { type_id: null, name: '' };
        this.isEditingType = false;
      },
      editType(type) {
        this.isEditingType = true;
        this.typeForm = { ...type };
      },
      deleteType(id) {
        axios.post('https://localhost/semester-types/delete', {
          key: localStorage.getItem('authToken'),
          id: id,
        })
          .then((response) => {
            this.$toast.success('Typ semestru został usunięty pomyślnie.');
            this.getSemesterTypesFromAPI();
          })
          .catch((error) => {
            console.error('Błąd usuwania danych:', error);
            this.displayError(error.response.data.reason);
          });
      },
      handleTypeSubmit() {
        if (this.isEditingType) {
          axios.post('https://localhost/semester-types/update', {
            key: localStorage.getItem('authToken'),
            id: this.typeForm.type_id,
            name: this.typeForm.name,
          })
            .then((response) => {
              this.$toast.success('Typ semestru został zaktualizowany pomyślnie.');
              this.getSemesterTypesFromAPI();
            })
            .catch((error) => {
              console.error('Błąd aktualizacji danych:', error);
              this.displayError(error.response.data.reason);
            });
        } else {
          axios.post('https://localhost/semester-types/add', {
            key: localStorage.getItem('authToken'),
            name: this.typeForm.name,
          })
            .then((response) => {
              this.$toast.success('Typ semestru został dodany pomyślnie.');
              this.getSemesterTypesFromAPI();
            })
            .catch((error) => {
              console.error('Błąd dodawania danych:', error);
              this.displayError(error.response.data.reason);
            });
        }
        this.closeTypesModal();
      },
      getSemesterType(typeId) {
        const type = this.semesterTypes.find((d) => d.type_id === typeId);
        return type ? type.name : 'Nieznany';
      },
        displayError(error) {
        console.error(error);
        this.$toast.error(error);
      },
      getSemestersFromAPI() {
        axios.post('https://localhost/semesters/get-all', {
          key: localStorage.getItem('authToken'),
        })
          .then((response) => {
            this.semesters = response.data.semesters;
          })
          .catch((error) => {
            console.error('Błąd pobierania danych:', error);
            this.displayError(error.response.data.reason);
          });
      },
      getSemesterTypesFromAPI() {
        axios.post('https://localhost/semester-types/get-all', {
          key: localStorage.getItem('authToken'),
        })
          .then((response) => {
            this.semesterTypes = response.data.semester_types;
          })
          .catch((error) => {
            console.error('Błąd pobierania danych:', error);
            this.displayError(error.response.data.reason);
          });
      },
    },
    created() {
      this.getSemesterTypesFromAPI();
      this.getSemestersFromAPI();
    },
  };
  </script>
  
  <style scoped>
  .semester-management {
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .add-button {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
  }
  
  .manage-types-button {
    padding: 10px 20px;
    background-color: #c0e571;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer; 
  }

  .semester-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  .semester-table th,
  .semester-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .edit-button {
    padding: 5px 10px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
  }
  
  .delete-button {
    padding: 5px 10px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
  }
  
  .form-group input,
  .form-group select {
    width: 90%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .save-button {
    background-color: #4caf50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .cancel-button {
    background-color: #f44336;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>
  