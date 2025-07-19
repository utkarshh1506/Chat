import React from "react";
import "./Chat.css";
import assets from '../assets/assets.js'

const ChatContainer = ({ selectedUser }) => {
  if (!selectedUser) {
    return (
      <div className="chat-container empty">
        <div className="placeholder">
          <img src={assets.logo_icon} alt="App Logo" style={{ width: "100px" }} />
          <p>Please select a user to start chatting</p>
        </div>
      </div>
    );
  }
  return (
    <div className="chat-container">
      {/* Your chat messages and input area here */}
    </div>
  );
};

export default ChatContainer;
