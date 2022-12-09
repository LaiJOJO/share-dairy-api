import express from "express";
import postsRouter from './routes/posts.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import interactRouter from './routes/interact.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from "body-parser";
const app = express()
app.use(bodyParser.json({limit: '500kb'}));
app.use(express.json())
app.use(cookieParser())

// 利用该配置允许地址跨域访问接口以及写入cookie
const corsOptions = {
  origin: ['http://172.16.75.224:3000','http://localhost:3000','http://192.168.175.131:3003'],
  // 允许跨域情况下发送cookie
  credentials: true,
  maxAge: '1728000'
}

app.use(cors(corsOptions))
// 注册路由
app.use("/api/posts",postsRouter)
app.use("/api/users",usersRouter)
app.use("/api/auth",authRouter)
app.use("/api/interact",interactRouter)

app.listen(8008,()=>{
  console.log('server is running')
})