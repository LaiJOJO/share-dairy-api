import db from '../db/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const register = function (req, res) {
  const { username, password, email } = req.body
  console.log(username,password,email)
  let getStr = "select * from users where username = ? or email = ?"
  // 用户查重
  db.query(getStr, [username, email], (err, result) => {
    if (err) return res.send(err.message)
    if (result.length) return res.status(409).send('用户已存在 !')
    // 加密插入数据库
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    let str = "insert into users (username,password,email,img) value(?,?,?,?)"
    db.query(str, [username, hashPassword, email,'null'], (err, data) => {
      if (err) return res.status(500).send(err.message)
      // 检测影响行数
      if (data.affectedRows !== 1) return res.status(500).send('用户名注册异常！')
      res.status(200).send('注册成功')
    })
  })
}

export const login = function (req, res) {
  const { username, password } = req.body
  let getHashPassword = "select * from users where username = ?"
  // 检测用户是否存在
  db.query(getHashPassword, username, (err, result) => {
    if (err) return res.send(err.message)
    if (!result.length) return res.status(401).send('用户不存在 !')
    // 注意数据库返回的是数组，数组首个元素的对象包含所筛选数据
    let isCorrect = bcrypt.compareSync(password, result[0].password)
    if (!isCorrect) return res.status(404).send('密码错误 !')

    // 过滤密码敏感信息
    const { password:pass, ...otherResult } = result[0]
    // 加密username生成token
    let token = jwt.sign({ id: result[0].id }, 'privateKey');
    // 将token写入cookie,并设置httpOnly
    res.cookie("access_token", token, { httpOnly: true,maxAge:(24*60*60*1000) }).status(200).send(otherResult)
  })
}

export const logout = function(req,res){
  // 清空cookie
  res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
  }).status(200).send("用户退出成功 !")
}