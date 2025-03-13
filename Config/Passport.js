const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../database"); 
const jwt = require("jsonwebtoken");
require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
              
                const [existingUser] = await db.query(
                    "SELECT * FROM users WHERE google_id = ?",
                    [profile.id]
                );

                if (existingUser.length > 0) {
                    return done(null, existingUser[0]); 
                }

                
                const [newUser] = await db.query(
                    "INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)",
                    [profile.id, profile.displayName, profile.emails[0].value]
                );

                const [createdUser] = await db.query("SELECT * FROM users WHERE id = ?", [newUser.insertId]);

                return done(null, createdUser[0]);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
    try {
        const [user] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
        done(null, user[0]);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
