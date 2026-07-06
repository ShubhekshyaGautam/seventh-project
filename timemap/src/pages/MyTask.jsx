// src/pages/MyTask.jsx  (same folder as Dashboard.jsx)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/img/logo1.png";
import {
  LogOut, LayoutDashboard, CheckSquare,
  Calendar, BarChart2, Timer, Search, Filter
} from "lucide-react";

export default function MyTask() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Student"; 
  const userId   = localStorage.getItem("user_id");

const [loading, setLoading] = useState(true);
const [tasks, setTasks] = useState([]);       
const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal,  setShowModal]  = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat,  setSavingCat]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({
    task_name: "", description: "", category_id: "",
    difficulty_level: "Medium", estimated_hours: "", deadline: "",
  });

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);  
    try {
      const r = await fetch(`http://localhost:5000/api/tasks/${userId}`);
      if (!r.ok) return;
      const d = await r.json();
      setTasks(d.tasks || []);
    } catch (e) { console.error(e); }
    setLoading(false);  
};

 

const fetchCategories = async () => {
  try {
    const r = await fetch(`http://localhost:5000/api/categories/${userId}`);
    if (!r.ok) return;
    const d = await r.json();
    setCategories(d.categories || []);
  } catch (e) { console.error(e); }
};





  const deleteTask = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) fetchTasks();
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddTask = async () => {
    if (!form.task_name || !form.deadline || !form.category_id) return;
    setSaving(true);
    try {
      const r = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_id: parseInt(userId), status: "Pending" }),
      });
      if (r.ok) {
        const data = await r.json();
        setForm({ task_name:"", description:"", category_id:"", difficulty_level:"Medium", estimated_hours:"", deadline:"" });
        setShowModal(false);
        navigate(`/tasks/${data.task_id}`);
      }
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const r = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parseInt(userId), name: newCatName.trim() }),
      });
      if (r.ok) {
        const d = await r.json();
        await fetchCategories();
        setForm(prev => ({ ...prev, category_id: d.category_id }));
        setShowCatModal(false);
        setNewCatName("");
      }
    } catch (e) { console.error(e); }
    setSavingCat(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const subjectColor = s => {
    const map = { math:"#4f7cff", science:"#38b2ac", english:"#e67e51",
                  history:"#9b7fe8", work:"#c48b32", personal:"#e879a0" };
    return map[(s||"").toLowerCase()] || "#c48b32";
  };

  const daysLeft = dl => {
    const today = new Date();
    const d = Math.ceil((new Date(dl) - today) / 86400000);
    if (d < 0)   return { label: "Overdue",    cls: "over"  };
    if (d === 0) return { label: "Today",      cls: "today" };
    if (d <= 3)  return { label: `${d}d left`, cls: "soon"  };
    return        { label: `${d}d left`,       cls: "ok"    };
  };

  const navItems = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard",   path: "/dashboard" },
    { id: "tasks",     Icon: CheckSquare,     label: "My Task",     path: "/tasks"     },
    { id: "calendar",  Icon: Calendar,        label: "Calendar",    path: "/calendar"  },
    { id: "analytics", Icon: BarChart2,       label: "Analytics",   path: "/analytics" },
    { id: "timer",     Icon: Timer,           label: "Focus Timer", path: "/timer"     },
  ];

  // Filter tasks based on search + status filter
  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.task_name.toLowerCase().includes(search.toLowerCase()) ||
                        (t.subject_category||"").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

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

        /* ── SIDEBAR (identical to Dashboard) ── */
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

        /* ── MY TASK PAGE SPECIFIC ── */
        .mt-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:28px; }
        .mt-title { font-family:'Lora',serif; font-size:28px; font-weight:600; color:var(--ink); }
        .mt-title em { font-style:italic; color:var(--gold); }
        .mt-subtitle { font-size:12.5px; color:var(--ink3); margin-top:4px; }

        .d-add-btn { display:flex; align-items:center; gap:7px; padding:11px 20px; background:var(--gold); color:white; border:none; border-radius:9px; font-size:13.5px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; transition:background 0.15s; white-space:nowrap; }
        .d-add-btn:hover { background:#a87328; }

        .mt-toolbar { display:flex; gap:12px; margin-bottom:20px; align-items:center; flex-wrap:wrap; }
        .mt-search-wrap { flex:1; min-width:200px; position:relative; }
        .mt-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--ink3); pointer-events:none; }
        .mt-search { width:100%; padding:10px 14px 10px 38px; border:1px solid var(--border); border-radius:9px; font-size:13.5px; font-family:'Inter',sans-serif; background:var(--card); color:var(--ink); outline:none; transition:border 0.15s; }
        .mt-search:focus { border-color:var(--gold); box-shadow:0 0 0 3px #c48b3218; }

        .mt-filters { display:flex; gap:6px; }
        .mt-filter-btn { padding:9px 16px; border:1px solid var(--border); border-radius:8px; font-size:12.5px; font-weight:500; font-family:'Inter',sans-serif; background:var(--card); color:var(--ink2); cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .mt-filter-btn:hover { background:#f4f4f5; }
        .mt-filter-btn.active { background:var(--gold); color:white; border-color:var(--gold); }

      
        .mt-tasks { display:flex; flex-direction:column; gap:10px; }
        .mt-task { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:18px 20px; display:flex; align-items:center; gap:16px; transition:box-shadow 0.15s, transform 0.15s; animation:fadeUp 0.3s ease both; }
        .mt-task:hover { box-shadow:0 4px 18px rgba(0,0,0,0.07); transform:translateY(-1px); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        
        .mt-body { flex:1; min-width:0; }
        .mt-name { font-size:14.5px; font-weight:600; color:var(--ink); margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .mt-meta { display:flex; gap:14px; font-size:12px; color:var(--ink3); flex-wrap:wrap; }
       

        .d-pill { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; white-space:nowrap; }
        .d-dl { font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:6px; white-space:nowrap; }
        .d-dl.ok    { background:#f0fdf4; color:#16a34a; }
        .d-dl.soon  { background:#fffbeb; color:#d97706; }
        .d-dl.today { background:#fdf3e3; color:var(--gold); }
        .d-dl.over  { background:#fef2f2; color:var(--red); }

        .mt-actions { display:flex; align-items:center; gap:6px; flex-shrink:0; }
        .d-task-btn { padding:6px 12px; font-size:12px; font-weight:500; font-family:'Inter',sans-serif; border:none; border-radius:6px; cursor:pointer; transition:opacity 0.15s; white-space:nowrap; }
        .d-task-btn:hover { opacity:0.85; }
        .d-task-btn-toggle-done { background:#dcfce7; color:#16a34a; }
        .d-task-btn-toggle-undo { background:#fef9c3; color:#a16207; }
        .d-task-btn-delete { background:#fee2e2; color:#dc2626; }

        .mt-empty { background:var(--card); border:1px dashed var(--border); border-radius:14px; padding:70px 24px; text-align:center; }
        .mt-empty-icon { font-size:44px; margin-bottom:14px; }
        .mt-empty-text { font-size:16px; font-weight:500; color:var(--ink2); }
        .mt-empty-sub  { font-size:13px; color:var(--ink3); margin-top:5px; }

        /* Modal — same as Dashboard */
        .d-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.35); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:200; animation:fadeIn 0.15s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .d-modal { background:var(--card); border-radius:18px; padding:32px; width:100%; max-width:460px; box-shadow:0 24px 64px rgba(0,0,0,0.14); animation:slideUp 0.2s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .d-modal-title { font-family:'Lora',serif; font-size:22px; font-weight:600; margin-bottom:6px; color:var(--ink); }
        .d-modal-sub { font-size:13px; color:var(--ink3); margin-bottom:24px; }
        .d-mform { display:flex; flex-direction:column; gap:12px; }
        .d-mlabel { display:block; font-size:11.5px; font-weight:600; color:var(--ink2); margin-bottom:5px; letter-spacing:0.3px; text-transform:uppercase; }
        .d-minput { width:100%; padding:12px 14px; border:1px solid var(--border); border-radius:9px; font-size:13.5px; font-family:'Inter',sans-serif; color:var(--ink); background:var(--bg); outline:none; transition:border 0.15s; }
        .d-minput:focus { border-color:var(--gold); box-shadow:0 0 0 3px #c48b3218; }
        .d-mrow { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .d-mactions { display:flex; gap:10px; margin-top:6px; }
        .d-mbtn-cancel { flex:1; padding:12px; border:1px solid var(--border); border-radius:9px; background:none; color:var(--ink2); font-size:13.5px; font-weight:500; font-family:'Inter',sans-serif; cursor:pointer; transition:all 0.15s; }
        .d-mbtn-cancel:hover { background:#f4f4f5; }
        .d-mbtn-save { flex:1; padding:12px; border:none; border-radius:9px; background:var(--gold); color:white; font-size:13.5px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; transition:background 0.15s; }
        .d-mbtn-save:hover { background:#a87328; }
        .d-mbtn-save:disabled { opacity:0.6; cursor:not-allowed; }

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
                className={`d-nav-item ${id === "tasks" ? "active" : ""}`}
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
          <div className="mt-header">
            <div>
              <h1 className="mt-title">My <em>Tasks</em></h1>
              <p className="mt-subtitle">
                {filteredTasks.length} of {tasks.length} tasks shown
              </p>
            </div>
            <button className="d-add-btn" onClick={() => setShowModal(true)}>
              ＋&nbsp; New Task
            </button>
          </div>

        

          {/* Search + Filter toolbar */}
          <div className="mt-toolbar">
            <div className="mt-search-wrap">
              <Search size={14} className="mt-search-icon" />
              <input
                className="mt-search"
                placeholder="Search tasks or subjects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="mt-filters">
              {["All","Pending","Completed"].map(s => (
                <button
                  key={s}
                  className={`mt-filter-btn ${filterStatus === s ? "active" : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Task list */}
        {loading ? (
  <div className="mt-empty">
    <div className="mt-empty-icon">⏳</div>
    <div className="mt-empty-text">Loading your tasks...</div>
  </div>
) : filteredTasks.length === 0 ? (
  <div className="mt-empty">
    <div className="mt-empty-icon">🗂️</div>
    <div className="mt-empty-text">
      {search || filterStatus !== "All" ? "No tasks match your filter" : "No tasks yet"}
    </div>
    <div className="mt-empty-sub">
      {search || filterStatus !== "All"
        ? "Try a different search or filter"
        : "Click '+ New Task' to add your first task"}
    </div>
  </div>
) : (
  <div className="mt-tasks">
              {filteredTasks.map((t, i) => {
                const dl  = daysLeft(t.deadline);
                const col = subjectColor(t.subject_category);
                return (
                  <div className="mt-task" key={t.id} style={{ animationDelay:`${i*0.04}s`, cursor: 'pointer' }} onClick={() => navigate(`/tasks/${t.id}`)}>
                    
                    <div className="mt-body">
                      <div className="mt-name">{t.task_name}</div>
                      <div className="mt-meta">
                    
                        <span>📅 {t.deadline}</span>
                       
                        
                      </div>
                    </div>
                    <div className="mt-actions" onClick={e => e.stopPropagation()}>
                      <span className="d-pill" style={{
                        background: t.status === "Completed" ? "#f0fdf4" : "#fdf3e3",
                        color:      t.status === "Completed" ? "#16a34a" : "#c48b32",
                      }}>
                        {t.status}
                      </span>
                      <button
                        className={`d-task-btn ${t.status==="Completed" ? "d-task-btn-toggle-undo" : "d-task-btn-toggle-done"}`}
                        onClick={() => updateStatus(t.id, t.status==="Completed" ? "Pending" : "Completed")}
                      >
                        {t.status === "Completed" ? "Undo" : "Done"}
                      </button>
                      <button
                        className="d-task-btn d-task-btn-delete"
                        onClick={() => deleteTask(t.id)}
                      >
                        Delete
                      </button>
                      <span className={`d-dl ${dl.cls}`}>{dl.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="d-overlay" onClick={() => setShowModal(false)}>
          <div className="d-modal" onClick={e => e.stopPropagation()}>
            <h2 className="d-modal-title">Add Study Task</h2>
            <p className="d-modal-sub">Fill in the details for your new task</p>
            <div className="d-mform">
              <div>
                <label className="d-mlabel">Task Name *</label>
                <input className="d-minput" name="task_name" placeholder="e.g. Chapter 5 revision"
                  value={form.task_name} onChange={handleChange}/>
              </div>
              <div>
                <label className="d-mlabel">Description</label>
                <textarea className="d-minput" name="description" placeholder="Any extra details..."
                  value={form.description} onChange={handleChange} rows={2} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="d-mlabel">Subject / Category *</label>
                {categories.length === 0 ? (
                  <button type="button" className="d-mbtn-cancel" style={{ width: '100%', textAlign: 'center', padding: '11px', borderStyle: 'dashed' }} onClick={() => setShowCatModal(true)}>
                    + Add Category
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="d-minput" name="category_id" value={form.category_id} onChange={handleChange}>
                      <option value="">Select a category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" className="d-mbtn-cancel" style={{ padding: '0 14px', flexShrink: 0 }} onClick={() => setShowCatModal(true)}>
                      +
                    </button>
                  </div>
                )}
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
                  value={form.deadline} onChange={handleChange}/>
              </div>
              <div className="d-mactions">
                <button type="button" className="d-mbtn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="d-mbtn-save" disabled={saving || !form.category_id} onClick={handleAddTask}>
                  {saving ? "Saving…" : "Add Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY MODAL ── */}
      {showCatModal && (
        <div className="d-overlay" onClick={() => setShowCatModal(false)} style={{ zIndex: 300 }}>
          <div className="d-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 className="d-modal-title">New Category</h2>
            <div className="d-mform" style={{ marginTop: '20px' }}>
              <div>
                <label className="d-mlabel">Category Name *</label>
                <input className="d-minput" placeholder="e.g. Math, Science"
                  value={newCatName} onChange={e => setNewCatName(e.target.value)} autoFocus/>
              </div>
              <div className="d-mactions">
                <button type="button" className="d-mbtn-cancel" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="button" className="d-mbtn-save" disabled={!newCatName.trim() || savingCat} onClick={handleAddCategory}>
                  {savingCat ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}