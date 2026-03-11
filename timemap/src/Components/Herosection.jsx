import backgroundImage from '../assets/img/bg.png'; 
import logo from '../assets/img/logo.png'; 

export default function HeroSection() {
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
        justifyContent: "center", // Keeps the TimeMap text centered vertically
        alignItems: "center",
        overflow: "hidden"
      }}
    >

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.55)", // This creates that aesthetic dark look
          zIndex: 1,
        }}
      />

      {/* 2. THE OVERLAY NAVBAR: Sits on top of the image */}
      <nav
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "30px 60px", 
          zIndex: 10, 
          backgroundColor: "transparent", 
        }}
      >
        {/* Logo Space (Left) */}
<div style={{ width: "40px", height: "40px", display: "flex", alignItems: "center" }}>
  <img 
    src={logo} 
    alt="TimeMap Logo" 
    style={{ 
      width: "100%", 
      height: "auto", 
      display: "block" 
    }} 
  />
</div>

        {/* Right Side Items */}
        <div style={{ display: "flex", gap: "35px", alignItems: "center" }}>
          <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "15px" }}>About Us</a>
          <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "15px" }}>Contact</a>
          
          {/* Login Button with Icon Space */}
          <button style={{
            backgroundColor: "white",
            color: "black",
            border: "none",
            padding: "9px 20px",
            borderRadius: "996px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer"
          }}>
             Login
          </button>

          {/* The Hamburger/Menu Icon on the far right */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", cursor: "pointer" }}>
            <div style={{ width: "20px", height: "2px", backgroundColor: "white" }}></div>
            <div style={{ width: "20px", height: "2px", backgroundColor: "white" }}></div>
          </div>
        </div>
      </nav>

      {/* 3. CENTER CONTENT */}
      <div
        style={{
          marginTop: "100px",
          position: "relative",
          zIndex: 5,
          textAlign: "center",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(60px, 10vw, 100px)", 
            fontWeight: "900",
            margin: "0 0 10px 0",
            letterSpacing: "-4px",
            lineHeight: "1",
          }}
        >
          TimeMap
        </h1>

        <p
          style={{
            fontSize: "22px",
            fontWeight: "500",
            marginBottom: "30px",
          }}
        >
          Where there is planning, there is progress.
        </p>

        <button
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
        </button>
      </div>

      
    </section>
  );
}