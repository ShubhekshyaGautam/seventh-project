import React from "react";

// IMPORT IMAGES FROM src/assets/img
import mainImg from "../assets/img/j1.png";
import img1 from "../assets/img/j2.png";
import img2 from "../assets/img/j3.png";
import img3 from "../assets/img/j4.png";

const Journal = () => {
  return (
    <>
      <section className="journal-section">
        <h2 className="journal-title">The Journal & Reviews</h2>

        <div className="journal-container">
          {/* LEFT BIG CARD */}
          <div className="journal-main-card">
            <img src={mainImg} alt="journal" />
            <div className="overlay"></div>

            <div className="journal-main-text">
              <h3>Reflect, Learn, and Improve Your Time</h3>
              <p>
                Write your daily reflections and track your productivity journey.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE CARDS */}
          <div className="journal-side">
            <div className="journal-card">
              <img src={img1} alt="focus" />
              <div className="overlay"></div>
              <div className="journal-text">
                <h4>Improving Focus with Time Blocking</h4>
                <p>How I used 2-hour focus sessions to finish assignments faster.</p>
              </div>
            </div>

            <div className="journal-card">
              <img src={img2} alt="procrastination" />
              <div className="overlay"></div>
              <div className="journal-text">
                <h4>Reducing Procrastination in Exams</h4>
                <p>Tracking my daily study time helped me stay consistent.</p>
              </div>
            </div>

            <div className="journal-card">
              <img src={img3} alt="report" />
              <div className="overlay"></div>
              <div className="journal-text">
                <h4>My Weekly Productivity Report</h4>
                <p>Insights from my study patterns and distractions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS INSIDE SAME FILE */}
      <style>{`
        .journal-section {
          padding: 60px 80px;
          background: #ffffff;
          font-family: "Inter", sans-serif;
        }

        .journal-title {
          font-size: 28px;
          margin-bottom: 30px;
        }

        .journal-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .journal-main-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          height: 420px;
        }

        .journal-main-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.79), rgba(0,0,0,0.1));
        }

        .journal-main-text {
          position: absolute;
          bottom: 24px;
          left: 24px;
          color: white;
          max-width: 70%;
        }

        .journal-main-text h3 {
          font-size: 22px;
          margin-bottom: 8px;
        }

        .journal-side {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .journal-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          height: 120px;
        }

        .journal-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .journal-text {
          position: absolute;
          bottom: 10px;
          left: 14px;
          right: 14px;
          color: white;
          font-size: 13px;
        }

        .journal-text h4 {
          font-size: 14px;
          margin-bottom: 4px;
        }
      `}</style>
    </>
  );
};

export default Journal;
