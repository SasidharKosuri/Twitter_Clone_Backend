const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

const dbPath = path.join(__dirname, 'twitterClone.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Middleware to authenticate JWT Token
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers['authorization']
  if (authHeader === undefined) {
    response.status(401).send('Invalid JWT Token')
  } else {
    const jwtToken = authHeader.split(' ')[1]
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401).send('Invalid JWT Token')
      } else {
        request.username = payload.username
        const getUserQuery = `SELECT user_id FROM user WHERE username = '${payload.username}';`
        const user = await db.get(getUserQuery)
        request.userId = user.user_id
        next()
      }
    })
  }
}

// API 1: Register User
app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser !== undefined) {
    response.status(400).send('User already exists')
  } else {
    if (password.length < 6) {
      response.status(400).send('Password is too short')
    } else {
      const createUserQuery = `
        INSERT INTO
          user (name, username, password, gender)
        VALUES
          (
            '${name}',
            '${username}',
            '${hashedPassword}',
            '${gender}'
          );`
      await db.run(createUserQuery)
      response.status(200).send('User created successfully')
    }
  }
})

// API 2: Login User
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    response.status(400).send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      const payload = {username: username}
      const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
      response.send({jwtToken})
    } else {
      response.status(400).send('Invalid password')
    }
  }
})

// API 3: Get Tweets Feed
app.get('/user/tweets/feed/', authenticateToken, async (request, response) => {
  const {userId} = request
  const getTweetsQuery = `
    SELECT
      username,
      tweet,
      date_time AS dateTime
    FROM
      follower
      INNER JOIN tweet ON follower.following_user_id = tweet.user_id
      INNER JOIN user ON tweet.user_id = user.user_id
    WHERE
      follower.follower_user_id = ${userId}
    ORDER BY
      date_time DESC
    LIMIT 4;`
  const tweets = await db.all(getTweetsQuery)
  response.send(tweets)
})

// API 4: Get Following
app.get('/user/following/', authenticateToken, async (request, response) => {
  const {userId} = request
  const getFollowingQuery = `
    SELECT
      name
    FROM
      follower
      INNER JOIN user ON follower.following_user_id = user.user_id
    WHERE
      follower.follower_user_id = ${userId};`
  const following = await db.all(getFollowingQuery)
  response.send(following)
})

// API 5: Get Followers
app.get('/user/followers/', authenticateToken, async (request, response) => {
  const {userId} = request
  const getFollowersQuery = `
    SELECT
      name
    FROM
      follower
      INNER JOIN user ON follower.follower_user_id = user.user_id
    WHERE
      follower.following_user_id = ${userId};`
  const followers = await db.all(getFollowersQuery)
  response.send(followers)
})

// API 6: Get Tweet by ID
app.get('/tweets/:tweetId/', authenticateToken, async (request, response) => {
  const {userId} = request
  const {tweetId} = request.params
  const getTweetQuery = `
    SELECT
      tweet,
      COUNT(DISTINCT like_id) AS likes,
      COUNT(DISTINCT reply_id) AS replies,
      date_time AS dateTime
    FROM
      tweet
      LEFT JOIN like ON tweet.tweet_id = like.tweet_id
      LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id
    WHERE
      tweet.tweet_id = ${tweetId}
      AND tweet.user_id IN (
        SELECT
          following_user_id
        FROM
          follower
        WHERE
          follower_user_id = ${userId}
      )
    GROUP BY
      tweet.tweet_id;`
  const tweet = await db.get(getTweetQuery)
  if (tweet === undefined) {
    response.status(401).send('Invalid Request')
  } else {
    response.send(tweet)
  }
})

// API 7: Get Likes of a Tweet
app.get(
  '/tweets/:tweetId/likes/',
  authenticateToken,
  async (request, response) => {
    const {userId} = request
    const {tweetId} = request.params
    const getLikesQuery = `
    SELECT
      username
    FROM
      like
      INNER JOIN tweet ON like.tweet_id = tweet.tweet_id
      INNER JOIN user ON like.user_id = user.user_id
    WHERE
      like.tweet_id = ${tweetId}
      AND tweet.user_id IN (
        SELECT
          following_user_id
        FROM
          follower
        WHERE
          follower_user_id = ${userId}
      );`
    const likesArray = await db.all(getLikesQuery)
    if (likesArray.length === 0) {
      response.status(401).send('Invalid Request')
    } else {
      const likes = likesArray.map(user => user.username)
      response.send({likes})
    }
  },
)

// API 8: Get Replies of a Tweet
app.get(
  '/tweets/:tweetId/replies/',
  authenticateToken,
  async (request, response) => {
    const {userId} = request
    const {tweetId} = request.params
    const getRepliesQuery = `
    SELECT
      name,
      reply
    FROM
      reply
      INNER JOIN tweet ON reply.tweet_id = tweet.tweet_id
      INNER JOIN user ON reply.user_id = user.user_id
    WHERE
      reply.tweet_id = ${tweetId}
      AND tweet.user_id IN (
        SELECT
          following_user_id
        FROM
          follower
        WHERE
          follower_user_id = ${userId}
      );`
    const repliesArray = await db.all(getRepliesQuery)
    if (repliesArray.length === 0) {
      response.status(401).send('Invalid Request')
    } else {
      response.send({replies: repliesArray})
    }
  },
)

// API 9: Get User's Tweets
app.get('/user/tweets/', authenticateToken, async (request, response) => {
  const {userId} = request
  const getUserTweetsQuery = `
    SELECT
      tweet,
      COUNT(DISTINCT like_id) AS likes,
      COUNT(DISTINCT reply_id) AS replies,
      date_time AS dateTime
    FROM
      tweet
      LEFT JOIN like ON tweet.tweet_id = like.tweet_id
      LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id
    WHERE
      tweet.user_id = ${userId}
    GROUP BY
      tweet.tweet_id;`
  const tweets = await db.all(getUserTweetsQuery)
  response.send(tweets)
})

// API 10: Create a Tweet
app.post('/user/tweets/', authenticateToken, async (request, response) => {
  const {tweet} = request.body
  const {userId} = request
  const dateTime = new Date().toISOString().replace('T', ' ').split('.')[0]
  const createTweetQuery = `
    INSERT INTO
      tweet (tweet, user_id, date_time)
    VALUES
      ('${tweet}', ${userId}, '${dateTime}');`
  await db.run(createTweetQuery)
  response.send('Created a Tweet')
})

// API 11: Delete a Tweet
app.delete(
  '/tweets/:tweetId/',
  authenticateToken,
  async (request, response) => {
    const {userId} = request
    const {tweetId} = request.params
    const getTweetQuery = `SELECT * FROM tweet WHERE tweet_id = ${tweetId} AND user_id = ${userId};`
    const tweet = await db.get(getTweetQuery)
    if (tweet === undefined) {
      response.status(401).send('Invalid Request')
    } else {
      const deleteTweetQuery = `DELETE FROM tweet WHERE tweet_id = ${tweetId};`
      await db.run(deleteTweetQuery)
      response.send('Tweet Removed')
    }
  },
)

module.exports = app
