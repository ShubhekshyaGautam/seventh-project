import React, { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is TimeMap?",
      a: "TimeMap is a student time management system that helps users plan, track, and analyze how they spend their time to improve productivity."
    },
    { q: "Is TimeMap free to use?", a: "" },
    { q: "How does time tracking work?", a: "" },
    { q: "Can I view my productivity reports?", a: "" },
    { q: "Does TimeMap use machine learning?", a: "" },
    { q: "Is my data safe?", a: "" }
  ];

  return (
    <>
      <section className="faq-section">
        <h2 className="faq-title">Frequently Ask Question</h2>

        <div className="faq-container">
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? "open" : ""}`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="faq-question">
                {item.q}
                <span className="icon">
                  {openIndex === i ? "−" : "+"}
                </span>
              </div>

              {openIndex === i && item.a && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>

        <p className="faq-footer">
          Didn’t find your query?{" "}
          <span>Reach out to our Customer Service team</span>
        </p>
      </section>

      {/* CSS IN SAME FILE */}
      <style>{`
        .faq-section {
          background: #ffffff;
          padding: 70px 140px;
          font-family: "Inter", sans-serif;
        }

        .faq-title {
          font-size: 30px;
          font-weight: 600;
          margin-bottom: 30px;
        }

        .faq-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 900px;
        }

        .faq-item {
          background: #eaeaea;
          border-radius: 8px;
          padding: 18px 22px;
          cursor: pointer;
          transition: 0.2s;
        }

        .faq-item.open {
          background: #eaeaea;
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: 500;
        }

        .icon {
          font-size: 20px;
          color:  #ff8c00;
        }

        .faq-answer {
          margin-top: 10px;
          font-size: 14px;
          color: #555;
          line-height: 1.5;
          max-width: 700px;
        }

        .faq-footer {
          margin-top: 18px;
          font-size: 13px;
          color: #777;
        }

        .faq-footer span {
          color: #ff8c00;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default FAQ;
