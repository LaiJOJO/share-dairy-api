import Client from 'ssh2-sftp-client'
function put(localPath, romotePath) {
  const sftp = new Client()
  sftp.connect({
    host: '192.168.175.131', // 服务器 IP
    port: '3001',
    username: 'root',
    password: '20000321'
  }).then(() => {
    // 上传文件       
    return sftp.fastPut(localPath, romotePath);
  }).then((data) => {
    console.log(localPath + "上传完成");
    sftp.end();
  }).catch((err) => {
    console.log(err, 'catch error');
  });
}
// export default put 
put('../../client/public/uploads/1667477179761-8460933241110664.png','/images/1667477179761-8460933241110664.png')
