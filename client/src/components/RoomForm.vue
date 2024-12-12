<template>
    <div>
        <h2>{{ room?.room_id ? 'Edit Room' : 'Add Room' }}</h2>
        <form @submit.prevent="submitForm">
            <div>
                <label for="roomNumber">Room Number:</label>
                <input id="roomNumber" v-model="formData.room_number" required />
            </div>
            <div>
                <label for="departmentId">Department ID:</label>
                <input id="departmentId" v-model="formData.department_id" required type="number" />
            </div>
            <button type="submit">{{ room?.room_id ? 'Update' : 'Add' }}</button>
            <button type="button" @click="$emit('close')">Cancel</button>
        </form>
    </div>
</template>

<script>
export default {
    props: ['room'],
    data() {
        return {
            formData: {
                room_number: '',
                department_id: null,
            },
        };
    },
    watch: {
        room: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.formData = { ...newVal };
                } else {
                    this.resetForm();
                }
            },
        },
    },
    methods: {
        submitForm() {
            const url = this.room?.room_id
                ? `http://localhost:8080/rooms/${this.room.room_id}`
                : 'http://localhost:8080/rooms';
            const method = this.room?.room_id ? 'PUT' : 'POST';

            fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.formData),
            })
                .then(() => {
                    this.$emit('refresh');
                    this.$emit('close');
                })
                .catch((error) => console.error('Error saving room:', error));
        },
        resetForm() {
            this.formData = {
                room_number: '',
                department_id: null,
            };
        },
    },
};
</script>