import db from "../db/db.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// 这里检验一次token后续不需要进行token的验证
// 获取用户邮箱头像等信息
export const getUserinfo = function (req, res) {
  const token = req.cookies.access_token
  const { username } = req.params
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const userIdStr = 'SELECT * FROM users WHERE username = ?'
  db.query(userIdStr, username, (err, result) => {
    if (err) return res.status(500).send(err)
    const userId = result[0].id
    jwt.verify(token, 'privateKey', function (err, tokenId) {
      if (err) return res.status(500).send(err)
      if (tokenId.id !== userId) res.status(403).send('无操作权限 !')
      // 过滤密码等重要信息
      const { password, ...otherInfo } = result[0]
      res.status(200).send(otherInfo)
    })
  })
}

export const getUserRecommentPosts = function (req, res) {
  const token = req.cookies.access_token
  const { userid } = req.params
  if (!token) return res.status(401).send('请登录后进行操作 !')
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(500).send(err)
    // 注意解析的id是字符串，因此要浅比较
    if (tokenId.id != userid) res.status(403).send('无相关文章 !')
    // 验证登录用户对应后再取数据
    const userIdStr = 'SELECT * FROM posts WHERE uid = ? AND status = "published"'
    db.query(userIdStr, userid, (err, result) => {
      if (err) return res.status(500).send(err)
      // 大于6篇返回最新创建的6篇
      const recommentPosts = result.length > 6 ? result.reverse().slice(0, 6) : result
      res.status(200).send(recommentPosts)
    })
  })
}

// 更改用户信息
export const changeUsername = function (req, res) {
  const token = req.cookies.access_token
  const { oldUsername, newUsername, password } = req.body
  if (!token) return res.status(401).send('请登录后进行操作 !')
  let getUserInfo = "select * from users where username = ?"
  // 检测用户是否存在
  db.query(getUserInfo, oldUsername, (err, result) => {
    if (err) return res.status(500).send(err)
    if (!result.length) return res.status(403).send('用户不存在 !')
    // 注意数据库返回的是数组，数组首个元素的对象包含所筛选数据
    let isCorrect = bcrypt.compareSync(password, result[0].password)
    if (!isCorrect) return res.status(403).send('密码错误 !')

    // 密码通过后进行用户名更换
    const changeUsernameStr = 'UPDATE users SET username = ? WHERE id = ?'
    db.query(changeUsernameStr, [newUsername, result[0].id], (err, result) => {
      if (err) return res.status(500).send(err)
      // 修改成功要清空cookie，通知前端清空登录状态,之后重新登录
      res.clearCookie("access_token", {
        sameSite: "none",
        secure: true
      })
      res.status(200).send('用户名修改成功 !')
    })
  })
}
export const changeEmail = function (req, res) {
  const token = req.cookies.access_token
  const { oldEmail, newEmail, username, password } = req.body
  if (!token) return res.status(401).send('请登录后进行操作 !')
  let getUserInfo = "select * from users where username = ?"
  // 检测用户是否存在
  db.query(getUserInfo, username, (err, result) => {
    if (err) return res.status(500).send(err)
    if (!result.length) return res.status(403).send('用户不存在 !')
    if (result[0].email !== oldEmail) return res.status(404).send('原邮箱不正确')
    // 注意数据库返回的是数组，数组首个元素的对象包含所筛选数据
    let isCorrect = bcrypt.compareSync(password, result[0].password)
    if (!isCorrect) return res.status(403).send({ message: '密码错误 !' })

    // 密码通过后进行邮箱更换
    const changeEmailStr = 'UPDATE users SET email = ? WHERE id = ?'
    db.query(changeEmailStr, [newEmail, result[0].id], (err, result) => {
      if (err) return res.status(500).send(err)
      // 修改成功要清空cookie，通知前端清空登录状态,之后重新登录
      res.clearCookie("access_token", {
        sameSite: "none",
        secure: true
      })
      res.status(200).send('邮箱修改成功 !')
    })
  })
}
export const changePassword = function (req, res) {
  const token = req.cookies.access_token
  const { oldPassword, newPassword, username, email } = req.body
  if (!token) return res.status(401).send('请登录后进行操作 !')
  let getUserInfo = "select * from users where username = ?"
  // 检测用户是否存在
  db.query(getUserInfo, username, (err, result) => {
    if (err) return res.status(500).send(err)
    if (!result.length) return res.status(403).send('用户不存在 !')
    // 注意数据库返回的是数组，数组首个元素的对象包含所筛选数据
    let isCorrect = bcrypt.compareSync(oldPassword, result[0].password)
    if (!isCorrect) return res.status(403).send({ message: '密码错误 !' })

    // 密码通过后进行密码更换
    const changePasswordStr = 'UPDATE users SET password = ? WHERE id = ?'
    // 加密插入数据库
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(newPassword, salt);
    db.query(changePasswordStr, [hashPassword, result[0].id], (err, result) => {
      if (err) return res.status(500).send(err)
      // 修改成功要清空cookie，通知前端清空登录状态,之后重新登录
      res.clearCookie("access_token", {
        sameSite: "none",
        secure: true
      })
      res.status(200).send('邮箱修改成功 !')
    })
  })
}
export const changeImg = async function (req, res) {
  const token = req.cookies.access_token
  const { image } = req.body

  if (!token) return res.status(401).send('请登录后进行操作 !')
  jwt.verify(token, 'privateKey', function (err, access_token) {
    if (err) return res.status(403).send('cookie错误,无权限操作 !')
    let getUserInfo = "select * from users where id = ?"
    // 检测用户是否存在
    db.query(getUserInfo, access_token.id, (err, result) => {
      if (err) return res.status(500).send(err)
      if (!result.length) return res.status(403).send('用户不存在 !')
      // 验证token后更换头像
      const changeImgStr = 'UPDATE users SET img = ? WHERE id = ?'
      db.query(changeImgStr, [image, result[0].id], (err) => {
        if (err) return res.status(500).send(err)
        res.status(200).send(image)
      })
    })
  })


}

// 获取指定用户发布文章
export const getUserPubisheds = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const { username, page } = req.query
  let getUserInfo = "select * from users where username = ?"
  db.query(getUserInfo, username, (err, result) => {
    if (err) return res.status(500).send(err)
    if (!result.length) return res.status(403).send('用户不存在 !')
    const getStr = 'SELECT * FROM posts WHERE UID = ? AND STATUS = "published"'
    db.query(getStr, result[0].id, (err, data) => {
      if (err) return res.status(500).send(err)
      const pageData = data.length > 3 ? data.slice((+page) * 3, (+page) * 3 + 3) : data
      res.status(200).send({ publisheds: pageData, length: data.length })
    })
  })
}

// 获取指定用户草稿
export const getUserDrafts = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const { username, page } = req.query
  let getUserInfo = "select * from users where username = ?"
  db.query(getUserInfo, username, (err, result) => {
    if (err) return res.status(500).send(err)
    if (!result.length) return res.status(403).send('用户不存在 !')
    const getStr = 'SELECT * FROM posts WHERE UID = ? AND STATUS = "draft"'
    db.query(getStr, result[0].id, (err, data) => {
      if (err) return res.status(500).send(err)
      const pageData = data.length > 3 ? data.slice(page * 3, page * 3 + 3) : data
      res.status(200).send({ publisheds: pageData, length: data.length })
    })
  })

}

// 获取用户收藏文章
export const getUserCollections = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const { username, page, pagesize } = req.query
  // 检测用户名
  let getUserInfo = "select * from users where username = ?"
  db.query(getUserInfo, username, (err, result) => {
    if (err) return res.status(500).send(err)
    if (!result.length) return res.status(403).send('用户不存在 !')
    const getStr = 'SELECT posts.id,`title`,`description`,`img` FROM posts JOIN collect ON posts.id = collect.postid WHERE collect.userid = ? AND iscollect = 1 '
    db.query(getStr,result[0].id, (err, data) => {
      if (err) return res.status(500).send(err)
      const pageData = data.length > (+pagesize) ? data.slice((+page) * pagesize, (+page) * (+pagesize) + (+pagesize)) : data
      res.status(200).send({ collections: pageData, length: data.length, userId: result[0].id })
    })
  })
}
