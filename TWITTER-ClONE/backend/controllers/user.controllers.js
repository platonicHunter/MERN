import Notification from "../models/notification.models.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not Found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getUserProfile :", error.message);
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    // const userModify = await User.findById(id);
    // const currentUser = await User.findById(req.user._id);
    const [userModify, currentUser] = await Promise.all([
      User.findById(id),
      User.findById(req.user._id),
    ]);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourSelf" });

    if (!userModify || !currentUser)
      return res.status(400).json({ error: "User not Found" });

    const isFollowing = currentUser.following.includes(id);

    // if (isFollowing) {
    //   //Unfollow the User
    //   await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    //   await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
    //   res.status(200).json({ message: "User Unfollow Succcessfully" });
    // } else {
    //   //follow user
    //   await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
    //   await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
    //   //Send Notification to User
    //   res.status(200).json({ message: "User Follow Succcessfully" });
    // }

    // Update both users in one go
    await Promise.all([
      User.updateOne(
        { _id: id },
        { [isFollowing ? "$pull" : "$push"]: { followers: req.user._id } }
      ),
      User.updateOne(
        { _id: req.user._id },
        { [isFollowing ? "$pull" : "$push"]: { following: id } }
      ),
    ]);
    if (!isFollowing) {
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userModify._id,
      });
      await newNotification.save();
    }

    res.status(200).json({
      message: `User ${isFollowing ? "Unfollowed" : "Followed"} Successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in followInfollowUser :", error.message);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedByme = await User.findById(userId).select("following");

    // const users = await User.aggregate([
    //   {
    //     $match: {
    //       _id: { $ne: userId },
    //     },
    //   },
    //   {
    //     $sample: {
    //       size: 10,
    //     },
    //   },
    // ]);

    // //Filter out the users that I am already following
    // const filterUsers = users.filter(
    //   (user) => !userFollowedByme.following.includes(user._id)
    // );
    // const suggestedUsers = filterUsers.slice(0, 4);

    // suggestedUsers.forEach((user) => (user.password = null));
    // res.status(200).json(suggestedUsers);
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // Exclude the current user
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "following",
          as: "isFollowed",
        },
      },
      {
        $match: {
          isFollowed: { $size: 0 }, // Only include users NOT followed by the current user
        },
      },
      {
        $sample: { size: 10 }, // Get random users
      },
      {
        $project: {
          password: 0, // Exclude password
        },
      },
    ]);
    res.status(200).json(users.slice(0, 4));
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getSuggestedUsers :", error.message);
  }
};

// helper
const deleteImage = (imagePath) => {
  const fullPath = path.join("uploads/images", imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, userName, currentPassword, newPassword, bio, link } =
    req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId); // ✅ await here
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (
      (newPassword && !currentPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please add current and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });

      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message: "Password must be at least 8 characters and strong.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 💡 Image handling
    if (req.files?.profileImg) {
      if (user.profileImg) deleteImage(user.profileImg);
      user.profileImg = req.files.profileImg[0].filename;
    }

    if (req.files?.coverImg) {
      if (user.coverImg) deleteImage(user.coverImg);
      user.coverImg = req.files.coverImg[0].filename;
    }

    // Update user info
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.userName = userName || user.userName;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();

    user.password = null; // hide password from frontend
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.log("Error in updateUser:", error.message);
    res.status(500).json({ error: error.message });
  }
};
