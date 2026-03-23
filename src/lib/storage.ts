"use client";

import { useState, useEffect } from "react";
import { StorageData, Message, DayRecord, CalorieEvent } from "./types";

const STORAGE_KEY = "calorie_tracker_data";

const defaultData: StorageData = {
  days: {},
  messages: [],
};

export function useStorage() {
  const [data, setData] = useState<StorageData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/storage?key=' + STORAGE_KEY)
      .then(res => res.json())
      .then(res => {
        if (res.value) {
          setData(typeof res.value === 'string' ? JSON.parse(res.value) : res.value);
        }
        setIsLoaded(true);
      })
      .catch(e => {
        console.error("Failed to load storage", e);
        setIsLoaded(true);
      });
  }, []);

  // Save to API whenever data changes
  useEffect(() => {
    if (isLoaded) {
      fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: STORAGE_KEY, value: data })
      }).catch(console.error);
    }
  }, [data, isLoaded]);

  const addMessage = (message: Message) => {
    setData((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  const addCalorieEvent = (dateStr: string, event: CalorieEvent) => {
    setData((prev) => {
      const dayRecord = prev.days[dateStr] || {
        date: dateStr,
        totalEaten: 0,
        totalBurned: 0,
        totalSteps: 0,
        events: [],
      };

      const newEvents = [...dayRecord.events, event];
      
      let eaten = 0;
      let burned = 0;
      let steps = 0;
      newEvents.forEach((e) => {
        if (e.type === "food") eaten += e.calories;
        if (e.type === "exercise") burned += e.calories;
        if (e.steps) steps += e.steps;
      });

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateStr]: {
            ...dayRecord,
            totalEaten: eaten,
            totalBurned: burned,
            totalSteps: steps,
            events: newEvents,
          },
        },
      };
    });
  };

  const processOperations = (ops: any[]) => {
    setData((prev) => {
      let newDays = { ...prev.days };
      
      ops.forEach(op => {
        if (!op || !op.date) return;
        if (!op.action) op.action = "add"; // Safely default
        
        const dateStr = op.date;
        let dayRecord = newDays[dateStr] || { date: dateStr, totalEaten: 0, totalBurned: 0, totalSteps: 0, events: [] };
        let newEvents = [...dayRecord.events];

        if (op.action === "add" && op.event) {
          newEvents.push({ id: Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9), ...op.event });
        } else if ((op.action === "edit" || op.action === "update") && op.event) {
          if (op.eventId && newEvents.some(ev => ev.id === op.eventId)) {
            newEvents = newEvents.map(ev => ev.id === op.eventId ? { ...ev, ...op.event, id: ev.id } : ev);
          } else {
            // If they tried to edit but ID doesn't exist, just add it!
            newEvents.push({ id: Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9), ...op.event });
          }
        } else if (op.action === "delete" && op.eventId) {
          newEvents = newEvents.filter(ev => ev.id !== op.eventId);
        }

        // Recalculate totals robustly
        let eaten = 0; let burned = 0; let steps = 0;
        newEvents.forEach(e => {
          if (e.type === "food") eaten += Number(e.calories) || 0;
          if (e.type === "exercise") burned += Number(e.calories) || 0;
          
          let s = 0;
          if (typeof e.steps === "number") s = e.steps;
          else if (typeof e.steps === "string") s = parseInt((e.steps as string).replace(/\D/g, ""), 10);
          
          if (!isNaN(s) && s > 0) steps += s;
        });

        newDays[dateStr] = { ...dayRecord, totalEaten: eaten, totalBurned: burned, totalSteps: steps, events: newEvents };
      });
      
      return { ...prev, days: newDays };
    });
  };

  const deleteEvent = (dateStr: string, eventId: string) => {
    setData((prev) => {
      let dayRecord = prev.days[dateStr];
      if (!dayRecord) return prev;

      let newEvents = dayRecord.events.filter(ev => ev.id !== eventId);
      
      let eaten = 0; let burned = 0; let steps = 0;
      newEvents.forEach(e => {
        if (e.type === "food") eaten += Number(e.calories) || 0;
        if (e.type === "exercise") burned += Number(e.calories) || 0;
        
        let s = 0;
        if (typeof e.steps === "number") s = e.steps;
        else if (typeof e.steps === "string") s = parseInt((e.steps as string).replace(/\D/g, ""), 10);
        
        if (!isNaN(s) && s > 0) steps += s;
      });

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateStr]: { ...dayRecord, totalEaten: eaten, totalBurned: burned, totalSteps: steps, events: newEvents },
        },
      };
    });
  };

  const clearData = () => {
    setData(defaultData);
    fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: STORAGE_KEY, value: defaultData })
    }).catch(console.error);
  };

  return {
    data,
    isLoaded,
    addMessage,
    processOperations,
    deleteEvent,
    clearData,
  };
}
