import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo1 from "../assets/img/logo1.png";
import {
  LogOut, LayoutDashboard, CheckSquare,
  Calendar, BarChart2, Timer, ArrowLeft, Clock, AlertCircle, BookOpen, AlertTriangle
} from "lucide-react";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Student";
  const userId   = localStorage.getItem("user_id");

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const r = await fetch(`http://localhost:5000/api/task/${id}`);
      if (!r.ok) {
        navigate("/tasks");
        return;
      }
      const d = await r.json();
      setTask(d.task);
    } catch (e) {
      console.error(e);
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const daysLeft = dl => {
    const today = new Date();
    const d = Math.ceil((new Date(dl) - today) / 86400000);
    if (d < 0)   return { label: "Overdue",    cls: "over"  };
    if (d === 0) return { label: "Today",      cls: "today" };
    if (d <= 3)  return { label: `${d}d left`, cls: "soon"  };
    return        { label: `${d}d left`,       cls: "ok"    };
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) navigate("/tasks");
    } catch (err) { console.error(err); }
  };

  const navItems = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard",   path: "/dashboard" },
    { id: "tasks",     Icon: CheckSquare,     label: "My Task",     path: "/tasks"     },
    { id: "calendar",  Icon: Calendar,        label: "Calendar",    path: "/calendar"  },
    { id: "analytics", Icon: BarChart2,       label: "Analytics",   path: "/analytics" },
    { id: "timer",     Icon: Timer,           label: "Focus Timer", path: "/timer"     },
  ];

  if (loading) {
    return <div className="d-root"><main className="d-main">Loading...</main></div>;
  }

  return (
    <>
      <style>{`
        /* Reuse the same CSS variables as Dashboard */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        :root {
          --gold: #c48b32; --gold2: #e8a93e; --gold-bg: #fdf3e3;
          --ink: #18181b; --ink2: #52525b; --ink3: #a1a1aa;
          --bg: #fafaf9; --card: #ffffff; --border: #e4e4e7;
          --red: #ef4444; --green: #22c55e;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        .d-root { font-family:'Inter',sans-serif; display:flex; min-height:100vh; background:var(--bg); color:var(--ink); }

        /* ── SIDEBAR ── */
        .d-sidebar { width:240px; min-height:100vh; background:var(--card); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:24px 16px 20px; position:fixed; top:0; left:0; bottom:0; }
        .d-logo-row { display:flex; align-items:center; gap:10px; padding:0 4px; margin-bottom:36px; }
        .d-logo-icon { width:28px; height:28px; background:transparent; display:flex; align-items:center; justify-content:center; }
        .d-logo-text { font-family:'Lora',serif; font-size:20px; font-weight:600; color:var(--gold); }
        .d-nav { flex:1; display:flex; flex-direction:column; gap:4px; }
        .d-nav-item { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px; font-size:14px; font-weight:500; color:#94a3b8; cursor:pointer; background:transparent; border:none; width:100%; text-align:left; font-family:'Inter',sans-serif; transition:all 0.2s; }
        .d-nav-item:hover { background:#f5f5f5; color:#1e293b; }
        .d-nav-item.active { background:white; color:#1e293b; box-shadow:0 6px 18px rgba(0,0,0,0.08); }
        .nav-icon { width:34px; height:34px; border-radius:50%; background:#f3f4f6; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.2s; }
        .d-nav-item.active .nav-icon { background:var(--gold); color:white; }
        .d-nav-item.active .nav-icon svg { color:white; }
        .d-sidebar-foot { border-top:1px solid var(--border); padding-top:16px; display:flex; flex-direction:column; gap:8px; }
        .d-user-row { display:flex; align-items:center; gap:10px; padding:6px 4px; }
        .d-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--gold2)); color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .d-uname { font-size:13px; font-weight:600; color:var(--ink); }
        .d-urole { font-size:11px; color:var(--ink3); }
        .d-logout { display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px; background:none; border:1px solid var(--border); border-radius:10px; color:var(--ink2); font-size:13.5px; font-family:'Inter',sans-serif; font-weight:500; cursor:pointer; transition:all 0.15s; }
        .d-logout:hover { border-color:var(--red); color:var(--red); background:#fef2f2; }
        .logout-icon-wrap { width:28px; height:28px; border-radius:6px; background:#f4f4f5; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.15s; }
        .d-logout:hover .logout-icon-wrap { background:#fee2e2; }

        /* ── MAIN ── */
        .d-main { margin-left:240px; flex:1; padding:40px 40px 60px; }

        .td-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .td-back-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border); background: var(--card); color: var(--ink2); cursor: pointer; transition: all 0.2s; }
        .td-back-btn:hover { background: #f4f4f5; color: var(--ink); }
        .td-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 600; color: var(--ink); }
        .td-delete-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; border: 1px solid #fee2e2; background: #fef2f2; color: #dc2626; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-left: auto; }
        .td-delete-btn:hover { background: #fee2e2; }
        
        .td-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .td-row { display: flex; gap: 24px; flex-wrap: wrap; }
        .td-item { flex: 1; min-width: 200px; display: flex; align-items: flex-start; gap: 12px; }
        .td-icon-wrap { width: 40px; height: 40px; border-radius: 10px; background: #f4f4f5; display: flex; align-items: center; justify-content: center; color: var(--ink2); flex-shrink: 0; }
        .td-info { display: flex; flex-direction: column; gap: 4px; }
        .td-label { font-size: 12px; font-weight: 600; color: var(--ink3); text-transform: uppercase; letter-spacing: 0.5px; }
        .td-value { font-size: 15px; font-weight: 500; color: var(--ink); }
        
        .td-status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .td-status-pill.pending { background: #fdf3e3; color: var(--gold); }
        .td-status-pill.completed { background: #f0fdf4; color: #16a34a; }
        .td-status-pill.overdue { background: #fef2f2; color: var(--red); }

        @media(max-width:720px) { .d-sidebar{display:none} .d-main{margin-left:0;padding:24px 16px} }
      `}</style>

      <div className="d-root">
        {/* ── SIDEBAR ── */}
        <aside className="d-sidebar">
          <div className="d-logo-row">
            <div className="d-logo-icon">
              <img src={logo1} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
            </div>
            <span className="d-logo-text">TimeMap</span>
          </div>

          <nav className="d-nav">
            {navItems.map(({ id: navId, Icon, label, path }) => (
              <button
                key={navId}
                className={`d-nav-item ${navId === "tasks" ? "active" : ""}`}
                onClick={() => navigate(path)}
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

        {/* ── MAIN CONTENT ── */}
        <main className="d-main">
          <div className="td-header">
            <button className="td-back-btn" onClick={() => navigate("/tasks")}>
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
            <h1 className="td-title">Task Details</h1>
            <button className="td-delete-btn" onClick={handleDelete}>
              Delete Task
            </button>
          </div>

          {task && (() => {
            const dl = daysLeft(task.deadline);
            return (
            <div className="td-card">
              <div className="td-row">
                <div className="td-item" style={{ flex: '100%' }}>
                  <div className="td-icon-wrap" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                    <CheckSquare size={20} />
                  </div>
                  <div className="td-info">
                    <span className="td-label">Task Name</span>
                    <span className="td-value" style={{ fontSize: '20px', fontWeight: '600' }}>{task.task_name}</span>
                    {task.description && (
                      <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--ink2)', lineHeight: '1.6' }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="td-row">
                <div className="td-item">
                  <div className="td-icon-wrap">
                    <BookOpen size={20} />
                  </div>
                  <div className="td-info">
                    <span className="td-label">Subject / Category</span>
                    <span className="td-value">{task.subject_category || "Uncategorized"}</span>
                  </div>
                </div>
                
                <div className="td-item">
                  <div className="td-icon-wrap">
                    <Calendar size={20} />
                  </div>
                  <div className="td-info">
                    <span className="td-label">Deadline</span>
                    <span className="td-value">{task.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="td-row">
                <div className="td-item">
                  <div className="td-icon-wrap">
                    <AlertCircle size={20} />
                  </div>
                  <div className="td-info">
                    <span className="td-label">Difficulty</span>
                    <span className="td-value">{task.difficulty_level || "Medium"}</span>
                  </div>
                </div>
                
                <div className="td-item">
                  <div className="td-icon-wrap">
                    <Clock size={20} />
                  </div>
                  <div className="td-info">
                    <span className="td-label">Estimated Hours</span>
                    <span className="td-value">{task.estimated_hours ? `${task.estimated_hours} hours` : "Not set"}</span>
                  </div>
                </div>
              </div>

              <div className="td-row">
                <div className="td-item">
                  <div className="td-icon-wrap">
                    <CheckSquare size={20} />
                  </div>
                  <div className="td-info">
                    <span className="td-label">Status</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`td-status-pill ${task.status === 'Completed' ? 'completed' : (dl.cls === 'over' ? 'overdue' : 'pending')}`}>
                        {task.status !== 'Completed' && dl.cls === 'over' ? 'Overdue' : task.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="td-item">
                  <div className="td-icon-wrap">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="td-info">
                    <span className="td-label">ML Risk Prediction</span>
                    <span className="td-value">{task.risk || "Medium"}</span>
                  </div>
                </div>
              </div>

            </div>
            );
          })()}
        </main>
      </div>
    </>
  );
}
