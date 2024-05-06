import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import path from "path";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { SocksProxyAgent } from 'socks-proxy-agent';
import env from "dotenv";

env.config();
const app = express();
app.get('/url', (req, res) => {
  res.send('Hello World!');
});

// 设置session秘钥和存储
app.use(session({
  secret: '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',
  resave: false,
  saveUninitialized: false,
}));

// 初始化Passport
app.use(passport.initialize());
app.use(passport.session());

// 配置Passport使用Google策略
const gStrategy = new GoogleStrategy({
  clientID: '90589332228-gs4leru0bie62gmmd82con0ndseb08l0.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:7777/auth/google/callback',
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
(req, accessToken, refreshToken, profile, done) => {
  // 使用Google profile信息创建用户session
  console.log("user id="+profile.id);
  // done(null, profile);
});
const Agent = new SocksProxyAgent(process.env.SOCKS5_PROXY||"socks5://127.0.0.1:7890");

gStrategy._oauth2.setAgent(Agent);

passport.use(gStrategy);
// 序列化用户session
passport.serializeUser((user, done) => {
  console.log("serialize ok");
  // done(null, user);
});

// 反序列化用户session
passport.deserializeUser((obj, done) => {
  console.log("deserialize ok");
  // done(null, obj);
});

// Google登录路由
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth 2.0回调路由
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 登录成功后的重定向逻辑
    // 你可以在这里检查req.session.user来访问用户信息
    res.redirect('/');
  });

// 启动服务器
app.listen(7777, () => {
  console.log('Server is running on port 7777');
});