const handleSignup = async () => {

  if (
    !formData.channelName.trim() ||
    !formData.userName.trim() ||
    !formData.password.trim() ||
    !formData.about.trim()
  ) {
    return toast.error("Please fill all fields ⚠️");
  }

  try {

    setLoading(true);

    const res = await api.post(
      "/api/user/signUp",
      formData
    );

    if (res.data.success) {

      // STORE USER DATA
      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "userId",
        res.data.user._id
      );

      localStorage.setItem(
        "userProfilePic",
        res.data.user.profilePic || ""
      );

      localStorage.setItem(
        "userName",
        res.data.user.userName
      );

      localStorage.setItem(
        "channelName",
        res.data.user.channelName
      );

      toast.success("Signup Successful 🎉");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    }

  } catch (err) {

    console.log(err);

    toast.error(
      err.response?.data?.message ||
      "Signup Failed ❌"
    );

  } finally {

    setLoading(false);
  }
};