require('dotenv').config();

module.exports = {
    'mongoUrl': process.env.MONGODB_CONNECT,
    'port': process.env.PORT,
    'host': process.env.HOST,
    'app_url': process.env.APP_URL,
    'session_secret': process.env.SESSION_SECRET,
    'session_expiration_time': process.env.SESSION_EXPIRATION_TIME
}