import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/img/logo1.png";
import {
  LogOut, LayoutDashboard, CheckSquare, Calendar as CalendarIcon, BarChart2, Timer,
  CheckCircle2, Circle, Plus, Check, Clock, AlertTriangle, ArrowRight
} from "lucide-react";

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay   = (year, month) => new Date(year, month, 1).getDay();
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function Dashboard() {
  const navigate  = useNavigate();
  const username  = localStorage.getItem("username") || "Student";
  const userId    = localStorage.getItem("user_id");

  const [tasks, setTasks] = useState([]);
  const [calDate, setCalDate] = useState(new Date());

  const today = new Date();

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    if (!userId) return;
    try {
      const r = await fetch(`http://localhost:5000/api/tasks/${userId}`);
      if (!r.ok) return;
      const d = await r.json();
      setTasks(d.tasks || []);
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTasks();
    } catch (err) { console.error(err); }
  };

  const total     = tasks.length;
  const pending   = tasks.filter(t => t.status === "Pending").length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const overdue   = tasks.filter(t => new Date(t.deadline) < today && t.status !== "Completed").length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  const daysLeft = dl => {
    const d = Math.ceil((new Date(dl) - today) / 86400000);
    if (d < 0)   return { label: "Overdue", cls: "over" };
    if (d === 0) return { label: "Today", cls: "today" };
    if (d <= 3)  return { label: `${d}d left`, cls: "soon" };
    return { label: `${d}d left`, cls: "ok" };
  };

  const cy  = calDate.getFullYear();
  const cm  = calDate.getMonth();
  const dim = getDaysInMonth(cy, cm);
  const fd  = getFirstDay(cy, cm);
  const deadlineDays = new Set(
    tasks.map(t => {
      const d = new Date(t.deadline);
      return d.getFullYear() === cy && d.getMonth() === cm ? d.getDate() : null;
    }).filter(Boolean)
  );

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const navItems = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard",   path: "/dashboard" },
    { id: "tasks",     Icon: CheckSquare,     label: "My Task",     path: "/tasks"     },
    { id: "calendar",  Icon: CalendarIcon,    label: "Calendar",    path: "/calendar"  },
    { id: "analytics", Icon: BarChart2,       label: "Analytics",   path: "/analytics" },
    { id: "timer",     Icon: Timer,           label: "Focus Timer", path: "/timer"     },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        :root {
          --gold-50: #fdf3e0;
--gold-100: #f8e4bd;
--gold-800: #7a5220;
          --gold: #c48b32; --gold2: #e8a93e; --gold-light: #fef7ec;
          --ink: #0f172a; --ink2: #475569; --ink3: #94a3b8;
          --bg: #f8fafc; --card: #ffffff;
          --red: #ef4444; --red-light: #fef2f2;
          --green: #10b981; --green-light: #ecfdf5;
          --orange: #f59e0b; --orange-light: #fffbeb;
          --shadow-sm: 0 2px 8px rgba(0,0,0,0.02);
          --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.04);
          --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.06);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--ink); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        
        .premium-root { display: flex; min-height: 100vh; }

        /* ── SIDEBAR ── */
        .p-sidebar {
          width: 260px; background: var(--card);
          display: flex; flex-direction: column;
          padding: 32px 20px 24px; position: fixed;
          top: 0; left: 0; bottom: 0; z-index: 50;
          box-shadow: 1px 0 24px rgba(0,0,0,0.02);
        }
        .p-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; padding-left: 8px; }
        .p-logo-img { width: 32px; height: 32px; object-fit: contain; }
        .p-logo-txt { font-family: 'Lora', serif; font-size: 22px; font-weight: 600; color: var(--gold); letter-spacing: -0.5px; }

        .p-nav { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .p-nav-btn {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px; border-radius: 12px;
          border: none; background: transparent;
          font-size: 14.5px; font-weight: 500; color: var(--ink2);
          cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left; font-family: inherit;
        }
        .p-nav-btn:hover { background: var(--bg); color: var(--ink); transform: translateX(2px); }
        .p-nav-btn.active {
          background: var(--ink); color: white;
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15);
        }
        .p-nav-icon { opacity: 0.7; transition: opacity 0.25s; }
        .p-nav-btn.active .p-nav-icon { opacity: 1; color: var(--gold2); }

        .p-user {
          margin-top: auto; padding: 16px;
          background: var(--bg); border-radius: 16px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .p-user-info { display: flex; align-items: center; gap: 12px; }
        .p-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          color: white; font-weight: 600; display: flex; align-items: center; justify-content: center;
        }
        .p-user-name { font-size: 13.5px; font-weight: 600; color: var(--ink); }
        .p-user-role { font-size: 12px; color: var(--ink3); }
        .p-logout {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 10px; border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.05); background: white;
          color: var(--ink2); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .p-logout:hover { color: var(--red); border-color: var(--red-light); background: var(--red-light); }

        /* ── MAIN AREA ── */
        .p-main { margin-left: 260px; flex: 1; padding: 48px 56px 80px; max-width: 1400px; }
        
        .p-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; animation: slideDown 0.5s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        .p-greeting { font-family: 'Lora', serif; font-size: 34px; font-weight: 500; color: var(--ink); letter-spacing: -0.5px; margin-bottom: 8px; }
        .p-greeting em { color: var(--gold); font-style: normal; font-weight: 400; }
        .p-date { font-size: 14px; color: var(--ink3); font-weight: 400; letter-spacing: 0.2px; }
        
        .p-add-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 100px;
          background: var(--ink); color: white; border: none;
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(15,23,42,0.1);
        }
        .p-add-btn:hover { transform: translateY(-2px); background: #1e293b; box-shadow: 0 8px 20px rgba(15,23,42,0.2); }

        /* ── KPI CARDS ── */
 .p-kpis { display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 48px; }

.p-kpi {
  border-radius: 22px; padding: 26px;
  background: linear-gradient(160deg, var(--gold-50) 0%, var(--gold-100) 100%);
  border: 1px solid rgba(196, 139, 50, 0.12);
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s, box-shadow 0.3s;
  animation: fadeUp 0.6s ease-out backwards;
}
.p-kpi:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.p-kpi:nth-child(1) { animation-delay: 0.1s; }
.p-kpi:nth-child(2) { animation-delay: 0.2s; }
.p-kpi:nth-child(3) { animation-delay: 0.3s; }
.p-kpi:nth-child(4) { animation-delay: 0.4s; }

.p-kpi.hero {
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
  border: none;
  box-shadow: 0 12px 28px rgba(196, 139, 50, 0.3);
}

.p-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.p-kpi-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(196, 139, 50, 0.14); color: var(--gold-800); }
.p-kpi.hero .p-kpi-icon { background: rgba(255,255,255,0.22); color: white; }

.p-kpi-val { font-family: 'Lora', serif; font-size: 40px; font-weight: 500; line-height: 1; margin-bottom: 6px; letter-spacing: -1px; color: var(--gold-800); }
.p-kpi.hero .p-kpi-val { color: white; }
.p-kpi-val.stat-green { color: #15803d; }
.p-kpi-val.stat-red   { color: #b91c1c; }

.p-kpi-lbl { font-size: 14px; font-weight: 500; color: var(--ink2); margin-bottom: 8px; }
.p-kpi.hero .p-kpi-lbl { color: rgba(255,255,255,0.92); }

.p-kpi-sub { font-size: 12.5px; color: var(--gold-800); opacity: 0.75; }
.p-kpi.hero .p-kpi-sub { color: rgba(255,255,255,0.78); opacity: 1; }

        /* ── GRID LAYOUT ── */
        .p-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; }

        .p-section-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 500; color: var(--ink); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .p-badge { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; background: var(--bg); color: var(--ink3); }

        /* ── TASK LIST ── */
        .p-task-list { display: flex; flex-direction: column; gap: 12px; animation: fadeUp 0.6s ease-out 0.3s backwards; }
        .p-task {
          background: var(--card); border-radius: 16px; padding: 18px 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: var(--shadow-sm); transition: all 0.25s ease; border: 1px solid transparent;
        }
        .p-task:hover { box-shadow: var(--shadow-md); border-color: rgba(15,23,42,0.05); transform: scale(1.005); }
        .p-task.completed { opacity: 0.6; }
        
        .p-task-check {
          color: var(--ink3); cursor: pointer; transition: color 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .p-task-check:hover { color: var(--gold); }
        .p-task.completed .p-task-check { color: var(--green); }
        
        .p-task-content { flex: 1; min-width: 0; }
        .p-task-name { font-size: 15px; font-weight: 500; color: var(--ink); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .p-task.completed .p-task-name { text-decoration: line-through; color: var(--ink2); }
        .p-task-meta { display: flex; gap: 16px; font-size: 12px; color: var(--ink3); }
        .p-task-meta span { display: flex; align-items: center; gap: 4px; }
        
        .p-task-dl { font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 8px; }
        .p-task-dl.ok { background: var(--bg); color: var(--ink2); }
        .p-task-dl.soon { background: var(--orange-light); color: #d97706; }
        .p-task-dl.today { background: var(--gold-light); color: var(--gold); }
        .p-task-dl.over { background: var(--red-light); color: var(--red); }

        .p-task-action { opacity: 0; transform: translateX(10px); transition: all 0.2s; font-size: 12px; font-weight: 500; color: var(--gold); cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; background: var(--gold-light); border: none; }
        .p-task:hover .p-task-action { opacity: 1; transform: translateX(0); }

        /* ── RIGHT COLUMN ── */
        .p-right { display: flex; flex-direction: column; gap: 32px; animation: fadeUp 0.6s ease-out 0.4s backwards; }

        .p-progress { background: var(--card); border-radius: 24px; padding: 32px; box-shadow: var(--shadow-md); position: relative; overflow: hidden; }
        .p-prog-circle { display: flex; justify-content: center; margin: 10px 0 32px; position: relative; }
        .p-prog-svg { transform: rotate(-90deg); filter: drop-shadow(0 4px 12px rgba(196, 139, 50, 0.2)); }
        .p-prog-track { fill: none; stroke: var(--bg); stroke-width: 12; }
        .p-prog-fill { fill: none; stroke: url(#gold-grad); stroke-width: 12; stroke-linecap: round; transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .p-prog-txt { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .p-prog-val { font-family: 'Lora', serif; font-size: 36px; font-weight: 500; color: var(--ink); line-height: 1; }
        .p-prog-lbl { font-size: 12px; color: var(--ink3); margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }

        .p-cal { background: var(--card); border-radius: 24px; padding: 28px; box-shadow: var(--shadow-md); }
        .p-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .p-cal-title { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: var(--ink); }
        .p-cal-nav { display: flex; gap: 8px; }
        .p-cal-btn { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--bg); background: white; color: var(--ink2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .p-cal-btn:hover { background: var(--bg); color: var(--ink); }
        .p-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .p-cal-dname { text-align: center; font-size: 11px; font-weight: 500; color: var(--ink3); margin-bottom: 8px; }
        .p-cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: var(--ink); border-radius: 10px; cursor: default; position: relative; transition: all 0.2s; }
        .p-cal-day:hover { background: var(--bg); }
        .p-cal-day.today { background: var(--ink); color: white; box-shadow: 0 4px 12px rgba(15,23,42,0.2); }
        .p-cal-day.has-dl::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: var(--gold); }
        .p-cal-day.today.has-dl::after { background: white; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media(max-width:1024px){
          .p-kpis { grid-template-columns: repeat(2, 1fr); }
          .p-grid { grid-template-columns: 1fr; }
        }
        @media(max-width:720px){
          .p-sidebar { display: none; }
          .p-main { margin-left: 0; padding: 32px 24px; }
        }
      `}</style>

      <div className="premium-root">
        
        <aside className="p-sidebar">
          <div className="p-logo">
            <img src={logo1} alt="Logo" className="p-logo-img" />
            <span className="p-logo-txt">TimeMap</span>
          </div>
          <nav className="p-nav">
            {navItems.map(({ id, Icon, label, path }) => (
              <button key={id} className={`p-nav-btn ${id === "dashboard" ? "active" : ""}`} onClick={() => navigate(path)}>
                <Icon size={18} strokeWidth={2} className="p-nav-icon" />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-user">
            <div className="p-user-info">
              <div className="p-avatar">{username[0].toUpperCase()}</div>
              <div>
                <div className="p-user-name">{username}</div>
                <div className="p-user-role">Student</div>
              </div>
            </div>
            <button className="p-logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>

        <main className="p-main">
          <header className="p-header">
            <div>
              <h1 className="p-greeting">{greeting}, <em>{username}</em></h1>
              <p className="p-date">{today.toLocaleDateString("en-US",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
            </div>
            <button className="p-add-btn" onClick={() => navigate('/tasks')}>
              <Plus size={18} strokeWidth={2.5} /> New Task
            </button>
          </header>

          {/* <div className="p-kpis">
            <div className="p-kpi">
              <div className="p-kpi-bg" style={{ background: 'var(--ink)' }} />
              <div className="p-kpi-icon" style={{ background: 'var(--bg)', color: 'var(--ink)' }}><CheckSquare size={20} /></div>
              <div className="p-kpi-val">{total}</div>
              <div className="p-kpi-lbl">Total Tasks</div>
            </div>
            <div className="p-kpi">
              <div className="p-kpi-bg" style={{ background: 'var(--orange)' }} />
              <div className="p-kpi-icon" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}><Clock size={20} /></div>
              <div className="p-kpi-val">{pending}</div>
              <div className="p-kpi-lbl">Pending</div>
            </div>
            <div className="p-kpi">
              <div className="p-kpi-bg" style={{ background: 'var(--green)' }} />
              <div className="p-kpi-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}><Check size={20} /></div>
              <div className="p-kpi-val">{completed}</div>
              <div className="p-kpi-lbl">Completed</div>
            </div>
            <div className="p-kpi">
              <div className="p-kpi-bg" style={{ background: 'var(--red)' }} />
              <div className="p-kpi-icon" style={{ background: 'var(--red-light)', color: 'var(--red)' }}><AlertTriangle size={20} /></div>
              <div className="p-kpi-val">{overdue}</div>
              <div className="p-kpi-lbl">Overdue</div>
            </div>
          </div> */}

          <div className="p-kpis">
  <div className="p-kpi hero">
    <div className="p-kpi-top">
      <div className="p-kpi-icon"><CheckSquare size={18} /></div>
    </div>
    <div className="p-kpi-val">{total}</div>
    <div className="p-kpi-lbl">Total tasks</div>
    <div className="p-kpi-sub">{pct}% completed so far</div>
  </div>

  <div className="p-kpi">
    <div className="p-kpi-top">
      <div className="p-kpi-icon"><Clock size={18} /></div>
    </div>
    <div className="p-kpi-val">{pending}</div>
    <div className="p-kpi-lbl">Pending</div>
    <div className="p-kpi-sub">Due soon</div>
  </div>

  <div className="p-kpi">
    <div className="p-kpi-top">
      <div className="p-kpi-icon"><Check size={18} /></div>
    </div>
    <div className="p-kpi-val stat-green">{completed}</div>
    <div className="p-kpi-lbl">Completed</div>
    <div className="p-kpi-sub">Keep it going</div>
  </div>

  <div className="p-kpi">
    <div className="p-kpi-top">
      <div className="p-kpi-icon"><AlertTriangle size={18} /></div>
    </div>
    <div className="p-kpi-val stat-red">{overdue}</div>
    <div className="p-kpi-lbl">Overdue</div>
    <div className="p-kpi-sub">{overdue > 0 ? "Needs attention" : "All caught up"}</div>
  </div>
</div>

          <div className="p-grid">
            
            <div className="p-tasks-sec">
              <h2 className="p-section-title">
                Recent Tasks <span className="p-badge">{pending} left</span>
              </h2>
              
              {tasks.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--card)', borderRadius: '24px', border: '1px dashed var(--ink3)' }}>
                  <p style={{ color: 'var(--ink2)', fontWeight: 500 }}>No tasks found. Time to relax!</p>
                </div>
              ) : (
                <div className="p-task-list">
                  {tasks.sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).map((t) => {
                    const dl = daysLeft(t.deadline);
                    const isDone = t.status === "Completed";
                    return (
                      <div className={`p-task ${isDone ? 'completed' : ''}`} key={t.id}>
                        <div className="p-task-check" onClick={() => updateStatus(t.id, isDone ? "Pending" : "Completed")}>
                          {isDone ? <CheckCircle2 size={24} strokeWidth={1.5} /> : <Circle size={24} strokeWidth={1.5} />}
                        </div>
                        <div className="p-task-content">
                          <div className="p-task-name">{t.task_name}</div>
                          <div className="p-task-meta">
                            <span><CalendarIcon size={12}/> {t.deadline}</span>
                            <span>{t.subject_category || "General"}</span>
                          </div>
                        </div>
                        <span className={`p-task-dl ${dl.cls}`}>{dl.label}</span>
                        {!isDone && (
                          <button className="p-task-action" onClick={() => navigate(`/tasks/${t.id}`)}>
                            View <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-right">
              <div className="p-progress">
                <h2 className="p-section-title" style={{ marginBottom: 0 }}>Overview</h2>
                <div className="p-prog-circle">
                  <svg width="180" height="180" viewBox="0 0 180 180" className="p-prog-svg">
                    <defs>
                      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--gold2)" />
                        <stop offset="100%" stopColor="var(--gold)" />
                      </linearGradient>
                    </defs>
                    <circle className="p-prog-track" cx="90" cy="90" r="76" />
                    <circle className="p-prog-fill" cx="90" cy="90" r="76" 
                      strokeDasharray={2 * Math.PI * 76} 
                      strokeDashoffset={(2 * Math.PI * 76) * (1 - pct / 100)} 
                    />
                  </svg>
                  <div className="p-prog-txt">
                    <span className="p-prog-val">{pct}%</span>
                    <span className="p-prog-lbl">Done</span>
                  </div>
                </div>
              </div>

              <div className="p-cal">
                <div className="p-cal-head">
                  <div className="p-cal-title">{MONTHS[cm]} {cy}</div>
                  <div className="p-cal-nav">
                    <button className="p-cal-btn" onClick={() => setCalDate(new Date(cy, cm-1))}>‹</button>
                    <button className="p-cal-btn" onClick={() => setCalDate(new Date(cy, cm+1))}>›</button>
                  </div>
                </div>
                <div className="p-cal-grid">
                  {DAYS.map(d => <div className="p-cal-dname" key={d}>{d}</div>)}
                  {Array.from({length:fd}).map((_,i) => <div key={`e${i}`}/>)}
                  {Array.from({length:dim}).map((_,i) => {
                    const day = i+1;
                    const isToday = cy===today.getFullYear() && cm===today.getMonth() && day===today.getDate();
                    const hasDl   = deadlineDays.has(day);
                    return (
                      <div key={day} className={`p-cal-day ${isToday?'today':''} ${hasDl?'has-dl':''}`}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </>
  );
}