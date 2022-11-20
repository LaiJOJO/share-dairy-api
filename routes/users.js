import {Router} from 'express'
import { changeImg,getUserinfo,getUserRecommentPosts,changeUsername,changeEmail,changePassword,getUserPubisheds,getUserDrafts } from '../routesHandler/users.js'

const router = Router()
router.get('/userinfo/:username',getUserinfo)
router.get('/userrecommentposts/:userid',getUserRecommentPosts)
router.post('/changeusername',changeUsername)
router.post('/changeemail',changeEmail)
router.post('/changepassword',changePassword)
router.post('/changeimg',changeImg)
router.get('/getuserpublisheds',getUserPubisheds)
router.get('/getusedrafts',getUserDrafts)


export default router