import { useState, useEffect } from 'react';

export function NowIndicator({ hourHeight }: { hourHeight: number }) {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  
  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = (minutes / 60) * hourHeight;
  
  return (
    <div className="now-indicator" style={{ top: `${top}px` }}>
      <div className="now-indicator__dot" />
      <div className="now-indicator__line" />
    </div>
  );
}
