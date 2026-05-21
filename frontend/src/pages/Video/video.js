import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "./video.css";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReplyIcon from "@mui/icons-material/Reply";
import DeleteIcon from "@mui/icons-material/Delete";

const formatViews = (v = 0) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
  if (v >= 1000)    return (v / 1000).toFixed(1) + "K";
  return v.toString();
};

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoData,      setVideoData]      = useState(null);
  const [suggestedVideos,setSuggestedVideos] = useState([]);
  const [comments,       setComments]       = useState([]);
  const [commentText,    setCommentText]    = useState("");
  const [loading,        setLoading]        = useState(true);
  const [liked,          setLiked]          = useState(false);
  const [disliked,       setDisliked]       = useState(false);
  const [message,        setMessage]        = useState("");
  const [replyingTo,     setReplyingTo]     = useState(null); // commentId
  const [replyText,      setReplyText]      = useState("");
  const [expandedReplies,setExpandedReplies]= useState({});

  const token  = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  // ===== FETCH =====
  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const vRes = await api.get(`/api/video/${id}`);
        if (vRes.data.success) {
          const v = vRes.data.video;
          setVideoData({ ...v, likes: v.likes || [], dislikes: v.dislikes || [] });
          if (userId) { setLiked(v.likes?.includes(userId)); setDisliked(v.dislikes?.includes(userId)); }
        }
        const cRes = await api.get(`/api/comment/${id}`);
        setComments(cRes.data.comments || []);
        const sRes = await api.get(`/api/video/suggested/${id}`);
        setSuggestedVideos(sRes.data.videos || []);
        if (token) await api.post("/api/history/add", { video: id });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [id, token, userId]);

  // ===== WATCH LATER =====
  const handleWatchLater = async () => {
    if (!token) return showMsg("Please login first.");
    try { const r = await api.post("/api/watchlater/add", { video: id }); showMsg(r.data.message || "Added ✔"); }
    catch { showMsg("Failed."); }
  };

  // ===== REACTION =====
  const handleReaction = async (type) => {
    if (!token) return showMsg("Please login to react.");
    try {
      const r = await api.put(`/api/video/react/${id}`, { type });
      if (r.data.success) {
        setVideoData(p => ({ ...p, likes: r.data.likes, dislikes: r.data.dislikes }));
        setLiked(r.data.isLiked); setDisliked(r.data.isDisliked);
      }
    } catch (e) { console.error(e); }
  };

  // ===== ADD COMMENT =====
  const handleAddComment = async () => {
    if (!token) return showMsg("Please login to comment.");
    if (!commentText.trim()) return;
    try {
      const r = await api.post("/api/comment", { video: videoData._id, message: commentText });
      if (r.data.newComment) setComments(p => [r.data.newComment, ...p]);
      setCommentText("");
    } catch (e) { console.error(e); }
  };

  // ===== ADD REPLY =====
  const handleAddReply = async (commentId) => {
    if (!token) return showMsg("Please login to reply.");
    if (!replyText.trim()) return;
    try {
      const r = await api.post(`/api/comment/reply/${commentId}`, { message: replyText });
      if (r.data.comment) {
        setComments(p => p.map(c => c._id === commentId ? r.data.comment : c));
      }
      setReplyText(""); setReplyingTo(null);
      setExpandedReplies(p => ({ ...p, [commentId]: true }));
    } catch (e) { console.error(e); }
  };

  // ===== DELETE COMMENT =====
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comment/delete/${commentId}`);
      setComments(p => p.filter(c => c._id !== commentId));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!videoData) return <div style={{ color: "white", padding: 40 }}>Video not found</div>;

  return (
    <div className="video-page">

      {/* ===== LEFT ===== */}
      <div className="videopost-section">
        <video className="video_player" controls autoPlay>
          <source src={videoData.videoLink} type="video/mp4" />
        </video>

        <h2 className="video_title">{videoData.title}</h2>

        {/* Views */}
        <div className="video_views_row">
          <VisibilityIcon style={{ fontSize: 18, color: "#aaa" }} />
          <span className="video_views_count">{formatViews(videoData.views)} views</span>
          <span className="video_views_date">• {new Date(videoData.createdAt).toDateString()}</span>
        </div>

        {/* Info row */}
        <div className="video_info_row">
          <div className="channel_section" onClick={() => navigate(`/profile/${videoData.user?._id}`)}>
            <img src={videoData.user?.profilePic || "https://via.placeholder.com/40"} alt="ch" className="channel_avatar" />
            <div>
              <div className="channel_name">{videoData.user?.channelName}</div>
              <div className="upload_date">{new Date(videoData.createdAt).toDateString()}</div>
            </div>
          </div>
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

        {/* ===== COMMENTS ===== */}
        <div className="comments_section">
          <h3>{comments.length} Comments</h3>

          {/* Add comment */}
          <div className="comment_add_row">
            <input
              className="comment_input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddComment()}
            />
            <button className="comment_btn" onClick={handleAddComment}>Comment</button>
          </div>

          {/* Comment list */}
          {comments.map((c) => (
            <div key={c._id} className="comment_item">
              <img
                src={c.user?.profilePic || "https://via.placeholder.com/40"}
                alt="user"
                className="comment_avatar"
                onClick={() => navigate(`/profile/${c.user?._id}`)}
              />
              <div className="comment_body">
                <div className="comment_header">
                  <span className="comment_user">{c.user?.userName}</span>
                  <span className="comment_time">{new Date(c.createdAt).toDateString()}</span>
                  {/* Delete own comment */}
                  {userId === c.user?._id?.toString() && (
                    <DeleteIcon
                      className="comment_delete_btn"
                      onClick={() => handleDeleteComment(c._id)}
                    />
                  )}
                </div>
                <div className="comment_text">{c.message}</div>

                {/* Reply button */}
                <button
                  className="reply_toggle_btn"
                  onClick={() => { setReplyingTo(replyingTo === c._id ? null : c._id); setReplyText(""); }}
                >
                  <ReplyIcon style={{ fontSize: 16 }} /> Reply
                </button>

                {/* Reply input */}
                {replyingTo === c._id && (
                  <div className="reply_input_row">
                    <input
                      className="reply_input"
                      placeholder={`Reply to ${c.user?.userName}...`}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddReply(c._id)}
                      autoFocus
                    />
                    <button className="comment_btn" onClick={() => handleAddReply(c._id)}>Reply</button>
                    <button className="cancel_btn" onClick={() => setReplyingTo(null)}>Cancel</button>
                  </div>
                )}

                {/* Show/hide replies */}
                {c.replies?.length > 0 && (
                  <button
                    className="show_replies_btn"
                    onClick={() => setExpandedReplies(p => ({ ...p, [c._id]: !p[c._id] }))}
                  >
                    {expandedReplies[c._id] ? "▲ Hide" : "▼ View"} {c.replies.length} {c.replies.length === 1 ? "reply" : "replies"}
                  </button>
                )}

                {/* Replies list */}
                {expandedReplies[c._id] && c.replies?.map((reply, ri) => (
                  <div key={ri} className="reply_item">
                    <img
                      src={reply.user?.profilePic || "https://via.placeholder.com/32"}
                      alt="user"
                      className="reply_avatar"
                      onClick={() => navigate(`/profile/${reply.user?._id}`)}
                    />
                    <div>
                      <span className="comment_user">{reply.user?.userName}</span>
                      <span className="comment_time"> • {new Date(reply.createdAt).toDateString()}</span>
                      <div className="comment_text">{reply.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT ===== */}
      <div className="video_suggestion">
        {suggestedVideos.map((item) => (
          <div key={item._id} className="suggestion_item" onClick={() => navigate(`/video/${item._id}`)}>
            <img src={item.thumbnail} alt={item.title} className="suggestion_thumbnail" />
            <div className="suggestion_info">
              <div className="suggestion_title">{item.title}</div>
              <div className="suggestion_channel">{item.user?.channelName}</div>
              <div className="suggestion_stats">{formatViews(item.views)} views • {item.likes?.length || 0} likes</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default VideoPage;