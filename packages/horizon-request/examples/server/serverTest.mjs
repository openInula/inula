import express from "express";
import * as fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 自定义 CORS 配置
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Requested-With,content-type', 'IR-Custom-Header'],
  exposedHeaders: ['X-Powered-By'],
  optionsSuccessStatus: 200, // 设置 OPTIONS 请求成功时的状态码为 200
  credentials: true
};

app.use(cors(corsOptions));

// 处理 GET 请求
app.get('/', (req, res) => {
  res.send('Hello Horizon Request!');
})

app.get('/data', (req, res) => {
  const data = {
    message: 'Hello Horizon Request!',
  };

  res.setHeader('Content-Type', 'application/json');

  res.send(JSON.stringify(data));
});

app.get('/download', (req, res) => {
  const filePath = 'D:\\code\\MRcode\\Horizon-Request\\examples\\request\\downloadTest.html';
  const fileName = 'downloadTest.html';
  const fileSize = fs.statSync(filePath).size;

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', fileSize);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).send('File not found');
  }
});

// 处理 POST 请求
app.post('/', (req, res) => {
  res.send('Got a POST request!');
});

// 处理 PUT 请求
app.put('/users', (req, res) => {
  res.send('Got a PUT request at /users');
});

// 处理 DELETE 请求
app.delete('/users', (req, res) => {
  res.send('Got a DELETE request at /users');
});

// 处理 HEAD 请求
app.head('/', (req, res) => {
  res.setHeader('x-powered-by', 'Express');
  res.json({ 'x-powered-by': 'Express' });
  res.sendStatus(200);
});

// 处理 OPTIONS 请求
app.options('/', (req, res) => {
  res.sendStatus(200);
});

// 处理 PATCH 请求
app.patch('/', (req, res) => {
  const name = req.body.name;
  const message = `Hello, ${name}! Your name has been updated.`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(message);
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
