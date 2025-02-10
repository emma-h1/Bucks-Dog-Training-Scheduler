import logo from "../assets/logoNoText.png"
import { Link } from "react-router-dom"

export default function LogIn() {


    return (
        <div className="container-signin">
            <img src={logo}
                 alt=""
                 height={250}
                 width={250}
                 style={{alignSelf:"center"}}
                 className="mt-5 pt-3"
            />

            <div className="title">
                <h1>Log In</h1>
            </div>

            {/*This is the input form for the user's info*/}
            <div className="form-signin">
                <form >
                    <div className="input">
                        <input type="text" placeholder="Email" name="email"  required/>
                    </div>

                    <div className="input">
                        <input type="password" placeholder="Password" name="password" required/>
                    </div>

                    <button className="btn btn-success" type="submit" title="submit">
                        Log In
                    </button>

                    {/*These are the other options to redirect if user does not want to create acct*/}
                    <div className="forgot-password">
                        <p>Forgot Password?
                            <span>
                                <Link to="/reset-password"> Reset Password</Link>
                            </span>
                        </p>
                    </div>

                    <div className="return-SignIn">
                        <p>Return to signin
                            <span>
                                <Link to="/signin"> here</Link>
                            </span>
                        </p>
                    </div>
                </form>
            
            </div>
        </div>
    )
}