import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "./video.css";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import WatchLaterIcon from "@mui/icons-material/WatchLater";

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoData, setVideoData] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch video
        const videoRes = await api.get(`/api/video/${id}`);
        if (videoRes.data.success) {
          const video = videoRes.data.video;
          setVideoData({ ...video, likes: video.likes || [], dislikes: video.dislikes || [] });
          if (userId) {
            setLiked(video.likes?.includes(userId));
            setDisliked(video.dislikes?.includes(userId));
          }
        }

        // Fetch comments
        const commentRes = await api.get(`/api/comment/${id}`);
        setComments(Array.isArray(commentRes.data.comments) ? commentRes.data.comments : []);

        // Fetch suggested
        const suggestRes = await api.get(`/api/video/suggested/${id}`);
        if (suggestRes.data.success) {
          setSuggestedVideos(Array.isArray(suggestRes.data.videos) ? suggestRes.data.videos : []);
        }

        // Add to history
        if (token) {
          await api.post("/api/history/add", { video: id });
        }

      } catch (error) {
        console.error("VideoPage Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id, token, userId]);

  // ===== WATCH LATER (API) =====
  const handleWatchLater = async () => {
    if (!token) return showMessage("Please login to save Watch Later.");
    try {
      const res = await api.post("/api/watchlater/add", { video: id });
      showMessage(res.data.message || "Added to Watch Later ✔");
    } catch (err) {
      showMessage("Failed to add to Watch Later.");
    }
  };

  // ===== LIKE / DISLIKE =====
  const handleReaction = async (type) => {
    if (!token) return showMessage("Please login to react.");
    try {
      const res = await api.put(`/api/video/react/${id}`, { type });
      if (res.data.success) {
        setVideoData((prev) => ({ ...prev, likes: res.data.likes, dislikes: res.data.dislikes }));
        setLiked(res.data.isLiked);
        setDisliked(res.data.isDisliked);
      }
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  // ===== COMMENT =====
  const handleAddComment = async () => {
    if (!token) return showMessage("Please login to comment.");
    if (!commentText.trim()) return;
    try {
      const res = await api.post("/api/comment", { video: videoData._id, message: commentText });
      if (res.data.newComment) {
        setComments((prev) => [res.data.newComment, ...prev]);
      }
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!videoData) return <div style={{ color: "white", padding: 40 }}>Video not found</div>;

  return (
    <div className="video-page">

      {/* LEFT */}
      <div className="videopost-section">
        <video className="video_player" controls autoPlay>
          <source src={videoData.videoLink} type="video/mp4" />
        </video>

        <h2 className="video_title">{videoData.title}</h2>

        <div className="video_info_row">
          {/* Channel */}
          <div className="channel_section" onClick={() => navigate(`/profile/${videoData.user?._id}`)}>
            <img
              src={videoData.user?.profilePic || "https://via.placeholder.com/40?text=U"}
              alt="channel"
              className="channel_avatar"
            />
            <div>
              <div className="channel_name">{videoData.user?.channelName}</div>
              <div className="upload_date">{new Date(videoData.createdAt).toDateString()}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="like_section">
            <div onClick={() => handleReaction("like")} style={{ cursor: "pointer", color: liked ? "#3ea6ff" : "white", display: "flex", alignItems: "center", gap: 5 }}>
              <ThumbUpIcon /><span>{videoData.likes?.length || 0}</span>
            </div>
            <div onClick={() => handleReaction("dislike")} style={{ cursor: "pointer", color: disliked ? "red" : "white", marginLeft: 15 }}>
              <ThumbDownIcon />
            </div>
            <div onClick={handleWatchLater} style={{ cursor: "pointer", marginLeft: 15, display: "flex", alignItems: "center", gap: 5 }}>
              <WatchLaterIcon /><span>Watch Later</span>
            </div>
          </div>
        </div>

        {message && <div style={{ color: "#3ea6ff", margin: "10px 0" }}>{message}</div>}

        <div className="video_description">{videoData.description}</div>

        {/* Comments */}
        <div className="comments_section">
          <h3>{comments.length} Comments</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              className="comment_input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button className="comment_btn" onClick={handleAddComment}>Comment</button>
          </div>

          {comments.map((c, i) => (
            <div key={i} className="comment_item">
              <img
                src={c.user?.profilePic || "https://via.placeholder.com/40?text=U"}
                alt="user"
                className="comment_avatar"
                onClick={() => navigate(`/profile/${c.user?._id}`)}
                style={{ cursor: "pointer" }}
              />
              <div>
                <div className="comment_user">{c.user?.userName}</div>
                <div className="comment_text">{c.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - Suggested */}
      <div className="video_suggestion">
        {suggestedVideos.map((item) => (
          <div key={item._id} className="suggestion_item" onClick={() => navigate(`/video/${item._id}`)}>
            <img src={item.thumbnail} alt={item.title} className="suggestion_thumbnail" />
            <div className="suggestion_info">
              <div className="suggestion_title">{item.title}</div>
              <div className="suggestion_channel">{item.user?.channelName}</div>
              <div className="suggestion_stats">{item.likes?.length || 0} likes • {new Date(item.createdAt).toDateString()}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default VideoPage;
