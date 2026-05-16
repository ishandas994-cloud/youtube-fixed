import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WatchLater.css";

const WatchLater = ({ sideNavbar }) => {

  const [videos, setVideos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    const savedVideos =
      JSON.parse(localStorage.getItem("watchLater")) || [];

    setVideos(savedVideos);

  }, []);

  const removeVideo = (id) => {

    const updatedVideos = videos.filter(
      (video) => video._id !== id
    );

    setVideos(updatedVideos);

    localStorage.setItem(
      "watchLater",
      JSON.stringify(updatedVideos)
    );
  };

  return (

    <div
      className={`watchlater_page ${
        sideNavbar ? "sidebar-open" : ""
      }`}
    >

      <h2>Watch Later</h2>

      {videos.length === 0 ? (

        <p>No videos saved in Watch Later.</p>

      ) : (

        <div className="watchlater_grid">

          {videos.map((video) => (

            <div
              key={video._id}
              className="watchlater_card"
            >

              <img
                src={video.thumbnail}
                alt={video.title}
                className="watchlater_thumbnail"
                onClick={() =>
                  navigate(`/video/${video._id}`)
                }
              />

              <div className="watchlater_info">

                <h3>{video.title}</h3>

                <p>
                  {video.user?.channelName}
                </p>

                <button
                  className="remove_btn"
                  onClick={() =>
                    removeVideo(video._id)
                  }
                >
                  Remove
                </button>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater;