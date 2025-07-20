import React, { useState, useEffect } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import axios from "../api/axios.config";
import { io } from "socket.io-client";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // ✅ Only once
  const [allUsers, setAllUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // 1. Connect socket
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // 2. Fetch current user, all users, rooms
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res1 = await axios.get("/api/users/me", { headers });
        setLoggedInUser(res1.data);

        const res2 = await axios.get("/api/users/all", { headers });
        setAllUsers(res2.data);

        const res3 = await axios.get(`/api/rooms/user/${res1.data._id}`, {
          headers,
        });
        setRooms(res3.data);
      } catch (error) {
        console.error("Error fetching users or rooms:", error);
      }
    };

    fetchData();
  }, []);

  // 3. Emit userConnected
  useEffect(() => {
    if (socket && loggedInUser?._id) {
      socket.emit("userConnected", loggedInUser);
    }
  }, [socket, loggedInUser]);

  // 4. Track user status changes
  useEffect(() => {
    if (!socket) return;

    const handleUserStatusChange = (updatedUsers) => {
      setAllUsers(updatedUsers);
    };

    socket.on("userStatusChanged", handleUserStatusChange);
    return () => socket.off("userStatusChanged", handleUserStatusChange);
  }, [socket]);

  // 5. Refresh selectedUser if status changed
  useEffect(() => {
    if (!selectedUser || allUsers.length === 0) return;
    const updated = allUsers.find((u) => u._id === selectedUser._id);
    if (updated) setSelectedUser(updated);
  }, [allUsers, selectedUser]);

  // 6. Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        if (selectedUser && loggedInUser) {
          const res = await axios.get(
            `/api/messages/${loggedInUser._id}/${selectedUser._id}`,
            { headers }
          );
          setMessages(res.data);
        } else if (selectedRoom) {
          const res = await axios.get(
            `/api/room-messages/${selectedRoom._id}`,
            { headers }
          );
          setMessages(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
  }, [selectedUser, selectedRoom, loggedInUser]);

  // 7. Real-time incoming messages
  useEffect(() => {
    if (!socket || !loggedInUser) return;

    const handleIncomingMessage = (msg) => {
      const isDM =
        selectedUser &&
        ((msg.senderId === loggedInUser._id &&
          msg.receiverId === selectedUser._id) ||
          (msg.receiverId === loggedInUser._id &&
            msg.senderId === selectedUser._id));

      const isRoomMsg = selectedRoom && msg.roomId === selectedRoom._id;

      if (isDM || isRoomMsg) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("chatMessage", handleIncomingMessage);
    socket.on("roomMessage", handleIncomingMessage);

    return () => {
      socket.off("chatMessage", handleIncomingMessage);
      socket.off("roomMessage", handleIncomingMessage);
    };
  }, [socket, selectedUser, selectedRoom, loggedInUser]);

  return (
    <div className="home-wrapper">
      <div
        className={`component-wrapper ${
          selectedUser || selectedRoom ? "user-selected" : "no-user"
        }`}
      >
        <Sidebar
          users={allUsers}
          rooms={rooms}
          currentUser={loggedInUser}
          selectedUserId={selectedUser?._id}
          selectedRoomId={selectedRoom?._id}
          setSelectedUser={(user) => {
            setSelectedUser(user);
            setSelectedRoom(null);
          }}
          setSelectedRoom={(room) => {
            setSelectedRoom(room);
            setSelectedUser(null);
          }}
        />

        {(selectedUser || selectedRoom) && (
          <RightSidebar
            currentUser={loggedInUser}
            selectedUser={selectedUser}
            selectedRoom={selectedRoom}
            messages={messages}
            socket={socket}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
