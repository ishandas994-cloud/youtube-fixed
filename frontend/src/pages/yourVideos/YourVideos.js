import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./YourVideos.css";

const YourVideos = ({ sideNavbar }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) { setLoading(false); return; }
    const fetchMyVideos = async () => {
      try {
        const res = await api.get(`/api/video/user/${userId}`);
        setVideos(res.data.videos || []);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchMyVideos();
  }, [userId, token]);

  if (!token) return (
    <div className="yourvideos_page">
      <div className="yourvideos_empty">
        <h2>Sign in to see your videos</h2>
        <button onClick={() => navigate("/login")}>Sign In</button>
      </div>
    </div>
  );

  if (loading) return <div className="yourvideos_page"><p style={{color:"white"}}>Loading...</p></div>;

  return (
    <div className={`yourvideos_page ${sideNavbar ? "sidebar-open" : ""}`}>
      <div className="yourvideos_header">
        <h2>Your Videos</h2>
        <button className="upload_btn" onClick={() => navigate("/upload")}>+ Upload Video</button>
      </div>

      {videos.length === 0 ? (
        <div className="yourvideos_empty">
          <h3>No videos uploaded yet</h3>
          <p>Share your content with the world!</p>
          <button onClick={() => navigate("/upload")}>Upload Your First Video</button>
        </div>
      ) : (
        <div className="yourvideos_list">
          {videos.map(v => (
            <div key={v._id} className="yourvideos_item" onClick={() => navigate(`/video/${v._id}`)}>
              <img src={v.thumbnail} alt={v.title} className="yourvideos_thumb" />
              <div className="yourvideos_info">
                <div className="yourvideos_title">{v.title}</div>
                <div className="yourvideos_desc">{v.description?.slice(0, 80)}...</div>
                <div className="yourvideos_meta">
                  <span>{v.likes?.length || 0} likes</span>
                  <span>{new Date(v.createdAt).toDateString()}</span>
                  <span className="yourvideos_type">{v.videoType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default YourVideos;
