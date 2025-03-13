import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaCopy, FaPhoneSlash, FaPhone } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VideoCall.css";

const socket = io("https://echomeet-5q04.onrender.com");

function VideoCall() {
    const { callId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState("Waiting to start...");
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [localStream, setLocalStream] = useState(null);

    const setupPeerConnection = useCallback(async () => {
        const pc = new RTCPeerConnection();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("candidate", { candidate: event.candidate, callId });
                }
            };

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
                setStatus("Connected");
            };

            setPeerConnection(pc);
            return pc;
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    }, [callId]);

    const startCall = useCallback(async () => {
        if (!peerConnection || peerConnection.signalingState === "closed") return;

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("offer", { offer, callId });
            setStatus("Waiting for other user...");
        } catch (error) {
            console.error("Error starting call:", error);
        }
    }, [callId, peerConnection]);

    useEffect(() => {
        let isMounted = true;
        let pc;

        const initializeCall = async () => {
            pc = await setupPeerConnection();
            if (!isMounted || !pc) return;

            socket.emit("join-room", { callId });

            socket.on("offer", async (data) => {
                if (!pc || pc.signalingState === "closed") return;
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit("answer", { answer, callId });
                    setStatus("Connecting...");
                } catch (error) {
                    console.error("Error handling offer:", error);
                }
            });

            socket.on("answer", async (data) => {
                if (!pc || pc.signalingState === "closed") return;
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                    setStatus("Connected");
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

            setPeerConnection(pc);
        };

        initializeCall();

        return () => {
            isMounted = false;
            if (pc) {
                pc.close();
            }
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
        };
    }, [callId, setupPeerConnection]);

    const handleStartCall = () => {
        if (peerConnection) {
            startCall();
            setIsCallStarted(true);
        }
    };

    const endCall = () => {
        if (peerConnection) {
            peerConnection.close();
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

            <div className="status">
                <strong>Status: </strong> {status}
            </div>

            <div className="video-container">
                <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
                <video ref={localVideoRef} className="local-video" autoPlay playsInline muted />
            </div>

            <div className="call-controls">
                {!isCallStarted ? (
                    <button className="btn btn-success start-call" onClick={handleStartCall}>
                        <FaPhone /> Start Call
                    </button>
                ) : (
                    <button className="btn btn-danger end-call" onClick={endCall}>
                        <FaPhoneSlash /> End Call
                    </button>
                )}
            </div>
        </div>
    );
}

export default VideoCall;
