import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/img/logo1.png";
import {
  LogOut, LayoutDashboard, CheckSquare,
  Calendar, BarChart2, Timer, Bell,
  Mail, AlertTriangle, Clock, CheckCircle, RefreshCw,
} from "lucide-react";
import { checkReminders, sendReminder } from "../Services/newsletterService";

export default function Notifications() {
  const navigate  = useNavigate();
  const username  = localStorage.getItem("username") || "Student";
  const userId    = localStorage.getItem("user_id");

  const [tasks,     setTasks]     = useState([]);
  const [email,     setEmail]     = useState("");
  const [count,     setCount]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState("");

  const today = new Date();

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await checkReminders(userId);
      setTasks(data.tasks || []);
      setEmail(data.email  || "");
      setCount(data.count  || 0);
    } catch (e) {
      setError("Could not load notifications. Is the backend running?");
    }
    setLoading(false);
  };

  const handleSendEmail = async () => {
    setSending(true);
    setSent(false);
    setError("");
    try {
      await sendReminder(userId);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      setError("Failed to send email. Check your Gmail config in app.py.");
    }
    setSending(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard",     path: "/dashboard" },
    { id: "tasks",     Icon: CheckSquare,     label: "My Task",       path: "/tasks"     },
    { id: "calendar",  Icon: Calendar,        label: "Calendar",      path: "/calendar"  },
    { id: "analytics", Icon: BarChart2,       label: "Analytics",     path: "/analytics" },
    { id: "timer",     Icon: Timer,           label: "Focus Timer",   path: "/timer"     },
  ];

  const riskConfig = {
    High:   { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", label: "High Risk",   icon: "🔴" },
    Medium: { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b", label: "Medium Risk", icon: "🟡" },
    Low:    { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", label: "Low Risk",    icon: "🟢" },
  };

  const dlConfig = (days) => {
    if (days < 0)   return { label: "Overdue!",       cls: "over"  };
    if (days === 0) return { label: "Due Today!",     cls: "today" };
    if (days <= 3)  return { label: `${days}d left`,  cls: "soon"  };
    return               { label: `${days}d left`,    cls: "ok"    };
  };

  const hour     = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --gold:   #c48b32; --gold2: #e8a93e; --gold-bg: #fdf3e3;
          --ink:    #18181b; --ink2:  #52525b; --ink3:    #a1a1aa;
          --bg:     #fafaf9; --card:  #ffffff; --border:  #e4e4e7;
          --red:    #ef4444; --green: #22c55e;
        }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); }

        .d-root { font-family:'Inter',sans-serif; display:flex; min-height:100vh; background:var(--bg); color:var(--ink); }

        /* ── SIDEBAR (identical to Dashboard) ── */
        .d-sidebar { width:240px; min-height:100vh; background:var(--card); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:24px 16px 20px; position:fixed; top:0; left:0; bottom:0; }
        .d-logo-row { display:flex; align-items:center; gap:10px; padding:0 4px; margin-bottom:36px; }
        .d-logo-icon { width:28px; height:28px; background:transparent; display:flex; align-items:center; justify-content:center; }
        .d-logo-text { font-family:'Lora',serif; font-size:20px; font-weight:600; color:var(--gold); }
        .d-nav { flex:1; display:flex; flex-direction:column; gap:4px; }
        .d-nav-item { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px; font-size:14px; font-weight:500; color:#94a3b8; cursor:pointer; background:transparent; border:none; width:100%; text-align:left; font-family:'Inter',sans-serif; transition:all 0.2s ease; }
        .d-nav-item:hover { background:#f5f5f5; color:#1e293b; }
        .d-nav-item.active { background:white; color:#1e293b; box-shadow:0 6px 18px rgba(0,0,0,0.08); }
        .nav-icon { width:34px; height:34px; border-radius:50%; background:#f3f4f6; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.2s; }
        .d-nav-item.active .nav-icon { background:var(--gold); color:white; }
        .d-nav-item.active .nav-icon svg { color:white; }
        .d-sidebar-foot { border-top:1px solid var(--border); padding-top:16px; display:flex; flex-direction:column; gap:8px; }
        .d-user-row { display:flex; align-items:center; gap:10px; padding:6px 4px; }
        .d-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--gold2)); color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Inter',sans-serif; }
        .d-uname { font-size:13px; font-weight:600; color:var(--ink); }
        .d-urole { font-size:11px; color:var(--ink3); }
        .d-logout { display:flex; align-items:center; gap:10px; width:100%; padding:10px 14px; background:none; border:1px solid var(--border); border-radius:10px; color:var(--ink2); font-size:13.5px; font-family:'Inter',sans-serif; font-weight:500; cursor:pointer; transition:all 0.15s; }
        .d-logout:hover { border-color:var(--red); color:var(--red); background:#fef2f2; }
        .logout-icon-wrap { width:28px; height:28px; border-radius:6px; background:#f4f4f5; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.15s; }
        .d-logout:hover .logout-icon-wrap { background:#fee2e2; }

        /* ── MAIN ── */
        .d-main { margin-left:240px; flex:1; padding:40px 40px 60px; }

        .d-topbar { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px; }
        .d-welcome { font-family:'Lora',serif; font-size:28px; font-weight:600; color:var(--ink); line-height:1.2; }
        .d-welcome em { font-style:italic; color:var(--gold); }
        .d-date-str { font-size:12.5px; color:var(--ink3); margin-top:5px; }

        /* ── EMAIL ACTION CARD ── */
        .notif-email-card {
          background: linear-gradient(135deg, #c48b32, #e8a93e);
          border-radius:16px; padding:28px 32px;
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:24px; gap:20px; flex-wrap:wrap;
          animation: fadeUp 0.4s ease both;
        }
        .notif-email-left { display:flex; align-items:center; gap:16px; }
        .notif-email-icon { width:52px; height:52px; border-radius:14px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .notif-email-title { font-family:'Lora',serif; font-size:18px; font-weight:600; color:white; margin-bottom:4px; }
        .notif-email-sub { font-size:13px; color:rgba(255,255,255,0.85); }
        .notif-email-addr { font-size:12px; color:rgba(255,255,255,0.7); margin-top:3px; }

        .notif-send-btn {
          display:flex; align-items:center; gap:8px;
          padding:13px 24px;
          background:white; color:var(--gold);
          border:none; border-radius:10px;
          font-size:13.5px; font-weight:700;
          font-family:'Inter',sans-serif;
          cursor:pointer; transition:all 0.15s;
          white-space:nowrap; flex-shrink:0;
        }
        .notif-send-btn:hover { background:#fdf3e3; }
        .notif-send-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .notif-send-btn.sent { background:#f0fdf4; color:#16a34a; }

        /* ── STATS ROW ── */
        .notif-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
        .notif-stat { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:18px 20px; animation:fadeUp 0.4s ease both; }
        .notif-stat:nth-child(1){animation-delay:.05s} .notif-stat:nth-child(2){animation-delay:.10s} .notif-stat:nth-child(3){animation-delay:.15s}
        .notif-stat-label { font-size:11px; font-weight:600; color:var(--ink3); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; }
        .notif-stat-val { font-family:'Lora',serif; font-size:32px; font-weight:600; line-height:1; }
        .notif-stat-sub { font-size:11.5px; color:var(--ink3); margin-top:4px; }

        /* ── TASK LIST ── */
        .notif-section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .notif-section-title { font-family:'Lora',serif; font-size:18px; font-weight:600; color:var(--ink); }
        .notif-refresh-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border:1px solid var(--border); border-radius:8px; background:none; color:var(--ink2); font-size:12.5px; font-family:'Inter',sans-serif; cursor:pointer; transition:all 0.15s; }
        .notif-refresh-btn:hover { background:#f4f4f5; }

        .notif-tasks { display:flex; flex-direction:column; gap:10px; }
        .notif-task {
          background:var(--card); border:1px solid var(--border);
          border-radius:12px; padding:18px 20px;
          display:flex; align-items:center; gap:16px;
          transition:box-shadow 0.15s, transform 0.15s;
          animation:fadeUp 0.35s ease both;
        }
        .notif-task:hover { box-shadow:0 4px 16px rgba(0,0,0,0.06); transform:translateY(-1px); }
        .notif-task-stripe { width:4px; height:44px; border-radius:4px; flex-shrink:0; }
        .notif-task-body { flex:1; min-width:0; }
        .notif-task-name { font-size:14.5px; font-weight:600; color:var(--ink); margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .notif-task-meta { display:flex; gap:12px; font-size:12px; color:var(--ink3); flex-wrap:wrap; }
        .notif-task-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }

        .n-pill { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; white-space:nowrap; }
        .n-dl { font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:6px; white-space:nowrap; }
        .n-dl.ok    { background:#f0fdf4; color:#16a34a; }
        .n-dl.soon  { background:#fffbeb; color:#d97706; }
        .n-dl.today { background:#fdf3e3; color:var(--gold); }
        .n-dl.over  { background:#fef2f2; color:var(--red); }

        /* ── EMPTY / SUCCESS / ERROR STATES ── */
        .notif-empty { background:var(--card); border:1px dashed var(--border); border-radius:14px; padding:64px 24px; text-align:center; }
        .notif-empty-icon { font-size:44px; margin-bottom:14px; }
        .notif-empty-text { font-size:16px; font-weight:500; color:var(--ink2); }
        .notif-empty-sub  { font-size:13px; color:var(--ink3); margin-top:5px; }

        .notif-alert { display:flex; align-items:center; gap:12px; padding:14px 18px; border-radius:10px; margin-bottom:20px; font-size:13.5px; font-weight:500; }
        .notif-alert.success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
        .notif-alert.error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }

        .notif-loading { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:var(--ink3); font-size:14px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }

        @media(max-width:900px)  { .notif-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:720px)  { .d-sidebar{display:none} .d-main{margin-left:0;padding:24px 16px} }
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
                className={`d-nav-item ${id === "notifications" ? "active" : ""}`}
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

        {/* ── MAIN ── */}
        <main className="d-main">
          <div className="d-topbar">
            <div>
              <h1 className="d-welcome">{greeting}, <em>{username}</em> :)</h1>
              <p className="d-date-str">
                {today.toLocaleDateString("en-US",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}
              </p>
            </div>
          </div>

          {/* ── EMAIL ACTION CARD ── */}
          <div className="notif-email-card">
            <div className="notif-email-left">
              <div className="notif-email-icon">
                <Mail size={26} color="white" />
              </div>
              <div>
                <div className="notif-email-title">Email Reminder</div>
                <div className="notif-email-sub">
                  Send yourself a summary of all high-risk &amp; due-soon tasks
                </div>
                <div className="notif-email-addr">📬 {email || "Loading…"}</div>
              </div>
            </div>
            <button
              className={`notif-send-btn ${sent ? "sent" : ""}`}
              onClick={handleSendEmail}
              disabled={sending || loading || count === 0}
            >
              {sending ? (
                <><RefreshCw size={15} className="spinning" /> Sending…</>
              ) : sent ? (
                <><CheckCircle size={15} /> Email Sent!</>
              ) : (
                <><Mail size={15} /> Send Reminder</>
              )}
            </button>
          </div>

          {/* ── ALERTS ── */}
          {sent && (
            <div className="notif-alert success">
              <CheckCircle size={16} />
              Reminder email sent successfully to <strong>&nbsp;{email}</strong>!
            </div>
          )}
          {error && (
            <div className="notif-alert error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* ── STATS ── */}
          {!loading && (
            <div className="notif-stats">
              {[
                {
                  label: "Flagged Tasks",
                  val:   count,
                  sub:   "Need your attention",
                  color: "#c48b32",
                },
                {
                  label: "High Risk",
                  val:   tasks.filter(t => t.risk === "High").length,
                  sub:   "AI predicted 🔴",
                  color: "#ef4444",
                },
                {
                  label: "Due in ≤ 3 days",
                  val:   tasks.filter(t => t.days_left >= 0 && t.days_left <= 3).length,
                  sub:   "Deadline approaching",
                  color: "#d97706",
                },
              ].map(s => (
                <div className="notif-stat" key={s.label}>
                  <div className="notif-stat-label">{s.label}</div>
                  <div className="notif-stat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="notif-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── TASK LIST ── */}
          <div className="notif-section-head">
            <h2 className="notif-section-title">
              <Bell size={18} style={{ display:"inline", marginRight:8, verticalAlign:"middle" }} />
              At-Risk Tasks
            </h2>
            <button className="notif-refresh-btn" onClick={loadReminders} disabled={loading}>
              <RefreshCw size={13} className={loading ? "spinning" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="notif-loading">
              <RefreshCw size={20} className="spinning" />
              Checking your tasks…
            </div>
          ) : tasks.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">🎉</div>
              <div className="notif-empty-text">All clear! No at-risk tasks</div>
              <div className="notif-empty-sub">None of your tasks are high risk or due within 3 days</div>
            </div>
          ) : (
            <div className="notif-tasks">
              {tasks.map((t, i) => {
                const rc  = riskConfig[t.risk] || riskConfig["Medium"];
                const dl  = dlConfig(t.days_left);
                return (
                  <div
                    className="notif-task"
                    key={t.id}
                    style={{ animationDelay:`${i * 0.05}s`, borderLeft:`3px solid ${rc.dot}` }}
                  >
                    <div className="notif-task-body">
                      <div className="notif-task-name">{t.task_name}</div>
                      <div className="notif-task-meta">
                        <span>📁 {t.category}</span>
                        <span>📅 {t.deadline}</span>
                        <span>
                          <Clock size={11} style={{ display:"inline", verticalAlign:"middle", marginRight:3 }} />
                          {t.days_left < 0
                            ? "Overdue"
                            : t.days_left === 0
                              ? "Due today"
                              : `${t.days_left} day(s) left`}
                        </span>
                      </div>
                    </div>
                    <div className="notif-task-actions">
                      <span
                        className="n-pill"
                        style={{ background: rc.bg, color: rc.color }}
                      >
                        {rc.icon} {rc.label}
                      </span>
                      <span className={`n-dl ${dl.cls}`}>{dl.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
