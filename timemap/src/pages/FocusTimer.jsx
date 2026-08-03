import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/img/logo1.png";
import {
  LogOut,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  Timer,
} from "lucide-react";

export default function FocusTimer() {
  const navigate  = useNavigate();
  const username  = localStorage.getItem("username") || "Student";
  const userId    = localStorage.getItem("user_id");

  const [isRunning,        setIsRunning]        = useState(false);
  const [isWorkSession,    setIsWorkSession]    = useState(true);
  const [completedCycles,  setCompletedCycles]  = useState(0);
  const [workMinutes,      setWorkMinutes]      = useState(25);
  const [breakMinutes,     setBreakMinutes]     = useState(5);
  const [totalSeconds,     setTotalSeconds]     = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);

  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  useEffect(() => {
    let interval = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => setRemainingSeconds(prev => prev - 1), 1000);
    } else if (remainingSeconds === 0 && isRunning) {
      playBeep();
      if (isWorkSession) {
        setCompletedCycles(c => c + 1);
        logWorkSession();
      }
      switchSession();
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, isWorkSession]);

  const logWorkSession = async () => {
    const taskId = localStorage.getItem("task_id");
    if (!userId || !taskId) return;

    try {
      await fetch("http://localhost:5000/api/log-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: parseInt(taskId, 10),
          user_id: parseInt(userId, 10),
          duration_minutes: workMinutes,
        }),
      });
    } catch (error) {
      console.error("Failed to log work session:", error);
    }
  };

  const audioContextRef = useRef(null);
  const getAudioContext = () => {
    if (!audioContextRef.current)
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioContextRef.current;
  };
  const playBeep = () => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  };

  const switchSession = () => {
    const newIsWork = !isWorkSession;
    setIsWorkSession(newIsWork);
    const newTotal = (newIsWork ? workMinutes : breakMinutes) * 60;
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
  };

  const startPause = () => setIsRunning(r => !r);
  const skip       = () => switchSession();
  const reset      = () => {
    setIsRunning(false);
    setCompletedCycles(0);
    setIsWorkSession(true);
    setTotalSeconds(workMinutes * 60);
    setRemainingSeconds(workMinutes * 60);
  };

  const formatTime = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const progress = totalSeconds === 0 ? 0 : ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --gold:   #c48b32;
          --gold2:  #e8a93e;
          --gold-bg: #fdf3e3;
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
          font-family: 'Inter', sans-serif;
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
        }

        /* ── SIDEBAR (identical to Dashboard) ── */
        .d-sidebar {
          width: 240px;
          min-height: 100vh;
          background: var(--card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 16px 20px;
          position: fixed;
          top: 0; left: 0; bottom: 0;
        }
        .d-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px;
          margin-bottom: 36px;
        }
        .d-logo-icon {
          width: 28px; height: 28px;
          background: transparent;
          display: flex; align-items: center; justify-content: center;
        }
        .d-logo-text {
          font-family: 'Lora', serif;
          font-size: 20px; font-weight: 600;
          color: var(--gold);
        }
        .d-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .d-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 14px; font-weight: 500;
          color: #94a3b8;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }
        .d-nav-item:hover { background: #f5f5f5; color: #1e293b; }
        .d-nav-item.active {
          background: white; color: #1e293b;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }
        .nav-icon {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .d-nav-item.active .nav-icon { background: var(--gold); color: white; }
        .d-nav-item.active .nav-icon svg { color: white; }
        .d-sidebar-foot {
          border-top: 1px solid var(--border);
          padding-top: 16px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .d-user-row {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 4px;
        }
        .d-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          color: white; font-weight: 700; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-family: 'Inter', sans-serif;
        }
        .d-uname { font-size: 13px; font-weight: 600; color: var(--ink); }
        .d-urole { font-size: 11px; color: var(--ink3); }
        .d-logout {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 14px;
          background: none; border: 1px solid var(--border);
          border-radius: 10px; color: var(--ink2);
          font-size: 13.5px; font-family: 'Inter', sans-serif;
          font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .d-logout:hover { border-color: var(--red); color: var(--red); background: #fef2f2; }
        .logout-icon-wrap {
          width: 28px; height: 28px; border-radius: 6px;
          background: #f4f4f5;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.15s;
        }
        .d-logout:hover .logout-icon-wrap { background: #fee2e2; }

        /* ── MAIN ── */
        .d-main {
          margin-left: 240px;
          flex: 1;
          padding: 40px 40px 60px;
        }

        /* ── TOPBAR ── */
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

        /* ── TIMER CARD ── */
        .ft-card {
          max-width: 520px;
          margin: 0 auto;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .ft-mode-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 13px; color: var(--ink2);
          margin-bottom: 20px;
          background: #fafafa;
        }
        .ft-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 0 5px rgba(34,197,94,0.15);
        }
        .ft-dot.break { background: var(--gold); box-shadow: 0 0 0 5px rgba(196,139,50,0.15); }

        /* Progress bar */
        .ft-progress-wrap { margin-bottom: 24px; }
        .ft-progress {
          height: 8px; width: 100%;
          background: #f4f4f5; border-radius: 999px; overflow: hidden;
        }
        .ft-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--green), #60a5fa);
          border-radius: 999px;
          transition: width 0.3s linear;
        }
        .ft-bar.break { background: linear-gradient(90deg, var(--gold), var(--gold2)); }
        .ft-progress-meta {
          display: flex; justify-content: space-between;
          margin-top: 8px; font-size: 12px; color: var(--ink3);
        }

        /* Timer circle */
        .ft-circle {
          display: grid; place-items: center;
          width: min(280px, 100%);
          aspect-ratio: 1;
          margin: 0 auto 24px;
          border-radius: 50%;
          border: 12px solid #f4f4f5;
          background: linear-gradient(180deg, #fafafa, #fff);
        }
        .ft-time {
          font-family: 'Lora', serif;
          font-size: 58px; font-weight: 600; line-height: 1;
          font-variant-numeric: tabular-nums;
          color: var(--ink);
        }
        .ft-phase-label {
          margin-top: 6px; text-align: center;
          font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--ink3);
        }

        /* Controls */
        .ft-controls {
          display: flex; gap: 10px;
          justify-content: center;
          margin-bottom: 24px;
        }
        .ft-btn {
          border: none; border-radius: 10px;
          padding: 12px 20px;
          font-family: 'Inter', sans-serif;
          font-weight: 600; font-size: 13.5px;
          cursor: pointer; transition: all 0.15s;
          min-width: 96px;
        }
        .ft-btn:active { transform: scale(0.97); }
        .ft-btn-primary { background: var(--green); color: white; }
        .ft-btn-primary:hover { background: #16a34a; }
        .ft-btn-secondary { background: #e5e7eb; color: var(--ink2); }
        .ft-btn-secondary:hover { background: #d1d5db; }
        .ft-btn-danger { background: #fee2e2; color: var(--red); }
        .ft-btn-danger:hover { background: #fecaca; }

        /* Settings */
        .ft-settings {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .ft-field {
          border: 1px solid var(--border); border-radius: 12px;
          padding: 14px; background: #fafafa;
        }
        .ft-field label {
          display: block; font-size: 11px; font-weight: 600;
          color: var(--ink3); margin-bottom: 8px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .ft-field input {
          width: 100%; background: white;
          border: 1px solid var(--border); color: var(--ink);
          border-radius: 8px; padding: 10px 12px;
          font-size: 15px; outline: none;
          font-family: 'Inter', sans-serif;
        }
        .ft-field input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(196,139,50,0.12);
        }
        .ft-hint {
          margin-top: 16px; font-size: 12px;
          color: var(--ink3); text-align: center; line-height: 1.6;
        }

        @media(max-width:720px) {
          .d-sidebar { display: none; }
          .d-main { margin-left: 0; padding: 24px 16px; }
          .ft-settings { grid-template-columns: 1fr; }
        }
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
                className={`d-nav-item ${id === "timer" ? "active" : ""}`}
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
              <p className="d-date-str">Stay focused. One session at a time.</p>
            </div>
          </div>

          <div className="ft-card">
            {/* Mode badge */}
            <div className="ft-mode-badge">
              <span className={`ft-dot ${isWorkSession ? "" : "break"}`} />
              {isWorkSession ? "Focus Session" : "Break Time"}
            </div>

            {/* Selected task for timer */}
            <div style={{ marginBottom: 20, fontSize: 13, color: '#52525b' }}>
              <strong>Selected task:</strong> {localStorage.getItem("task_name") || "None"}
            </div>

            {/* Progress bar */}
            <div className="ft-progress-wrap">
              <div className="ft-progress">
                <div className={`ft-bar ${isWorkSession ? "" : "break"}`} style={{ width:`${progress}%` }} />
              </div>
              <div className="ft-progress-meta">
                <span>{completedCycles} cycles completed</span>
                <span>{Math.round(progress)}% done</span>
              </div>
            </div>

            {/* Timer circle */}
            <div className="ft-circle">
              <div>
                <div className="ft-time">{formatTime(remainingSeconds)}</div>
                <div className="ft-phase-label">{isWorkSession ? "Focus" : "Break"}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="ft-controls">
              <button className="ft-btn ft-btn-primary" onClick={startPause}>
                {isRunning ? "⏸ Pause" : "▶ Start"}
              </button>
              <button className="ft-btn ft-btn-secondary" onClick={skip}>
                ⏭ Skip
              </button>
              <button className="ft-btn ft-btn-danger" onClick={reset}>
                ↺ Reset
              </button>
            </div>

            {/* Settings */}
            <div className="ft-settings">
              <div className="ft-field">
                <label>Focus (min)</label>
                <input
                  type="number" min="1" max="120"
                  value={workMinutes}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 25;
                    setWorkMinutes(val);
                    if (isWorkSession && !isRunning) {
                      setTotalSeconds(val * 60);
                      setRemainingSeconds(val * 60);
                    }
                  }}
                />
              </div>
              <div className="ft-field">
                <label>Break (min)</label>
                <input
                  type="number" min="1" max="60"
                  value={breakMinutes}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 5;
                    setBreakMinutes(val);
                    if (!isWorkSession && !isRunning) {
                      setTotalSeconds(val * 60);
                      setRemainingSeconds(val * 60);
                    }
                  }}
                />
              </div>
            </div>

            <p className="ft-hint">
              Changes to duration take effect after the current session ends,
              or immediately if the timer is paused.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
