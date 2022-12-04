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

// 添加评论
export const postAddComment = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const { postId, formdata } = req.body
  const { commentText, date } = formdata
  // 鉴权
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let addCommentStr = 'INSERT INTO comments(commentuserid,commentpostid,commenttext,commentdate) VALUE(?,?,?,?)'
    db.query(addCommentStr, [tokenId.id, postId, commentText, date], (err) => {
      if (err) return res.status(500).send(err)
      res.status(200).send({ message: '发布评论成功' })
    })
  })
}

//拉取评论, 获取评论的同时将首个回复一并进行传递
export const getComments = function (req, res) {
  const { postid, page, pagesize } = req.query
  let getLengthStr = 'SELECT count(*) length FROM comments WHERE commentpostid = ? AND commentstatus = "1"'
  db.query(getLengthStr, postid, (err, result) => {
    if (err) return res.status(500).send(err)
    let getCommentsStr = 'SELECT comments.id,`commenttext`,`username`,`img`,`commentdate` FROM comments JOIN users ON users.id = comments.commentuserid WHERE commentpostid = ? AND commentstatus = "1"  ORDER BY comments.id DESC LIMIT ?,?'
    db.query(getCommentsStr, [postid, ((+page) * (+pagesize)), +pagesize], (err, data) => {
      if (err) return res.status(500).send(err)
      const commentIds = data.map(item => {
        const { id } = item
        return id
      })
      // 有评论再进行回复筛选
      if (commentIds.length === 0) {
        res.status(200).send({ comments: data, length: result[0].length })
      } else {
        let getReplyStr = 'SELECT reply.id AS replyId,publisher.id AS publisherId,publisher.username AS publisherUsername,subscripter.id AS subscripterId,subscripter.username AS subscripterUsername,`replytext`,`replydate`,`isreply`, `commentid` FROM comment_reply AS reply JOIN users AS publisher ON reply.publisherid = publisher.id JOIN users AS subscripter ON reply.subscripterid = subscripter.id WHERE reply.commentid in(?) AND replystatus = "1" ORDER BY reply.id DESC '
        db.query(getReplyStr, [commentIds], (err, replys) => {
          if (err) return res.status(500).send(err)
          // 过滤筛选第一条回复评论
          let filterHelper = []
          const newReplys = replys.filter(item => {
            if (filterHelper.indexOf(item.commentid) === -1) {
              filterHelper.push(item.commentid)
              return true
            } else {
              return false
            }
          })
          // 拼接首个评论以及回复
          const newData = data.map(each => {
            const firstReply = newReplys.find(item => {
              return item.commentid === each.id
            })
            each.reply = firstReply
            return each
          })
          res.status(200).send({ comments: newData, length: result[0].length })
        })
      }
    })
  })
}
// 获取指定评论
export const getComment = function (req, res) {
  const { commentid } = req.query
  let getCommentsStr = 'SELECT users.id AS userid,comments.id,`commenttext`,`username`,`img`,`commentdate`,`commentpostid` FROM users JOIN comments ON users.id = comments.commentuserid WHERE comments.id = ? AND commentstatus = "1"'
  db.query(getCommentsStr, commentid, (err, data) => {
    if (err) return res.status(500).send(err)
    res.status(200).send(data[0])
  })

}

// 获取二级评论回复
export const getCommentReply = function (req, res) {
  const { commentid, page, pagesize } = req.query
  let getLengthStr = 'SELECT count(*) length FROM comment_reply WHERE commentid = ? AND replystatus = "1"'
  db.query(getLengthStr, commentid, (err, result) => {
    if (err) return res.status(500).send(err)
    // 多表联查 + 键自联 实现多对多和一表多查询
    let getReplyStr = 'SELECT reply.id AS replyId,publisher.id AS publisherId,publisher.username AS publisherUsername,subscripter.id AS subscripterId,subscripter.username AS subscripterUsername,`replytext`,`replydate`,`isreply` FROM comment_reply AS reply JOIN users AS publisher ON reply.publisherid = publisher.id JOIN users AS subscripter ON reply.subscripterid = subscripter.id WHERE reply.commentid = ? AND replystatus = "1" ORDER BY reply.id DESC LIMIT ?,? '
    db.query(getReplyStr, [commentid, ((+page) * (+pagesize)), +pagesize], (err, data) => {
      if (err) return res.status(500).send(err)
      res.status(200).send({ replyInfo: data, replyLength: result[0].length })
    })
  })
}
// 添加二级评论或回复
export const postAddReply = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const { commentText, date, subscripterId, commentId, isReply } = req.body
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let addReplyStr = 'INSERT INTO comment_reply(commentid,publisherid,replytext,subscripterid,replydate,isreply) VALUE(?,?,?,?,?,?)'
    db.query(addReplyStr, [commentId, tokenId.id, commentText, subscripterId, date, isReply], (err) => {
      if (err) return res.status(500).send(err)
      res.status(200).send({ message: '发布评论成功' })
    })
  })
}

// 删除评论
export const postDelComment = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const { commentId } = req.body
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let checkHostStr = 'SELECT `uid` AS postuserid,`commentuserid` FROM comments JOIN posts ON commentpostid = posts.id WHERE comments.id = ?'
    db.query(checkHostStr, [commentId], (err, result) => {
      if (err) return res.status(500).send(err)
      // 有删除权限的id，文章作者或评论发起人
      if (result[0].postuserid == tokenId.id || result[0].commentuserid == tokenId.id) {
        let delCommentStr = 'UPDATE comments SET commentstatus = ? WHERE id = ?'
        db.query(delCommentStr, [0, commentId], (err) => {
          if (err) return res.status(500).send(err)
          let delReplyStr = 'UPDATE comment_reply SET replystatus = ?  WHERE commentid = ? '
          db.query(delReplyStr, [0, commentId], (err) => {
            if (err) return res.status(500).send(err)
            res.status(200).send({ message: '已删除评论 !' })
          })
        })
      } else {
        res.status(403).send('无操作权限 !')
      }
    })
  })
}
// 删除回复
export const postDelReply = function (req, res) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).send('请登录后进行操作 !')
  const { replyId } = req.body
  // 文章发布者或者评论回复者才能删除回复
  jwt.verify(token, 'privateKey', function (err, tokenId) {
    if (err) return res.status(401).send('非法token值')
    let checkHostStr = 'SELECT `uid` AS postuserid,`publisherid`,comment_reply.id AS replyId FROM comments JOIN posts ON commentpostid = posts.id JOIN comment_reply ON commentid = comments.id WHERE comment_reply.id = ?'
    db.query(checkHostStr, [replyId], (err, result) => {
      if (err) return res.status(500).send(err)
      // 有删除权限的id，文章作者或评论发起人
      if (result[0].postuserid == tokenId.id || result[0].publisherid == tokenId.id) {
        let delReplyStr = 'UPDATE comment_reply SET replystatus = ? WHERE id = ?'
        db.query(delReplyStr, [0, replyId], (err) => {
          if (err) return res.status(500).send(err)
          res.status(200).send({ message: '已删除评论 !' })
        })
      } else {
        res.status(403).send('无操作权限 !')
      }
    })
  })
}