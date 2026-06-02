// src/db/seed.ts
import { db } from './database';
import { TaskClass } from '@/types/class';
import { WeeklyAvailability } from '@/types/availability';
import { nanoid } from 'nanoid';

export async function seedDatabase() {
  const taskCount = await db.tasks.count();
  const classCount = await db.classes.count();
  if (taskCount > 0 || classCount > 0) return; // Já tem dados
  
  // Classes padrão
  const defaultClasses: TaskClass[] = [
    { id: nanoid(), name: 'Trabalho',   color: 'blue',   priorityLevel: 0, priorityPosition: 0, icon: 'Briefcase', createdAt: new Date().toISOString() },
    { id: nanoid(), name: 'Faculdade',  color: 'purple', priorityLevel: 0, priorityPosition: 1, icon: 'GraduationCap', createdAt: new Date().toISOString() },
    { id: nanoid(), name: 'Saúde',      color: 'green',  priorityLevel: 1, priorityPosition: 0, icon: 'Heart', createdAt: new Date().toISOString() },
    { id: nanoid(), name: 'Pessoal',    color: 'orange', priorityLevel: 2, priorityPosition: 0, icon: 'User', createdAt: new Date().toISOString() },
  ];
  
  // Disponibilidade padrão (seg-sex, 9h-10h45 e 14h-16h45)
  const defaultAvailability: WeeklyAvailability = {
    0: [],  // Domingo
    1: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
    2: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
    3: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
    4: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
    5: [{ startTime: '09:00', endTime: '10:45' }, { startTime: '14:00', endTime: '16:45' }],
    6: [],  // Sábado
  };
  
  await db.classes.bulkAdd(defaultClasses);
  await db.settings.put({ key: 'weeklyAvailability', value: defaultAvailability });
  await db.settings.put({ key: 'sidebarCollapsed', value: false });
  await db.settings.put({ key: 'calendarView', value: 'week' });
}
