import jwt from "jsonwebtoken"
import db from "../db/db.js"
// 检测是否添加收藏或已经点赞
export const getCheckIsLike = function (req, res) {
  const postId = req.params.id
  // 没登陆的直接返回false
  const token = req.cookies.access_token
  if (!token) return res.status(200).send({ isLike: false })
  // 登录的则通过token获取用户id
  jwt.verify(token, 'privateKey', async function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    // 检测点赞
    let checkLiketStr = 'SELECT islike FROM likestatus WHERE likepostid = ? AND likeuserid = ?'
    db.query(checkLiketStr, [postId, tokenId.id], (err, data) => {
      if (err) return res.status(500).send(err)
      // 关联存在且激活状态为1则点赞
      if (data.length !== 0 && data[0].islike === 1) return res.status(200).send({ isLike: true })
      res.status(200).send({ isLike: false })
    })
  })
}
export const getCheckIsCollect = function (req, res) {
  const postId = req.params.id
  // 没登陆的直接返回false
  const token = req.cookies.access_token
  if (!token) return res.status(200).send({ isCollect: false })
  // 登录的则通过token获取用户id
  jwt.verify(token, 'privateKey', async function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    // 检测收藏
    let checkCollectStr = 'SELECT iscollect FROM collect WHERE postid = ? AND userid = ?'
    db.query(checkCollectStr, [postId, tokenId.id], (err, data) => {
      if (err) return res.status(500).send(err)
      if (data.length !== 0 && data[0].iscollect === 1) return res.status(200).send({ isCollect: true })
      res.status(200).send({ isCollect: false })
    })
  })
}

// 添加收藏
export const postCollection = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const postId = req.params.id
  // 校验token
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let checkCollectStr = 'SELECT iscollect FROM collect WHERE postid = ? AND userid = ?'
    db.query(checkCollectStr, [postId, tokenId.id], (err, data) => {
      if (err) return res.status(500).send(err)
      // 已有关联关系，则检测激活状态是否为0
      if (data.length !== 0) {
        if (data[0].iscollect === 1) return res.status(403).send('文章已收藏, 请勿重复操作')
        let updateCollectStr = 'UPDATE collect SET iscollect = ? WHERE postid = ? AND userid = ?'
        db.query(updateCollectStr, [1, postId, tokenId.id], (err, result) => {
          if (err) return res.status(500).send(err)
          res.status(200).send({ message: '添加收藏成功' })
        })
      }
      // 没有关联关系则添加关联并激活状态
      else {
        let addCollectStr = 'INSERT INTO collect(postid,userid,iscollect) value(?,?,?)'
        db.query(addCollectStr, [postId, tokenId.id, 1], (err, data) => {
          if (err) return res.status(500).send(err)
          res.status(200).send({ message: '添加收藏成功' })
        })
      }
    })
  })
}
// 添加点赞
export const postLike = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const postId = req.params.id
  // 校验token
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let checkLikeStr = 'SELECT islike FROM likestatus WHERE likepostid = ? AND likeuserid = ?'
    db.query(checkLikeStr, [postId, tokenId.id], (err, data) => {
      if (err) return res.status(500).send(err)
      // 已有关联关系，则检测激活状态是否为0
      if (data.length !== 0) {
        if (data[0].iscollect === 1) return res.status(403).send('文章已点赞, 请勿重复操作')
        let updateLikeStr = 'UPDATE likestatus SET islike = ? WHERE likepostid = ? AND likeuserid = ?'
        db.query(updateLikeStr, [1, postId, tokenId.id], (err, result) => {
          if (err) return res.status(500).send(err)
          res.status(200).send({ message: '点赞成功' })
        })
      }
      // 没有关联关系则添加关联并激活状态
      else {
        let addCollectStr = 'INSERT INTO likestatus(likepostid,likeuserid,islike) value(?,?,?)'
        db.query(addCollectStr, [postId, tokenId.id, 1], (err, data) => {
          if (err) return res.status(500).send(err)
          res.status(200).send({ message: '点赞成功' })
        })
      }
    })
  })
}

// 取消收藏点赞,将状态设为0即可，先检查是否存在
export const delCollection = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const postId = req.params.id
  // 校验token
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let checkCollectStr = 'SELECT iscollect FROM collect WHERE postid = ? AND userid = ?'
    db.query(checkCollectStr, [postId, tokenId.id], (err, data) => {
      if (err) return res.status(500).send(err)
      // 已有关联关系，则检测激活状态是否为0
      if (data.length !== 0) {
        if (data[0].iscollect === 0) return res.status(403).send('已取消收藏, 请勿重复操作')
        let updateCollectStr = 'UPDATE collect SET iscollect = ? WHERE postid = ? AND userid = ?'
        db.query(updateCollectStr, [0, postId, tokenId.id], (err, result) => {
          if (err) return res.status(500).send(err)
          res.status(200).send({ message: '已取消收藏' })
        })
      }
      // 没有关联关系则返回警告
      else {
        return res.status(403).send('已取消收藏, 请勿重复操作')
      }
    })
  })
}

export const delLike = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const postId = req.params.id
  // 校验token
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let checkLikeStr = 'SELECT islike FROM likestatus WHERE likepostid = ? AND likeuserid = ?'
    db.query(checkLikeStr, [postId, tokenId.id], (err, data) => {
      if (err) return res.status(500).send(err)
      // 已有关联关系，则检测激活状态是否为0,0则已取消点赞，无需重复操作
      if (data.length !== 0) {
        if (data[0].iscollect === 0) return res.status(403).send('已取消点赞, 请勿重复操作')
        let updateLikeStr = 'UPDATE likestatus SET islike = ? WHERE likepostid = ? AND likeuserid = ?'
        db.query(updateLikeStr, [0, postId, tokenId.id], (err, result) => {
          if (err) return res.status(500).send(err)
          res.status(200).send({ message: '已取消点赞' })
        })
      }
      // 没有关联关系则返回警告
      else {
        return res.status(403).send('已取消点赞, 请勿重复操作')
      }
    })
  })
}