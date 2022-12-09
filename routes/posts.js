import { Router } from 'express'
import { getDraft, getPost, getPosts, addPost, deletePost, uploadDescImg, updatePost, uploadImg, getRecommentPosts, getSearchPosts } from '../routesHandler/posts.js'
import multer from "multer";

// multer上传文件配置,封面
const storage = multer.diskStorage({
  // 指定路径
  destination: function (req, file, cb) {
    // cb(null, '../client/public/uploads')
    // 部署服务器时的存放位置
    cb(null, '../../storage/images/blog') 
  },
  // 指定文件名，时间戳标记防止冲突
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname)
  }
})
const upload = multer({ storage: storage })
// 富文本上传图片
const quillStorage = multer.diskStorage({
  // 指定路径
  destination: function (req, file, cb) {
    cb(null, '../client/public/uploads')
    // 部署服务器时的存放位置
    // cb(null, '../../storage/images/blog/quill') 
  },
  // 指定文件名，时间戳标记防止冲突
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname)
  }
})
const quillUpload = multer({ storage: quillStorage })

const router = Router()

router.get("/getposts", getPosts)
router.get("/getpost/:id", getPost)
router.get("/getdraft/:id", getDraft)
router.post("/addpost", addPost)
router.delete("/deletepost/:id", deletePost)
router.put("/updatepost/:id", updatePost)
router.post("/uploadpost", upload.single('myfile'), uploadImg)
router.post("/uploaddescimg", quillUpload.single('descfile'), uploadDescImg)
router.get('/getrecommentposts', getRecommentPosts)
router.get('/getsearch', getSearchPosts)

export default router
