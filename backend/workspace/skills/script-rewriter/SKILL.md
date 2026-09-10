---
name: script-rewriter
description: Phương pháp và quy chuẩn viết lại tiểu thuyết thành kịch bản chuẩn hóa
---

# Hướng dẫn viết lại kịch bản

## Nguyên tắc viết lại

1. **Giữ nguyên cốt truyện cốt lõi**: không thay đổi mạch truyện chính và quan hệ nhân vật
2. **Tăng cường tính hình ảnh**: chuyển văn bản tường thuật thành mô tả cảnh có thể hình dung được
3. **Lời thoại dẫn dắt**: dùng lời thoại để đẩy tình tiết, giảm bớt lời dẫn (旁白)
4. **Kiểm soát nhịp độ**: mỗi cảnh giới hạn trong 30-60 giây, phù hợp với video ngắn
5. **Không viết ngôn ngữ máy quay**: không đề cập cỡ cảnh, góc quay, chuyển động máy quay — những thứ này thuộc bước chia tách phân cảnh

## Định dạng kịch bản chuẩn hóa

```
## S01 | Nội cảnh · Quán cà phê | Hoàng hôn

Ánh nắng hoàng hôn xuyên qua khung cửa kính rọi vào quán cà phê, ly cà phê trên quầy bốc hơi nghi ngút.

Tiểu Minh ngồi một mình ở góc bàn, cúi đầu nhìn điện thoại, vẻ mặt có chút lo lắng.

Chuông cửa vang lên, Tiểu Hồng đẩy cửa bước vào. Cô nhìn thấy Tiểu Minh, mỉm cười bước tới.

Tiểu Hồng: (mỉm cười) Đợi lâu chưa?
Tiểu Minh: (ngẩng đầu) Cũng không lâu, vừa mới tới.
```

### Quy tắc định dạng

- `## SSố thứ tự | Nội cảnh/Ngoại cảnh · Địa điểm | Khung giờ` — tiêu đề cảnh
- Đoạn mô tả hành động tự nhiên — không chứa bất kỳ ngôn ngữ máy quay nào
- `Tên nhân vật: (trạng thái/biểu cảm) nội dung lời thoại` — định dạng lời thoại

### Tham khảo mức độ nội dung

Kịch bản chuẩn hóa tăng khoảng 20-30% so với nội dung gốc, phần tăng thêm chủ yếu là nhãn tiêu đề cảnh và định dạng hóa lời thoại, không phải viết thêm mở rộng nội dung.

## Các bước viết lại

1. Trước tiên gọi `read_episode_script` để đọc nội dung gốc
2. Phân tích cấu trúc nội dung (tỷ lệ giữa hội thoại, tường thuật, mô tả tâm lý)
3. Gọi `rewrite_to_screenplay` để thực hiện viết lại
4. Kiểm tra kết quả viết lại, xác nhận đúng định dạng kịch bản chuẩn hóa
5. Gọi `save_script` để lưu kết quả cuối cùng

## Lưu ý

- Mô tả tâm lý có thể chuyển hóa thành biểu cảm/hành động của nhân vật hoặc lời dẫn ngoài hình
- Đoạn tường thuật dài nên tách thành nhiều cảnh ngắn
- Đảm bảo mỗi cảnh có điểm chuyển biến cảm xúc rõ ràng
- Giữ nhất quán phong cách ngôn ngữ của từng nhân vật
- Số thứ tự cảnh tăng dần liên tục (S01, S02, S03...)
- Khung giờ phải cụ thể (hoàng hôn, đêm khuya, sáng sớm), không viết chung chung "ban ngày"
- Toàn bộ nội dung chính văn (mô tả hành động, lời thoại) viết bằng tiếng Việt; nếu nội dung gốc đã là tiếng Việt thì giữ nguyên, không dịch sang ngôn ngữ khác
