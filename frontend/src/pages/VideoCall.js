import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaCopy, FaPhoneSlash, FaPlay } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VideoCall.css";

const socket = io("https://echomeet-5q04.onrender.com");

function VideoCall() {
    const { callId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState("Waiting to Start...");

    const startCall = useCallback(async () => {
        setStatus("Connecting...");
        
        const pc = new RTCPeerConnection();
        peerConnectionRef.current = pc;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("candidate", { candidate: event.candidate, callId });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { offer, callId });

        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    }, [callId]);

    useEffect(() => {
        socket.emit("join-room", { callId });

        socket.on("offer", async (data) => {
            setStatus("Incoming Call...");
            const pc = new RTCPeerConnection();
            peerConnectionRef.current = pc;

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("candidate", { candidate: event.candidate, callId });
                }
            };

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("answer", { answer, callId });

                setStatus("Connected");
                setIsConnected(true);
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        });

        socket.on("answer", async (data) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                setStatus("Connected");
                setIsConnected(true);
            }
        });

        socket.on("candidate", async (data) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (error) {
                    console.error("Error adding ICE candidate:", error);
                }
            }
        });

        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
        };
    }, [callId]);

    const endCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        socket.emit("end-call", { callId });
        navigate("/home");
    };

    const copyCallId = () => {
        navigator.clipboard.writeText(callId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="video-call-container">
            <div className="call-id">
                <span>Call ID: {callId}</span>
                <button onClick={copyCallId} className="copy-btn" title="Copy Call ID">
                    <FaCopy />
                </button>
                {copied && <span className="copied-tooltip">Copied!</span>}
            </div>

            <div className="status-message">{status}</div>

            <div className="video-container">
                <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
                <video ref={localVideoRef} className="local-video" autoPlay playsInline muted />
            </div>

            <div className="call-controls">
                {!isConnected && (
                    <button className="btn btn-success start-call" onClick={startCall}>
                        <FaPlay /> Start Call
                    </button>
                )}
                <button className="btn btn-danger end-call" onClick={endCall}>
                    <FaPhoneSlash /> End Call
                </button>
            </div>
        </div>
    );
}

export default VideoCall;
