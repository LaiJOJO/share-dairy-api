import {Router} from 'express'
import {register,login,logout,findpassword} from '../routesHandler/auth.js'

const router = Router()
router.post("/register",register)
router.post("/login",login)
router.post("/logout",logout)
router.post("/findpassword",findpassword)

export default router