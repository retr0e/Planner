<template>
  <div class="schedule-container">
    <header class="header">
      <h1 class="course-name">{{ courseName }}</h1>
      <div class="date">
        <p>{{ formattedDate }}</p>
        <h2>Today</h2>
      </div>
      <button class="add-task">+ Add Task</button>
    </header>

    <div class="week-days-navigation">
      <button @click="prevWeek" class="nav-button">&lt;</button>
      <div class="week-days">
        <span
          v-for="day in visibleDays"
          :key="day.date"
          :class="{ active: day.isActive }"
          @click="selectDate(day.date)"
        >
          <div>{{ day.day }}</div>
          <div>{{ day.date }}</div>
        </span>
      </div>
      <button @click="nextWeek" class="nav-button">&gt;</button>
    </div>

    <main class="task-list">
      <div v-for="task in tasks" :key="task.class_id" class="main-task-block">
        <div class="time">{{ new Date(task.start_time).getHours() + ":" + new Date(task.start_time).getMinutes() }} - {{ new Date(task.end_time).getHours() + ":" + new Date(task.end_time).getMinutes() }}</div>
        <div class="task">
          <div class="details">
            <div class="subject">{{ task.type_name }} ({{ task.group_number }})</div>
            <div class="chapter">{{  }}</div>
            <div class="meta">
              <span class="teacher">Prowadzący: {{ task.prowadzacy }}</span>
              <span class="platform">{{ task.room_number }}, {{ task.room_department_name }}</span>
            </div>
            <div class="status">Stan: {{ task.state_name }}</div>
          </div>
        </div>
      </div>
    </main>


    <nav class="bottom-nav">
      <button
        v-for="nav in navItems"
        :key="nav.label"
        :class="{ active: nav.isActive }"
        class="nav-item"
        @click="setActiveNav(nav.label)"
      >
        <i :class="nav.icon"></i>
        <span>{{ nav.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ScheduleView',
  props: {
    courseName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      startDate: new Date('2024-10-01'),
      endDate: new Date('2025-02-28'),
      currentWeekStart: new Date('2024-10-14'),
      visibleDays: [] as { day: string; date: string; isActive: boolean }[],
      selectedDate: '2025-01-13',
      tasks: [
        {
          class_id: 1,
          group_number: "",
          type_name: "",
          prowadzacy: "",
          date: "",
          start_time: "",
          end_time: '',
          room_number: "",
          room_department_name: "",
          state_name: "",
        },
      ],
      navItems: [
        { label: 'Home', icon: 'fas fa-home', isActive: true },
        { label: 'Log', icon: 'fas fa-clipboard', isActive: false },
        { label: 'Classroom', icon: 'fas fa-chalkboard', isActive: false },
        { label: 'Chat', icon: 'fas fa-comments', isActive: false },
      ],
    };
  },
  computed: {
    formattedDate(): string {
      const date = new Date(this.selectedDate);
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
      });
    },
  },
  mounted() {
    this.updateVisibleDays();
  },
  methods: {
    updateVisibleDays() {
      const days = [];
      const currentDate = new Date(this.currentWeekStart);

      this.getScheduleDataFromAPI();

      for (let i = 0; i < 7; i++) {
        const day = currentDate.toLocaleDateString('en-US', {
          weekday: 'short',
        });
        const date = currentDate.toISOString().split('T')[0];
        days.push({
          day,
          date,
          isActive: date === this.selectedDate,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.visibleDays = days;
    },
    selectDate(date: string) {
      this.selectedDate = date;
      this.updateVisibleDays();
    },
    prevWeek() {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
      if (this.currentWeekStart >= this.startDate) {
        this.updateVisibleDays();
      } else {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
      }
    },
    nextWeek() {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
      if (this.currentWeekStart <= this.endDate) {
        this.updateVisibleDays();
      } else {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
      }
    },
    setActiveNav(label: string) {
      this.navItems.forEach((item) => {
        item.isActive = item.label === label;
      });
    },

    convertDateToSQLDateFormat(date: Date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    },

    getScheduleDataFromAPI() {
      const id = this.$route.params.id;
      let currentWeekEndDay = this.currentWeekStart.getDate() + 6;
      let currentWeekEnd = new Date(this.currentWeekStart.getFullYear(), this.currentWeekStart.getMonth(), currentWeekEndDay);

      fetch(`http://localhost:8080/plan?id=${id}&start=${this.convertDateToSQLDateFormat(this.currentWeekStart)}&end=${this.convertDateToSQLDateFormat(currentWeekEnd)}`)
        .then((res) => res.json())
        .then((data) => {
          // Mapujemy dane, aby dopasować do formatu w widoku
          this.tasks = data.map((item: any) => ({
            class_id: item.class_id,
            group_number: item.group_number,
            type_name: item.type_name,
            prowadzacy: item.prowadzacy,
            date: item.date,
            start_time: item.start_time,
            end_time: item.end_time,
            room_number: item.room_number,
            room_department_name: item.room_department_name,
            state_name: item.state_name,
          }));
        })
        .catch((err) => {
          console.error(err);
        });
    }
  },
});
</script>

<style scoped>
.schedule-container {
  font-family: Arial, sans-serif;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.course-name {
  flex-basis: 100%;
  text-align: center;
  margin-bottom: 16px;
  color: #27ae60;
  font-size: 1.8em;
}

.date {
  text-align: left;
}

.date > p {
  margin-bottom: 0px;
}

.date > h2 {
  margin-top: 0px;
}

.add-task {
  background-color: #3eaa6b;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
}

.week-days-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
  color: #555;
}

.week-days {
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  overflow-x: auto;
}

.week-days span {
  text-align: center;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.week-days .active {
  color: #27ae60;
  font-weight: bold;
  border-bottom: 1px solid #27ae60;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-task-block {
  display: flex;
  flex-direction: row;
  gap: 2%;
}

.task {
  background: #333;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  gap: 16px;
  color: #fff;
  width: 100%;
}

.time {
  font-weight: bold;
}

.details {
  display: flex;
  flex-direction: column;
}

.meta {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  color: gray;
  font-size: 0.9em;
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 16px;
  border-top: 1px solid #ddd;
  border-radius: 16px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  text-align: center;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-item i {
  font-size: 18px;
  margin-bottom: 4px;
}

.nav-item.active {
  color: #27ae60;
}
</style>
