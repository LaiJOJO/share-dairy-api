import db from '../db/db.js'
import jwt from 'jsonwebtoken'
import getRandom from '../units/random.js'

// 获取所有已发布文章
export const getPosts = function (req, res) {
  let { cat, page, pagesize } = req.query
  let str = cat == 'undefined' ? 'SELECT * FROM posts WHERE status = "published"' : 'SELECT * FROM posts WHERE cat = ? AND status = "published"'
  db.query(str, cat, (err, data) => {
    if (err) return res.status(500).send(err)
    // 注意将传递的字符串转换成int类型 
    const pageData = data.length > pagesize ? data.slice((+page * pagesize), ((+page + 1) * (+pagesize))) : data
    res.status(200).send({ posts: pageData, dataLength: data.length })
  })
}

// 获取模糊查询关键词文章
export const getSearchPosts = function (req, res) {
  let { keyword, page, pagesize } = req.query
  let keywords = "%" + keyword + "%"
  let searchStr = 'SELECT * FROM posts WHERE (description like ? OR title like ?) AND status = "published"'
  db.query(searchStr, [keywords, keywords], (err, data) => {
    if (err) return res.status(500).send(err)
    const pageData = data.length > pagesize ? data.slice((+page * pagesize), ((+page + 1) * (+pagesize))) : data
    res.status(200).send({ posts: pageData, dataLength: data.length })
  })
}

// 获取随机推荐文章
export const getRecommentPosts = function (req, res) {
  let { cat } = req.query
  let str = cat == 'undefined' ? 'SELECT * FROM posts WHERE status = "published"' : 'SELECT * FROM posts WHERE cat = ? AND status = "published"'
  db.query(str, cat, (err, data) => {
    if (err) return res.status(500).send('获取数据异常 !')
    // 随机选取三篇文章 ,小于三篇则全部发送
    const randomIndex = getRandom(0, data.length - 3)
    const pageData = data.length > 3 ? data.slice(randomIndex, randomIndex + 3) : data
    res.status(200).send(pageData)
  })
}

// 根据params参数获取文章
export const getPost = function (req, res) {
  let postId = req.params.id
  const str = 'SELECT posts.id,`title`,`username`,`description`,`cat`,`date`,`status`,posts.img,users.img AS userImg FROM users JOIN posts ON users.id = posts.uid WHERE posts.id = ? AND status = "published"'
  db.query(str, [postId], (err, data) => {
    if (err) return res.status(500).send(err)
    res.status(200).send(data[0])
  })
}

// 根据params参数获取草稿
export const getDraft = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  let draftId = req.params.id
  const str = 'SELECT posts.id,`title`,`username`,`description`,`cat`,`date`,`status`,posts.img,users.img AS userImg FROM users JOIN posts ON users.id = posts.uid WHERE posts.id = ? AND status = "draft"'
  db.query(str, [draftId], (err, data) => {
    if (err) return res.status(500).send(err)
    res.status(200).send(data[0])
  })
}

// 上传图片
export const uploadImg = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  jwt.verify(token, 'privateKey', function (err, publisherId) {
    if (err) res.status(403).send('非创作者无法进行操作 !')
    // 上传服务器的返回值
    const imgUrl = 'http://192.168.175.131:3001/images/blog/'+req.file?.filename
    res.status(200).send(imgUrl)
    // res.status(200).send(req.file?.filename)
  });
}
// 上传富文本图片
export const uploadDescImg = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  jwt.verify(token, 'privateKey', function (err, publisherId) {
    if (err) res.status(403).send('非创作者无法进行操作 !')
    // 上传服务器的返回值
    const imgUrl = 'http://192.168.175.131:3001/images/blog/quill/' + req.file?.filename
    res.status(200).send(imgUrl)
    // res.status(200).send(req.file?.filename)
  })
}

// 创建文章，需要在线才能添加
export const addPost = function (req, res) {
  const token = req.cookies.access_token
  const { title, desc, cat, img, date, status } = req.body
  if (!token) return res.status(401).send('请登录后进行操作 !')
  jwt.verify(token, 'privateKey', function (err, publisherId) {
    if (err) res.status(403).send('无权限操作 !')
    let str = 'INSERT INTO posts(`title`,`description`,`cat`,`img`,`date`,`uid`,`status`) VALUE(?) '
    db.query(str, [[title, desc, cat, img, date, publisherId.id, status]], (err) => {
      if (err) return res.status(500).send(err)
      res.status(200).send('创建成功 !')
    })
  });
}

// 指定params传参，传递id进行文章删除(需要检测token权限)
export const deletePost = function (req, res) {
  const token = req.cookies.access_token
  const postId = req.params
  if (!token) return res.status(401).send('请登录后进行操作 !')
  jwt.verify(token, 'privateKey', function (err, publisherId) {
    if (err) res.status(403).send('非创作者无法进行操作 !')
    // 根据文章的uid和存入cookie的uid进行判断是否为作者操作
    const str = 'DELETE FROM posts WHERE id = ? AND uid = ?'
    db.query(str, [postId.id, publisherId.id], (err) => {
      if (err) return res.status(500).send('操作异常,请稍后尝试 !')
      res.status(200).send('删除成功 !')
    })
  });
}

// 更新文章，需要验证token权限,图片没有上传则不需要更新
export const updatePost = function (req, res) {
  const token = req.cookies.access_token
  const postId = req.params
  const { title, desc, cat, img, status } = req.body
  if (!token) return res.status(401).send('请登录后进行操作 !')
  jwt.verify(token, 'privateKey', function (err, publisherId) {
    if (err) res.status(403).send('无权限操作 !')
    // 根据文章的uid和存入cookie的uid进行判断是否为作者操作
    let str = 'UPDATE posts SET `title` = ?,`description` = ?,`cat` = ?,`img` = ?,`status` = ?  WHERE id = ? AND uid = ?'
    db.query(str, [title, desc, cat, img, status, postId.id, publisherId.id], (err) => {
      if (err) return res.status(500).send(err)
      res.status(200).send('更新成功 !')
    })
  });
}