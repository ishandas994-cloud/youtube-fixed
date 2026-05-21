import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./HomePage.css";
import api from "../../api";

const formatViews = (v = 0) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
  if (v >= 1000)    return (v / 1000).toFixed(1) + "K";
  return v.toString();
};

const formatSubs = (v = 0) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
  if (v >= 1000)    return (v / 1000).toFixed(1) + "K";
  return v.toString();
};

const HomePage = ({ sideNavbar }) => {
  const [videos,          setVideos]          = useState([]);
  const [filteredVideos,  setFilteredVideos]  = useState([]);
  const [categories,      setCategories]      = useState([]);
  const [activeCategory,  setActiveCategory]  = useState("All");
  const [subCounts,       setSubCounts]       = useState({}); // userId -> count

  const scrollRef  = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/api/video");
        if (res.data.success && Array.isArray(res.data.videos)) {
          const data = res.data.videos;
          setVideos(data);
          setCategories(["All", ...new Set(data.map(v => v.videoType || "All"))]);

          // Fetch subscriber counts for unique channel owners
          const uniqueUserIds = [...new Set(data.map(v => v.user?._id).filter(Boolean))];
          const counts = {};
          await Promise.all(uniqueUserIds.map(async (uid) => {
            try {
              const r = await api.get(`/api/user/profile/${uid}`);
              counts[uid] = r.data.subscriberCount || 0;
            } catch { counts[uid] = 0; }
          }));
          setSubCounts(counts);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    fetchVideos();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...videos];
    if (searchQuery) {
      filtered = filtered.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeCategory !== "All") {
      filtered = filtered.filter(v => v.videoType === activeCategory);
    }
    setFilteredVideos(filtered);
  }, [searchQuery, activeCategory, videos]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <div className="homepage-root">

      {/* CATEGORY BAR */}
      <div className={`homepage-options-wrapper ${sideNavbar ? "open" : "close"}`}>
        <button className="scroll-btn" onClick={() => scroll("left")}>❮</button>
        <div className="homepage-options" ref={scrollRef}>
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => setActiveCategory(cat)}
              className={`homepage-option ${activeCategory === cat ? "active" : ""}`}
            >
              {cat}
            </div>
          ))}
        </div>
        <button className="scroll-btn" onClick={() => scroll("right")}>❯</button>
      </div>

      {/* VIDEO GRID */}
      <div className={`homepage-content ${sideNavbar ? "open" : "close"}`}>
        <div className={`video-grid ${sideNavbar ? "grid-3" : "grid-4"}`}>

          {filteredVideos.length === 0 && (
            <p style={{ marginTop: 20 }}>
              No videos found{searchQuery && ` for "${searchQuery}"`}{activeCategory !== "All" && ` in "${activeCategory}"`}
            </p>
          )}

          {filteredVideos.map((item) => (
            <div key={item._id} className="youtube-video">

              <Link to={`/video/${item._id}`} className="video-card-link">
                <div className="thumbnail">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    onError={e => e.target.src = "https://via.placeholder.com/300x180?text=No+Thumbnail"}
                  />
                </div>
              </Link>

              <div className="video-info">
                <img
                  className="avatar"
                  src={item.user?.profilePic || "https://via.placeholder.com/40"}
                  alt={item.user?.channelName}
                  onClick={() => item.user?._id && navigate(`/profile/${item.user._id}`)}
                />
                <div className="text">
                  <p className="title">{item.title}</p>
                  <p className="channel" onClick={() => item.user?._id && navigate(`/profile/${item.user._id}`)}>
                    {item.user?.channelName || "Unknown"}
                  </p>
                  {/* Subscriber count under channel name */}
                  {subCounts[item.user?._id] !== undefined && (
                    <p className="sub-count">
                      {formatSubs(subCounts[item.user?._id])} subscribers
                    </p>
                  )}
                  <p className="stats">
                    {formatViews(item.views)} views • {item.likes?.length || 0} likes •{" "}
                    {item.createdAt ? new Date(item.createdAt).toDateString() : ""}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;