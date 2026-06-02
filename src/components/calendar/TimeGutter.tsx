export function TimeGutter() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return (
    <div className="time-gutter">
      <div className="time-gutter__spacer" />
      {hours.map(hour => (
        <div key={hour} className="time-gutter__hour">
          {hour === 0 ? '' : `${hour}:00`}
        </div>
      ))}
    </div>
  );
}
