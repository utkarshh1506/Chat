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

  // Set up socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // adjust if using env vars
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch logged-in user and all users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res1 = await axios.get("/api/users/me", { headers });
        setLoggedInUser(res1.data);

        const res2 = await axios.get("/api/users/all", { headers });
        setAllUsers(res2.data);

        if(socket && res1?.data._id){
          socket.emit('setOnline', res1.data._id)
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, [socket]);

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

        {/* Only show RightSidebar when a user is selected */}
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
