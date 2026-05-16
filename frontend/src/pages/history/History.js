import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./History.css";

const History = ({ sideNavbar }) => {

  const [historyVideos, setHistoryVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    const fetchHistory = async () => {

      try {

        setLoading(true);
        setError("");

        const res = await api.get("/api/history/get");

        if (res.data.success) {
          setHistoryVideos(res.data.history || []);
        } else {
          setError("No history found");
        }

      } catch (err) {

        console.error("History Fetch Error:", err);

        if (err.response?.status === 401) {

          setError("Please login again");

          localStorage.removeItem("token");

        } else {

          setError("Failed to fetch history");

        }

      } finally {

        setLoading(false);

      }
    };

    fetchHistory();

  }, []);

  if (loading) {
    return (
      <div className="history_page">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="history_page">
        {error}
      </div>
    );
  }

  return (
    <div className={`history_page ${sideNavbar ? "sidebar-open" : ""}`}>

      <h2>Watch History</h2>

      {historyVideos.length === 0 ? (

        <p>No watch history found.</p>

      ) : (

        <div className="history_grid">

          {historyVideos.map((item) => {

            const video = item.video;

            if (!video) return null;

            return (

              <div
                key={item._id}
                className="history_card"
                onClick={() => navigate(`/video/${video._id}`)}
              >

                <img
                  src={
                    video.thumbnail ||
                    "https://via.placeholder.com/300x180"
                  }
                  alt={video.title}
                />

                <h3>{video.title}</h3>

                <p>
                  {new Date(item.createdAt).toLocaleString()}
                </p>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
};

export default History;