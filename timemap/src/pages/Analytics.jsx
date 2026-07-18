import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/img/logo1.png";
import {
  LogOut, LayoutDashboard, CheckSquare, Calendar, BarChart2, Timer,
  CheckCircle2, Clock, AlertCircle, ListTodo
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function Analytics() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Student";
  const userId   = localStorage.getItem("user_id");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const r = await fetch(`http://localhost:5000/api/tasks/${userId}`);
      if (!r.ok) return;
      const d = await r.json();
      setTasks(d.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  // Derived metrics
  const metrics = useMemo(() => {
    const today = new Date();
    let completed = 0;
    let overdue = 0;
    let pending = 0;
    
    // For subject distribution
    const subjectCounts = {};

    tasks.forEach(t => {
      // Check status
      if (t.status === "Completed") {
        completed++;
      } else {
        pending++;
        // Check overdue
        const daysLeft = Math.ceil((new Date(t.deadline) - today) / 86400000);
        if (daysLeft < 0) overdue++;
      }

      // Group by subject category
      const sub = t.subject_category || "Uncategorized";
      subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
    });

    const statusData = [
      { name: "Completed", value: completed, color: "#16a34a" },
      { name: "Pending", value: pending - overdue, color: "#c48b32" },
      { name: "Overdue", value: overdue, color: "#dc2626" }
    ];

    const subjectData = Object.keys(subjectCounts).map(key => ({
      name: key,
      tasks: subjectCounts[key]
    })).sort((a, b) => b.tasks - a.tasks);

    return { total: tasks.length, completed, pending, overdue, statusData, subjectData };
  }, [tasks]);

  return (
    <>
      <style>{`
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
        
        .a-header { margin-bottom: 32px; }
        .a-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 600; color: var(--ink); }
        .a-title em { font-style: italic; color: var(--gold); }
        .a-subtitle { font-size: 13.5px; color: var(--ink3); margin-top: 6px; }

        .a-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .a-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: transform 0.2s; }
        .a-card:hover { transform: translateY(-2px); }
        .a-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        
        .ic-total { background: #f3f4f6; color: #4b5563; }
        .ic-completed { background: #f0fdf4; color: #16a34a; }
        .ic-pending { background: #fdf3e3; color: var(--gold); }
        .ic-overdue { background: #fef2f2; color: #dc2626; }

        .a-stat-info { display: flex; flex-direction: column; }
        .a-stat-value { font-size: 24px; font-weight: 700; color: var(--ink); line-height: 1.1; }
        .a-stat-label { font-size: 13px; font-weight: 500; color: var(--ink3); margin-top: 4px; }

        .a-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .a-chart-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .a-chart-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 24px; }

        @media(max-width:1024px) { .a-charts { grid-template-columns: 1fr; } }
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
            {navItems.map(({ id, Icon, label, path }) => (
              <button
                key={id}
                className={`d-nav-item ${id === "analytics" ? "active" : ""}`}
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

        
        <main className="d-main">
          <div className="a-header">
            <h1 className="a-title">TESTING123</h1>
            <p className="a-subtitle">Overview of your study tasks and progress</p>
          </div>

          {loading ? (
            <div style={{ color: "var(--ink3)" }}>Loading analytics...</div>
          ) : (
            <>
              {/* KPI CARDS */}
              <div className="a-grid">
                <div className="a-card">
                  <div className="a-icon-wrap ic-total">
                    <ListTodo size={24} strokeWidth={2} />
                  </div>
                  <div className="a-stat-info">
                    <span className="a-stat-value">{metrics.total}</span>
                    <span className="a-stat-label">Total Tasks</span>
                  </div>
                </div>

                <div className="a-card">
                  <div className="a-icon-wrap ic-completed">
                    <CheckCircle2 size={24} strokeWidth={2} />
                  </div>
                  <div className="a-stat-info">
                    <span className="a-stat-value">{metrics.completed}</span>
                    <span className="a-stat-label">Completed</span>
                  </div>
                </div>

                <div className="a-card">
                  <div className="a-icon-wrap ic-pending">
                    <Clock size={24} strokeWidth={2} />
                  </div>
                  <div className="a-stat-info">
                    <span className="a-stat-value">{metrics.pending}</span>
                    <span className="a-stat-label">Pending</span>
                  </div>
                </div>

                <div className="a-card">
                  <div className="a-icon-wrap ic-overdue">
                    <AlertCircle size={24} strokeWidth={2} />
                  </div>
                  <div className="a-stat-info">
                    <span className="a-stat-value">{metrics.overdue}</span>
                    <span className="a-stat-label">Overdue</span>
                  </div>
                </div>
              </div>

              {/* CHARTS */}
              <div className="a-charts">
                {/* Status Chart */}
                <div className="a-chart-card">
                  <h3 className="a-chart-title">Task Status Breakdown</h3>
                  {metrics.total === 0 ? (
                    <p style={{ color: "var(--ink3)", textAlign: "center", marginTop: "40px" }}>No data to display</p>
                  ) : (
                    <div style={{ height: "300px", width: "100%" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metrics.statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {metrics.statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px" }}>
                        {metrics.statusData.map((d, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--ink2)" }}>
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: d.color }} />
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject Chart */}
                <div className="a-chart-card">
                  <h3 className="a-chart-title">Tasks by Subject</h3>
                  {metrics.subjectData.length === 0 ? (
                    <p style={{ color: "var(--ink3)", textAlign: "center", marginTop: "40px" }}>No data to display</p>
                  ) : (
                    <div style={{ height: "300px", width: "100%" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={metrics.subjectData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: "var(--ink3)" }} 
                            dy={10} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: "var(--ink3)" }} 
                            allowDecimals={false}
                          />
                          <RechartsTooltip cursor={{ fill: 'var(--bg)' }} />
                          <Bar dataKey="tasks" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
