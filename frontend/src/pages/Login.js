import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Importing custom styles
import Navbar from "./Navbar";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const response = await fetch("https://echomeet-5q04.onrender.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            navigate("/home");
        } else {
            alert(data.error);
        }
    };

    return (
        <div>
            <Navbar/>
            <div className="login-container d-flex flex-column align-items-center justify-content-center">
            <div className="login-box shadow-lg p-4 rounded">
                <h2 className="text-center mb-4">Sign in to Your Account</h2>

                <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="Enter your password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button 
                    onClick={handleLogin} 
                    className="btn btn-primary w-100"
                >
                    Sign in
                </button>

            
            </div>

            <p className="text-white mt-3">
                New here? <a href="/Regiser" className="text-info">Create an account</a>
            </p>
        </div>
        </div>
    );
}

export default Login;
