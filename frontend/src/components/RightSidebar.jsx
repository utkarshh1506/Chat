import React, { useEffect, useRef, useState } from "react";
import "./RightSideBar.css";
import assets from "../assets/assets";
import axios from "../api/axios.config";

const RightSideBar = ({
  currentUser,
  selectedUser,
  messages,
  setMessages,
  socket,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socket || !currentUser || !selectedUser) return;

    const handleIncomingMessage = (message) => {
      console.log("📩 Incoming Socket Message:", message);
      const isRelevant =
        (message.senderId === currentUser._id &&
          message.receiverId === selectedUser._id) ||
        (message.senderId === selectedUser._id &&
          message.receiverId === currentUser._id);

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("chatMessage", handleIncomingMessage);

    return () => {
      socket.off("chatMessage", handleIncomingMessage);
    };
  }, [socket, currentUser?._id, selectedUser?._id]);

  // Send a message
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUser || !selectedUser) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message: trimmed,
    };

    // Emit real-time message via socket
    socket.emit("chatMessage", messageData);

    // Save to DB
    try {
      await axios.post("/api/messages", messageData);
    } catch (err) {
      console.error("❌ Message save failed:", err.message);
    }

    setNewMessage("");
  };

  return (
    <div className="rightbar">
      {/* Top user info */}
      <div className="rightbar-top">
        <img
          src={selectedUser?.profile || assets.avatar_icon}
          alt="profile"
          className="selected-profile"
        />
        <div className="selected-info">
          <h3>{selectedUser?.fullname}</h3>
          <span className={selectedUser?.isOnline ? "online" : "offline"}>
            {selectedUser?.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="message-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-card ${
              msg.senderId === currentUser._id ? "sent" : "received"
            }`}
          >
            <p>{msg.message}</p>
            <small>
              {msg.senderId === currentUser._id ? "You" : selectedUser.fullname}
            </small>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Message input */}
      <form className="message-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default RightSideBar;
