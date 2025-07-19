import React, { useState } from "react";
import "./Sidebar.css";
import assets from "../assets/assets.js";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  users = [],
  currentUser,
  setSelectedUser,
  selectedUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Normalize users data
  const normalizedUsers = Array.isArray(users)
    ? users
    : Object.values(users || {}); // fallback for object-type users

  // Sort users: online users first
  const sortedUsers = normalizedUsers.sort((a, b) => b.isOnline - a.isOnline);

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user._id !== currentUser?._id &&
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  console.log("All Users (normalized):", sortedUsers);
  console.log("Current user:", currentUser);

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <img
          src={currentUser?.profile || assets.avatar_icon}
          alt="Me"
          className="profile-pic"
        />
        <div className="menu-wrapper">
          <button
            className="menu-btn"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <img src={assets.menu_icon} alt="menu" />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/profile")}>Edit Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search users"
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="user-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`user-card ${
                selectedUserId === user._id ? "selected" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <img src={user.profile || assets.avatar_icon} alt="profile" />
              <div className="user-info">
                <span className="username">{user.fullname}</span>
                <span
                  className={`status ${user.isOnline ? "online" : "offline"}`}
                ></span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-users">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
