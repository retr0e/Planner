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
      <div v-for="task in tasks" :key="task.id" class="main-task-block">
        <div class="time">{{ task.time }}</div>
        <div class="task">
          <div class="details">
            <div class="subject">{{ task.subject }}</div>
            <div class="chapter">{{ task.chapter }}</div>
            <div class="meta">
              <span class="teacher">{{ task.teacher }}</span>
              <span class="platform">{{ task.platform }}</span>
            </div>
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
      selectedDate: '2024-10-17',
      tasks: [
        {
          id: 1,
          time: '9:30 - 10:20',
          subject: 'Physics',
          chapter: 'Chapter 3: Force',
          teacher: 'Alex Jesus',
          platform: 'Google Meet',
        },
        {
          id: 2,
          time: '11:00 - 11:50',
          subject: 'Geography',
          chapter: 'Chapter 12: Soil Profile',
          teacher: 'Jenifer Clark',
          platform: 'Zoom',
        },
        {
          id: 3,
          time: '12:20 - 13:00',
          subject: 'Assignment',
          chapter: 'World Regional Pattern',
          teacher: 'Alexa Tenorio',
          platform: 'Google Docs',
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
