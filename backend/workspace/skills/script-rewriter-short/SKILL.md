---
name: script-rewriter-short
description: Phương pháp và quy chuẩn viết lại truyện thành kịch bản hành động ngắn cho MỘT video 30-60 giây
---

# Hướng dẫn viết lại kịch bản phim ngắn (short movie)

Khác với kịch bản phim dài nhiều tập (mỗi cảnh 30-60 giây), ở đây TOÀN BỘ kịch bản chỉ phục vụ MỘT video duy nhất dài 30-60 giây (ví dụ: một trường đoạn đánh nhau, một pha rượt đuổi, một khoảnh khắc cao trào rút ra từ truyện gốc).

## Nguyên tắc viết lại

1. **Chọn đúng lát cắt**: từ toàn bộ nội dung gốc, chọn ra MỘT trường đoạn hành động có đầy đủ khởi đầu — diễn biến — cao trào — kết thúc, có thể kể trọn trong 30-60 giây phim. Bỏ qua các phần khác của truyện không thuộc lát cắt này
2. **Tối giản, không lan man**: cắt bỏ hội thoại dài dòng, diễn giải tâm lý, tình tiết phụ; chỉ giữ hành động, phản ứng cơ thể, và tối đa vài câu thoại/hét ngắn
3. **Tăng cường tính hình ảnh**: chuyển văn bản tường thuật thành mô tả động tác cụ thể có thể hình dung được (đòn đánh nào, né hướng nào, phản ứng ra sao)
4. **Không viết ngôn ngữ máy quay**: không đề cập cỡ cảnh, góc quay, chuyển động máy quay — thuộc bước chia tách phân cảnh

## Định dạng kịch bản chuẩn hóa

```
## S01 | Ngoại cảnh · Bãi đất trống | Giữa trưa

Nhân vật A đứng thủ thế, nắm đấm siết chặt, mắt không rời đối thủ.

Nhân vật B lao tới tung một cú đấm thẳng, A né sang trái rồi phản đòn bằng một cú đá vào sườn.

Nhân vật A: (gằn giọng) Chưa đủ đâu!
```

### Quy tắc định dạng

- `## SSố thứ tự | Nội cảnh/Ngoại cảnh · Địa điểm | Khung giờ` — tiêu đề cảnh
- Đoạn mô tả hành động tự nhiên, tập trung vào chuyển động cơ thể/đòn thế — không chứa ngôn ngữ máy quay
- `Tên nhân vật: (trạng thái/biểu cảm) nội dung lời thoại` — ngắn gọn, ưu tiên hét/quát/độc thoại ngắn

### Độ dài mục tiêu

Toàn bộ kịch bản chỉ nên có **1-3 cảnh** (## S1, S2, S3), tổng nội dung khi lên phim tương ứng khoảng **30-60 giây** hành động — không phải 30-60 giây MỖI cảnh như phim dài nhiều tập.

## Các bước viết lại

1. Gọi `read_episode_script` để đọc nội dung gốc
2. Xác định lát cắt hành động phù hợp nhất để chuyển thể (nếu truyện có nhiều trường đoạn đánh nhau, chọn trường đoạn kịch tính/rõ cao trào nhất)
3. Viết lại thành kịch bản 1-3 cảnh theo định dạng chuẩn hóa ở trên
4. Gọi `save_script` để lưu kết quả cuối cùng

## Lưu ý

- Không cố kể hết toàn bộ truyện — chỉ kể trọn một trường đoạn hành động ngắn
- Đảm bảo có đủ khởi đầu xung đột, ít nhất một pha đôi công/né/phản công, và một kết thúc dứt khoát (hạ gục, bỏ chạy, bị chặn lại...)
- Toàn bộ nội dung chính văn (mô tả hành động, lời thoại) viết bằng tiếng Việt; nếu nội dung gốc đã là tiếng Việt thì giữ nguyên, không dịch sang ngôn ngữ khác
