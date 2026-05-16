import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinearProgress from "@mui/material/LinearProgress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import api from "../../api";
import "./signup.css";

const CLOUDINARY_CLOUD = "duxonqe5o";
const CLOUDINARY_PRESET = "youtube_project";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    channelName: "",
    userName: "",
    password: "",
    about: "",
    profilePic: "",
  });

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload profile pic to Cloudinary
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_PRESET);
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        data
      );
      setFormData((prev) => ({ ...prev, profilePic: res.data.secure_url }));
      toast.success("Profile picture uploaded ✔");
    } catch (err) {
      toast.error("Profile pic upload failed. Check Cloudinary preset.");
    } finally {
      setUploading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.channelName.trim() || !formData.userName.trim() || !formData.password.trim()) {
      return toast.error("Channel name, username and password are required ⚠️");
    }
    try {
      setLoading(true);
      const res = await api.post("/api/user/signUp", formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("userProfilePic", res.data.user.profilePic || "");
        localStorage.setItem("userName", res.data.user.userName);
        localStorage.setItem("channelName", res.data.user.channelName);
        toast.success("Signup Successful 🎉");
        setTimeout(() => navigate("/"), 1200);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        {(loading || uploading) && <LinearProgress />}

        {/* LEFT */}
        <div className="signup-left">
          <div className="profile-preview">
            <img
              src={formData.profilePic || "https://www.w3schools.com/howto/img_avatar.png"}
              alt="Profile"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="signup-right">
          <div className="signup-header">
            <YouTubeIcon className="youtube-logo" />
            <h2>Create Account</h2>
          </div>

          <input className="signup-input" type="text" name="channelName" placeholder="Channel Name *" value={formData.channelName} onChange={handleChange} />
          <input className="signup-input" type="text" name="userName"    placeholder="Username *"      value={formData.userName}    onChange={handleChange} />
          <input className="signup-input" type="password" name="password" placeholder="Password *"    value={formData.password}    onChange={handleChange} />
          <textarea className="signup-textarea" name="about" placeholder="About your channel (optional)" value={formData.about} onChange={handleChange} />

          <div style={{ color: "white", fontSize: 13 }}>
            Profile Picture (optional — upload to Cloudinary)
          </div>
          <input
            className="signup-input"
            type="file"
            accept="image/*"
            onChange={handleProfilePicUpload}
            disabled={uploading}
            style={{ color: "white" }}
          />

          {formData.profilePic && (
            <p style={{ color: "green", fontSize: 13 }}>Profile pic uploaded ✔</p>
          )}

          <div className="signup-buttons">
            <button onClick={handleSignup} disabled={loading || uploading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <button onClick={() => navigate("/login")} disabled={loading}>Login</button>
            <button onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default Signup;
