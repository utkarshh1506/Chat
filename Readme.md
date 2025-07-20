# WebChat 💬

**WebChat** is a real-time full-stack chat application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**. It supports 1-to-1 messaging and room-based group chats with live online status, typing indicators, and persistent message storage.

---

## 🚀 Features

- 🔐 **User Authentication** (JWT-based)
- 👥 **1-to-1 Direct Messaging**
- 🏠 **Group Chat Rooms**
- 📸 **Profile and Room Images (via Cloud/Supabase)**
- 🟢 **Real-Time Online Status**
- 💬 **Live Messaging with Socket.IO**
- 📝 **Typing Indicators**
- 📜 **Chat History Persistence**
- 🔄 **Auto Scroll to Latest Message**
- 📱 Responsive, clean UI

---

## 🛠️ Tech Stack

| Frontend     | Backend    | Realtime  | Database | Auth | Image Upload          |
| ------------ | ---------- | --------- | -------- | ---- | --------------------- |
| React (Vite) | Node.js    | Socket.IO | MongoDB  | JWT  | Supabase / Cloudinary |
| Axios        | Express.js |           | Mongoose |      |                       |

---

## 📁 Folder Structure

```
webchat/
├── client/                 # Frontend (React)
│   ├── components/         # Reusable components (Sidebar, RightSidebar, etc.)
│   ├── pages/              # HomePage, Login, Register
│   ├── api/axios.config.js # Axios instance with JWT headers
│   └── assets/             # Static icons/images
├── server/                 # Backend (Node + Express)
│   ├── models/             # Mongoose models (User, Message, Room, RoomMessage)
│   ├── routes/             # REST API routes
│   ├── controllers/        # Logic for each route
│   ├── socket.js           # Socket.IO events
│   └── server.js           # Entry point
```

---

## 🧪 API Overview

### 🔐 Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me` – Current user profile
- `GET /api/users/all` – All users

### 📩 Messages

- `POST /api/messages` – Send 1-to-1 message
- `GET /api/messages/:senderId/:receiverId` – Fetch direct chat history

### 🏘️ Rooms

- `POST /api/rooms` – Create new room
- `GET /api/rooms/user/:userId` – Get rooms user is part of

### 💬 Room Messages

- `POST /api/room-messages` – Send room message
- `GET /api/room-messages/:roomId` – Fetch room chat history

---

## 💡 Socket.IO Events

| Event               | Description                       |
| ------------------- | --------------------------------- |
| `userConnected`     | Triggered when a user joins       |
| `chatMessage`       | Sends and receives 1-to-1 message |
| `roomMessage`       | Sends and receives group message  |
| `typing`            | Typing indicator for direct chats |
| `userStatusChanged` | Broadcasts updated online users   |

---

## 🖥️ UI Highlights

### 🔻 Sidebar

- Profile image with dropdown menu (Edit Profile, Logout)
- Live search for users
- Sorted users by online status
- Room cards with images and names

### 🗨️ RightSidebar

- Chat header with name, image, and online status
- Message display with timestamps
- Input box for sending messages
- Typing indicators for direct chats
- Supports both 1-to-1 and room chats

---

## 🔧 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/webchat.git
cd webchat
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

### 4. Setup environment variables

**server/.env**

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 5. Start the app

**Start Backend**

```bash
cd server
npm run dev
```

**Start Frontend**

```bash
cd ../client
npm run dev
```

---

## 🌐 Deployment Suggestions

- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway / Cyclic
- **MongoDB:** Atlas
- **Image Uploads:** Cloudinary or Supabase storage

---


## ✍️ Author

> ✨ **Assignment Name:** `WebChat`  
> 📅 **Stack Used:** MERN + Socket.IO + Supabase

---

## ✅ Future Improvements

- ✅ Message delete/edit
- ✅ Room admin roles
- ✅ Push notifications
- ✅ Dark mode toggle
- ✅ Pinned or starred chats

---

## 📜 License

MIT © [Your Name or GitHub Handle]
