<template>
    <div class="type-management">
        <h1>Zarządzanie Typami Użytkownika</h1>

        <!-- Formularz dodawania/modyfikacji Pracownika -->
        <div class="form-card">
            <h2>{{ editMode ? 'Edytuj Typ Użytkownika' : 'Dodaj Typ Użytkownika' }}</h2>
            <form @submit.prevent="saveType">
                <div class="form-group">
                    <label for="account_type_name">Nazwa *</label>
                    <input type="text" id="account_type_name" v-model="form.account_type_name" placeholder="Wprowadź nazwę" required />
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

        <!-- Lista Typów Użytkowników -->
        <div class="types-list">
            <h2>Lista Typów Użytkowników</h2>
            <ul>
                <li v-for="(type, index) in types" :key="index" class="list-item">
                    <span>
                        <strong>{{ type.account_type_name }}</strong>
                    </span>
                    <div class="actions">
                        <button class="btn btn-edit" @click="editType(index)">Edytuj</button>
                        <button class="btn btn-delete" @click="deleteType(index)">Usuń</button>
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
            types: [],
            form: {
                id: null,
                account_type_name: '',
            },
            editMode: false,
            editIndex: null,
        };
    },
    methods: {
        saveType() {
            if (this.editMode) {
                axios.post('https://localhost/user-types/update', {
                    key: localStorage.getItem('authToken'),
                    id: this.form.id,
                    account_type_name: this.form.account_type_name,
                })
                    .then((response) => {
                        this.getTypesFromAPI();
                        this.resetForm();
                    })
                    .catch((error) => {
                        console.error('Błąd zapisu danych:', error);
                        this.displayError(error.response.data.reason);
                    });
            } else {
                axios.post('https://localhost/user-types/add', {
                    key: localStorage.getItem('authToken'),
                    account_type_name: this.form.account_type_name,
                })
                    .then((response) => {
                        this.getTypesFromAPI();
                        this.resetForm();
                    })
                    .catch((error) => {
                        console.error('Błąd zapisu danych:', error);
                        this.displayError(error.response.data.reason);
                    });
            }

        },
        editType(index) {
            this.editIndex = index;
            this.form = { ...this.types[index] };
            this.editMode = true;
        },
        deleteType(index) {
            axios.post('https://localhost/user-types/delete', {
                key: localStorage.getItem('authToken'),
                id: this.types[index].id,
            })
                .then((response) => {
                    this.types.splice(index, 1);
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
                account_type_name: '',
            };
            this.editMode = false;
            this.editIndex = null;
        },
        displayError(error) {
            console.error(error);
            this.$toast.error(error);
        },
        getTypesFromAPI() {
            axios.post('https://localhost/user-types/get-all', {
                key: localStorage.getItem('authToken'),
            })
                .then((response) => {
                    this.types = response.data.account_types;
                })
                .catch((error) => {
                    console.error('Błąd pobierania danych:', error);
                    this.displayError(error.response.data.reason);
                });
        },
    },
    mounted() {
        this.getTypesFromAPI();
    },
};
</script>

<style scoped>
.type-management {
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

.type-list ul {
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