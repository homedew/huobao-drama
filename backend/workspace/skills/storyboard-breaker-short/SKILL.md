---
name: storyboard-breaker-short
description: Quy chuẩn chia tách phân cảnh cho video hành động ngắn 30-60 giây — đoạn phân cảnh 3-6 giây, nhịp nhanh
---

# Hướng dẫn chia tách phân cảnh (short movie)

## Định nghĩa cốt lõi: đoạn phân cảnh

Một phân cảnh = một **đoạn phân cảnh** (segment) = một tác vụ tạo video.

- Mỗi đoạn dài **3-6 giây** (ngắn hơn nhiều so với phim dài 8-15 giây, để bắt kịp nhịp độ nhanh của đánh nhau/hành động)
- Bên trong chứa **1-2 cảnh con**
- Các cảnh con **có thể chuyển cảnh**: đổi cỡ cảnh, đổi góc quay, đổi đối tượng quay, chuyển cứng (hard cut)
- Các cảnh con **không được đổi bối cảnh**: một đoạn chỉ diễn ra trong một bối cảnh duy nhất (`scene_id` được gắn ở cấp độ đoạn)

## Quy trình chia tách (bốn bước)

1. Gọi `read_storyboard_context` để đọc kịch bản, nhân vật, bối cảnh, đạo cụ, tóm tắt phân cảnh đã có
2. **Neo tổng lượng theo độ dài mục tiêu của cả video** (30-60 giây, KHÔNG dùng công thức số chữ/500 chữ-phút của phim dài vì kịch bản ngắn): số đoạn ≈ tổng thời lượng mục tiêu ÷ 4-5 giây/đoạn. Nếu người dùng không chỉ định độ dài cụ thể, mặc định nhắm tới khoảng 40-45 giây tổng
3. **Chia theo nhịp hành động** (không phải nhịp tự sự của phim dài):
   - 【Khởi phát xung đột】— 1 đoạn thiết lập nhanh (đối đầu, thủ thế)
   - 【Giao tranh】— phần lớn số đoạn, mỗi đoạn là một pha đòn/né/phản công rõ rệt
   - 【Cao trào】— 1-2 đoạn, đòn quyết định; có thể kéo cảnh con chậm lại một chút để nhấn
   - 【Kết thúc】— 1 đoạn chốt hạ/hệ quả (hạ gục, bỏ chạy, bị chặn...)
   Ranh giới nhịp bắt buộc phải cắt đoạn
4. **Chia cảnh con trong đoạn**: cắt theo điểm chuyển động tác (ra đòn/né/phản ứng), điền đầy đủ các trường cho mỗi đoạn rồi gọi `save_storyboards` để lưu

## Phân lớp thời lượng theo nhịp điệu

| Loại đoạn | Thời lượng | Ghi chú |
|---|---|---|
| Khởi phát/chuyển tiếp | 3-4 giây | Thiết lập, thủ thế, di chuyển vào vị trí |
| Giao tranh | 3-5 giây | Một pha đòn/né/phản công, nhịp nhanh, hard cut liên tục |
| Cao trào | 4-6 giây | Đòn quyết định, có thể chậm nhịp cảnh con lại để nhấn |
| Kết thúc | 3-5 giây | Chốt hạ, hệ quả tức thời |

## Các yếu tố của cảnh quay

Mỗi đoạn chỉ cần điền các trường sau:

1. **Tiêu đề cảnh**: khái quát pha hành động trong 3-5 chữ (như "cú đấm phản công")
2. **Cỡ cảnh / góc quay / chuyển động máy quay**: ưu tiên cận cảnh (close-up) cho khoảnh khắc va chạm, trung cảnh cho toàn bộ pha đòn; chuyển động máy quay nên năng động (lia nhanh, đẩy vào, rung nhẹ) để tăng cảm giác tốc độ
3. **description**: theo `【Cảnh 1】…【Cảnh 2】…`, tập trung mô tả động tác cụ thể — loại đòn, hướng di chuyển, phản ứng cơ thể, hiệu ứng va chạm/bụi/tia lửa/nước bắn; cảnh con có lời hét/thoại ngắn thì viết「Tên nhân vật nói: "..."」; lời thoại giữ nguyên ngôn ngữ kịch bản gốc (tiếng Việt), phần mô tả hình ảnh có thể viết bằng tiếng Trung
4. **atmosphere**: ánh sáng + tông màu + âm thanh (tiếng va chạm, gió, nhạc nền căng thẳng) + không khí tổng thể
5. **duration**: tổng thời lượng đoạn 3-6 giây theo bảng phân lớp ở trên
6. **Liên kết bối cảnh**: nếu khớp được với bối cảnh đã có, bắt buộc phải điền `scene_id`
7. **Liên kết nhân vật**: điền `character_ids`, gắn nhân vật xuất hiện trong đoạn hiện tại
8. **Liên kết đạo cụ**: điền `prop_ids` — vũ khí là đạo cụ trọng yếu của thể loại hành động, luôn phải gắn khi xuất hiện rõ trong khung hình

## Quy tắc liên kết bối cảnh / nhân vật / đạo cụ

- Ưu tiên dùng `scenes`/`characters`/`props` mà `read_storyboard_context` trả về, không tự bịa ID không tồn tại
- Đoạn thuần môi trường, cảnh trống có thể truyền mảng rỗng cho `character_ids`/`prop_ids`
- Vật dụng nền và bài trí bối cảnh không liên quan đến trận đấu thì không gắn vào `prop_ids`

## Lưu ý khi lưu

- Gọi `save_storyboards` theo từng đợt: đợt gọi đầu tiên bắt buộc kèm `replace_existing: true`; các đợt sau bỏ qua; `shot_number` phải tăng dần theo thứ tự; không được kết thúc trước khi lưu xong toàn bộ đoạn
- Không được xuất bất kỳ văn bản lập kế hoạch, phân tích, suy luận hay giải thích nào; mỗi bước đầu ra phải là một lời gọi công cụ (hoặc lời kết ngắn gọn sau khi hoàn thành)
- Nếu đã có `existing_storyboards`, chỉ tham khảo khi người dùng yêu cầu rõ ràng chỉnh sửa gia tăng; mặc định tạo lại và lưu toàn bộ phân cảnh theo kịch bản hiện tại
