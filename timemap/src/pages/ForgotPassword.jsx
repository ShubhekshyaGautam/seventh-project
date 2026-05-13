import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/img/bg.png";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError("Email is required");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert(`Your OTP is: ${data.otp}`);
                navigate("/reset-password");
            } else {
                setError(data.error || "Something went wrong");
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

        .main-btn{
          padding:14px;
          border:none;
          border-radius:8px;
          background:#c48b32;
          color:white;
          font-weight:600;
          cursor:pointer;
        }

        .back{
          margin-top:20px;
          color:#c48b32;
          cursor:pointer;
          font-size:14px;
        }

        .success{
          color:green;
          font-size:14px;
          white-space:pre-wrap;
        }

        .error{
          color:red;
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
          color:white;
          text-align:center;
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

                <div className="left">

                    <div className="form-box">

                        <h2 className="title">Forgot Password</h2>

                        <p className="subtitle">
                            Enter your email to receive reset token
                        </p>

                        <form className="form" onSubmit={handleSubmit}>

                            <input
                                type="email"
                                className="input"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {error && <p className="error">{error}</p>}

                            {message && <p className="success">{message}</p>}

                            <button type="submit" className="main-btn">
                                {loading ? "Sending..." : "Send Reset Token"}
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

                <div className="right">

                    <div className="overlay">

                        <h1 className="hero-title">TimeMap</h1>

                        <p className="hero-text">
                            Recover your account securely.
                        </p>

                    </div>

                </div>

            </div>
        </>
    );
};

export default ForgotPassword;