import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios.config";
import { supabase } from "../supabaseClient";
import "./Profile.css";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserId(res.data._id);
      } catch (err) {
        console.error("Error fetching user:", err.message);
      }
    };

    fetchUser();
  }, []);

  const handleImageUpload = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("users-avatar") // ✅ Make sure this bucket exists in Supabase
      .upload(fileName, imageFile);

    if (error) {
      console.error("Image upload error:", error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("users-avatar").getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await handleImageUpload();

      const payload = {
        fullname,
        bio,
        ...(imageUrl && { profile: imageUrl }),
      };

      const token = localStorage.getItem("token");

      await axios.put(`/api/users/${userId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/");
    } catch (err) {
      console.error("Profile update error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <form onSubmit={handleSubmit}>
          <h2>Complete Your Profile</h2>

          <input
            type="text"
            className="full"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
          <textarea
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
          ></textarea>

          <div className="profile">
            <label>Profile Picture:</label>
            <input
              type="file"
              accept="image/*"
              className="file"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
