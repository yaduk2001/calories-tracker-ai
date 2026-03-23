"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import ChatInterface from "@/components/ChatInterface";
import CalendarView from "@/components/CalendarView";
import DetailsView from "@/components/DetailsView";
import SettingsView, { ThemeConfig } from "@/components/SettingsView";
import { useStorage } from "@/lib/storage";

export default function Home() {
  const [view, setView] = useState<"chat" | "calendar" | "details" | "settings">("chat");
  const { data, isLoaded, addMessage, processOperations, deleteEvent, clearData } = useStorage();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>({ type: "default", value: "" });

  useEffect(() => {
    const saved = localStorage.getItem("diet-ai-theme");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (theme.type === "solid" || theme.type === "gradient") {
      document.body.style.background = theme.value;
    } else if (theme.type === "image") {
      document.body.style.background = `url(${theme.value}) center/cover no-repeat fixed`;
      document.body.style.backgroundColor = "#000";
    } else {
      document.body.style.background = "var(--bg-gradient)";
    }
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    localStorage.setItem("diet-ai-theme", JSON.stringify(newTheme));
  };

  // Derive today's string in local timezone correctly
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [todayStr] = useState(getLocalDate());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const handleSendMessage = async (content: string, image?: string | null) => {
    if (!content.trim() && !image) return;

    // 1. Save User Message
    const userMsg = { id: Date.now().toString() + "_u", role: "user" as const, content, image: image || undefined, timestamp: new Date().toISOString() };
    addMessage(userMsg);

    setIsLoading(true);

    try {
      // Extract last 5 days for context
      const recentContext = Object.values(data.days)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-5)
        .map(day => ({ date: day.date, events: day.events }));

      // 2. Call API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: data.messages,
          message: content,
          image: image || undefined, // Send image to API
          clientDate: todayStr,
          clientTime: new Date().toLocaleTimeString(),
          recentContext,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch response");
      }

      const { reply, operations } = await res.json();

      // 3. Save AI Message
      addMessage({ id: Date.now().toString() + "_ai", role: "ai" as const, content: reply, timestamp: new Date().toISOString() });

      // 4. Run Operations
      if (operations && Array.isArray(operations) && operations.length > 0) {
        processOperations(operations);
      }

    } catch (err) {
      console.error(err);
      addMessage({ id: Date.now().toString() + "_err", role: "system" as const, content: "Sorry, I had trouble processing that request.", timestamp: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return <div style={{ color: "var(--text-primary)", padding: "2rem" }}>Loading...</div>;

  return (
    <div className={styles.layout}>
      {/* Sidebar Placeholder */}
      <aside className={styles.sidebar}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "var(--text-primary)" }}>
          Diet AI
        </h2>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            className={styles.toggleBtn}
            style={{ width: "100%", textAlign: "left", marginBottom: "1rem" }}
            onClick={() => setView("chat")}
          >
            + New Chat
          </button>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
            History
          </p>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
            {Object.keys(data.days).sort().reverse().map((dateStr) => {
              const d = data.days[dateStr];
              const isSelected = view === "details" && selectedDate === dateStr;

              // Localize dateStr to display cleanly without UTC timezone shift
              const dateObj = new Date(dateStr + "T12:00:00Z");

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setView("details");
                  }}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    background: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                    transition: "background 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = isSelected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = isSelected ? "rgba(255,255,255,0.1)" : "transparent")}
                >
                  <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                    {dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {d.events.length} items
                  </span>
                </div>
              );
            })}

            {Object.keys(data.days).length === 0 && (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "1rem" }}>No activity logs yet.</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            className={styles.toggleBtn}
            onClick={() => setView("settings")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: view === "settings" ? "rgba(255,255,255,0.1)" : "" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {view === "chat" ? "AI Assistant" : view === "calendar" ? "Calendar Overview" : view === "settings" ? "Settings" : "Daily Details"}
          </div>
          <button
            className={styles.toggleBtn}
            onClick={() => setView(view === "chat" ? "calendar" : "chat")}
          >
            {view === "chat" ? "View Calendar" : "Back to Chat"}
          </button>
        </header>

        <section className={styles.contentArea}>
          {view === "chat" ? (
            <ChatInterface
              messages={data.messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          ) : view === "calendar" ? (
            <CalendarView
              daysData={data.days}
              onDayClick={(dateStr) => {
                setSelectedDate(dateStr);
                setView("details");
              }}
            />
          ) : view === "settings" ? (
            <SettingsView currentTheme={theme} onThemeChange={handleThemeChange} />
          ) : (
            <DetailsView
              dayRecord={data.days[selectedDate]}
              onDeleteEvent={deleteEvent}
            />
          )}
        </section>
      </main>
    </div>
  );
}
