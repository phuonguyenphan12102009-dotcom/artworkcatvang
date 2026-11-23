# Living Artwork – Tranh rõ dần theo số người ghé xem

Mỗi thiết bị ghé xem được tính **1 lần**, **cộng dồn theo thời gian** (không cần xem cùng lúc).
Đủ `TARGET_VIEWERS` thiết bị (mặc định 10) thì tranh rõ nét 100%.

## Chạy thử trên máy
```bash
npm install
npm start
```
Mở http://localhost:3000. Mỗi trình duyệt/thiết bị chỉ tính 1 lần (tải lại trang không tăng thêm).
Để thử nhiều người trên cùng máy: mở cửa sổ ẩn danh hoặc dùng trình duyệt khác. Muốn dễ thấy hiệu ứng, đổi `TARGET_VIEWERS` trong `public/index.html` (ví dụ 3).

## Thay ảnh
Thay file `public/artwork.jpg` bằng ảnh của bạn (giữ đúng tên). Ảnh hiển thị tối đa ~1000px ngang nên nên dùng ảnh rộng khoảng 1000–1600px, dưới ~1 MB. File hiện tại chỉ là ảnh mẫu.

## Reset
Nút Reset **không hiện với người xem thường**. Chỉ hiện khi mở: `http://localhost:3000/?admin=<khoá>`.
Trên server đặt biến môi trường `ADMIN_KEY=<khoá>` thì chỉ ai biết khoá mới reset được (nếu không đặt, ai gọi `/reset` cũng reset được; chỉ nên để vậy khi chạy thử trên máy).

## Lưu số đếm
- Mặc định lưu vào file `data.json` (còn nguyên khi khởi động lại server, miễn ổ đĩa không bị xoá).
- **Render gói Free xoá ổ đĩa mỗi khi server ngủ/khởi động lại**, nên số đếm cộng dồn sẽ về 0. Để giữ lâu dài, tạo database Redis miễn phí ở upstash.com rồi đặt 2 biến môi trường trên Render:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

  Có 2 biến này, server tự dùng Upstash thay cho file.

## API
- `POST /visit` body `{ "id": "<mã thiết bị>" }` -> `{ ok, count, resetSeq }`
- `GET  /count` -> `{ count, resetSeq }`
- `POST /reset` (header `x-admin-key` nếu có đặt `ADMIN_KEY`) -> `{ ok, count: 0, resetSeq }`

## Đẩy lên GitHub
```bash
git init
git add .
git commit -m "Living artwork"
git branch -M main
git remote add origin https://github.com/<ten-ban>/living-artwork.git
git push -u origin main
```

## Deploy miễn phí trên Render
1. render.com -> đăng nhập bằng GitHub.
2. New -> Web Service -> chọn repo.
3. Runtime: Node | Build: `npm install` | Start: `npm start` | Instance: Free.
4. Environment: thêm `ADMIN_KEY` (và 2 biến Upstash ở trên nếu muốn giữ số đếm lâu dài).
5. Create Web Service, đợi 1-2 phút để có link `https://<ten>.onrender.com`.

Lưu ý: gói Free tự ngủ sau ~15 phút không truy cập (lần mở đầu sau đó sẽ chậm vài chục giây).
