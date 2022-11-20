import { Router } from 'express'
import { getPost, getPosts, addPost, deletePost, updatePost, uploadImg ,getRecommentPosts,getSearchPosts} from '../routesHandler/posts.js'
import multer from "multer";
// import sftpStorage from 'multer-sftp'

// multer上传文件配置
const storage = multer.diskStorage({
  // 指定路径
  destination: function (req, file, cb) {
    cb(null, '../client/public/uploads')
  },
  // 指定文件名，时间戳标记防止冲突
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname)
  }
})
/* const storage = sftpStorage({
  sftp: {
    host: '114.132.214.26',
    port: 3001,
    username: 'root',
    password: 'lai232173'
  },
  destination: function (req, file, cb) {
    cb(null, '/images')
  },
  filename: function (req, file, cb) {
    cb(null, (Date.now() + '-' + Math.round(Math.random() * 1E9))+ file.originalname)
  }
}) */
const upload = multer({ storage: storage })

const router = Router()

router.get("/getposts", getPosts)
router.get("/getpost/:id", getPost)
router.post("/addpost", addPost)
router.delete("/deletepost/:id", deletePost)
router.put("/updatepost/:id", updatePost)
router.post("/uploadpost", upload.single('myfile'), uploadImg)
router.get('/getrecommentposts',getRecommentPosts)
router.get('/getsearch',getSearchPosts)
// router.post("/uploadpost", uploadImg)

export default router
