import { Router } from 'express'
import { postDelComment, postDelReply, postCollection, postLike, getCheckIsLike, getCheckIsCollect, delCollection, delLike, postAddComment, getComments, getCommentReply, getComment, postAddReply } from '../routesHandler/interact.js'
const router = Router()

// 添加收藏
router.post('/addcollect/:id', postCollection)
router.post('/addlike/:id', postLike)
router.get('/islike/:id', getCheckIsLike)
router.get('/iscollect/:id', getCheckIsCollect)
// 取消点赞收藏
router.post('/dislike/:id', delLike)
router.post('/discollect/:id', delCollection)
// 添加评论
router.post('/addcomment', postAddComment)
// 拉取评论
router.get('/getcomments', getComments)
router.get('/getcomment', getComment)
// 拉取二级评论
router.get('/getcommentreply', getCommentReply)
// 添加二级评论或回复
router.post('/postaddreply', postAddReply)
// 删除评论
router.post('/postdelreply', postDelReply)
router.post('/postdelcomment', postDelComment)


export default router