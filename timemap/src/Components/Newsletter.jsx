import React from "react";

const Newsletter = () => {
  return (
    <>
      <section className="newsletter-section">
        <div className="newsletter-container">

          {/* LEFT TEXT */}
          <div className="newsletter-text">
            <h2>Subscribe to our newsletter</h2>
            <p>Stay Updated with TimeMap</p>
          </div>

          {/* RIGHT FORM */}
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email address"
            />

            <button>Subscribe</button>

            <span className="privacy">
              By sharing your email, you agree to our terms of use and privacy.
            </span>
          </div>

        </div>
      </section>

      {/* CSS INSIDE SAME FILE */}
      <style>{`
        .newsletter-section {
          background: #ffffff;
          padding: 70px 140px;
          font-family: "Inter", sans-serif;
        }

        .newsletter-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* LEFT SIDE */
        .newsletter-text h2 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .newsletter-text p {
          color: #777;
          font-size: 15px;
        }

        /* RIGHT SIDE */
        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 420px;
        }

        .newsletter-form input {
          padding: 14px 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          outline: none;
        }

        .newsletter-form button {
          background: #c58b2b;   /* gold color */
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          cursor: pointer;
          transition: 0.2s;
        }

        .newsletter-form button:hover {
          background: #b57a1f;
        }

        .privacy {
          font-size: 12px;
          color: #999;
        }
      `}</style>
    </>
  );
};

export default Newsletter;
