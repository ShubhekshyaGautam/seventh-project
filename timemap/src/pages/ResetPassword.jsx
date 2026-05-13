import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import backgroundImage from "../assets/img/bg.png";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Token passed from ForgotPassword page
    const initialToken = location.state?.token || "";

    const [form, setForm] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [passwordMessage, setPasswordMessage] = useState("");

    const validatePassword = (password) => {
        if (password.length < 8) {
            return "Password should be at least 8 characters";
        }

        if (!/[A-Z]/.test(password)) {
            return "Add at least one uppercase letter";
        }

        if (!/[a-z]/.test(password)) {
            return "Add at least one lowercase letter";
        }

        if (!/[0-9]/.test(password)) {
            return "Add at least one number";
        }

        if (!/[!@#$%^&*]/.test(password)) {
            return "Add at least one special character";
        }

        return "Strong password ✓";
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        if (e.target.name === "newPassword") {
            setPasswordMessage(validatePassword(e.target.value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (
            !form.token ||
            !form.newPassword ||
            !form.confirmPassword
        ) {
            setError("All fields are required");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!passwordMessage.includes("Strong")) {
            setError("Please create a stronger password");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        otp: form.otp,
                        new_password: form.newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Password reset successful!");

                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(data.error || "Reset failed");
            }
        } catch (err) {
            setError("Server error");
        }

        setLoading(false);
    };

    return (
        <>
            <style>{`
        *{
          box-sizing:border-box;
          margin:0;
          padding:0;
          font-family:Inter,sans-serif;
        }

        .container{
          display:flex;
          height:100vh;
          width:100%;
        }

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
        }

        .subtitle{
          font-size:15px;
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

        .main-btn{
          padding:14px;
          border:none;
          border-radius:8px;
          background:#c48b32;
          color:white;
          font-weight:600;
          cursor:pointer;
        }

        .success{
          color:green;
          font-size:14px;
        }

        .error{
          color:red;
          font-size:14px;
        }

        .back{
          margin-top:20px;
          color:#c48b32;
          cursor:pointer;
          font-size:14px;
        }

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
        }

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

                {/* LEFT */}

                <div className="left">

                    <div className="form-box">

                        <h2 className="title">Reset Password</h2>

                        <p className="subtitle">
                            Enter your token and new password
                        </p>

                        <form className="form" onSubmit={handleSubmit}>

                            <input
                                type="text"
                                name="otp"
                                className="input"
                                placeholder="Enter OTP"
                                value={form.otp}
                                onChange={handleChange}
                            />

                            {/* NEW PASSWORD */}

                            <div className="password-box">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="password-input"
                                    name="newPassword"
                                    placeholder="New password"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                />

                                <span
                                    className="eye"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </span>

                            </div>

                            {/* PASSWORD MESSAGE */}

                            {form.newPassword && (
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: passwordMessage.includes("Strong")
                                            ? "green"
                                            : "#d97706",
                                        marginTop: "-8px",
                                    }}
                                >
                                    {passwordMessage}
                                </p>
                            )}

                            {/* CONFIRM PASSWORD */}

                            <div className="password-box">

                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className="password-input"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                />

                                <span
                                    className="eye"
                                    onClick={() =>
                                        setShowConfirm(!showConfirm)
                                    }
                                >
                                    {showConfirm ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </span>

                            </div>

                            {error && (
                                <p className="error">{error}</p>
                            )}

                            {message && (
                                <p className="success">{message}</p>
                            )}

                            <button
                                type="submit"
                                className="main-btn"
                            >
                                {loading
                                    ? "Resetting..."
                                    : "Reset Password"}
                            </button>

                        </form>

                        <p
                            className="back"
                            onClick={() => navigate("/login")}
                        >
                            ← Back to Login
                        </p>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="right">

                    <div className="overlay">

                        <h1 className="hero-title">
                            TimeMap
                        </h1>

                        <p className="hero-text">
                            Securely update your password.
                        </p>

                    </div>

                </div>

            </div>
        </>
    );
};

export default ResetPassword;