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
  const [typingStatus, setTypingStatus] = useState(false);
  const messageEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socket || !currentUser || !selectedUser) return;

    const handleIncomingMessage = (message) => {
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

  // Handle typing indicator send
  useEffect(() => {
    if (!socket || !currentUser || !selectedUser) return;

    const delay = 1000;
    let typingTimeout;

    const handleTyping = () => {
      socket.emit("typing", {
        from: currentUser._id,
        to: selectedUser._id,
        isTyping: true,
      });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("typing", {
          from: currentUser._id,
          to: selectedUser._id,
          isTyping: false,
        });
      }, delay);
    };

    const input = document.getElementById("message-input");
    if (input) {
      input.addEventListener("input", handleTyping);
    }

    return () => {
      if (input) input.removeEventListener("input", handleTyping);
      clearTimeout(typingTimeout);
    };
  }, [socket, currentUser?._id, selectedUser?._id]);

  // Listen to typing event from selected user
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ from, isTyping }) => {
      if (from === selectedUser._id) {
        setTypingStatus(isTyping);
      }
    };

    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, [socket, selectedUser?._id]);

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

    socket.emit("chatMessage", messageData);

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
            {typingStatus
              ? "Typing..."
              : selectedUser?.isOnline
              ? "Online"
              : "Offline"}
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
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Message input */}
      <form className="message-input" onSubmit={handleSend}>
        <input
          id="message-input"
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
