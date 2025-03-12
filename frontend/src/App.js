import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VideoCall from "./pages/VideoCall";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Regiser" element={<Register/>}/>
                <Route path="/home" element={<Home />} />
                <Route path="/call/:callId" element={<VideoCall />} />
            </Routes>
        </Router>
    );
}

export default App;
