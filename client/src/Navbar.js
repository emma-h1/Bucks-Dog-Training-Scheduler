import logo from "./assets/logoNoText.png";
import icon from "./assets/userIcon.png";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="nav">

            <img src={logo} className="logo" />
    
        <ul> 
            <Link to="/">HOME</Link>

            <CustomLink to="/about">ABOUT</CustomLink>

            <CustomLink to="/services">SERVICES</CustomLink>  

            <CustomLink to="/contact">CONTACT</CustomLink>

        </ul>


        <ul className="btn-signin">
            <img src={icon} className="icon" />

                <Link to="/signin">SIGN IN</Link>

        </ul>

    </nav>
    );
}

function CustomLink({to, children, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })
    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    );
}