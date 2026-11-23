# Living Artwork – Tranh rõ dần theo số người nhìn vào màn hình

Camera của máy tính nhận diện khuôn mặt để đếm số người đang nhìn vào màn hình.
Nhận diện chạy **ngay trong trình duyệt**, hình từ camera không được gửi đi đâu và không được lưu.

## Chạy
```bash
npm install
npm start
```
Mở http://localhost:3000 và bấm **Cho phép** khi trình duyệt hỏi quyền camera.
Camera chỉ hoạt động trên `localhost` hoặc `https` (link Render là https nên dùng được).

## Hai chế độ đếm (đổi `MODE` trong `public/index.html`)
- `'accumulate'` (mặc định): **cộng dồn**. Mỗi lần có thêm người đến nhìn thì cộng thêm, không cần nhìn cùng lúc.
  Ví dụ 2 người nhìn rồi đi, lát sau 3 người khác đến thì tổng là 5. Đủ `TARGET_VIEWERS` (10) thì tranh rõ 100%.
  Tổng được nhớ trong trình duyệt của máy đó (localStorage), tải lại trang không mất.
  Máy không nhận ra từng người, nên một người đi rồi quay lại sẽ được tính thêm một lần.
- `'live'`: chỉ tính số người **đang nhìn** tại thời điểm hiện tại; ai rời đi thì tranh mờ lại.

## Chỉnh độ nhạy (đầu đoạn script trong `public/index.html`)
- `STABLE_MS`: số người phải ổn định ngần này mili giây mới được tính (lọc nhiễu).
- `MIN_FACE_RATIO`: mặt nhỏ hơn tỉ lệ này (người đứng quá xa) thì bỏ qua.
- `CHECK_GAZE`, `YAW_MIN`, `YAW_MAX`: chỉ tính người quay mặt về phía màn hình; nới khoảng này nếu hay bị bỏ sót người.
- `MIN_SCORE`: độ tin cậy tối thiểu của khuôn mặt.

## Reset
Nút Reset chỉ hiện khi mở `http://localhost:3000/?admin`.

## Thay ảnh
Thay file `public/artwork.jpg` bằng ảnh của bạn (giữ đúng tên). Ảnh hiển thị tối đa ~1000px ngang.

## Thư mục `public/vendor`
Chứa thư viện nhận diện khuôn mặt [@vladmandic/face-api](https://github.com/vladmandic/face-api) (giấy phép MIT) và các model, để trang chạy được mà không cần tải thêm từ internet.

## Deploy miễn phí trên Render
Runtime: Node | Build: `npm install` | Start: `npm start` | Instance: Free. Không cần biến môi trường nào.
