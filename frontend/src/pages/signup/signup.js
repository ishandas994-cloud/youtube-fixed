import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinearProgress from "@mui/material/LinearProgress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";
import "./signup.css";

function Signup() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    channelName: "",
    userName: "",
    password: "",
    about: "",
    profilePic: "",
  });

  // ================= AUTO REDIRECT =================

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  // ================= INPUT CHANGE =================

  const handleOnChangeInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= SIGNUP =================

  const handleSignup = async () => {

    if (
      !formData.channelName.trim() ||
      !formData.userName.trim() ||
      !formData.password.trim() ||
      !formData.about.trim()
    ) {
      return toast.error("Please fill all fields ⚠️");
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

      console.log(err);

      toast.error(
        err.response?.data?.message || "Signup Failed ❌"
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= RENDER =================

  return (
    <div className="signup-page">

      <div className="signup-card">

        {loading && <LinearProgress />}

        {/* LEFT SIDE */}
        <div className="signup-left">
          <div className="profile-preview">
            <img
              src={
                formData.profilePic ||
                "https://www.w3schools.com/howto/img_avatar.png"
              }
              alt="Profile Preview"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="signup-right">

          <div className="signup-header">
            <YouTubeIcon className="youtube-logo" />
            <h2>Create Account</h2>
          </div>

          <input
            className="signup-input"
            type="text"
            name="channelName"
            placeholder="Channel Name"
            value={formData.channelName}
            onChange={handleOnChangeInput}
          />

          <input
            className="signup-input"
            type="text"
            name="userName"
            placeholder="Username"
            value={formData.userName}
            onChange={handleOnChangeInput}
          />

          <input
            className="signup-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleOnChangeInput}
          />

          <textarea
            className="signup-textarea"
            name="about"
            placeholder="About your channel..."
            value={formData.about}
            onChange={handleOnChangeInput}
          />

          <input
            className="signup-input"
            type="text"
            name="profilePic"
            placeholder="Profile Picture URL (optional)"
            value={formData.profilePic}
            onChange={handleOnChangeInput}
          />

          <div className="signup-buttons">

            <button
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>

            <button
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              Login
            </button>

            <button
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

      <ToastContainer position="top-right" autoClose={2000} />

    </div>
  );
}

export default Signup;
