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


// 3. 配置 Google Strategy
const gStrategy = new GoogleStrategy({
  clientID: '90589332228-gs4leru0bie62gmmd82con0ndseb08l0.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/auth/google/callback'
},(req, accessToken, refreshToken, profile, done) => {
  /// 在这里处理用户登录成功后的逻辑
    // 例如，将用户信息存储到数据库或 session 中
    console.log('Logged in as:', profile.displayName);
    done(null, profile); // 将用户信息传递给序列化函数
});
//本地中国宝宝需要用这个,vpn代理配置，具体
//const Agent = new SocksProxyAgent(process.env.SOCKS5_PROXY||"socks5://127.0.0.1:7890");

//gStrategy._oauth2.setAgent(Agent);

passport.use(gStrategy);


// 4. 序列化和反序列化用户
passport.serializeUser((user, done) => {
    console.log("serializeUser");
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    console.log("deserializeUser");
    done(null, obj);
});

// 5. 创建 Express 应用
const app = express();

// 6. 配置中间件
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// 7. 创建登录路由
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 8. 创建回调路由
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // 登录成功后的重定向逻辑
        res.redirect('/index');
        console.log("log success");
    }
);

// 9. 启动服务器
app.listen(7777, () => {
    console.log('Server is running on port 7777');
});

// 10. 配置登录成功后的日志
// 创建 index 路由
app.get('/index', (req, res) => {
    // 检查用户是否已经通过鉴权
    if (req.isAuthenticated()) {
        // 用户已通过鉴权，可以继续处理请求
        const user = req.user; // 获取用户信息
        const name = user.displayName; // 用户名字
        const email = user.emails[0].value; // 用户电子邮件地址

        // 返回用户的名字和电子邮件地址
        res.send(`Welcome, ${name}! Your email address is ${email}.`);
    } else {
        // 用户未通过鉴权，重定向到登录页面
        res.redirect('/auth/google');
    }
});