import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/img/logo1.png";
import {
  LogOut,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  Timer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay    = (year, month) => new Date(year, month, 1).getDay();

export default function CalendarPage() {
  const navigate  = useNavigate();
  const username  = localStorage.getItem("username") || "Student";
  const userId    = localStorage.getItem("user_id");

  const [tasks,     setTasks]     = useState([]);
  const [calDate,   setCalDate]   = useState(new Date());
  const [selected,  setSelected]  = useState(null); // selected day number
  const [activeNav, setActiveNav] = useState("calendar");

  const today = new Date();

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const r = await fetch(`http://localhost:5000/api/tasks/${userId}`);
      if (!r.ok) return;
      const d = await r.json();
      setTasks(d.tasks || []);
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard",   path: "/dashboard" },
    { id: "tasks",     Icon: CheckSquare,     label: "My Task",     path: "/tasks"     },
    { id: "calendar",  Icon: Calendar,        label: "Calendar",    path: "/calendar"  },
    { id: "analytics", Icon: BarChart2,       label: "Analytics",   path: "/analytics" },
    { id: "timer",     Icon: Timer,           label: "Focus Timer", path: "/timer"     },
  ];

  const cy  = calDate.getFullYear();
  const cm  = calDate.getMonth();
  const dim = getDaysInMonth(cy, cm);
  const fd  = getFirstDay(cy, cm);

  // Map: day number → tasks due that day (current month/year)
  const tasksByDay = {};
  tasks.forEach(t => {
    const d = new Date(t.deadline);
    if (d.getFullYear() === cy && d.getMonth() === cm) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const subjectColor = s => {
    const map = {
      math: "#4f7cff", science: "#38b2ac", english: "#e67e51",
      history: "#9b7fe8", work: "#c48b32", personal: "#e879a0",
    };
    return map[(s || "").toLowerCase()] || "#c48b32";
  };

  const daysLeft = dl => {
    const d = Math.ceil((new Date(dl) - today) / 86400000);
    if (d < 0)   return { label: "Overdue",    cls: "over"  };
    if (d === 0) return { label: "Today",      cls: "today" };
    if (d <= 3)  return { label: `${d}d left`, cls: "soon"  };
    return        { label: `${d}d left`,       cls: "ok"    };
  };

  // Tasks shown in side panel: selected day, or all upcoming
  const panelTasks = selected
    ? (tasksByDay[selected] || [])
    : tasks
        .filter(t => new Date(t.deadline) >= today && t.status !== "Completed")
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 10);

  const selectedDateLabel = selected
    ? `${DAYS_FULL[new Date(cy, cm, selected).getDay()]}, ${MONTHS[cm]} ${selected}`
    : "Upcoming Tasks";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --gold:    #c48b32;
          --gold2:   #e8a93e;
          --gold-bg: #fdf3e3;
          --ink:     #18181b;
          --ink2:    #52525b;
          --ink3:    #a1a1aa;
          --bg:      #fafaf9;
          --card:    #ffffff;
          --border:  #e4e4e7;
          --red:     #ef4444;
          --green:   #22c55e;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }

        .c-root {
          font-family: 'Inter', sans-serif;
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
        }

        /* ── SIDEBAR (identical to Dashboard) ── */
        .d-sidebar {
          width: 240px; min-height: 100vh;
          background: var(--card); border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          padding: 24px 16px 20px;
          position: fixed; top: 0; left: 0; bottom: 0;
        }
        .d-logo-row { display: flex; align-items: center; gap: 10px; padding: 0 4px; margin-bottom: 36px; }
        .d-logo-icon { width: 28px; height: 28px; background: transparent; display: flex; align-items: center; justify-content: center; }
        .d-logo-text { font-family: 'Lora', serif; font-size: 20px; font-weight: 600; color: var(--gold); }
        .d-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .d-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 14px;
          font-size: 14px; font-weight: 500; color: #94a3b8;
          cursor: pointer; background: transparent; border: none;
          width: 100%; text-align: left; font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .d-nav-item:hover { background: #f5f5f5; color: #1e293b; }
        .d-nav-item.active { background: white; color: #1e293b; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        .nav-icon {
          width: 34px; height: 34px; border-radius: 50%;
          background: #f3f4f6; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.2s;
        }
        .d-nav-item.active .nav-icon { background: var(--gold); color: white; }
        .d-nav-item.active .nav-icon svg { color: white; }
        .d-sidebar-foot { border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 8px; }
        .d-user-row { display: flex; align-items: center; gap: 10px; padding: 6px 4px; }
        .d-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          color: white; font-weight: 700; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-family: 'Inter', sans-serif;
        }
        .d-uname { font-size: 13px; font-weight: 600; color: var(--ink); }
        .d-urole { font-size: 11px; color: var(--ink3); }
        .d-logout {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 14px; background: none;
          border: 1px solid var(--border); border-radius: 10px;
          color: var(--ink2); font-size: 13.5px; font-family: 'Inter', sans-serif;
          font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .d-logout:hover { border-color: var(--red); color: var(--red); background: #fef2f2; }
        .d-logout .logout-icon-wrap {
          width: 28px; height: 28px; border-radius: 6px;
          background: #f4f4f5; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; transition: background 0.15s;
        }
        .d-logout:hover .logout-icon-wrap { background: #fee2e2; }

        /* ── MAIN ── */
        .c-main {
          margin-left: 240px; flex: 1;
          padding: 40px 40px 60px;
        }
        .c-topbar {
          display: flex; justify-content: space-between;
          align-items: flex-end; margin-bottom: 36px;
        }
        .c-title {
          font-family: 'Lora', serif;
          font-size: 28px; font-weight: 600;
          color: var(--ink); line-height: 1.2;
        }
        .c-title em { font-style: italic; color: var(--gold); }
        .c-subtitle { font-size: 12.5px; color: var(--ink3); margin-top: 5px; }

        /* ── LAYOUT ── */
        .c-body {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px; align-items: start;
        }

        /* ── BIG CALENDAR ── */
        .c-cal-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .c-cal-head {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 24px;
        }
        .c-cal-month-title {
          font-family: 'Lora', serif;
          font-size: 22px; font-weight: 600; color: var(--ink);
        }
        .c-cal-nav-group {
  display: flex;
  gap: 2px;   /* reduce spacing */
  align-items: center;
}
        .c-cal-nav {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: white;
  border: 1px solid var(--border);

  color: #18181b;

  cursor: pointer;
  border-radius: 8px;

  transition: all 0.15s ease;
}
     .c-cal-nav:hover {
  background: #f4f4f5;
  border-color: #a1a1aa;
  transform: scale(1.05);
}
        .c-today-btn {
          padding: 6px 14px; border-radius: 8px;
          background: var(--gold-bg); border: 1px solid #e8c98a;
          color: var(--gold); font-size: 12px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.15s;
        }
        .c-today-btn:hover { background: #f5e2c0; }

        .c-grid {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
        }
        .c-dayname {
          text-align: center; font-size: 11px; font-weight: 600;
          color: var(--ink3); padding: 6px 0 10px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .c-day {
          min-height: 80px;
          border-radius: 10px; padding: 6px 7px;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.15s; position: relative;
          background: transparent;
        }
        .c-day:hover { background: #f8f8f7; border-color: var(--border); }
        .c-day.today-cell {
          background: var(--gold-bg);
          border-color: var(--gold) !important;
        }
        .c-day.selected-cell {
          background: #fff8ee;
          border-color: var(--gold2) !important;
          box-shadow: 0 0 0 3px #c48b3218;
        }
        .c-day.other-month { opacity: 0.3; pointer-events: none; }
        .c-day-num {
          font-size: 13px; font-weight: 600; color: var(--ink2);
          margin-bottom: 4px; display: block;
        }
        .c-day.today-cell .c-day-num {
          color: var(--gold); font-weight: 700;
        }
        .c-day-dots { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px; }
        .c-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        }
        .c-task-chip {
          font-size: 10px; font-weight: 500;
          padding: 2px 5px; border-radius: 4px;
          white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; max-width: 100%;
          margin-top: 2px; display: block;
        }

        /* ── SIDE PANEL ── */
        .c-panel {
          display: flex; flex-direction: column; gap: 16px;
        }

        .c-panel-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
          animation: fadeUp 0.4s ease 0.15s both;
        }
        .c-panel-head {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 14px;
        }
        .c-panel-title {
          font-family: 'Lora', serif;
          font-size: 16px; font-weight: 600; color: var(--ink);
        }
        .c-panel-date {
          font-size: 11.5px; color: var(--ink3); margin-bottom: 14px;
        }
        .c-badge {
          font-size: 11px; font-weight: 600;
          background: #f4f4f5; color: var(--ink2);
          padding: 3px 9px; border-radius: 20px;
        }
        .c-panel-empty {
          text-align: center; padding: 28px 0;
        }
        .c-panel-empty-icon { font-size: 28px; margin-bottom: 8px; }
        .c-panel-empty-text { font-size: 13px; color: var(--ink3); }

        .c-task-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          animation: fadeUp 0.3s ease both;
        }
        .c-task-item:last-child { border-bottom: none; padding-bottom: 0; }
        .c-task-stripe { width: 3px; height: 38px; border-radius: 3px; flex-shrink: 0; margin-top: 2px; }
        .c-task-info { flex: 1; min-width: 0; }
        .c-task-name {
          font-size: 13px; font-weight: 600; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 3px;
        }
        .c-task-meta { font-size: 11px; color: var(--ink3); }
        .c-dl {
          font-size: 10.5px; font-weight: 600;
          padding: 3px 8px; border-radius: 5px; white-space: nowrap;
          flex-shrink: 0; align-self: flex-start; margin-top: 2px;
        }
        .c-dl.ok    { background: #f0fdf4; color: #16a34a; }
        .c-dl.soon  { background: #fffbeb; color: #d97706; }
        .c-dl.today { background: #fdf3e3; color: var(--gold); }
        .c-dl.over  { background: #fef2f2; color: var(--red); }

        /* Clear selection */
        .c-clear-btn {
          background: none; border: none;
          color: var(--gold); font-size: 12px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer; padding: 2px 0;
        }
        .c-clear-btn:hover { text-decoration: underline; }

        @media (max-width: 1024px) {
          .c-body { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .d-sidebar { display: none; }
          .c-main { margin-left: 0; padding: 24px 16px; }
          .c-day { min-height: 56px; }
        }
      `}</style>

      <div className="c-root">
        {/* ── SIDEBAR ── */}
        <aside className="d-sidebar">
          <div className="d-logo-row">
            <div className="d-logo-icon">
              <img src={logo1} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span className="d-logo-text">TimeMap</span>
          </div>

          <nav className="d-nav">
            {navItems.map(({ id, Icon, label, path }) => (
              <button
                key={id}
                className={`d-nav-item ${activeNav === id ? "active" : ""}`}
                onClick={() => { setActiveNav(id); navigate(path); }}
              >
                <span className="nav-icon">
                  <Icon size={16} strokeWidth={2} />
                </span>
                {label}
              </button>
            ))}
          </nav>

          <div className="d-sidebar-foot">
            <div className="d-user-row">
              <div className="d-avatar">{username[0].toUpperCase()}</div>
              <div>
                <div className="d-uname">{username}</div>
                <div className="d-urole">Student</div>
              </div>
            </div>
            <button className="d-logout" onClick={handleLogout}>
              <span className="logout-icon-wrap">
                <LogOut size={14} strokeWidth={2} />
              </span>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="c-main">
          <div className="c-topbar">
            <div>
              <h1 className="c-title">Study <em>Calendar</em></h1>
              <p className="c-subtitle">
                {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>



          <div className="c-body">
            {/* ── BIG CALENDAR ── */}
            <div className="c-cal-card">
              <div className="c-cal-head">
                <span className="c-cal-month-title">{MONTHS[cm]} {cy}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    className="c-today-btn"
                    onClick={() => { setCalDate(new Date()); setSelected(null); }}
                  >
                    Today
                  </button>
                  <div className="c-cal-nav-group">
                   <button
  className="c-cal-nav"
  onClick={() => { setCalDate(new Date(cy, cm - 1)); setSelected(null); }}
>
  <ChevronLeft size={16} color="#18181b" />
</button>

<button
  className="c-cal-nav"
  onClick={() => { setCalDate(new Date(cy, cm + 1)); setSelected(null); }}
>
  <ChevronRight size={16} color="#18181b" />
</button>
                  </div>
                </div>
              </div>

              <div className="c-grid">
                {DAYS_SHORT.map(d => (
                  <div className="c-dayname" key={d}>{d}</div>
                ))}

                {/* Leading empty cells */}
                {Array.from({ length: fd }).map((_, i) => (
                  <div key={`e${i}`} className="c-day other-month" />
                ))}

                {/* Day cells */}
                {Array.from({ length: dim }).map((_, i) => {
                  const day     = i + 1;
                  const isToday = cy === today.getFullYear() && cm === today.getMonth() && day === today.getDate();
                  const isSel   = selected === day;
                  const dayTasks = tasksByDay[day] || [];

                  return (
                    <div
                      key={day}
                      className={`c-day ${isToday ? "today-cell" : ""} ${isSel ? "selected-cell" : ""}`}
                      onClick={() => setSelected(isSel ? null : day)}
                    >
                      <span className="c-day-num">{day}</span>

                      {/* Show up to 2 task chips, rest as dots */}
                      {dayTasks.slice(0, 2).map(t => (
                        <span
                          key={t.id}
                          className="c-task-chip"
                          style={{
                            background: subjectColor(t.subject_category) + "22",
                            color: subjectColor(t.subject_category),
                          }}
                        >
                          {t.task_name}
                        </span>
                      ))}

                      {dayTasks.length > 2 && (
                        <div className="c-day-dots">
                          {dayTasks.slice(2).map(t => (
                            <div
                              key={t.id}
                              className="c-dot"
                              style={{ background: subjectColor(t.subject_category) }}
                              title={t.task_name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── SIDE PANEL ── */}
            <div className="c-panel">
              <div className="c-panel-card">
                <div className="c-panel-head">
                  <span className="c-panel-title">{selectedDateLabel}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {selected && (
                      <button className="c-clear-btn" onClick={() => setSelected(null)}>
                        Clear
                      </button>
                    )}
                    <span className="c-badge">{panelTasks.length}</span>
                  </div>
                </div>

                {!selected && (
                  <p className="c-panel-date">Next upcoming tasks</p>
                )}

                {panelTasks.length === 0 ? (
                  <div className="c-panel-empty">
                    <div className="c-panel-empty-icon">
                      {selected ? "📭" : "🎉"}
                    </div>
                    <div className="c-panel-empty-text">
                      {selected ? "No tasks due on this day" : "No upcoming tasks!"}
                    </div>
                  </div>
                ) : (
                  <div>
                    {panelTasks.map((t, i) => {
                      const dl  = daysLeft(t.deadline);
                      const col = subjectColor(t.subject_category);
                      return (
                        <div className="c-task-item" key={t.id} style={{ animationDelay: `${i * 0.05}s` }}>
                        
                          <div className="c-task-info">
                            <div className="c-task-name">{t.task_name}</div>
                            <div className="c-task-meta">
                              📁 {t.subject_category || "General"} &nbsp;·&nbsp; {t.deadline}
                            </div>
                          </div>
                          <span className={`c-dl ${dl.cls}`}>{dl.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
