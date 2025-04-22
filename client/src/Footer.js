import { Facebook, Instagram, Tiktok } from "react-bootstrap-icons";
import logo from "./assets/logoNoText.png";
import "./Footer.css"; // Make sure this line imports your CSS

const Footer = () => {
  const companyName = "Buck's Dog Training of Central Jersey";
  
  return (
    <footer className="footer mt-5">
      <div className="footer-container">
        {/* Company info */}
        <div className="company-info">
          <img src={logo} alt="Logo" className="logo" />
          <div className="company-text">
            <h2>Buck's Dog Training</h2>
            <h5>of Central Jersey</h5>
          </div>
        </div>

        {/* Social media links */}
        <div className="social-links">
          <a href="https://www.instagram.com/lauraine_bucksdogtraining/" target="_blank" rel="noopener noreferrer">
            <Instagram size={32} />
          </a>
          <a href="https://www.facebook.com/bucksdogtrainingcnj" target="_blank" rel="noopener noreferrer">
            <Facebook size={32} />
          </a>
          <a href="https://www.tiktok.com/@laurainewright" target="_blank" rel="noopener noreferrer">
            <Tiktok size={32} />
          </a>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
