// Server chỉ phục vụ file tĩnh. Việc nhận diện mặt chạy hoàn toàn trong trình duyệt,
// hình từ camera không được gửi đi đâu cả.
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Chạy tại http://localhost:${PORT}`));
