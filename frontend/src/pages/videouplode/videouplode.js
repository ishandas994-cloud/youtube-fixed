import React, { useState } from "react";
import "./videouplode.css";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import axios from "axios";
import { Box, CircularProgress } from "@mui/material";

// ===== CLOUDINARY CONFIG =====
const CLOUDINARY_CLOUD = "duxonqe5o";
const CLOUDINARY_PRESET = "youtube_project";

const Videouplod = () => {

  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    videoType: "",
    thumbnail: "",
    videoLink: "",
  });

  // ===== Handle Text Input =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVideoData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== Upload to Cloudinary =====
  const uploadToCloudinary = async (file, type) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${type}/upload`;

    const res = await axios.post(url, data, {
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total);
        setUploadStatus(`Uploading ${type}... ${percent}%`);
      },
    });

    return res.data.secure_url;
  };

  // ===== Upload Thumbnail =====
  const uploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoader(true);
    setErrorMsg("");

    try {
      const url = await uploadToCloudinary(file, "image");
      setVideoData((prev) => ({ ...prev, thumbnail: url }));
      setUploadStatus("Thumbnail uploaded ✔");
    } catch (err) {
      setErrorMsg("Thumbnail upload failed. Check your Cloudinary preset.");
      console.error("Thumbnail Upload Error:", err.response?.data || err.message);
    } finally {
      setLoader(false);
    }
  };

  // ===== Upload Video =====
  const uploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoader(true);
    setErrorMsg("");

    try {
      const url = await uploadToCloudinary(file, "video");
      setVideoData((prev) => ({ ...prev, videoLink: url }));
      setUploadStatus("Video uploaded ✔");
    } catch (err) {
      setErrorMsg("Video upload failed. Check your Cloudinary preset allows video.");
      console.error("Video Upload Error:", err.response?.data || err.message);
    } finally {
      setLoader(false);
    }
  };

  // ===== Submit =====
  const handleSubmitFunc = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMsg("Please login first.");
      return;
    }

    if (
      !videoData.title.trim() ||
      !videoData.description.trim() ||
      !videoData.videoType.trim() ||
      !videoData.thumbnail ||
      !videoData.videoLink
    ) {
      setErrorMsg("Please fill all fields and upload thumbnail + video.");
      return;
    }

    try {
      setLoader(true);

      const response = await api.post("/api/video", videoData);

      if (response.data.success) {
        setSuccessMsg("🎉 Video Uploaded Successfully!");
        setVideoData({
          title: "",
          description: "",
          videoType: "",
          thumbnail: "",
          videoLink: "",
        });
        setUploadStatus("");

        setTimeout(() => navigate("/"), 2000);
      }

    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Upload failed. Please try again."
      );
      console.error("Submit Error:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="videoUpload">
      <div className="uploadBox">

        <div className="uploadVideoTitle">
          <YouTubeIcon sx={{ fontSize: "54px", color: "red" }} />
          <span>Upload Video</span>
        </div>

        <div className="uploadForm">

          <input
            type="text"
            placeholder="Title of Video"
            className="uploadInput"
            name="title"
            value={videoData.title}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder="Description"
            className="uploadInput"
            name="description"
            value={videoData.description}
            onChange={handleChange}
          />

          <input
            type="text"
            placeholder="Category (e.g. Music, Gaming, Education)"
            className="uploadInput"
            name="videoType"
            value={videoData.videoType}
            onChange={handleChange}
          />

          {/* Thumbnail */}
          <div className="fileInput">
            <label>Thumbnail (Image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={uploadThumbnail}
              disabled={loader}
            />
          </div>

          {videoData.thumbnail && (
            <div>
              <img
                src={videoData.thumbnail}
                alt="thumbnail preview"
                style={{ width: "200px", borderRadius: "8px", marginTop: "8px" }}
              />
            </div>
          )}

          {/* Video */}
          <div className="fileInput">
            <label>Video File (MP4/WebM)</label>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={uploadVideo}
              disabled={loader}
            />
          </div>

          {videoData.videoLink && (
            <p style={{ fontSize: "14px", color: "green" }}>
              Video Uploaded ✔
            </p>
          )}

          {/* Status */}
          {uploadStatus && (
            <p style={{ fontSize: "13px", color: "#aaa" }}>{uploadStatus}</p>
          )}

          {loader && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={30} />
            </Box>
          )}

          {errorMsg && (
            <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
              ❌ {errorMsg}
            </p>
          )}

          {successMsg && (
            <p style={{ color: "green", marginTop: "10px", fontWeight: "bold" }}>
              {successMsg}
            </p>
          )}

        </div>

        <div className="uploadBtns">
          <div
            className="uploadBtn-form"
            onClick={!loader ? handleSubmitFunc : undefined}
            style={{ opacity: loader ? 0.5 : 1, cursor: loader ? "not-allowed" : "pointer" }}
          >
            {loader ? "Uploading..." : "Upload"}
          </div>

          <Link to="/" className="uploadBtn-form">
            Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Videouplod;
