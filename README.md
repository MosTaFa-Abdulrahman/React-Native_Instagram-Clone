📸 Instagram Clone (React-Native + Express.js + Prisma)

A full-featured Instagram-like mobile app built with React-Native (Expo) + Express.js + Prisma + PostgreSQL 🚀
(Built with ❤️ by Mustafa Abdelrahman)

✨ Features Overview
🔐 Authentication & User Management

👤 User registration & login (JWT)

🔒 Secure password hashing

🔐 Protected routes

📝 Update profile (username, name, bio, images…)

🗑️ Delete account

👥 Fetch single/all users

👁️ View user posts, followers, following

🧾 Persistent login using secure tokens

📝 Posts

➕ Create posts (Image + Caption)

✏️ Update posts

🗑️ Delete posts

📄 Fetch all posts (feed)

👤 Fetch posts by user

👍 Like / Unlike posts

🔢 Count post likes

💾 Save / Unsave posts

📚 Fetch saved posts

🕒 Timestamps (2h ago) via Moment.js

💬 Comments & Replies

💬 Add comments to posts

✏️ Edit comments

❌ Delete comments

📄 Fetch comments per post

❤️ Like / Unlike comments

↩️ Replies system

✏️ Edit replies

🗑️ Delete replies

🔄 Like / Unlike replies

📚 Fetch all replies under a comment

👥 Followers System

➕ Follow users

➖ Unfollow users

👣 Fetch user followers

👤 Fetch following

🚫 Prevent duplicate follow actions

🎥 Stories (24-Hour Auto Expire)

➕ Add stories (Image/Video)

❌ Delete own story

⏳ Auto-expire after 24 hours

👀 View stories from users you follow

🔁 Real-time refresh via React Query

🎬 Video stories supported

🔔 Notifications

Triggered automatically on:

👍 Post Likes

💬 Comment Likes

↩️ Reply Likes

💬 New Comments

↩️ New Replies

👣 New Followers

Includes:

📩 Fetch notifications

🔢 Count unread notifications

👁️ Mark as read (single/all)

❌ Delete notification (single/all)

🎨 Mobile App (React-Native + Expo)

⚡ Expo Router navigation

📦 React Query → caching & realtime updates

📸 Expo Image → fast optimized images

🎬 Expo AV → video player (stories)

📁 Expo ImagePicker → upload image/video

🕒 Moment.js → time formatting

🌐 Axios → API communication

🎨 Beautiful, modern UI

🌗 Dark/Light mode support (optional)

🛠️ Backend (Express + Prisma + Bun)

⚡ Bun runtime (ultra fast)

🗄️ Prisma ORM

🐘 PostgreSQL

🔐 JWT authentication

👮 Auth middleware

🧵 Background cron job → expire stories

🖼️ Cloudinary integration (optional)

🪝 Clean REST API architecture

🗄️ Database Models (Prisma)

Includes full relational schema:

👤 User

📝 Posts

💾 SavedPosts

💬 Comments

↩️ Replies

❤️ PostLikes / CommentLikes / ReplyLikes

🎥 Stories

👥 Followers

🔔 Notifications

Everything is relational & fully indexed for performance.

🛠️ Tech Stack
Frontend (React-Native / Expo)

Expo Router

React Query

Axios

Moment.js

Expo Image

Expo AV

Zustand (optional global state)

Backend (Express.js + Bun)

Bun

Express.js

Prisma

PostgreSQL

JWT

Bcrypt

CORS

Helmet

Node-Cron

Cloudinary (media uploads)
