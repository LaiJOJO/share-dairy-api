import mysql from 'mysql'
// 本机
/* const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'lai232173',
  database: 'blog_react_schema'
}) */
// 虚拟机
const db = mysql.createPool({
  host: '192.168.175.131',
  user: 'root',
  password: '20000321',
  database: 'blog_react_schema'
})
/* // 检测链接
db.query('SELECT 1', (err, result) => {
  if (err) return console.log(err.message)
  console.log(result)
}) */
export default db