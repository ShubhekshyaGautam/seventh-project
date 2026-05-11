import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function FocusTimer() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Student";
  const userId = localStorage.getItem("user_id");

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);

  // Check auth
  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isRunning) {
      // Timer finished - play beep and switch
      playBeep();
      if (isWorkSession) setCompletedCycles((c) => c + 1);
      switchSession();
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, isWorkSession]);

  // Beep sound
  const audioContextRef = useRef(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };
  const playBeep = () => {
    const audioContext = getAudioContext();
    if (audioContext.state === "suspended") audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  const switchSession = () => {
    const newIsWork = !isWorkSession;
    setIsWorkSession(newIsWork);
    const newTotal = (newIsWork ? workMinutes : breakMinutes) * 60;
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
  };

  const startPause = () => {
    setIsRunning(!isRunning);
  };

  const skip = () => {
    switchSession();
  };

  const reset = () => {
    setIsRunning(false);
    setCompletedCycles(0);
    setIsWorkSession(true);
    setTotalSeconds(workMinutes * 60);
    setRemainingSeconds(workMinutes * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress = totalSeconds === 0 ? 0 : ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        
        :root {
          --gold: #c48b32;
          --gold2: #e8a93e;
          --ink: #18181b;
          --ink2: #52525b;
          --ink3: #a1a1aa;
          --bg: #fafaf9;
          --card: #ffffff;
          --border: #e4e4e7;
          --accent: #22c55e;
          --accent2: #f59e0b;
        }

        .ft-root {
          font-family: 'Outfit', sans-serif;
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
        }

        .ft-sidebar {
          width: 220px;
          min-height: 100vh;
          background: var(--card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 28px 16px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
        }

        .ft-logo {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--gold);
          padding: 0 8px;
          margin-bottom: 4px;
        }

        .ft-tagline {
          font-size: 10.5px;
          color: var(--ink3);
          padding: 0 8px;
          margin-bottom: 32px;
        }

        .ft-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ft-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
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
          text-decoration: none;
        }

        .ft-nav-item:hover {
          background: #f4f4f5;
          color: var(--ink);
        }

        .ft-nav-item.active {
          background: #fdf3e3;
          color: var(--gold);
          font-weight: 600;
        }

        .ft-sidebar-foot {
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }

        .ft-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          margin-bottom: 8px;
        }

        .ft-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          color: white;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ft-uname {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }

        .ft-urole {
          font-size: 11px;
          color: var(--ink3);
        }

        .ft-logout {
          width: 100%;
          padding: 9px 12px;
          background: none;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--ink2);
          font-size: 13px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ft-logout:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: #fef2f2;
        }

        .ft-main {
          margin-left: 220px;
          flex: 1;
          padding: 40px;
        }

        .ft-header {
          margin-bottom: 36px;
        }

        .ft-welcome {
          font-family: 'Lora', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 5px;
        }

        .ft-welcome em {
          font-style: italic;
          color: var(--gold);
        }

        .ft-subtitle {
          font-size: 13px;
          color: var(--ink3);
        }

        .ft-timer-container {
          max-width: 520px;
          margin: 0 auto;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .ft-mode {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 13px;
          color: var(--ink2);
          margin-bottom: 18px;
          background: #fafafa;
        }

        .ft-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
        }

        .ft-progress-wrap {
          margin-bottom: 20px;
        }

        .ft-progress {
          height: 8px;
          width: 100%;
          background: #f4f4f5;
          border-radius: 999px;
          overflow: hidden;
        }

        .ft-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), #60a5fa);
          border-radius: 999px;
          transition: width 0.3s linear;
        }

        .ft-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 12px;
          color: var(--ink3);
        }

        .ft-timer-circle {
          display: grid;
          place-items: center;
          aspect-ratio: 1;
          width: min(300px, 100%);
          margin: 0 auto 22px;
          border-radius: 50%;
          border: 12px solid #f4f4f5;
          background: linear-gradient(180deg, #fafafa, #ffffff);
        }

        .ft-time {
          font-size: 64px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 1px;
          font-variant-numeric: tabular-nums;
          color: var(--ink);
        }

        .ft-label {
          margin-top: 8px;
          font-size: 13px;
          color: var(--ink3);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .ft-controls {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .ft-btn {
          border: 0;
          border-radius: 12px;
          padding: 13px 18px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.15s;
          min-width: 100px;
        }

        .ft-btn:active {
          transform: scale(0.98);
        }

        .ft-btn-primary {
          background: var(--accent);
          color: white;
        }

        .ft-btn-primary:hover {
          background: #16a34a;
        }

        .ft-btn-secondary {
          background: #e5e7eb;
          color: var(--ink2);
        }

        .ft-btn-secondary:hover {
          background: #d1d5db;
        }

        .ft-btn-danger {
          background: #ef4444;
          color: white;
        }

        .ft-btn-danger:hover {
          background: #dc2626;
        }

        .ft-settings {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .ft-field {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px;
          background: #fafafa;
        }

        .ft-field label {
          display: block;
          font-size: 12px;
          color: var(--ink3);
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ft-field input {
          width: 100%;
          background: white;
          border: 1px solid var(--border);
          color: var(--ink);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 15px;
          outline: none;
          font-family: 'Outfit', sans-serif;
        }

        .ft-field input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(196, 139, 50, 0.1);
        }

        .ft-hint {
          margin-top: 16px;
          color: var(--ink3);
          font-size: 12px;
          text-align: center;
          line-height: 1.6;
        }

        @media (max-width: 720px) {
          .ft-sidebar {
            display: none;
          }
          .ft-main {
            margin-left: 0;
            padding: 24px 16px;
          }
          .ft-settings {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ft-root">
        {/* Sidebar */}
        <aside className="ft-sidebar">
          <div className="ft-logo">TimeMap</div>
          <p className="ft-tagline">Your study companion</p>
          <nav className="ft-nav">
            <a href="/dashboard" className="ft-nav-item">
              🏠 Dashboard
            </a>
            <a href="/dashboard" className="ft-nav-item">
              📚 My Tasks
            </a>
            <a href="/dashboard" className="ft-nav-item">
              📅 Calendar
            </a>
            <a href="/dashboard" className="ft-nav-item">
              📊 Analytics
            </a>
            <span className="ft-nav-item active">⏱️ Focus Timer</span>
          </nav>
          <div className="ft-sidebar-foot">
            <div className="ft-user-row">
              <div className="ft-avatar">{username[0].toUpperCase()}</div>
              <div>
                <div className="ft-uname">{username}</div>
                <div className="ft-urole">Student</div>
              </div>
            </div>
            <button className="ft-logout" onClick={handleLogout}>
              🚪 Sign out
            </button>
          </div>
        </aside>
        {/* Main content */}
        <main className="ft-main">
          <div className="ft-header">
            <div className="ft-welcome">
              {greeting}, <em>{username}</em> 👋
            </div>
            <div className="ft-subtitle">Stay focused. One session at a time.</div>
          </div>

          <div className="ft-timer-container">
            {/* Mode badge */}
            <div className="ft-mode">
              <span className="ft-dot"></span>
              {isWorkSession ? "Focus Session" : "Break Time"}
            </div>

            {/* Progress bar */}
            <div className="ft-progress-wrap">
              <div className="ft-progress">
                <div className="ft-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="ft-stats">
                <span>{completedCycles} cycles completed</span>
                <span>{Math.round(progress)}% done</span>
              </div>
            </div>

            {/* Timer circle */}
            <div className="ft-timer-circle">
              <div>
                <div className="ft-time">{formatTime(remainingSeconds)}</div>
                <div className="ft-label">{isWorkSession ? "Focus" : "Break"}</div>
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
                  type="number"
                  min="1"
                  max="120"
                  value={workMinutes}
                  onChange={(e) => {
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
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutes}
                  onChange={(e) => {
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