import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCopy, FaPhoneSlash } from "react-icons/fa";
import "./VideoCall.css"; // Import custom styles

const socket = io("https://echomeet-5q04.onrender.com");

function VideoCall() {
    const { callId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [peerConnection, setPeerConnection] = useState(null);

    useEffect(() => {
        const pc = new RTCPeerConnection();

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            })
            .catch((error) => console.error("Error accessing media devices:", error));

        socket.emit("join-room", { callId });

        socket.on("offer", async (data) => {
            if (!pc || pc.signalingState === "closed") return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("answer", { answer, to: data.from });
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        });

        socket.on("answer", async (data) => {
            if (!pc || pc.signalingState === "closed") return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (error) {
                console.error("Error setting remote description:", error);
            }
        });

        socket.on("candidate", async (data) => {
            if (!pc || pc.signalingState === "closed") return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("candidate", { candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        setPeerConnection(pc);

        // Auto start call
        startCall(pc);

        return () => {
            if (pc.signalingState !== "closed") {
                pc.close();
            }
            setPeerConnection(null);
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
        };
    }, [callId]);

    const startCall = async (pc) => {
        if (!pc || pc.signalingState === "closed") return;
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { offer, callId });
        } catch (error) {
            console.error("Error starting call:", error);
        }
    };

    const endCall = () => {
        if (peerConnection) {
            peerConnection.close();
        }
        socket.emit("end-call", { callId });
        navigate("/home"); // Navigate to home after call ends
    };

    const copyCallId = () => {
        navigator.clipboard.writeText(callId);
        alert("Call ID copied!");
    };

    return (
        <div className="video-call-container">
            {/* Call ID Display */}
            <div className="call-id">
                <span>Call ID: {callId}</span>
                <button onClick={copyCallId} className="copy-btn">
                    <FaCopy />
                </button>
            </div>

            <div className="video-container">
                <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
                <video ref={localVideoRef} className="local-video" autoPlay playsInline muted />
            </div>

            {/* Call Control Buttons */}
            <div className="call-controls">
                <button className="btn btn-danger end-call" onClick={endCall}>
                    <FaPhoneSlash /> End Call
                </button>
            </div>
        </div>
    );
}

export default VideoCall;
