import React from 'react';

export const Timeline = ({ events = [] }) => {
  return (
    <div className="timeline-container">
      {events.map((ev, idx) => (
        <div key={idx} className="timeline-item">
          <div className="timeline-dot" style={{ borderColor: ev.color || 'var(--primary-blue)' }} />
          <div className="timeline-date">{ev.date}</div>
          <div className="timeline-title">{ev.title}</div>
          {ev.description && <div className="timeline-desc">{ev.description}</div>}
        </div>
      ))}
    </div>
  );
};
