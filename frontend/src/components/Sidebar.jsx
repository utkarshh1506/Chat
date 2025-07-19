import React from "react";
import "./Sidebar.css";
import assets from "../assets/assets.js";
import { useState } from "react";
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

  const sortedUsers = [...users].sort((a, b) => b.isOnline - a.isOnline);
  console.log(sortedUsers);

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
            <img src={assets.menu_icon} alt="" />
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
        {filteredUsers.map((user) => (
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
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
