import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Importing custom styles
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post("https://echomeet-5q04.onrender.com/api/auth/register", { email, password });
            alert(response.data.message);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <div>
            <Navbar/>
            <div className="register-container d-flex flex-column align-items-center justify-content-center">
            <div className="register-box shadow-lg p-4 rounded">
                <h2 className="text-center mb-4">Create an Account</h2>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-register w-100" >
                        Sign Up
                    </button>
                </form>

                <p className="text-center mt-3">
                    Already have an account? <Link to="/" className="text-info">Sign in</Link>
                </p>
            </div>
        </div>
        </div>
    );
};

export default Register;
