<template>
    <div>
        <h1>Rooms</h1>
        <button @click="showAddForm = true">Add Room</button>
        <table>
            <thead>
                <tr>
                    <th>Room ID</th>
                    <th>Room Number</th>
                    <th>Department ID</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="room in rooms" :key="room.room_id">
                    <td>{{ room.room_id }}</td>
                    <td>{{ room.room_number }}</td>
                    <td>{{ room.department_id }}</td>
                    <td>
                        <button @click="editRoom(room)">Edit</button>
                        <button @click="deleteRoom(room.room_id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <RoomForm v-if="showAddForm || selectedRoom" :room="selectedRoom" @close="resetForm" @refresh="fetchRooms" />
    </div>
</template>

<script>
import RoomForm from './RoomForm.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'RoomsView',
    components: { RoomForm },
    data() {
        return {
            rooms: [],
            showAddForm: false,
            selectedRoom: null,
        };
    },
    methods: {
        fetchRooms() {
            fetch('http://localhost:8080/rooms')
                .then((response) => response.json())
                .then((data) => {
                    this.rooms = data.rooms;
                })
                .catch((error) => console.error('Error fetching rooms:', error));
        },
        editRoom(room) {
            this.selectedRoom = { ...room };
            this.showAddForm = true;
        },
        deleteRoom(roomId) {
            fetch(`http://localhost:8080/rooms/${roomId}`, { method: 'DELETE' })
                .then(() => {
                    this.fetchRooms();
                })
                .catch((error) => console.error('Error deleting room:', error));
        },
        resetForm() {
            this.showAddForm = false;
            this.selectedRoom = null;
            this.fetchRooms();
        },
    },
    mounted() {
        this.fetchRooms();
    },
});
</script>