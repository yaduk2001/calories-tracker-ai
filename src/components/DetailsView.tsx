import { DayRecord } from "@/lib/types";

interface DetailsViewProps {
  dayRecord: DayRecord;
  onDeleteEvent: (dateStr: string, eventId: string) => void;
}

export default function DetailsView({ dayRecord, onDeleteEvent }: DetailsViewProps) {
  if (!dayRecord) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
        <h2>No Data found for this date.</h2>
        <p>Start a chat to log your meals and exercises!</p>
      </div>
    );
  }

  const { date, totalEaten, totalBurned, totalSteps, events } = dayRecord;
  const netCalories = totalEaten - totalBurned;

  // Format date nicely
  const formattedDate = new Date(date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Visual ratio bar logic
  const totalActivity = totalEaten + totalBurned;
  const eatenPct = totalActivity === 0 ? 50 : (totalEaten / totalActivity) * 100;
  const burnedPct = totalActivity === 0 ? 50 : (totalBurned / totalActivity) * 100;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", width: "100%", color: "var(--text-primary)", animation: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-1px", background: "linear-gradient(90deg, #fff, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {formattedDate}
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Daily Analytics & Insights</p>
        </div>
      </header>

      {/* Hero Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, padding: "1rem", opacity: 0.1, fontSize: "2.5rem" }}>🍔</div>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Consumed</h3>
          <p style={{ fontSize: "2.6rem", fontWeight: 700, color: "#ef4444", marginTop: "0.5rem", textShadow: "0 4px 20px rgba(239,68,68,0.3)" }}>{totalEaten}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>kcal</span>
        </div>
        
        <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, padding: "1rem", opacity: 0.1, fontSize: "2.5rem" }}>🔥</div>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Burned</h3>
          <p style={{ fontSize: "2.6rem", fontWeight: 700, color: "#10b981", marginTop: "0.5rem", textShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>{totalBurned}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>kcal</span>
        </div>
        
        <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, padding: "1rem", opacity: 0.1, fontSize: "2.5rem" }}>⚖️</div>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Net Balance</h3>
          <p style={{ fontSize: "2.6rem", fontWeight: 700, color: "#f8fafc", marginTop: "0.5rem", textShadow: "0 2px 15px rgba(255,255,255,0.2)" }}>{netCalories}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>kcal difference</span>
        </div>
        
        <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, padding: "1rem", opacity: 0.1, fontSize: "2.5rem" }}>👟</div>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Activity</h3>
          <p style={{ fontSize: "2.6rem", fontWeight: 700, color: "#3b82f6", marginTop: "0.5rem", textShadow: "0 4px 20px rgba(59,130,246,0.3)" }}>{totalSteps}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>total steps</span>
        </div>
      </div>

      {/* Energy Ratio Bar */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
          <span>Intake</span>
          <span>Output</span>
        </div>
        <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", display: "flex", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
          <div style={{ width: `${eatenPct}%`, background: "linear-gradient(90deg, #b91c1c, #ef4444)", transition: "width 1s ease" }} />
          <div style={{ width: `${burnedPct}%`, background: "linear-gradient(90deg, #10b981, #059669)", transition: "width 1s ease" }} />
        </div>
      </div>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1.5rem" }}>
        Chronological Log
      </h2>
      
      {events.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", fontStyle: "italic", color: "var(--text-secondary)" }}>
          No specific activities logged for this day.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {events.map((ev, idx) => (
            <div key={ev.id} className="glass-panel" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "transform 0.2s ease, background 0.2s ease", cursor: "default" }} onMouseOver={(e) => e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseOut={(e) => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: ev.type === "food" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", border: `1px solid ${ev.type === "food" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }}>
                  {ev.type === "food" ? "🍔" : "🔥"}
                </div>
                <div>
                  <p style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--text-primary)" }}>{ev.description}</p>
                  {ev.steps && <p style={{ fontSize: "0.8rem", color: "#3b82f6", marginTop: "2px", fontWeight: 600 }}>👟 {ev.steps} steps added</p>}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: "1.3rem", fontWeight: 700, color: ev.type === "food" ? "#ef4444" : "#10b981", textShadow: `0 2px 10px ${ev.type === "food" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }}>
                    {ev.type === "food" ? "+" : "-"}{ev.calories}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>kcal</span>
                </div>
                
                <button 
                  onClick={() => onDeleteEvent(date, ev.id)}
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "var(--text-secondary)", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
                  title="Remove Entry"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
