import { Router } from 'express'
import { postCollection, postLike, getCheckIsLike, getCheckIsCollect, delCollection, delLike } from '../routesHandler/interact.js'
const router = Router()

// 添加收藏
router.post('/addcollect/:id', postCollection)
router.post('/addlike/:id', postLike)
router.get('/islike/:id', getCheckIsLike)
router.get('/iscollect/:id', getCheckIsCollect)
// 取消点赞收藏
router.post('/dislike/:id', delLike)
router.post('/discollect/:id', delCollection)

export default router