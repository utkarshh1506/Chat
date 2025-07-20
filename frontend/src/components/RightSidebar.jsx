import React, { useEffect, useRef, useState } from "react";
import "./RightSideBar.css";
import assets from "../assets/assets";
import axios from "../api/axios.config";

const RightSideBar = ({
  currentUser,
  selectedUser,
  selectedRoom,
  messages,
  socket,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState(false);
  const messageEndRef = useRef(null);

  const isRoomChat = Boolean(selectedRoom);

  // Auto scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator for 1-to-1 chats
  useEffect(() => {
    if (!socket || !currentUser || !selectedUser || isRoomChat) return;

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
    input?.addEventListener("input", handleTyping);

    return () => {
      input?.removeEventListener("input", handleTyping);
      clearTimeout(typingTimeout);
    };
  }, [socket, currentUser, selectedUser, isRoomChat]);

  // Listen to typing for 1-to-1
  useEffect(() => {
    if (!socket || !selectedUser || isRoomChat) return;

    const handleTyping = ({ from, isTyping }) => {
      if (from === selectedUser._id) {
        setTypingStatus(isTyping);
      }
    };

    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, [socket, selectedUser, isRoomChat]);

  // Handle Send
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUser) return;

    if (isRoomChat) {
      const payload = {
        roomId: selectedRoom._id,
        senderId: currentUser._id,
        message: trimmed,
      };

      socket.emit("roomMessage", payload);

      try {
        await axios.post("/api/room-messages", payload);
      } catch (err) {
        console.error("Room message save failed:", err.message);
      }
    } else {
      const payload = {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        message: trimmed,
      };

      socket.emit("chatMessage", payload);

      try {
        await axios.post("/api/messages", payload);
      } catch (err) {
        console.error("1-to-1 message save failed:", err.message);
      }
    }

    setNewMessage("");
  };

  // Message bubble renderer
  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isSentByMe =
        msg.senderId === currentUser._id ||
        msg.senderId?._id === currentUser._id;

      const senderName =
        isRoomChat && msg.senderId?.fullname
          ? msg.senderId.fullname
          : isSentByMe
          ? "You"
          : selectedUser?.fullname || "User";

      return (
        <div
          key={index}
          className={`message-card ${isSentByMe ? "sent" : "received"}`}
        >
          {isRoomChat && !isSentByMe && (
            <div className="room-msg-sender">
              <strong>{senderName}</strong>
            </div>
          )}
          <p>{msg.message}</p>
          <small>
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
        </div>
      );
    });
  };

  return (
    <div className="rightbar">
      {/* Header */}
      <div className="rightbar-top">
        <img
          src={
            isRoomChat
              ? selectedRoom?.roomImg || assets.avatar_icon
              : selectedUser?.profile || assets.avatar_icon
          }
          alt="chat"
          className="selected-profile"
        />
        <div className="selected-info">
          <h3>{isRoomChat ? selectedRoom?.name : selectedUser?.fullname}</h3>
          {!isRoomChat && (
            <span className={selectedUser?.isOnline ? "online" : "offline"}>
              {typingStatus
                ? "Typing..."
                : selectedUser?.isOnline
                ? "Online"
                : "Offline"}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="message-area">
        {renderMessages()}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
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
