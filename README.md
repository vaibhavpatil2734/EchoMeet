# 📹 Real-Time Video Calling Web Application

🚀 About the Project
This is a real-time video calling web application built using React.js, WebRTC, and Socket.io. The platform enables seamless peer-to-peer video communication with a clean and intuitive interface similar to Google Meet. It features real-time signaling, ICE candidate exchange, and interactive controls for managing calls.

---

⚙️ Tech Stack
- Frontend: React.js, Tailwind CSS (for styling)
- Backend: Node.js, Express.js
- Real-Time Communication: WebRTC, Socket.io
- Styling: Tailwind CSS

---

🎯 Key Features

🔹 1. Peer-to-Peer Video Calling
- Users can initiate and join video calls with low latency.
- Smooth real-time communication without external plugins.

🔹 2. Google Meet-Like Interface
- Small self-video preview: Displays the user's own video in a small box while the peer's video is shown in the main area.
- Responsive Layout: The UI automatically adjusts for different screen sizes.

🔹 3. WebRTC Integration
- Uses WebRTC API to handle peer-to-peer video and audio communication.
- Facilitates direct data streams between users without the need for an external server.

🔹 4. Secure Signaling with Socket.io
- Socket.io handles signaling for WebRTC connection establishment.
- ICE Candidate Exchange: Transfers network information between peers to establish a direct connection.
- Ensures efficient connection negotiation and real-time updates.

🔹 5. Interactive UI
- Clear and minimalistic UI with buttons for:
  - Start/End Call
  - Mute/Unmute Microphone
  - Toggle Video
  - Disconnect

---

🛠️ Installation and Setup

Clone the Repository
```bash
git clone <repository_url>
cd <project_folder>
```

Install Dependencies
```bash
npm install
```

Start the Development Server
```bash
npm start
```

---

🛠️ Usage Instructions
1. Open the application in your browser.
2. Allow access to your camera and microphone.
3. Create a room or join an existing room using the generated ID.
4. Enjoy seamless video communication with peers.

---

✅ Future Enhancements
- Chat Integration: Add text messaging alongside video calls.
- Screen Sharing: Enable users to share their screens.
- Authentication: Secure user authentication using OAuth.
- Session Recording: Add functionality to record and save calls.

---

📄 License
This project is licensed under the MIT License.

---

🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request with detailed information about the changes.

---

📩 Contact
For any questions or feedback, feel free to reach out at [your_email@example.com](mailto:your_email@example.com).
