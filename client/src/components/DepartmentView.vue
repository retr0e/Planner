<template>
  <div>
    <h2>Manage Departments</h2>

    <!-- Formularz do dodawania / edycji -->
    <form @submit.prevent="saveDepartment">
      <div>
        <label for="department_name">Department Name:</label>
        <input
          type="text"
          id="department_name"
          v-model="department.name"
          required
        />
      </div>
      <div>
        <label for="open_time">Opening Time:</label>
        <input
          type="time"
          id="open_time"
          v-model="department.open_time"
          required
        />
      </div>
      <div>
        <label for="close_time">Closing Time:</label>
        <input
          type="time"
          id="close_time"
          v-model="department.close_time"
          required
        />
      </div>

      <!-- Adres -->
      <fieldset>
        <legend>Address</legend>
        <div>
          <label for="street">Street:</label>
          <input
            type="text"
            id="street"
            v-model="department.address.street"
            required
          />
        </div>
      </fieldset>

      <!-- Telefony -->
      <fieldset>
        <legend>Phone Numbers</legend>
        <div v-for="(phone, index) in department.phones" :key="index">
          <label :for="'phone_' + index">Phone {{ index + 1 }}:</label>
          <input
            type="text"
            :id="'phone_' + index"
            v-model="phone.phone_number"
            required
          />
          <button type="button" @click="removePhone(index)">Remove</button>
        </div>
        <button type="button" @click="addPhone">Add Phone</button>
      </fieldset>

      <button type="submit">Save Department</button>
    </form>

    <!-- Lista departamentów -->
    <h3>Existing Departments</h3>
    <ul>
      <li v-for="dept in departments" :key="dept.department_id">
        {{ dept.name }}
        <button @click="editDepartment(dept)">Edit</button>
        <button @click="deleteDepartment(dept.department_id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      department: {
        name: "",
        open_time: "",
        close_time: "",
        address: {
          street: "",
        },
        phones: [
          {
            phone_number: "",
          },
        ],
      },
      departments: [], // Lista wszystkich departamentów
    };
  },
  methods: {
    async fetchDepartments() {
      try {
        const response = await fetch("http://localhost:8080/departments");
        const data = await response.json();
        if (data.ok) {
          this.departments = data.departments;
        } else {
          alert("Error fetching departments: " + data.reason);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    },
    async saveDepartment() {
      try {
        const endpoint = this.department.department_id
          ? `http://localhost:8080/departments/${this.department.department_id}`
          : "http://localhost:8080/departments";
        const method = this.department.department_id ? "PUT" : "POST";

        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.department),
        });
        const data = await response.json();

        if (data.ok) {
          alert("Department saved successfully");
          this.resetForm();
          this.fetchDepartments();
        } else {
          alert("Error saving department: " + data.reason);
        }
      } catch (error) {
        console.error("Error saving department:", error);
      }
    },
    async deleteDepartment(department_id) {
      if (!confirm("Are you sure you want to delete this department?")) return;

      try {
        const response = await fetch(`http://localhost:8080/departments/${department_id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.ok) {
          alert("Department deleted successfully");
          this.fetchDepartments();
        } else {
          alert("Error deleting department: " + data.reason);
        }
      } catch (error) {
        console.error("Error deleting department:", error);
      }
    },
    editDepartment(dept) {
      this.department = { ...dept };
      if (!this.department.phones) this.department.phones = [];
    },
    resetForm() {
      this.department = {
        name: "",
        open_time: "",
        close_time: "",
        address: {
          street: "",
        },
        phones: [{ phone_number: "" }],
      };
    },
    addPhone() {
      this.department.phones.push({ phone_number: "" });
    },
    removePhone(index) {
      this.department.phones.splice(index, 1);
    },
  },
  async created() {
    this.fetchDepartments();
  },
};
</script>
