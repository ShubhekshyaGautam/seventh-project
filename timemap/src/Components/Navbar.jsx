import logo from '../assets/img/logo.png';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <>
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
        <div style={{ width: "40px", height: "40px", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="TimeMap Logo" style={{ width: "100%" }} />
        </div>

        <div style={{ display: "flex", gap: "35px", alignItems: "center" }}>
          <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "15px" }}>About Us</a> <a href="#" style={{ color: "white", textDecoration: "none", fontWeight: "500", fontSize: "15px" }}>Contact</a>

          <button onClick={() => navigate('/login')} style={{ backgroundColor: "white", color: "black", border: "none", padding: "9px 20px", borderRadius: "996px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} > Login </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px", cursor: "pointer" }}>
            <div style={{ width: "20px", height: "2px", backgroundColor: "white" }}></div>
            <div style={{ width: "20px", height: "2px", backgroundColor: "white" }}></div>
          </div>
        </div>
      </nav>
    </>
  );
};
