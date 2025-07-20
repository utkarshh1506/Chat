import React, { useState, useEffect } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import axios from "../api/axios.config";
import { io } from "socket.io-client";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // 1. Establish socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 2. Fetch users immediately on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res1 = await axios.get("/api/users/me", { headers });
        setLoggedInUser(res1.data);

        const res2 = await axios.get("/api/users/all", { headers });
        setAllUsers(res2.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, []);

  // 3. Emit userConnected once user and socket are ready
  useEffect(() => {
    if (socket && loggedInUser?._id) {
      socket.emit("userConnected", loggedInUser);
    }
  }, [socket, loggedInUser]);

  // 4. Listen for user status change
  useEffect(() => {
    if (!socket) return;

    const handleUserStatusChange = (updatedUsers) => {
      setAllUsers(updatedUsers);
    };

    socket.on("userStatusChanged", handleUserStatusChange);

    return () => {
      socket.off("userStatusChanged", handleUserStatusChange);
    };
  }, [socket]);

  // 5. Update selectedUser if online status changes
  useEffect(() => {
    if (!selectedUser || allUsers.length === 0) return;

    const updated = allUsers.find((u) => u._id === selectedUser._id);
    if (updated) {
      setSelectedUser(updated);
    }
  }, [allUsers, selectedUser]);

  // 6. Fetch chat messages on user selection
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !loggedInUser) return;

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(
          `/api/messages/${loggedInUser._id}/${selectedUser._id}`,
          { headers }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat messages", err);
      }
    };

    fetchMessages();
  }, [selectedUser, loggedInUser]);

  // 7. Real-time message listener
  useEffect(() => {
    if (!socket || !loggedInUser) return;

    const handleIncomingMessage = (newMsg) => {
      const isForCurrentChat =
        (newMsg.senderId === loggedInUser._id &&
          newMsg.receiverId === selectedUser?._id) ||
        (newMsg.receiverId === loggedInUser._id &&
          newMsg.senderId === selectedUser?._id);

      if (isForCurrentChat) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("chatMessage", handleIncomingMessage);

    return () => {
      socket.off("chatMessage", handleIncomingMessage);
    };
  }, [socket, selectedUser, loggedInUser]);

  return (
    <div className="home-wrapper">
      <div
        className={`component-wrapper ${
          selectedUser ? "user-selected" : "no-user"
        }`}
      >
        <Sidebar
          users={allUsers}
          currentUser={loggedInUser}
          selectedUserId={selectedUser?._id}
          setSelectedUser={setSelectedUser}
        />

        {selectedUser && (
          <RightSidebar
            currentUser={loggedInUser}
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages}
            socket={socket}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
