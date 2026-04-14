import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay   = (year, month) => new Date(year, month, 1).getDay();
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function Dashboard() {
  const navigate  = useNavigate();
  const username  = localStorage.getItem("username") || "Student";
  const userId    = localStorage.getItem("user_id");

  const [tasks,       setTasks]       = useState([]);
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [activeNav,   setActiveNav]   = useState("dashboard");
  const [calDate,     setCalDate]     = useState(new Date());
  const [form, setForm] = useState({
    task_name: "", subject_category: "",
    difficulty_level: "Medium", estimated_hours: "", deadline: "",
  });

  const today = new Date();

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    fetchTasks();
  }, []);

 const fetchTasks = async () => {
  if (!userId) return;
  try {
    const r = await fetch(`http://localhost:5000/api/tasks/${userId}`);
    if (!r.ok) {
      console.error('Failed to fetch tasks');
      return;
    }
    const d = await r.json();
    console.log('Tasks received:', d);  // Debug log
    setTasks(d.tasks || []);
  } catch(e) { 
    console.error('Error fetching tasks:', e); 
    setTasks([]);  // Set empty array on error
  }
};

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddTask = async e => {
    e.preventDefault();
    if (!form.task_name || !form.deadline) return;
    setSaving(true);
    try {
      const r = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_id: parseInt(userId) }),
      });
      if (r.ok) {
        setForm({ task_name:"", subject_category:"", difficulty_level:"Medium", estimated_hours:"", deadline:"" });
        setShowModal(false);
        fetchTasks();
      }
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const total     = tasks.length;
  const pending   = tasks.filter(t => t.status === "Pending").length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const overdue   = tasks.filter(t => new Date(t.deadline) < today && t.status !== "Completed").length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  const daysLeft = dl => {
    const d = Math.ceil((new Date(dl) - today) / 86400000);
    if (d < 0)   return { label: "Overdue",    cls: "over"  };
    if (d === 0) return { label: "Today",      cls: "today" };
    if (d <= 3)  return { label: `${d}d left`, cls: "soon"  };
    return        { label: `${d}d left`,       cls: "ok"    };
  };

  const subjectColor = s => {
    const map = { math:"#4f7cff", science:"#38b2ac", english:"#e67e51",
                  history:"#9b7fe8", work:"#c48b32", personal:"#e879a0" };
    return map[(s||"").toLowerCase()] || "#c48b32";
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --gold:   #c48b32;
          --gold2:  #e8a93e;
          --ink:    #18181b;
          --ink2:   #52525b;
          --ink3:   #a1a1aa;
          --bg:     #fafaf9;
          --card:   #ffffff;
          --border: #e4e4e7;
          --red:    #ef4444;
          --green:  #22c55e;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }

        .d-root {
          font-family: 'Outfit', sans-serif;
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
        }

        .d-sidebar {
          width: 220px;
          min-height: 100vh;
          background: var(--card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 28px 16px;
          position: fixed;
          top: 0; left: 0; bottom: 0;
        }
        .d-logo {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--gold);
          padding: 0 8px;
          margin-bottom: 4px;
        }
        .d-tagline {
          font-size: 10.5px;
          color: var(--ink3);
          padding: 0 8px;
          margin-bottom: 32px;
        }
        .d-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .d-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink2);
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'Outfit', sans-serif;
          transition: all 0.15s;
        }
        .d-nav-item:hover  { background: #f4f4f5; color: var(--ink); }
        .d-nav-item.active { background: #fdf3e3; color: var(--gold); font-weight: 600; }
        .d-nav-item .ni    { font-size: 15px; width: 20px; text-align: center; }
        .d-sidebar-foot {
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }
        .d-user-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 8px; margin-bottom: 8px;
        }
        .d-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          color: white; font-weight: 700; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .d-uname { font-size: 13px; font-weight: 600; color: var(--ink); }
        .d-urole { font-size: 11px; color: var(--ink3); }
        .d-logout {
          width: 100%; padding: 9px 12px;
          background: none; border: 1px solid var(--border);
          border-radius: 8px; color: var(--ink2);
          font-size: 13px; font-family: 'Outfit', sans-serif;
          cursor: pointer; text-align: left; transition: all 0.15s;
        }
        .d-logout:hover { border-color: var(--red); color: var(--red); background: #fef2f2; }

        .d-main {
          margin-left: 220px;
          flex: 1;
          padding: 40px 40px 60px;
        }
        .d-topbar {
          display: flex; justify-content: space-between;
          align-items: flex-end; margin-bottom: 36px;
        }
        .d-welcome {
          font-family: 'Lora', serif;
          font-size: 28px; font-weight: 600;
          color: var(--ink); line-height: 1.2;
        }
        .d-welcome em { font-style: italic; color: var(--gold); }
        .d-date-str { font-size: 12.5px; color: var(--ink3); margin-top: 5px; }
        .d-add-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 20px;
          background: var(--gold); color: white;
          border: none; border-radius: 9px;
          font-size: 13.5px; font-weight: 600;
          font-family: 'Outfit', sans-serif;
          cursor: pointer; transition: background 0.15s;
          white-space: nowrap;
        }
        .d-add-btn:hover { background: #a87328; }

        .d-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 32px;
        }
        .d-stat {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px 22px;
          position: relative; overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }
        .d-stat:nth-child(1){animation-delay:.05s}
        .d-stat:nth-child(2){animation-delay:.10s}
        .d-stat:nth-child(3){animation-delay:.15s}
        .d-stat:nth-child(4){animation-delay:.20s}
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .d-stat-label {
          font-size: 11px; font-weight: 500;
          color: var(--ink3); letter-spacing: 0.6px;
          text-transform: uppercase; margin-bottom: 8px;
        }
        .d-stat-val {
          font-family: 'Lora', serif;
          font-size: 38px; font-weight: 600; line-height: 1;
        }
        .d-stat-sub { font-size: 11.5px; color: var(--ink3); margin-top: 5px; }
        .d-stat-bar {
          position: absolute; bottom:0; left:0; right:0;
          height: 3px; background: var(--border);
        }
        .d-stat-bar-fill { height: 100%; border-radius: 2px; transition: width 0.8s ease; }

        .d-grid {
          display: grid;
          grid-template-columns: 1fr 296px;
          gap: 20px; align-items: start;
        }
        .d-section-head {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 14px;
        }
        .d-section-title {
          font-family: 'Lora', serif;
          font-size: 18px; font-weight: 600; color: var(--ink);
        }
        .d-count-badge {
          font-size: 11px; font-weight: 600;
          background: #f4f4f5; color: var(--ink2);
          padding: 3px 9px; border-radius: 20px;
        }

        .d-tasks { display: flex; flex-direction: column; gap: 10px; }
        .d-task {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
          display: flex; align-items: center; gap: 14px;
          transition: box-shadow 0.15s, transform 0.15s;
          animation: fadeUp 0.35s ease both;
        }
        .d-task:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }
        .d-task-stripe { width:4px; height:40px; border-radius:4px; flex-shrink:0; }
        .d-task-body   { flex:1; min-width:0; }
        .d-task-name {
          font-size: 14px; font-weight: 600; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .d-task-meta {
          display: flex; gap: 10px;
          font-size: 11.5px; color: var(--ink3); flex-wrap: wrap;
        }
        .d-pill {
          font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px; white-space: nowrap;
        }
        .d-dl {
          font-size: 11.5px; font-weight: 600;
          padding: 4px 10px; border-radius: 6px; white-space: nowrap;
        }
        .d-dl.ok    { background:#f0fdf4; color:#16a34a; }
        .d-dl.soon  { background:#fffbeb; color:#d97706; }
        .d-dl.today { background:#fdf3e3; color:var(--gold); }
        .d-dl.over  { background:#fef2f2; color:var(--red); }

        .d-empty {
          background: var(--card);
          border: 1px dashed var(--border);
          border-radius: 14px; padding: 56px 24px; text-align: center;
        }
        .d-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .d-empty-text { font-size: 15px; font-weight: 500; color: var(--ink2); }
        .d-empty-sub  { font-size: 13px; color: var(--ink3); margin-top: 4px; }

        .d-right { display: flex; flex-direction: column; gap: 20px; }

        .d-progress-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 22px;
          animation: fadeUp 0.4s ease 0.25s both;
        }
        .d-ring-wrap { display: flex; justify-content: center; margin: 18px 0 14px; }
        .d-ring-svg  { transform: rotate(-90deg); }
        .d-ring-track { fill:none; stroke:#f4f4f5; stroke-width:10; }
        .d-ring-fill  {
          fill:none; stroke:var(--gold); stroke-width:10;
          stroke-linecap:round; transition: stroke-dashoffset 1s ease;
        }
        .d-ring-num {
          font-family:'Lora',serif; font-size:22px; font-weight:600;
          fill:var(--ink); dominant-baseline:middle; text-anchor:middle;
        }
        .d-ring-sub2 {
          font-size:10px; fill:var(--ink3);
          dominant-baseline:middle; text-anchor:middle;
        }
        .d-progress-stats {
          display: flex; justify-content: space-around;
          border-top: 1px solid var(--border); padding-top: 14px;
        }
        .d-ps      { text-align: center; }
        .d-ps-val  { font-size: 18px; font-weight: 700; color: var(--ink); }
        .d-ps-lbl  { font-size: 11px; color: var(--ink3); margin-top: 2px; }

        .d-cal {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
          animation: fadeUp 0.4s ease 0.3s both;
        }
        .d-cal-head {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 14px;
        }
        .d-cal-title {
          font-family: 'Lora', serif;
          font-size: 15px; font-weight: 600; color: var(--ink);
        }
        .d-cal-nav {
          background: none; border: 1px solid var(--border);
          border-radius: 6px; width:26px; height:26px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; font-size:12px; color:var(--ink2); transition:all 0.15s;
        }
        .d-cal-nav:hover { background: #f4f4f5; }
        .d-cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px;
        }
        .d-cal-dayname {
          text-align:center; font-size:10px; font-weight:600;
          color:var(--ink3); padding: 4px 0 6px; letter-spacing:0.3px;
        }
        .d-cal-day {
          aspect-ratio:1; display:flex; align-items:center; justify-content:center;
          font-size:12px; border-radius:6px; color:var(--ink2); position:relative;
        }
        .d-cal-day.today-cell {
          background: var(--gold); color:white;
          font-weight:700; border-radius:50%;
        }
        .d-cal-day.has-deadline::after {
          content:''; position:absolute; bottom:2px;
          width:4px; height:4px; border-radius:50%; background:var(--red);
        }

        .d-upcoming {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
          animation: fadeUp 0.4s ease 0.35s both;
        }
        .d-upcoming-list { display:flex; flex-direction:column; gap:10px; margin-top:14px; }
        .d-uitem { display:flex; align-items:center; gap:10px; }
        .d-uitem-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .d-uitem-name {
          flex:1; font-size:12.5px; font-weight:500; color:var(--ink);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .d-uitem-date { font-size:11px; color:var(--ink3); white-space:nowrap; }

        .d-overlay {
          position:fixed; inset:0;
          background:rgba(0,0,0,0.35); backdrop-filter:blur(3px);
          display:flex; align-items:center; justify-content:center;
          z-index:200; animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .d-modal {
          background: var(--card); border-radius:18px;
          padding:32px; width:100%; max-width:460px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14);
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .d-modal-title {
          font-family:'Lora',serif; font-size:22px;
          font-weight:600; margin-bottom:6px; color:var(--ink);
        }
        .d-modal-sub { font-size:13px; color:var(--ink3); margin-bottom:24px; }
        .d-mform   { display:flex; flex-direction:column; gap:12px; }
        .d-mlabel  {
          display:block; font-size:11.5px; font-weight:600;
          color:var(--ink2); margin-bottom:5px;
          letter-spacing:0.3px; text-transform:uppercase;
        }
        .d-minput {
          width:100%; padding:12px 14px;
          border:1px solid var(--border); border-radius:9px;
          font-size:13.5px; font-family:'Outfit',sans-serif;
          color:var(--ink); background:var(--bg); outline:none;
          transition: border 0.15s, box-shadow 0.15s;
        }
        .d-minput:focus { border-color:var(--gold); box-shadow:0 0 0 3px #c48b3218; }
        .d-mrow { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .d-mactions { display:flex; gap:10px; margin-top:6px; }
        .d-mbtn-cancel {
          flex:1; padding:12px;
          border:1px solid var(--border); border-radius:9px;
          background:none; color:var(--ink2);
          font-size:13.5px; font-weight:500;
          font-family:'Outfit',sans-serif; cursor:pointer; transition:all 0.15s;
        }
        .d-mbtn-cancel:hover { background:#f4f4f5; }
        .d-mbtn-save {
          flex:1; padding:12px; border:none;
          border-radius:9px; background:var(--gold); color:white;
          font-size:13.5px; font-weight:600;
          font-family:'Outfit',sans-serif; cursor:pointer; transition:background 0.15s;
        }
        .d-mbtn-save:hover    { background:#a87328; }
        .d-mbtn-save:disabled { opacity:0.6; cursor:not-allowed; }

        @media(max-width:1024px){
          .d-stats { grid-template-columns:repeat(2,1fr); }
          .d-grid  { grid-template-columns:1fr; }
        }
        @media(max-width:720px){
          .d-sidebar { display:none; }
          .d-main    { margin-left:0; padding:24px 16px; }
        }
      `}</style>

      <div className="d-root">
        <aside className="d-sidebar">
          <div className="d-logo">TimeMap</div>
          <p className="d-tagline">Your study companion</p>
          <nav className="d-nav">
            {[
              { id:"dashboard", icon:"", label:"Dashboard" },
              { id:"tasks",     icon:"", label:"My Tasks" },
              { id:"calendar",  icon:"", label:"Calendar" },
              { id:"analytics", icon:"", label:"Analytics" },
              { id:"timer",     icon:"", label:"Focus Timer" },
            ].map(n => (
              <button
                key={n.id}
                className={`d-nav-item ${activeNav === n.id ? "active" : ""}`}
                onClick={() => setActiveNav(n.id)}
              >
                <span className="ni">{n.icon}</span> {n.label}
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
            <button className="d-logout" onClick={handleLogout}>🚪 &nbsp;Sign out</button>
          </div>
        </aside>

        <main className="d-main">
          <div className="d-topbar">
            <div>
              <h1 className="d-welcome">{greeting}, <em>{username}</em> :) </h1>
              <p className="d-date-str">
                {today.toLocaleDateString("en-US",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}
              </p>
            </div>
            <button className="d-add-btn" onClick={() => setShowModal(true)}>
              ＋&nbsp; New Task
            </button>
          </div>

          <div className="d-stats">
            {[
              { label:"Total Tasks",  val:total,     sub:"All subjects",    color:"#c48b32", pct:100 },
              { label:"Pending",      val:pending,   sub:"To study",        color:"#f59e0b", pct: total?(pending/total)*100:0 },
              { label:"Completed",    val:completed, sub:"Well done!",      color:"#ca9231", pct: total?(completed/total)*100:0 },
              { label:"Overdue",      val:overdue,   sub:"Needs attention", color:"#e5b71f", pct: total?(overdue/total)*100:0 },
            ].map(s => (
              <div className="d-stat" key={s.label}>
                <div className="d-stat-label">{s.label}</div>
                <div className="d-stat-val" style={{ color:s.color }}>{s.val}</div>
                <div className="d-stat-sub">{s.sub}</div>
                <div className="d-stat-bar">
                  <div className="d-stat-bar-fill" style={{ width:`${s.pct}%`, background:s.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="d-grid">
            <div>
              <div className="d-section-head">
                <h2 className="d-section-title">Study Tasks</h2>
                <span className="d-count-badge">{total} tasks</span>
              </div>
              {tasks.length === 0 ? (
                <div className="d-empty">
                  <div className="d-empty-icon"></div>
                  <div className="d-empty-text">No tasks yet</div>
                  <div className="d-empty-sub">Add your first study task to get started</div>
                </div>
              ) : (
                <div className="d-tasks">
                  {tasks.map((t, i) => {
                    const dl  = daysLeft(t.deadline);
                    const col = subjectColor(t.subject_category);
                    return (
                      <div className="d-task" key={t.id} style={{ animationDelay:`${i*0.05}s` }}>
                        <div className="d-task-stripe" style={{ background:col }} />
                        <div className="d-task-body">
                          <div className="d-task-name">{t.task_name}</div>
                          <div className="d-task-meta">
                            <span>📁 {t.subject_category || "General"}</span>
                            <span>📅 {t.deadline}</span>
                            <span>⚡ {t.risk || "Medium"} risk</span>
                          </div>
                        </div>
                        <span className="d-pill" style={{
                          background: t.status==="Completed" ? "#f0fdf4":"#fdf3e3",
                          color:      t.status==="Completed" ? "#16a34a":"#c48b32",
                        }}>{t.status}</span>
                        <span className={`d-dl ${dl.cls}`}>{dl.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="d-right">
              <div className="d-progress-card">
                <div className="d-section-head" style={{ marginBottom:0 }}>
                  <h2 className="d-section-title">Progress</h2>
                  <span className="d-count-badge">{pct}%</span>
                </div>
                <div className="d-ring-wrap">
                  {(() => {
                    const r = 52, circ = 2*Math.PI*r, offset = circ-(pct/100)*circ;
                    return (
                      <svg width="130" height="130" viewBox="0 0 130 130" className="d-ring-svg">
                        <circle className="d-ring-track" cx="65" cy="65" r={r}/>
                        <circle className="d-ring-fill"  cx="65" cy="65" r={r}
                          strokeDasharray={circ} strokeDashoffset={offset}/>
                        <text x="65" y="61" className="d-ring-num"  transform="rotate(90 65 65)">{pct}%</text>
                        <text x="65" y="76" className="d-ring-sub2" transform="rotate(90 65 65)">complete</text>
                      </svg>
                    );
                  })()}
                </div>
                <div className="d-progress-stats">
                  <div className="d-ps"><div className="d-ps-val" style={{color:"#22c55e"}}>{completed}</div><div className="d-ps-lbl">Done</div></div>
                  <div className="d-ps"><div className="d-ps-val" style={{color:"#f59e0b"}}>{pending}</div><div className="d-ps-lbl">Pending</div></div>
                  <div className="d-ps"><div className="d-ps-val" style={{color:"#ef4444"}}>{overdue}</div><div className="d-ps-lbl">Overdue</div></div>
                </div>
              </div>

              <div className="d-cal">
                <div className="d-cal-head">
                  <button className="d-cal-nav" onClick={() => setCalDate(new Date(cy, cm-1))}>‹</button>
                  <span className="d-cal-title">{MONTHS[cm]} {cy}</span>
                  <button className="d-cal-nav" onClick={() => setCalDate(new Date(cy, cm+1))}>›</button>
                </div>
                <div className="d-cal-grid">
                  {DAYS.map(d => <div className="d-cal-dayname" key={d}>{d}</div>)}
                  {Array.from({length:fd}).map((_,i) => <div key={`e${i}`} className="d-cal-day"/>)}
                  {Array.from({length:dim}).map((_,i) => {
                    const day = i+1;
                    const isToday = cy===today.getFullYear() && cm===today.getMonth() && day===today.getDate();
                    const hasDl   = deadlineDays.has(day);
                    return (
                      <div key={day} className={`d-cal-day ${isToday?"today-cell":""} ${hasDl&&!isToday?"has-deadline":""}`}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="d-upcoming">
                <h2 className="d-section-title">Upcoming Deadlines</h2>
                <div className="d-upcoming-list">
                  {tasks
                    .filter(t => new Date(t.deadline) >= today && t.status !== "Completed")
                    .sort((a,b) => new Date(a.deadline)-new Date(b.deadline))
                    .slice(0,5)
                    .map(t => (
                      <div className="d-uitem" key={t.id}>
                        <div className="d-uitem-dot" style={{ background:subjectColor(t.subject_category) }}/>
                        <div className="d-uitem-name">{t.task_name}</div>
                        <div className="d-uitem-date">{t.deadline}</div>
                      </div>
                    ))
                  }
                  {tasks.filter(t => new Date(t.deadline) >= today && t.status !== "Completed").length === 0 && (
                    <p style={{fontSize:"12.5px",color:"var(--ink3)"}}>No upcoming deadlines 🎉</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="d-overlay" onClick={() => setShowModal(false)}>
          <div className="d-modal" onClick={e => e.stopPropagation()}>
            <h2 className="d-modal-title">Add Study Task</h2>
            <p className="d-modal-sub">Fill in the details for your new task</p>
            <form className="d-mform" onSubmit={handleAddTask}>
              <div>
                <label className="d-mlabel">Task Name *</label>
                <input className="d-minput" name="task_name" placeholder="e.g. Chapter 5 revision"
                  value={form.task_name} onChange={handleChange} required/>
              </div>
              <div>
                <label className="d-mlabel">Subject / Category</label>
                <input className="d-minput" name="subject_category" placeholder="e.g. Math, Science, English"
                  value={form.subject_category} onChange={handleChange}/>
              </div>
              <div className="d-mrow">
                <div>
                  <label className="d-mlabel">Difficulty</label>
                  <select className="d-minput" name="difficulty_level"
                    value={form.difficulty_level} onChange={handleChange}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="d-mlabel">Est. Hours</label>
                  <input className="d-minput" name="estimated_hours" type="number"
                    placeholder="e.g. 2" value={form.estimated_hours} onChange={handleChange}/>
                </div>
              </div>
              <div>
                <label className="d-mlabel">Deadline *</label>
                <input className="d-minput" name="deadline" type="date"
                  value={form.deadline} onChange={handleChange} required/>
              </div>
              <div className="d-mactions">
                <button type="button" className="d-mbtn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="d-mbtn-save" disabled={saving}>
                  {saving ? "Saving…" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}