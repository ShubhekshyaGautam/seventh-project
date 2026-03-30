import { loginUser } from "../api/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import backgroundImage from "../assets/img/bg.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ emailPhone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.emailPhone || !form.password) {
    setError("All fields are required!");
    return;
  }

  setLoading(true);
  setError("");

  const result = await loginUser(form);

  setLoading(false);

  if (result.success) {
    alert("Login successful!");
    navigate("/"); // redirect to landing
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
        font-family: Inter, sans-serif;
      }

      .container{
        display:flex;
        height:100vh;
        width:100%;
      }

      /* LEFT PANEL */

      .left{
        width:40%;
        display:flex;
        justify-content:center;
        align-items:center;
        background:white;
        padding:40px;
      }

      .form-box{
        width:100%;
        max-width:360px;
      }

      .title{
        font-size:30px;
        font-weight:700;
        margin-bottom:8px;
        color:#1a1a1a;
      }

      .subtitle{
        font-size:16px;
        color:#666;
        margin-bottom:30px;
      }

      .form{
        display:flex;
        flex-direction:column;
        gap:15px;
      }

      .input{
        padding:14px 16px;
        border-radius:8px;
        border:1px solid #ddd;
        font-size:14px;
        outline:none;
      }

      .password-box{
        display:flex;
        align-items:center;
        border:1px solid #ddd;
        border-radius:8px;
        padding-right:10px;
      }

      .password-input{
        flex:1;
        border:none;
        padding:14px 16px;
        outline:none;
        font-size:14px;
      }

      .eye{
        cursor:pointer;
      }

      .forgot{
        text-align:right;
        font-size:13px;
        color:#777;
        cursor:pointer;
      }

      .main-btn{
        margin-top:10px;
        padding:14px;
        border:none;
        border-radius:8px;
        background:#c48b32;
        color:white;
        font-weight:600;
        cursor:pointer;
      }

      .footer{
        text-align:center;
        font-size:14px;
        margin-top:20px;
        color:#666;
      }

      .link{
        color:#c48b32;
        font-weight:600;
        cursor:pointer;
      }

      /* RIGHT PANEL */

      .right{
        width:60%;
        background-image:url(${backgroundImage});
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
        font-size:72px;
        font-weight:800;
      }

      .hero-text{
        margin-top:10px;
        font-size:20px;
        font-weight:500;
      }

 .hero-btn{
  margin-top:25px;
  padding:12px 28px;
  border:none;
  border-radius:30px;
  background:white;
  font-weight:700;
  cursor:pointer;
  color:black;   

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
          <div className="form-box">

            <h2 className="title">Welcome to TimeMap</h2>
            <p className="subtitle">Login to your account</p>

            <form className="form" onSubmit={handleSubmit}>

              <input
                className="input"
                name="emailPhone"
                placeholder="Email *"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>

              </div>

              <p className="forgot">Forgot password?</p>
              {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
              <button type="submit" className="main-btn">
                Log in
              </button>

            </form>

            <p className="footer">
              Not a TimeMap member?{" "}
              <span
                className="link"
                onClick={() => navigate("/signup")}
              >
                Create new account
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

export default Login;
