// src/stores/availabilityStore.ts
import { create } from 'zustand';
import { db } from '@/db/database';
import { WeeklyAvailability, AvailabilityException, TimeSlot, DayOfWeek } from '@/types/availability';
import { nanoid } from 'nanoid';

interface AvailabilityState {
  weeklyPattern: WeeklyAvailability;
  exceptions: AvailabilityException[];
  loading: boolean;

  loadAvailability: () => Promise<void>;
  setDaySlots: (day: DayOfWeek, slots: TimeSlot[]) => Promise<void>;
  addException: (exception: Omit<AvailabilityException, 'id'>) => Promise<void>;
  removeException: (id: string) => Promise<void>;
  getEffectiveSlots: (date: string) => TimeSlot[];
}

export const useAvailabilityStore = create<AvailabilityState>((set, get) => ({
  weeklyPattern: {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  },
  exceptions: [],
  loading: false,

  loadAvailability: async () => {
    set({ loading: true });
    const setting = await db.settings.get('weeklyAvailability');
    
    // Se o usuário nunca configurou e pulou o seed, damos um padrão decente (seg-sex, 9h-10h45, 14h-16h45)
    const defaultPattern: WeeklyAvailability = {
      0: [],
      1: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
      2: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
      3: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
      4: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
      5: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
      6: []
    };
    
    const pattern = setting?.value || defaultPattern;
    const exceptions = await db.availabilityExceptions.toArray();
    set({ weeklyPattern: pattern, exceptions, loading: false });
  },

  setDaySlots: async (day, slots) => {
    const { weeklyPattern } = get();
    const newPattern = { ...weeklyPattern, [day]: slots };
    await db.settings.put({ key: 'weeklyAvailability', value: newPattern });
    await get().loadAvailability();
  },

  addException: async (exceptionData) => {
    const newException: AvailabilityException = {
      ...exceptionData,
      id: nanoid()
    };
    await db.availabilityExceptions.add(newException);
    await get().loadAvailability();
  },

  removeException: async (id) => {
    await db.availabilityExceptions.delete(id);
    await get().loadAvailability();
  },

  getEffectiveSlots: (dateStr: string) => {
    const { weeklyPattern, exceptions } = get();
    const exception = exceptions.find(e => e.date === dateStr);
    
    if (exception) {
      return exception.isDayOff ? [] : exception.slots;
    }
    
    // Fallback para o padrão semanal
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay() as DayOfWeek;
    return weeklyPattern[dayOfWeek] || [];
  }
}));
