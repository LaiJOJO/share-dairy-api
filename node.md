## 包
  express
  mysql
  bcrypt -- hash加密
  jsonwebtoken -- 生成加密token
  cookie-parser -- 中间件，用来解析cookie
  body-parser -- 提高请求体实体大小，防止413请求体过大错误
  multer -- 解析前端上传的文件进行命名和存放用

## 错误码
  401. 未登录
  403. 密码、用户、邮箱错误、无权限访问
  404. 无对应资源或用户信息
  500. 数据库问题或其它后台引发错误

## 数据库的posts表的uid与users表的id串联，删除用户id时根据uid删除对应所有posts文章

## auth请求结构 /api/users
  1. /register : 请求注册
    a. 检测是否存在用户(请求数据库中用户名返回的数据长度不为0表示存在)，返回409状态码(状态冲突),返回‘用户存在信息’
    b. 不存在则对密码利用 bcrypt 进行密码加密放入数据库
  2. /login : 登录
    a. 登录时验证加密密码，同时使用jsonwebtoken生成加密token
    b. 使用res.cookie将token写入cookie
    c. cookie跨域写入 :
      // 利用该配置允许该地址写入cookie, 客户端axios要开启 withCredentials:true 配置
        const corsOptions = {
          origin: 'http://localhost:3000',//允许发送cookie的网站
          // 允许跨域情况下发送cookie
          credentials: true,
          maxAge: '1728000'
        }
  3. /logout : 退出登录
    a. 清空cookie
    b. 返回状态码200退出成功

## posts请求结构
  1. 获取文章 /getPosts
    a. 根据query参数进行分类匹配
    b. 

  2. 获取指定文章 /getPost
    a. 根据params参数进行id获取指定文章
    b. 嵌套字段进行两张表数据筛选

  3. 添加文章 /addPost
    a. 数据库存放使用LONGTEXT类型才能存放长文本，否则过长文本会报:"Data too long for column 'desc' at row 1"错误,非同一行

  4. 删除文章 /deletePost
    a. 获取req.cookies ,并且使用jwt进行解密获取cookies写入的用户id； 没有token则无权限操作
    b. 根据用户id和文章的uid进行删除，如果数据库报错，则代表无权限操作

  5. 更新文章 /updatePost
    a. 验证token，更新信息

  6. 模糊查询相关数据
    a. 根据关键词进行内容和标题的模糊匹配
    b. 模糊查询语句(使用like,但是效率低) : SELECT * FROM posts WHERE (description like ? OR title like ?)

## users请求结构
  1. 提供用户信息，需要将传递上来的用户名的id和cookie的id作对比
  2. 修改用户信息，只需要验证登录状态,之后再进行密码校验,因此不需要验证是否为对应登录用户
  3. 根据前台传递的页数进行数据切割
  4. 上传图片为base64格式，以text形式保存到数据库；根据需求也可以修改blob格式进行保存且blob更小更轻便


## 优化
  1. 部署nodejs到服务器后，将文件保存路径修改为服务器指定文件夹，将拼接文件名和服务器文件夹地址的字符串保存到数据库，之后获取时只需要请求地址获取图片即可
  2. nodejs在Linux的路径以index.js为基准，无论哪个文件的代码都是
  3. 只有域名对应的domain才能写入cookie，因此只有都部署到服务器上才能实现cookie写入
  4. 部署时bcrypt需要在linux环境卸载安装一次，因为针对不同的系统环境其编译结果会存在误差