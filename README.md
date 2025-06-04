# 🐦 Twitter Clone Backend

A secure, feature-rich, and scalable backend clone of Twitter developed using Node.js, Express.js, and SQLite. This project is designed to simulate the core functionality of the Twitter platform from a backend perspective. It includes robust user authentication using JWT tokens, secure password handling with bcrypt, and a relational database structure that manages users, tweets, followers, likes, and replies efficiently.

The backend supports essential Twitter operations such as user registration and login, tweeting, replying to tweets, liking posts, and managing follower-following relationships. Additionally, it provides authenticated users with features like accessing their tweet feed, viewing tweet engagement (likes and replies), and safely performing create, read, and delete operations on tweets. All functionalities are exposed via a well-structured set of RESTful APIs, designed with a focus on real-world authentication flow, authorization, and data validation.

---

## 🚀 Features

- ✅ User Registration and Login with **JWT Authentication**
- ✅ Follow/Unfollow system between users
- ✅ Create, read, and delete **tweets**
- ✅ View tweet feed from followed users (latest 4 tweets)
- ✅ Like and reply to tweets
- ✅ View likes and replies on tweets (only from followed users)
- ✅ Get analytics: total likes/replies per tweet
- ✅ Secure access with **authentication middleware**

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Security:** bcrypt for password hashing, JWT for session management
- **Tools:** Postman for API testing

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/twitter-clone-backend.git
   cd twitter-clone-backend
2. **Install dependencies**
   ```bash
   npm install
3. **Start the server**
   ```bash
   node app.js
3. **Server will run at http://localhost:3000/**

## 🔐 Authentication
All routes (except /register/ and /login/) are protected and require a valid JWT token in the Authorization header: 
- Authorization: Bearer <your-jwt-token>

## 📂 Folder Structure
.
├── app.js              # Main Express server
├── twitterClone.db     # SQLite database file
├── package.json
└── README.md

📑 API Endpoints Summary
| Method | Endpoint                    | Description                                    |
| ------ | --------------------------- | ---------------------------------------------- |
| POST   | `/register/`                | Register a new user                            |
| POST   | `/login/`                   | Login and get JWT token                        |
| GET    | `/user/tweets/feed/`        | Get latest 4 tweets from followed users        |
| GET    | `/user/following/`          | Get names of users you follow                  |
| GET    | `/user/followers/`          | Get names of users who follow you              |
| GET    | `/tweets/:tweetId/`         | Get tweet details (if user follows the poster) |
| GET    | `/tweets/:tweetId/likes/`   | Get usernames who liked a tweet                |
| GET    | `/tweets/:tweetId/replies/` | Get replies to a tweet                         |
| GET    | `/user/tweets/`             | Get your own tweets with likes & replies count |
| POST   | `/user/tweets/`             | Create a new tweet                             |
| DELETE | `/tweets/:tweetId/`         | Delete your tweet                              |


