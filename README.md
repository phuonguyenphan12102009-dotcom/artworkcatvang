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
Mở trang với `?debug` (ví dụ `http://localhost:3000/?debug`) để thấy bảng số liệu: bộ nhận diện đang dùng, số mặt, và góc quay (yaw), ngẩng/cúi (pitch), nghiêng (roll) của từng người. Nhìn số rồi chỉnh các ngưỡng bên dưới.
- `CAM_WIDTH` / `CAM_HEIGHT` (1280x720): độ phân giải camera. Cao hơn nhận ra người xa tốt hơn; máy yếu thì hạ về 640x480.
- `PREFER_SSD` (true): dùng bộ nhận diện SSD MobileNet (chính xác hơn) nếu có file model, nếu không tự dùng TinyFaceDetector. `SSD_MIN_CONF` (0.5) là độ tin cậy tối thiểu của SSD.
- `INPUT_SIZE` (320) và `MIN_SCORE` (0.35): chỉ áp dụng cho TinyFaceDetector. Tăng `INPUT_SIZE` (416) nếu người đứng xa; hạ `MIN_SCORE` nếu bỏ sót người, nâng nếu nhận nhầm.
- `ARRIVE_MS` / `LEAVE_MS`: thời gian để tính một người là đã đến / đã rời đi. Lớn hơn thì ít đếm nhầm nhưng phản ứng chậm hơn.
- `MIN_FACE_RATIO` (0.04): mặt nhỏ hơn tỉ lệ này (người đứng quá xa) thì bỏ qua.
- `CHECK_GAZE`, `YAW_MAX_OFFSET`, `PITCH_MIN`/`PITCH_MAX`, `ROLL_MAX_DEG`: chỉ tính người quay mặt về phía màn hình. Nới các ngưỡng nếu hay bỏ sót người, siết lại nếu tính nhầm người đang nhìn đi chỗ khác.

## Bật bộ nhận diện SSD MobileNet (chính xác hơn, nặng hơn)
Tải model từ https://github.com/vladmandic/face-api/tree/master/model hai file `ssd_mobilenetv1_model.bin` và `ssd_mobilenetv1_model.json`, bỏ vào `public/vendor/models/`, rồi **đổi tên** `ssd_mobilenetv1_model.json` thành `ssd_mobilenetv1_model-weights_manifest.json` (thư viện tìm đúng tên này). Mở `?debug` để kiểm tra dòng "Bộ nhận diện" hiện `SSD MobileNet v1`. Nếu máy bị giật, tăng `DETECT_INTERVAL_MS` hoặc đặt `PREFER_SSD = false`.

## Reset
Nút Reset chỉ hiện khi mở `http://localhost:3000/?admin`.

## Thay ảnh
Thay file `public/artwork.jpg` bằng ảnh của bạn (giữ đúng tên). Nên dùng ảnh ngang tỉ lệ 3:2, rộng khoảng 2000px, dưới 1MB để trang tải nhanh.

## Giao diện
Cùng phong cách với web Bảo tàng số Kiến trúc Chùa Khmer, gồm một trang duy nhất. Các file hình dùng chung nằm trong `public/`: `icon.png` (logo) và `rosette.svg` (hoa văn sen xoay).

## Thư mục `public/vendor`
Chứa thư viện nhận diện khuôn mặt [@vladmandic/face-api](https://github.com/vladmandic/face-api) (giấy phép MIT) và các model, để trang chạy được mà không cần tải thêm từ internet.

## Deploy miễn phí trên Render
Runtime: Node | Build: `npm install` | Start: `npm start` | Instance: Free. Không cần biến môi trường nào.

## Nhận diện người xem (bản nâng cấp)
- **Hai bộ nhận diện:** `vendor/models` có cả Tiny Face Detector (nhẹ) và SSD MobileNet (chính xác hơn, nhận được người đứng xa hơn, nặng hơn). Mặc định `DETECTOR = 'auto'`: lúc mở trang, trang tự đo tốc độ máy rồi chọn bộ phù hợp. Máy mạnh dùng SSD, máy yếu dùng Tiny. Đang dùng SSD mà máy chậm đi thì tự lùi về Tiny.
- **Thích nghi máy chậm:** các khoảng thời gian "người đến/người rời" tự giãn ra theo tốc độ nhận diện, nên máy chậm vẫn đếm được.
- **Chống ra/vào để lách:** sau khi tính một lượt, nếu khung trống rồi cùng người đó quay lại trong `REENTRY_COOLDOWN_MS` (mặc định 15 giây) thì không tính thêm. Đặt về `0` để tắt. Lưu ý: không nhận diện danh tính nên đây chỉ làm chậm việc lách, không chặn tuyệt đối. Nơi đông khách nên giảm xuống 5–8 giây.
- **Chỉnh nhanh** (đầu đoạn script trong `index.html`): `DETECTOR`, `MIN_FACE_RATIO` (mặc định 5%, tương đương khoảng 2 m), `PITCH_MIN`/`YAW_MAX_OFFSET` (độ nghiêng đầu cho phép).
- Mở trang với `?debug` để xem bộ đang dùng, tốc độ mỗi lần nhận diện, số người và độ nghiêng đầu từng người.
