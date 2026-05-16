import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "./likedVideos.css";

const LikedVideos = () => {

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchLikedVideos = async () => {

      try {

        const res = await api.get(
          "/api/video/liked/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setVideos(res.data.videos);
        }

      } catch (error) {

        console.log("Liked Videos Error:", error);

      } finally {

        setLoading(false);

      }
    };

    fetchLikedVideos();

  }, [token]);

  if (loading) {
    return <div className="liked-loading">Loading...</div>;
  }

  return (

    <div className="likedVideosPage">

      <h2 className="liked-title">
        Liked Videos
      </h2>

      {videos.length === 0 ? (

        <div className="empty-liked">
          No liked videos yet
        </div>

      ) : (

        <div className="liked-video-grid">

          {videos.map((video) => (

            <div
              key={video._id}
              className="liked-video-card"
              onClick={() =>
                navigate(`/video/${video._id}`)
              }
            >

              <img
                src={video.thumbnail}
                alt={video.title}
                className="liked-thumbnail"
              />

              <div className="liked-info">

                <div className="liked-video-title">
                  {video.title}
                </div>

                <div className="liked-channel">
                  {video.user?.channelName}
                </div>

                <div className="liked-stats">
                  {video.likes?.length || 0} likes
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;