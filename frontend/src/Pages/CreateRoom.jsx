import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.config";
import { supabase } from "../supabaseClient";
import './CreateRoom.css'

const CreateRoom = () => {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err.message);
      }
    };

    fetchUsers();
  }, []);

  // Handle checkbox toggle
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Upload room image to Supabase
  const uploadRoomImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("room-images")
      .upload(fileName, file);

    if (error) {
      console.error("Room image upload error:", error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("room-images").getPublicUrl(data.path);

    return publicUrl;
  };

  // Submit room form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length < 2) {
      alert("Please select at least 2 users for the room.");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadRoomImage(roomImage);

      const payload = {
        name: roomName,
        roomImg: imageUrl,
        users: selectedUsers,
      };

      await axios.post("/api/rooms", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/");
    } catch (err) {
      console.error("Room creation failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-room-wrapper">
      <form className="create-room-form" onSubmit={handleSubmit}>
        <h2>Create a Group Room</h2>

        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />

        <div>
          <label>Room Image:</label>
          <input
            type="file"
            accept="image/*"
            className="file-input"
            onChange={(e) => setRoomImage(e.target.files[0])}
          />
        </div>

        <div className="user-selection">
          <h4>Select Users:</h4>
          {users.map((user) => (
            <label key={user._id}>
              <input
                type="checkbox"
                value={user._id}
                onChange={() => toggleUserSelection(user._id)}
              />
              {user.fullname}
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Room"}
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
