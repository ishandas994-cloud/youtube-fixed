import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./Subscriptions.css";

const Subscriptions = ({ sideNavbar }) => {
  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const res = await api.get("/api/user/subscriptions");
        setChannels(res.data.channels || []);
        setVideos(res.data.videos || []);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetch();
  }, [token]);

  if (!token) return (
    <div className="subs_page">
      <div className="subs_empty">
        <h2>Sign in to see subscriptions</h2>
        <button onClick={() => navigate("/login")}>Sign In</button>
      </div>
    </div>
  );

  if (loading) return <div className="subs_page"><p>Loading...</p></div>;

  return (
    <div className={`subs_page ${sideNavbar ? "sidebar-open" : ""}`}>
      <h2 className="subs_title">Subscriptions</h2>

      {channels.length > 0 && (
        <div className="subs_channels">
          {channels.map(ch => (
            <div key={ch._id} className="subs_channel_chip" onClick={() => navigate(`/profile/${ch._id}`)}>
              <img src={ch.profilePic || "https://via.placeholder.com/40"} alt={ch.channelName} />
              <span>{ch.channelName}</span>
            </div>
          ))}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="subs_empty">
          <h3>No subscription videos yet</h3>
          <p>Subscribe to channels to see their latest videos here.</p>
          <button onClick={() => navigate("/")}>Browse Videos</button>
        </div>
      ) : (
        <div className="subs_grid">
          {videos.map(v => (
            <div key={v._id} className="subs_card" onClick={() => navigate(`/video/${v._id}`)}>
              <img src={v.thumbnail} alt={v.title} className="subs_thumbnail" />
              <div className="subs_info">
                <div className="subs_video_title">{v.title}</div>
                <div className="subs_channel_name" onClick={e => { e.stopPropagation(); navigate(`/profile/${v.user?._id}`); }}>
                  {v.user?.channelName}
                </div>
                <div className="subs_meta">{v.likes?.length || 0} likes</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Subscriptions;
