const fs = require('fs');

const files = [
  'src/engine/scheduler.ts',
  'src/components/calendar/DayView.tsx',
  'src/hooks/useGlobalEngine.ts',
  'src/components/calendar/WeekView.tsx',
  'src/components/availability/ExceptionModal.tsx',
  'src/components/calendar/TimeGrid.tsx',
  'src/components/calendar/CalendarView.tsx',
  'src/components/calendar/CalendarHeader.tsx',
  'src/components/tasks/TaskForm.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("toISOString().split('T')[0]")) {
    content = content.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLocalDateString()');
    content = content.replace(/(\w+)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLocalDateString($1)');
    
    if (content.includes('getLocalDateString')) {
      const importStmt = "import { getLocalDateString } from '@/utils/date';\n";
      content = importStmt + content;
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
});
