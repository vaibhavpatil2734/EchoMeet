import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Import the CSS file
import Navbar from "./Navbar";

function Home() {
    const [callId, setCallId] = useState("");
    const navigate = useNavigate();

    const startCall = () => {
        const generatedCallId = Math.random().toString(36).substr(2, 6);
        navigate(`/call/${generatedCallId}`);
    };

    const joinCall = () => {
        if (callId) navigate(`/call/${callId}`);
    };

    return (
        <div>
            <Navbar/>
            <div className="home-container">
            <div className="home-box">
                <h2>🎥 Video Call Dashboard</h2>
                <button className="btn-primary start-btn" onClick={startCall}>Start New Call</button>
                <input 
                    type="text" 
                    placeholder="Enter Call ID" 
                    value={callId} 
                    onChange={(e) => setCallId(e.target.value)} 
                    className="form-control call-input"
                />
                <button className="btn-secondary join-btn" onClick={joinCall}>Join Call</button>
            </div>
        </div>
        </div>
    );
}

export default Home;
