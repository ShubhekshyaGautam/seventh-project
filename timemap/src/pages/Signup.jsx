import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/img/bg.png";
import { registerUser } from "../api/api";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",  
    phone: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!form.name || !form.email || !form.phone || !form.password) {
    setError("All fields are required!");
    return;
  }

  setLoading(true);
  setError("");

  const result = await registerUser(form);

  setLoading(false);

  if (result.success) {
    alert("Registration successful! Please login.");
    navigate("/login");
  } else {
    setError(result.error);
  }
};

  return (
    <>
      <style>{`

*{
box-sizing:border-box;
margin:0;
padding:0;
font-family:Inter, sans-serif;
}

.container{
display:flex;
height:100vh;
width:100%;
}

/* LEFT SIDE */

.left{
width:40%;
background:#fff;
display:flex;
justify-content:center;
align-items:flex-start;
padding:60px 40px;
overflow-y:auto;
}

.form-wrapper{
width:100%;
max-width:380px;
}

.title{
font-size:28px;
font-weight:700;
color:#222;
margin-bottom:6px;
}

.subtitle{
font-size:15px;
color:#666;
margin-bottom:30px;
}

.form{
display:flex;
flex-direction:column;
gap:16px;
}

.input{
width:100%;
padding:16px;
border-radius:10px;
border:1px solid #e6e6e6;
font-size:14px;
outline:none;
}

.password-box{
display:flex;
align-items:center;
border:1px solid #e6e6e6;
border-radius:10px;
padding-right:12px;
}

.password-input{
flex:1;
border:none;
padding:16px;
outline:none;
font-size:14px;
}

.eye{
cursor:pointer;
}

.terms{
font-size:13px;
color:#777;
margin-top:5px;
line-height:1.5;
}

.gold{
color:#c48b32;
font-weight:600;
cursor:pointer;
}

.main-btn{
width:100%;
padding:16px;
border:none;
border-radius:10px;
background:#c48b32;
color:white;
font-size:15px;
font-weight:600;
cursor:pointer;
margin-top:10px;
}

.footer{
text-align:center;
font-size:14px;
margin-top:22px;
color:#666;
}

.link{
color:#c48b32;
font-weight:600;
cursor:pointer;
}

.divider{
display:flex;
align-items:center;
gap:12px;
margin:28px 0;
}

.line{
flex:1;
height:1px;
background:#eee;
}

.social-btn{
width:100%;
display:flex;
align-items:center;
justify-content:center;
gap:10px;
padding:14px;
border-radius:10px;
border:1px solid #e6e6e6;
background:#fff;
font-size:14px;
cursor:pointer;
margin-bottom:12px;
}

.social-btn img{
width:18px;
}

/* RIGHT SIDE */

.right{
width:60%;
background-image:url(${bgImage});
background-size:cover;
background-position:center;
position:relative;
}

.overlay{
position:absolute;
inset:0;
background:rgba(0,0,0,0.45);
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
text-align:center;
color:white;
}

.hero-title{
font-size:74px;
font-weight:800;
letter-spacing:-2px;
}

.hero-text{
font-size:22px;
margin-top:12px;
}

.hero-btn{
margin-top:28px;
padding:8px 22px;
border-radius:30px;
border:none;
background:white;
color:#000;
font-weight:600;
font-size:12px;
cursor:pointer;
}

/* RESPONSIVE */

@media(max-width:900px){

.container{
flex-direction:column;
}

.left{
width:100%;
}

.right{
display:none;
}

}

      `}</style>

      <div className="container">

        {/* LEFT FORM */}

        <div className="left">
          <div className="form-wrapper">

            <h2 className="title">Welcome to TimeMap</h2>
            <p className="subtitle">Create your TimeMap account</p>

            <form className="form" onSubmit={handleSubmit}>

              <input
                className="input"
                name="name"
                placeholder="Name *"
                onChange={handleChange}
              />

              <input 
                 className="input"
                 name="email"
                 placeholder="Email *"
                 onChange={handleChange}
                 />
              
              <input
                className="input"
                name="phone"
                placeholder="Phone *"
                onChange={handleChange}
              />

              <div className="password-box">

                <input
                  type={showPassword ? "text" : "password"}
                  className="password-input"
                  name="password"
                  placeholder="Password *"
                  onChange={handleChange}
                />

                <span
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </span>

              </div>

              <p className="terms">
                By creating an account, you agree to our
                <span className="gold"> Terms and Condition </span>
                as well as our
                <span className="gold"> Privacy Policy</span>.
              </p>
              {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

              <button type="submit" className="main-btn">
                Create account
              </button>

            </form>

            <p className="footer">
              Already have an account?{" "}
              <span
                className="link"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>

            
        
          </div>
        </div>

        {/* RIGHT HERO */}

        <div className="right">

          <div className="overlay">

            <h1 className="hero-title">
              TimeMap
            </h1>

            <p className="hero-text">
              Where there is planning, there is progress.
            </p>

            <button
              className="hero-btn"
              onClick={() => navigate("/")}
            >
              Manage your time
            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default Signup;