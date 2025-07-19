import React, { useEffect, useRef, useState } from "react";
import "./RightSideBar.css";
import assets from "../assets/assets";
import axios from "axios";

const RightSideBar = ({ currentUser, selectedUser, messages, setMessages, socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Receive messages
  useEffect(() => {
    socket.on("chatMessage", (message) => {
      if (
        (message.username === selectedUser.fullname &&
         message.room === selectedUser.room) ||
        message.username === currentUser.fullname
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("chatMessage");
  }, [selectedUser, socket]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      room: selectedUser.room,
      username: currentUser.fullname,
      message: newMessage,
    };

    // Emit to socket and save in DB
    socket.emit("chatMessage", messageData);

    try {
      await axios.post("/api/messages", messageData);
    } catch (err) {
      console.error("Failed to save message", err);
    }

    setNewMessage("");
  };

  return (
    <div className="rightbar">
      {/* Top sticky user card */}
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

      {/* Scrollable message area */}
      <div className="message-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-card ${
              msg.username === currentUser.fullname ? "sent" : "received"
            }`}
          >
            <p>{msg.message}</p>
            <small>{msg.username}</small>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Input area */}
      <form className="message-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">
          <img src={assets.send_icon} alt="Send" />
        </button>
      </form>
    </div>
  );
};

export default RightSideBar;
