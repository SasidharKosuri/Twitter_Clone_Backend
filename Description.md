## 🔧 Database Schema
1. user Table  
| Column   | Type    |
| -------- | ------- |
| user\_id | INTEGER |
| name     | TEXT    |
| username | TEXT    |
| password | TEXT    |
| gender   | TEXT    |

2. follower Table 
| Column              | Type    |
| ------------------- | ------- |
| follower\_id        | INTEGER |
| follower\_user\_id  | INTEGER |
| following\_user\_id | INTEGER |

3. tweet Table
| Column     | Type     |
| ---------- | -------- |
| tweet\_id  | INTEGER  |
| tweet      | TEXT     |
| user\_id   | INTEGER  |
| date\_time | DATETIME |

4. reply Table
| Column     | Type     |
| ---------- | -------- |
| reply\_id  | INTEGER  |
| tweet\_id  | INTEGER  |
| reply      | TEXT     |
| user\_id   | INTEGER  |
| date\_time | DATETIME |

5. like Table
| Column     | Type     |
| ---------- | -------- |
| like\_id   | INTEGER  |
| tweet\_id  | INTEGER  |
| user\_id   | INTEGER  |
| date\_time | DATETIME |

 ## ✅ Core Functionalities
 
🔐 User Registration (/register/ - POST)
Handles new user registration with password validation and username checks.
Sample Request:
{
  "username": "adam_richard",
  "password": "richard_567",
  "name": "Adam Richard",
  "gender": "male"
}

Scenarios:
- Username already exists → 400: User already exists
- Password < 6 characters → 400: Password is too short
- Success → 200: User created successfully

🔐 User Login (/login/ - POST)
Authenticates existing users and returns a JWT token on success.
Sample Request:
{
  "username": "JoeBiden",
  "password": "biden@123"
}
Scenarios:
- Invalid user → 400: Invalid user
- Incorrect password → 400: Invalid password
- Success → 200: { "jwtToken": "<token>" }

🔒 Authentication Middleware
Middleware validates JWT token passed in the Authorization header.

Scenarios:
- Missing/invalid token → 401: Invalid JWT Token
- Valid token → proceeds to route handler

📰 Feed & User Data APIs
/user/tweets/feed/ – GET
Returns the latest 4 tweets from users the logged-in user follows.
Sample Response:
[
{
    "username": "SrBachchan",
    "tweet": "do something wonderful...",
    "dateTime": "2021-04-07 14:50:19"
}
]

/user/following/ – GET
Returns names of users the logged-in user is following.
[
  { "name": "Narendra Modi" }
]

/user/followers/ – GET
Returns names of users who follow the logged-in user.
[
  { "name": "Barack Obama" }
]

🧾 Tweet APIs
/tweets/:tweetId/ – GET
Returns tweet details (tweet, likes, replies, date) only if the user follows the tweet author.
If unauthorized:
401: Invalid Request

If allowed:
{
  "tweet": "Some inspiring message",
  "likes": 5,
  "replies": 2,
  "dateTime": "2021-04-07 14:50:19"
}

/tweets/:tweetId/likes/ – GET
Returns usernames who liked the tweet (if authorized).
{
  "likes": ["albert", "joe", "elon"]
}

/tweets/:tweetId/replies/ – GET
Returns names and replies of users who replied to the tweet.
{
  "replies": [
    { "name": "Narendra Modi", "reply": "When you see it.." }
  ]
}

🗂 User’s Own Tweets
/user/tweets/ – GET
Returns all tweets by the logged-in user with their likes and replies count.
[
  {
    "tweet": "Ready to don the Blue and Gold",
    "likes": 3,
    "replies": 4,
    "dateTime": "2021-4-3 08:32:44"
  }
]

/user/tweets/ – POST
Creates a new tweet.
Sample Request:
{
  "tweet": "The Mornings..."
}
Response:
Created a Tweet

/tweets/:tweetId/ – DELETE
Deletes a tweet only if it belongs to the user.
Unauthorized delete:
401: Invalid Request

Success:
Tweet Removed

🔚 Summary
- It exports Express app via CommonJS default syntax (module.exports = app).
- The project Uses relational SQL logic to handle followers, likes, and replies.
- This project is ideal for showcasing authentication, authorization, and REST API design using Express and SQLite in a real-world scenario.



