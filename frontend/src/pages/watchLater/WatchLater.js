import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./WatchLater.css";

const WatchLater = ({ sideNavbar }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchLater = async () => {
      try {
        const res = await api.get("/api/watchlater/get");
        if (res.data.success) {
          setVideos(res.data.videos || []);
        }
      } catch (err) {
        console.error("WatchLater fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchLater();
  }, []);

  const removeVideo = async (id) => {
    try {
      await api.delete(`/api/watchlater/remove/${id}`);
      setVideos((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  if (loading) return <div className="watchlater_page">Loading...</div>;

  return (
    <div className={`watchlater_page ${sideNavbar ? "sidebar-open" : ""}`}>
      <h2>Watch Later</h2>
      {videos.length === 0 ? (
        <p>No videos saved in Watch Later.</p>
      ) : (
        <div className="watchlater_grid">
          {videos.map((item) => {
            const video = item.video;
            if (!video) return null;
            return (
              <div key={item._id} className="watchlater_card">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="watchlater_thumbnail"
                  onClick={() => navigate(`/video/${video._id}`)}
                />
                <div className="watchlater_info">
                  <h3>{video.title}</h3>
                  <p>{video.user?.channelName}</p>
                  <button className="remove_btn" onClick={() => removeVideo(item._id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchLater;
