import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/img/bg.png';
import { motion } from "framer-motion";
import { fadeIn, fadeLeft, staggerContainer } from "./Animation";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
      }}
    >
      {/* 1. THE DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          zIndex: 1,
        }}
      />

      {/* 2. THE OVERLAY NAVBAR */}
      

      {/* 3. CENTER CONTENT */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{
          marginTop: "100px",
          position: "relative",
          zIndex: 5,
          textAlign: "center",
          color: "white",
        }}
      >
        {/* ✅ FadeIn text */}
        <motion.h1 variants={fadeIn}
          style={{
            fontSize: "clamp(60px, 10vw, 100px)",
            fontWeight: "900",
            margin: "0 0 10px 0",
            letterSpacing: "-4px",
            lineHeight: "1",
          }}
        >
          TimeMap
        </motion.h1>

        <motion.p
          variants={fadeIn}
          style={{
            fontSize: "22px",
            fontWeight: "500",
            marginBottom: "30px",
          }}
        >
          Where there is planning, there is progress.
        </motion.p>

        <motion.button
          variants={fadeIn}
          onClick={() => navigate('/signup')}
          style={{
            backgroundColor: "white",
            color: "black",
            border: "none",
            padding: "12px 32px",
            borderRadius: "999px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "15px"
          }}
        >
          Manage your time
        </motion.button>
      </motion.div>
    </section>
  );
}