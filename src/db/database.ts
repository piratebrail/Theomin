// src/db/database.ts
import Dexie, { Table } from 'dexie';
import { Task } from '@/types/task';
import { TaskClass } from '@/types/class';
import { AvailabilityException } from '@/types/availability';
import { ScheduledBlock } from '@/types/block';

import { Commitment } from '@/types/commitment';

export class TheominDB extends Dexie {
  tasks!: Table<Task, string>;
  classes!: Table<TaskClass, string>;
  availabilityExceptions!: Table<AvailabilityException, string>;
  blocks!: Table<ScheduledBlock, string>;
  settings!: Table<{ key: string; value: any }, string>;
  commitments!: Table<Commitment, string>;

  constructor() {
    super('TheominDB');
    
    this.version(1).stores({
      tasks: 'id, classId, status, deadline, startDate, [status+deadline]',
      classes: 'id, priorityLevel, [priorityLevel+priorityPosition]',
      availabilityExceptions: 'id, date',
      blocks: 'id, taskId, date, [date+startTime], [taskId+date]',
      settings: 'key',
    });

    this.version(2).stores({
      tasks: 'id, classId, status, deadline, startDate, [status+deadline]',
      classes: 'id, priorityLevel, [priorityLevel+priorityPosition]',
      availabilityExceptions: 'id, date',
      blocks: 'id, taskId, date, [date+startTime], [taskId+date]',
      settings: 'key',
      commitments: 'id, date, completed',
    });
  }
}

export const db = new TheominDB();
