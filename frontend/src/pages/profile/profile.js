import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import "./profile.css";

const Profile = ({ sideNavbar }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser]                   = useState(null);
  const [videos, setVideos]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [subscribed, setSubscribed]       = useState(false);
  const [subLoading, setSubLoading]       = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const token  = localStorage.getItem("token");
  const myId   = localStorage.getItem("userId");
  const isOwner = myId === id;

  // ================= FETCH PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = id ? `/api/user/profile/${id}` : `/api/user/profile/me`;
        const res = await api.get(endpoint);

        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          setVideos(res.data.videos || []);
          setSubscriberCount(res.data.subscriberCount || 0);

          // Check if current user is already subscribed
          if (token && myId) {
            const meRes = await api.get("/api/user/profile/me");
            const mySubs = meRes.data.user?.subscriptions || [];
            setSubscribed(mySubs.map(s => s.toString()).includes(id));
          }
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Profile Error:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token, myId]);

  // ================= TOGGLE SUBSCRIBE =================
  const handleSubscribe = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSubLoading(true);
      const res = await api.post(`/api/user/subscribe/${id}`);

      if (res.data.success) {
        setSubscribed(res.data.subscribed);
        setSubscriberCount(res.data.subscriberCount);
      }
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setSubLoading(false);
    }
  };

  // ================= FORMAT SUBSCRIBERS =================
  const formatCount = (count = 0) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000)    return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  if (loading) return <div className="profile_loading">Loading...</div>;
  if (error)   return <div className="profile_error">{error}</div>;
  if (!user)   return <div className="profile_error">No user found</div>;

  return (
    <div className={`profile_page ${sideNavbar ? "sidebar-open" : ""}`}>

      {/* ===== BANNER ===== */}
      <div className="profile_banner" />

      {/* ===== CHANNEL HEADER ===== */}
      <div className="channel_header">
        <img
          src={user.profilePic || "https://via.placeholder.com/100"}
          alt="channel"
          className="profile_avatar"
        />

        <div className="channel_meta">
          <h1>{user.channelName}</h1>
          <p className="channel_sub_info">
            @{user.userName} • {formatCount(subscriberCount)} subscribers • {videos.length} videos
          </p>

          {user.about && (
            <p className="channel_about">{user.about}</p>
          )}

          {/* SUBSCRIBE / EDIT BUTTON */}
          {isOwner ? (
            <button
              className="subscribe_btn subscribed"
              onClick={() => navigate("/your-channel")}
            >
              Edit Channel
            </button>
          ) : (
            <button
              className={`subscribe_btn ${subscribed ? "subscribed" : ""}`}
              onClick={handleSubscribe}
              disabled={subLoading}
            >
              {subLoading
                ? "..."
                : subscribed
                ? "Subscribed ✔"
                : "Subscribe"}
            </button>
          )}
        </div>
      </div>

      {/* ===== VIDEOS GRID ===== */}
      <div className="profile_videos_title">
        Videos ({videos.length})
      </div>

      <div className="video_grid">
        {videos.length === 0 ? (
          <p className="no_videos">No videos uploaded yet.</p>
        ) : (
          videos.map((video) => (
            <div
              key={video._id}
              className="video_card"
              onClick={() => navigate(`/video/${video._id}`)}
            >
              <img
                src={video.thumbnail || "https://via.placeholder.com/300x180"}
                alt={video.title}
                className="video_thumbnail"
              />
              <div className="video_info">
                <h3>{video.title}</h3>
                <p>
                  {video.views || 0} views •{" "}
                  {video.createdAt ? new Date(video.createdAt).toDateString() : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Profile;