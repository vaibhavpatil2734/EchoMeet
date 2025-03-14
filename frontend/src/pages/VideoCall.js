import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaCopy, FaPhoneSlash, FaPlay, FaVideo, FaMicrophone, FaVideoSlash, FaMicrophoneSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VideoCall.css";

const socket = io("https://echomeet-5q04.onrender.com");

function VideoCall() {
    const { callId } = useParams();
    const navigate = useNavigate();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    useEffect(() => {
        const pc = new RTCPeerConnection();

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setLocalStream(stream);
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

    const startCall = async () => {
        if (!peerConnection || peerConnection.signalingState === "closed") return;
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("offer", { offer, callId });
        } catch (error) {
            console.error("Error starting call:", error);
        }
    };

    const endCall = () => {
        // Close peer connection
        if (peerConnection) {
            peerConnection.ontrack = null;
            peerConnection.onicecandidate = null;
            peerConnection.close();
            setPeerConnection(null);
        }
    
        // Stop all media tracks (camera & mic)
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
    
        // Inform the server that the user has left
        socket.emit("leave-room", { callId });
    
        // Remove all socket event listeners to prevent memory leaks
        socket.off("offer");
        socket.off("answer");
        socket.off("candidate");
        socket.off("leave-room");
    
        // Redirect user to home page after cleanup
        navigate("/home");
    };
    

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
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

            <div className="video-container">
                <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
                <video ref={localVideoRef} className="local-video" autoPlay playsInline muted />
            </div>

            <div className="call-controls">
                <button className="btn btn-danger end-call" onClick={endCall}>
                    <FaPhoneSlash /> End Call
                </button>
                <button className="btn btn-primary start-call" onClick={startCall}>
                    <FaPlay /> Start Call
                </button>
                <button className={`btn ${isCameraOn ? "btn-secondary" : "btn-warning"}`} onClick={toggleCamera}>
                    {isCameraOn ? <FaVideo /> : <FaVideoSlash />} Camera
                </button>
                <button className={`btn ${isMicOn ? "btn-secondary" : "btn-warning"}`} onClick={toggleMic}>
                    {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />} Mic
                </button>
            </div>
        </div>
    );
}

export default VideoCall;
