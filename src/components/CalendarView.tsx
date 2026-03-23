"use client";

import { useState, useMemo } from "react";
import styles from "./CalendarView.module.css";
import { DayRecord } from "@/lib/types";

interface CalendarViewProps {
  daysData: Record<string, DayRecord>;
  onDayClick: (dateStr: string) => void;
}

export default function CalendarView({ daysData, onDayClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Setup for padding the beginning of the month
    const firstDayIndex = date.getDay();
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getLocalDateStr(new Date());

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={handlePrevMonth}>&lt;</button>
        <div className={styles.title}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button className={styles.navBtn} onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className={styles.dayNames}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {daysInMonth.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className={`${styles.dayCard} ${styles.empty}`}></div>;
          }

          const dateStr = getLocalDateStr(day);
          const record = daysData[dateStr];
          const isToday = dateStr === todayStr;

          return (
            <div 
              key={dateStr} 
              className={`${styles.dayCard} ${isToday ? styles.today : ""}`}
              onClick={() => onDayClick(dateStr)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.dateLabel}>{day.getDate()}</div>
              {record ? (
                <div className={styles.stats}>
                  <div className={`${styles.statRow} ${styles.eaten}`}>
                    <span>🥘</span> <span>{record.totalEaten} kcal</span>
                  </div>
                  <div className={`${styles.statRow} ${styles.burned}`}>
                    <span>🔥</span> <span>{record.totalBurned} kcal</span>
                  </div>
                  <div className={`${styles.statRow} ${styles.steps}`}>
                    <span>👟</span> <span>{record.totalSteps}</span>
                  </div>
                  <div className={`${styles.statRow} ${styles.net}`}>
                    <span>Net</span> <span>{record.totalEaten - record.totalBurned}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.stats} style={{ color: "var(--text-secondary)" }}>
                  <div className={styles.statRow}>No data</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
