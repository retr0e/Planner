<template>
    <div class="employee-management">
        <h1>Zarządzanie Pracownikami</h1>

        <!-- Formularz dodawania/modyfikacji Pracownika -->
        <div class="form-card">
            <h2>{{ editMode ? 'Edytuj Pracownika' : 'Dodaj Pracownika' }}</h2>
            <form @submit.prevent="saveEmployee">
                <div class="form-group">
                    <label for="first_name">Imię *</label>
                    <input type="text" id="first_name" v-model="form.first_name" placeholder="Wprowadź imię" required />
                </div>
                <div class="form-group">
                    <label for="last_name">Nazwisko *</label>
                    <input type="text" id="last_name" v-model="form.last_name" placeholder="Wprowadź nazwisko"
                        required />
                </div>
                <div class="form-group">
                    <label for="position">Stanowisko *</label>
                    <input type="text" id="position" v-model="form.position" placeholder="Wprowadź stanowisko"
                        required />
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        {{ editMode ? 'Zapisz' : 'Dodaj' }}
                    </button>
                    <button type="button" v-if="editMode" class="btn btn-secondary" @click="cancelEdit">
                        Anuluj
                    </button>
                </div>
            </form>
        </div>

        <!-- Lista Pracowników -->
        <div class="employee-list">
            <h2>Lista Pracowników</h2>
            <ul>
                <li v-for="(employee, index) in employees" :key="index" class="list-item">
                    <span>
                        <strong>{{ employee.first_name }} {{ employee.last_name }}</strong> - {{ employee.position }}
                    </span>
                    <div class="actions">
                        <button class="btn btn-edit" @click="editEmployee(index)">Edytuj</button>
                        <button class="btn btn-delete" @click="deleteEmployee(index)">Usuń</button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            employees: [],
            form: {
                id: null,
                first_name: '',
                last_name: '',
                position: '',
            },
            editMode: false,
            editIndex: null,
        };
    },
    methods: {
        saveEmployee() {
            if (this.editMode) {
                axios.post('https://localhost/employees/update', {
                    key: localStorage.getItem('authToken'),
                    id: this.form.id,
                    first_name: this.form.first_name,
                    last_name: this.form.last_name,
                    position: this.form.position,
                })
                    .then((response) => {
                        this.getEmployeesFromAPI();
                        this.resetForm();
                    })
                    .catch((error) => {
                        console.error('Błąd zapisu danych:', error);
                        this.displayError(error.response.data.reason);
                    });
            } else {
                axios.post('https://localhost/employees/add', {
                    key: localStorage.getItem('authToken'),
                    first_name: this.form.first_name,
                    last_name: this.form.last_name,
                    position: this.form.position,
                })
                    .then((response) => {
                        this.getEmployeesFromAPI();
                        this.resetForm();
                    })
                    .catch((error) => {
                        console.error('Błąd zapisu danych:', error);
                        this.displayError(error.response.data.reason);
                    });
            }

        },
        editEmployee(index) {
            this.editIndex = index;
            this.form = { ...this.employees[index] };
            this.editMode = true;
        },
        deleteEmployee(index) {
            axios.post('https://localhost/employees/delete', {
                key: localStorage.getItem('authToken'),
                id: this.employees[index].id,
            })
                .then((response) => {
                    this.employees.splice(index, 1);
                })
                .catch((error) => {
                    console.error('Błąd usuwania danych:', error);
                    this.displayError(error.response.data.reason);
                });
        },
        cancelEdit() {
            this.resetForm();
        },
        resetForm() {
            this.form = {
                id: null,
                first_name: '',
                last_name: '',
                position: '',
            };
            this.editMode = false;
            this.editIndex = null;
        },
        displayError(error) {
            console.error(error);
            this.$toast.error(error);
        },
        getEmployeesFromAPI() {
            axios.post('https://localhost/employees/get-all', {
                key: localStorage.getItem('authToken'),
            })
                .then((response) => {
                    this.employees = response.data.employees;
                })
                .catch((error) => {
                    console.error('Błąd pobierania danych:', error);
                    this.displayError(response.data.reason);
                });
        },
    },
    mounted() {
        this.getEmployeesFromAPI();
    },
};
</script>

<style scoped>
.employee-management {
    font-family: Arial, sans-serif;
    max-width: 700px;
    margin: 2rem auto;
    padding: 1rem;
}

h1,
h2 {
    text-align: center;
    margin-bottom: 1.5rem;
}

.form-card {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}

input:focus {
    outline: none;
    border-color: #007bff;
}

.form-actions {
    display: flex;
    gap: 1rem;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-edit {
    background-color: #ffc107;
    color: white;
}

.btn-delete {
    background-color: #dc3545;
    color: white;
}

.employee-list ul {
    list-style: none;
    padding: 0;
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions {
    display: flex;
    gap: 0.5rem;
}
</style>