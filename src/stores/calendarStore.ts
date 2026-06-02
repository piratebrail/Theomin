// src/stores/calendarStore.ts
import { create } from 'zustand';

interface CalendarState {
  currentDate: string; // 'YYYY-MM-DD'
  viewType: 'week' | 'day';
  editingTaskId: string | null;
  
  setCurrentDate: (date: string) => void;
  setViewType: (type: 'week' | 'day') => void;
  setEditingTaskId: (id: string | null) => void;
  goToToday: () => void;
}

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: getTodayString(),
  viewType: 'week',
  editingTaskId: null,
  
  setCurrentDate: (date) => set({ currentDate: date }),
  setViewType: (type) => set({ viewType: type }),
  setEditingTaskId: (id) => set({ editingTaskId: id }),
  goToToday: () => set({ currentDate: getTodayString() })
}));
