import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./YourChannel.css";

const YourChannel = ({ sideNavbar }) => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ channelName: "", about: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) { setLoading(false); return; }
    const fetchChannel = async () => {
      try {
        const res = await api.get(`/api/user/profile/${userId}`);
        if (res.data.success) {
          setUser(res.data.user);
          setVideos(res.data.videos || []);
          setEditData({ channelName: res.data.user.channelName, about: res.data.user.about });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchChannel();
  }, [userId, token]);

  if (!token) return (
    <div className="yourchannel_page">
      <div className="yourchannel_empty">
        <h2>Sign in to view your channel</h2>
        <button onClick={() => navigate("/login")}>Sign In</button>
      </div>
    </div>
  );

  if (loading) return <div className="yourchannel_page"><p style={{color:"white"}}>Loading...</p></div>;
  if (!user) return <div className="yourchannel_page"><p style={{color:"white"}}>User not found</p></div>;

  return (
    <div className={`yourchannel_page ${sideNavbar ? "sidebar-open" : ""}`}>
      {/* Banner */}
      <div className="yourchannel_banner" />

      {/* Header */}
      <div className="yourchannel_header">
        <img
          src={user.profilePic || "https://via.placeholder.com/100"}
          alt="profile"
          className="yourchannel_avatar"
        />
        <div className="yourchannel_meta">
          <h1>{user.channelName}</h1>
          <p className="yourchannel_username">@{user.userName}</p>
          <p className="yourchannel_stats">{videos.length} videos</p>
          <p className="yourchannel_about">{user.about}</p>
          <div className="yourchannel_actions">
            <button onClick={() => setEditing(!editing)} className="edit_btn">
              {editing ? "Cancel" : "Edit Channel"}
            </button>
            <button onClick={() => navigate("/upload")} className="upload_btn">+ Upload</button>
            <button onClick={() => navigate(`/profile/${userId}`)} className="view_btn">View Public Page</button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="yourchannel_edit">
          <h3>Edit Channel</h3>
          <input
            className="edit_input"
            value={editData.channelName}
            onChange={e => setEditData(p => ({ ...p, channelName: e.target.value }))}
            placeholder="Channel Name"
          />
          <textarea
            className="edit_textarea"
            value={editData.about}
            onChange={e => setEditData(p => ({ ...p, about: e.target.value }))}
            placeholder="About your channel"
          />
          {msg && <p style={{ color: msg.includes("✅") ? "green" : "red" }}>{msg}</p>}
          <button className="save_btn" onClick={async () => {
            try {
              await api.put("/api/user/update", editData);
              setUser(p => ({ ...p, ...editData }));
              localStorage.setItem("channelName", editData.channelName);
              setMsg("✅ Channel updated!");
              setTimeout(() => { setEditing(false); setMsg(""); }, 1500);
            } catch (err) { setMsg("❌ Update failed"); }
          }}>Save Changes</button>
        </div>
      )}

      {/* Videos Grid */}
      <div className="yourchannel_videos_section">
        <h2>Your Videos ({videos.length})</h2>
        {videos.length === 0 ? (
          <div className="yourchannel_empty">
            <p>No videos yet. Upload your first video!</p>
            <button onClick={() => navigate("/upload")}>Upload Video</button>
          </div>
        ) : (
          <div className="yourchannel_grid">
            {videos.map(v => (
              <div key={v._id} className="yourchannel_card" onClick={() => navigate(`/video/${v._id}`)}>
                <img src={v.thumbnail} alt={v.title} className="yourchannel_thumb" />
                <div className="yourchannel_card_info">
                  <div className="yourchannel_card_title">{v.title}</div>
                  <div className="yourchannel_card_meta">{v.likes?.length || 0} likes • {new Date(v.createdAt).toDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default YourChannel;
