import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
            <h2>Video Call Dashboard</h2>
            <button onClick={startCall}>Start New Call</button>
            <input type="text" placeholder="Enter Call ID" value={callId} onChange={(e) => setCallId(e.target.value)} />
            <button onClick={joinCall}>Join Call</button>
        </div>
    );
}

export default Home;
