https://github.com/user-attachments/assets/88a1cdbe-c4e6-4ead-ba48-80decc2293ac

# 📱 Full-Stack Mobile Instagram-Clone App (React Native + Express.js) 

> A **full-featured Instagram-like ** built with **Express.js + React-Native** 🚀  

*(Built with ❤️ by Mustafa Abdelrahman)*  

🔗 **Demo Video:** [Watch on LinkedIn](link)  

---

## ✨ Features Overview  

### 🔐 Authentication & User Management  
- 👤 User registration & login (JWT Auth)
- 🔒 Secure password hashing (bcrypt)
- ✏️ Update profile (firtsName, lastname, picture, etc.)  
- 🖼️ Change profile photo (Cloudinary)  
- 🔁 Refresh token support
- ❌ Delete account  
- 🛡️ Protected routes (Private APIs)
- 📑 Fetch profile + user list with pagination

---

### 🖼️ Posts & Media
- ➕ Create / Update / Delete posts 
- 🖼️ Upload images & videos (Cloudinary)
- 🎥 Auto-play videos in feed
- 📝 Captions + hashtags
- 📄 Fetch posts (home feed + user feed + explore) with pagination
- 📌 Save / Unsave posts
- 🎥 View posts in gallery grid 

---

### ❤️ Interactions (Likes, Comments, Replies)
- 👍 Like / Unlike posts
- ❤️ Like / Unlike comments & replies  
- 💬 Add / Edit / Delete comments  
- ↩️ Reply to comments  
- 📑 View nested comments & replies 

---

### 👥 Social Features  
- ➕ Follow / Unfollow users  
- 👥 Followers & Following lists 
- 🔍 Search users by username  
- 📚 Suggested users to follow  
- 📝 View user profiles

---

### 📄 Stories (Instagram Stories System) 
- 📷 Upload stories (image/video)
- ⏱️ Auto delete after 24 hours
- 👁️ Track story viewers  
- 🎞️ Story slider UI  
- 🔄 Add multiple stories in a row 

---

### 💳 Payments & Transactions  
- 💰 Store purchase transactions  
- 👨‍💼 Payments restricted to Admins  
- 🎓 Add purchased courses to user profile

---

### 🔔 Notifications  
- Triggered by:  
  - 👍 Likes your post 
  - 💬 Comments on your post 
  - ↩️ Reply Likes  
  - ↩️ Replies to your comment  
  - 👥 Follows you 
  - 👥 New Followers  
  - 📌 Saves your post (optional)
- 📩 Fetch all (paginated)  
- 🔢 Count unread notifications  
- ✅ Mark as read (single/all)  
- ❌ Delete notification  

---

### 📂 Files & Uploads  
- ⬆️ Upload **images, videos, docs**  
- 🔗 Serve uploaded files securely  
- ☁️ Cloudinary / External storage supported  

---

### 🎨 React-Native (Expo )  
- ⚡ **React-Query** → caching, auto-refetch, pagination  
- 🌐 Axios → API calls  
- 🎨 @expo/vector-icons → modern icons  
- 🕒 Moment.js → time formatting (`2h ago`)  

---

## 🛠️ Tech Stack  

**Backend (Express.js + Prisma + PostgreSQL)**  
- Express.js  
- JWT + bcrypt  
- PostgreSQL   
- Prisma ORM 
- Cloudinary (media uploads)  

**Mobile (React-Native, Expo)**  
- React Native  
- Expo Router  
- AsyncStorage
- React-Query (tansStack)  
- Axios  
- @expo/vector-icons  
