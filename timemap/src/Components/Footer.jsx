import React from 'react';
import logoImgFile from '../assets/img/logo.png';
import { Instagram, Youtube, Twitter, Music2 } from 'lucide-react'; 


const Footer = () => {
  const currentYear = new Date().getFullYear();

  // --- Inline Styles ---
  const styles = {
    footer: {
      backgroundColor: '#c48b32', // Warm mustard color from your image
      color: '#ffffff',
      padding: '60px 5% 30px 5%',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    topSection: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '40px',
      marginBottom: '60px',
    },
    brandArea: {
      flex: '1 1 250px',
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
    },
    logoImg: {
      width: '32px', // Adjust size as needed
      height: '32px',
      objectFit: 'contain',
    },
    brandName: {
      fontSize: '24px',
      fontWeight: '600',
      margin: 0,
    },
    tagline: {
      fontSize: '14px',
      lineHeight: '1.5',
      opacity: '0.9',
      fontWeight: '400',
    },
    linksWrapper: {
      display: 'flex',
      flex: '2 1 500px',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '30px',
    },
    column: {
      minWidth: '140px',
    },
    columnTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '20px',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    listItem: {
      marginBottom: '12px',
    },
    link: {
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: '14px',
      opacity: '0.8',
      transition: 'opacity 0.2s',
    },
    divider: {
      border: 'none',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '25px',
    },
    bottomBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px',
    },
    copyright: {
      fontSize: '14px',
      opacity: '0.9',
    },
    socials: {
      display: 'flex',
      gap: '18px',
    },
    socialIcon: {
      color: '#ffffff',
      opacity: '0.9',
      transition: 'transform 0.2s',
      cursor: 'pointer',
    }
  };

  const sections = [
    {
      title: "TimeMap",
      links: ["About Us", "Contact Us", "Help & FAQ", "Feedback", "Privacy Policy", "Terms and Condition"]
    },
    {
      title: "Tools",
      links: ["Create Schedule", "Track Time", "Task Manager", "Goal Setting", "Productivity Reports", "Calendar View"]
    },
    {
      title: "Resources",
      links: ["Study Tips", "Blog", "Time Management Guide", "Documentation", "Terms & Conditions"]
    }
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.topSection}>
          
          {/* Brand & Logo Section */}
          <div style={styles.brandArea}>
            <div style={styles.logoWrapper}>
              {/* REPLACE THE SRC BELOW WITH YOUR LOGO PATH */}
             <img src={logoImgFile} alt="TimeMap Logo" style={styles.logoImg} />
              <h2 style={styles.brandName}>TimeMap</h2>
            </div>
            <p style={styles.tagline}>
              Helping students manage time smarter,<br />not harder.
            </p>
          </div>

          {/* Nav Links Section */}
          <div style={styles.linksWrapper}>
            {sections.map((section, idx) => (
              <div key={idx} style={styles.column}>
                <h3 style={styles.columnTitle}>{section.title}</h3>
                <ul style={styles.list}>
                  {section.links.map((link, i) => (
                    <li key={i} style={styles.listItem}>
                      <a href={`#${link.toLowerCase().replace(/\s/g, '-')}`} style={styles.link}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Bottom Bar: Copyright & Lucide Icons */}
        <div style={styles.bottomBar}>
          <div style={styles.copyright}>
            © {currentYear} TimeMap. All rights reserved.
          </div>
          <div style={styles.socials}>
            <a href="#" style={styles.socialIcon}><Instagram size={20} strokeWidth={1.5} /></a>
            <a href="#" style={styles.socialIcon}><Youtube size={20} strokeWidth={1.5} /></a>
            <a href="#" style={styles.socialIcon}><Music2 size={20} strokeWidth={1.5} /></a> {/* TikTok alternative */}
            <a href="#" style={styles.socialIcon}><Twitter size={20} strokeWidth={1.5} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;