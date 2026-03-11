import { CalendarCheck, Clock, BarChart3 } from "lucide-react";

export default function Features() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.heading}>
          Why Use TimeMap for Better Time Management?
        </h2>

        <p style={styles.subheading}>
          Track your time, stay focused, and build productive habits with smart
          insights designed for students.
        </p>

        <div style={styles.grid}>
          <Card
            color="#FFF7AF"
            title="Smart Scheduling"
            text="Plan your daily tasks and study sessions with a clear, flexible schedule that fits your goals."
            icon={<CalendarCheck size={20} color="#C28730" />}
          />

          <Card
            color="#C5F0FF"
            title="Effortless Tracking"
            text="Easily record how you spend your time and identify where it's being wasted or optimized."
            icon={<Clock size={20} color="#C28730" />}
          />

          <Card
            color="#FFBBBB"
            title="Personalized Insights"
            text="Get data-driven recommendations to improve productivity and manage time more effectively."
            icon={<BarChart3 size={20} color="#C28730" />}
          />
        </div>
      </div>
    </section>
  );
}

function Card({ title, text, color, icon }) {
  return (
    <div style={{ ...styles.card, backgroundColor: color }}>
      <div style={styles.iconBox}>{icon}</div>

      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{text}</p>
    </div>
  );
}

const styles = {
  section: {
    backgroundColor: "#ffffff",
    padding: "100px 0",
    fontFamily: "DM Sans, sans-serif"
  },

  container: {
    width: "1100px",
    margin: "0 auto",
    textAlign: "center"
  },

  heading: {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "15px"
  },

  subheading: {
    fontSize: "15px",
    color: "#555",
    maxWidth: "600px",
    margin: "0 auto 60px auto",
    lineHeight: 1.6
  },

  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "30px"
  },

  card: {
    width: "320px",
    padding: "30px",
    borderRadius: "14px",
    textAlign: "left"
  },

  iconBox: {
    width: "44px",
    height: "44px",
    backgroundColor: "white",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px"
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "10px"
  },

  cardText: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#333"
  }
};
