<template>
  <div class="subject-and-group-management">
    <!-- Zarządzanie Przedmiotami -->
    <div class="subject-management">
      <header>
        <h1>Zarządzanie Przedmiotami</h1>
        <button class="add-button" @click="openSubjectModal">Dodaj Przedmiot</button>
      </header>
      <table class="subject-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa Przedmiotu</th>
            <th>Kod Kursu</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjects" :key="subject.subject_id">
            <td>{{ subject.subject_id }}</td>
            <td>{{ subject.name }}</td>
            <td>{{ subject.course_code }}</td>
            <td>
              <button class="edit-button" @click="editSubject(subject)">Edytuj</button>
              <button class="delete-button" @click="deleteSubject(subject.subject_id)">Usuń</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal do Zarządzania Przedmiotami -->
    <div v-if="showSubjectModal" class="modal">
      <div class="modal-content">
        <h2>{{ isEditingSubject ? 'Edytuj Przedmiot' : 'Dodaj Przedmiot' }}</h2>
        <form @submit.prevent="handleSubjectSubmit">
          <div class="form-group">
            <label for="name">Nazwa Przedmiotu:</label>
            <input type="text" v-model="subjectForm.name" required />
          </div>
          <div class="form-group">
            <label for="course_code">Kod Kursu:</label>
            <input type="text" v-model="subjectForm.course_code" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="save-button">Zapisz</button>
            <button type="button" class="cancel-button" @click="closeSubjectModal">Anuluj</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Zarządzanie Grupami -->
    <div class="group-management">
      <header>
        <h1>Zarządzanie Grupami</h1>
        <button class="add-button" @click="openGroupModal">Dodaj Grupę</button>
      </header>
      <table class="group-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Przedmiot</th>
            <th>Typ Grupy</th>
            <th>Numer Grupy</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in groups" :key="group.group_id">
            <td>{{ group.group_id }}</td>
            <td>{{ getSubjectName(group.subject_id) }}</td>
            <td>{{ getGroupTypeName(group.group_type_id) }}</td>
            <td>{{ group.group_number }}</td>
            <td>
              <button class="edit-button" @click="editGroup(group)">Edytuj</button>
              <button class="delete-button" @click="deleteGroup(group.group_id)">Usuń</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal do Zarządzania Grupami -->
    <div v-if="showGroupModal" class="modal">
      <div class="modal-content">
        <h2>{{ isEditingGroup ? 'Edytuj Grupę' : 'Dodaj Grupę' }}</h2>
        <form @submit.prevent="handleGroupSubmit">
          <div class="form-group">
            <label for="subject_id">Przedmiot:</label>
            <select v-model="groupForm.subject_id" required>
              <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
                {{ subject.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="group_type_id">Typ Grupy:</label>
            <select v-model="groupForm.group_type_id" required>
              <option v-for="type in groupTypes" :key="type.group_type_id" :value="type.group_type_id">
                {{ type.type_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="group_number">Numer Grupy:</label>
            <input type="number" v-model="groupForm.group_number" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="save-button">Zapisz</button>
            <button type="button" class="cancel-button" @click="closeGroupModal">Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      // Przedmioty
      subjects: [
        { subject_id: 1, name: "Matematyka", course_code: "MATH101" },
        { subject_id: 2, name: "Fizyka", course_code: "PHYS202" },
      ],
      showSubjectModal: false,
      isEditingSubject: false,
      subjectForm: {
        subject_id: null,
        name: "",
        course_code: "",
      },

      // Grupy
      groups: [
        { group_id: 1, subject_id: 1, group_type_id: 1, group_number: 1 },
        { group_id: 2, subject_id: 2, group_type_id: 2, group_number: 2 },
      ],
      groupTypes: [
        { group_type_id: 1, type_name: "Laboratorium" },
        { group_type_id: 2, type_name: "Wykład" },
      ],
      showGroupModal: false,
      isEditingGroup: false,
      groupForm: {
        group_id: null,
        subject_id: null,
        group_type_id: null,
        group_number: null,
      },
    };
  },
  methods: {
    openSubjectModal() {
      this.isEditingSubject = false;
      this.subjectForm = { subject_id: null, name: "", course_code: "" };
      this.showSubjectModal = true;
    },
    editSubject(subject) {
      this.isEditingSubject = true;
      this.subjectForm = { ...subject };
      this.showSubjectModal = true;
    },
    deleteSubject(id) {
      axios.post('https://localhost/subjects/delete', {
        key: localStorage.getItem('authToken'),
        id: id,
      })
        .then((response) => {
          this.$toast.success('Przedmiot został usunięty pomyślnie.');
          this.getSubjectsFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    handleSubjectSubmit() {
      if (this.isEditingSubject) {
        axios.post('https://localhost/subjects/update', {
          key: localStorage.getItem('authToken'),
          id: this.subjectForm.subject_id,
          name: this.subjectForm.name,
          course_code: this.subjectForm.course_code,
        })
          .then((response) => {
            this.$toast.success('Przedmiot został zaktualizowany pomyślnie.');
            this.getSubjectsFromAPI();
          })
          .catch((error) => {
            console.error('Błąd aktualizacji danych:', error);
            this.displayError(error.response.data.reason);
          });
      } else {
        axios.post('https://localhost/subjects/add', {
          key: localStorage.getItem('authToken'),
          name: this.subjectForm.name,
          course_code: this.subjectForm.course_code,
        })
          .then((response) => {
            this.$toast.success('Przedmiot został dodany pomyślnie.');
            this.getSubjectsFromAPI();
          })
          .catch((error) => {
            console.error('Błąd dodawania danych:', error);
            this.displayError(error.response.data.reason);
          });
      }
      this.closeSubjectModal();
    },
    closeSubjectModal() {
      this.showSubjectModal = false;
    },

    //grupy
    openGroupModal() {
      this.isEditingGroup = false;
      this.groupForm = { group_id: null, subject_id: null, group_type_id: null, group_number: null };
      this.showGroupModal = true;
    },
    editGroup(group) {
      this.isEditingGroup = true;
      this.groupForm = { ...group };
      this.showGroupModal = true;
    },
    deleteGroup(id) {
      axios.post('https://localhost/groups/delete', {
        key: localStorage.getItem('authToken'),
        id: id,
      })
        .then((response) => {
          this.$toast.success('Grupa została usunięta pomyślnie.');
          this.getGroupsFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    handleGroupSubmit() {
      if (this.isEditingGroup) {
        axios.post('https://localhost/groups/update', {
          key: localStorage.getItem('authToken'),
          id: this.groupForm.group_id,
          subject_id: this.groupForm.subject_id,
          group_type_id: this.groupForm.group_type_id,
          group_number: this.groupForm.group_number,
        })
          .then((response) => {
            this.$toast.success('Grupa została zaktualizowana pomyślnie.');
            this.getGroupsFromAPI();
          })
          .catch((error) => {
            console.error('Błąd aktualizacji danych:', error);
            this.displayError(error.response.data.reason);
          });
      } else {
        axios.post('https://localhost/groups/add', {
          key: localStorage.getItem('authToken'),
          subject_id: this.groupForm.subject_id,
          group_type_id: this.groupForm.group_type_id,
          group_number: this.groupForm.group_number,
        })
          .then((response) => {
            this.$toast.success('Grupa została dodana pomyślnie.');
            this.getGroupsFromAPI();
          })
          .catch((error) => {
            console.error('Błąd dodawania danych:', error);
            this.displayError(error.response.data.reason);
          });
      }
      this.closeGroupModal();
    },
    closeGroupModal() {
      this.showGroupModal = false;
    },
    getSubjectName(subject_id) {
      const subject = this.subjects.find((s) => s.subject_id === subject_id);
      return subject ? subject.name : "Nieznany";
    },
    getGroupTypeName(group_type_id) {
      const type = this.groupTypes.find((t) => t.group_type_id === group_type_id);
      return type ? type.type_name : "Nieznany";
    },
    displayError(error) {
      console.error(error);
      this.$toast.error(error);
    },
    getSubjectsFromAPI() {
      axios.post('https://localhost/subjects/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.subjects = response.data.subjects;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getGroupsFromAPI() {
      axios.post('https://localhost/groups/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.groups = response.data.groups;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getGroupsTypesFromAPI() {
      axios.post('https://localhost/groups-types/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.groupTypes = response.data.groups_types;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
  },
  created() {
    this.getSubjectsFromAPI();
    this.getGroupsFromAPI();
    this.getGroupsTypesFromAPI();
  },
};
</script>


<style scoped>
.subject-and-group-management {
  font-family: Arial, sans-serif;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.add-button:hover {
  background-color: #45a049;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

table th {
  background-color: #f2f2f2;
}

.edit-button,
.delete-button {
  background-color: #008CBA;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 5px;
}

.delete-button {
  background-color: #f44336;
}

.edit-button:hover {
  background-color: #007bb5;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
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
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.save-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.save-button:hover {
  background-color: #45a049;
}

.cancel-button:hover {
  background-color: #d32f2f;
}
</style>
