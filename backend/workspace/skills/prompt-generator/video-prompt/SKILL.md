---
name: video-prompt
description: Quy chuẩn prompt video — dựa trên nội dung đoạn phân cảnh, tạo prompt video chia theo thời gian, cho phép chuyển cảnh bên trong đoạn
---

# Prompt video (đoạn phân cảnh → video_prompt)

Dựa trên `description` (gồm cấu trúc cảnh con `【Cảnh N】` cùng lời thoại/lời dẫn), `atmosphere`, `duration` của một đoạn phân cảnh, tạo ra `video_prompt` để dẫn dắt AI tạo video. **Một đoạn phân cảnh = một video 8-15 giây, bên trong được phép chuyển cảnh**: các đoạn 3 giây có thể là những cảnh khác nhau (đổi cỡ cảnh/góc quay/đối tượng), nối bằng chuyển cứng (hard cut); nhưng **toàn bộ không được đổi bối cảnh**, không hồi tưởng (flashback).

## Định dạng

Chia theo từng đoạn 3 giây, mỗi đoạn một dòng riêng, cách nhau bằng xuống dòng, khoảng thời gian nối tiếp liên tục (không chồng lấn, không bỏ trống):

```
0-3 giây: @Quán cà phê, cận cảnh máy quay cố định, @Tiểu Minh cúi đầu nhìn điện thoại, ngón tay liên tục gõ lên bàn, vẻ mặt lo lắng.
3-6 giây: Chuyển sang toàn cảnh cửa ra vào, chuông cửa vang lên, @Tiểu Hồng đẩy cửa bước vào, mang theo một luồng gió lạnh.
6-9 giây: Chuyển về trung cảnh, @Tiểu Hồng mỉm cười bước tới ngồi xuống cạnh Tiểu Minh, Tiểu Minh nói: "Em đến rồi à."
```

## Ánh xạ với mô tả phân cảnh

`description` là nguồn nội dung duy nhất của video_prompt (hình ảnh, hành động, lời thoại, lời dẫn đều nằm trong đó), quy tắc chuyển đổi:

- Mỗi `【Cảnh N】` trong `description` ánh xạ thành **1-2 đoạn 3 giây liên tiếp**, giữ đúng thứ tự, không bỏ sót, không gộp, không thêm cảnh con mới
- Lời thoại/lời dẫn được lấy từ「Tên nhân vật nói: "…"」「Lời dẫn: …」trong `【Cảnh N】` tương ứng, phân bổ vào đoạn được ánh xạ từ cảnh con đó, rồi **dịch sang tiếng Trung tự nhiên, đúng ngữ cảnh** (video model đọc giọng tiếng Trung; phụ đề tiếng Việt được ghép riêng ở bước xuất video, không liên quan đến bước này); **không được tự sáng tác lời thoại ngoài description**
- Hành động hình ảnh lấy theo `description`; `atmosphere` chỉ dùng để bổ sung ánh sáng, tông màu và mô tả không khí cho mỗi đoạn

## Cấu trúc bên trong một đoạn

Mỗi đoạn tổ chức nội dung theo thứ tự này (có thể lược bỏ mục không có nội dung, nhưng hành động/hình ảnh bắt buộc phải có):

**Khoảng thời gian ＋ @tham chiếu bối cảnh ＋ cỡ cảnh/chuyển động máy quay ＋ @tham chiếu nhân vật ＋ hành động chủ thể · biểu cảm ＋ lời thoại/lời dẫn ＋ ánh sáng không khí**

- **Đoạn đầu tiên bắt buộc phải thiết lập không gian**: bối cảnh + vị trí máy quay + vị trí và trạng thái của nhân vật, để khán giả nhìn là biết đang ở đâu, đang xem ai
- **Chuyển cảnh**: đoạn sau khi chuyển cảnh mở đầu bằng từ nối như "chuyển sang/chuyển về", và nêu lại cỡ cảnh và chủ thể; điểm chuyển cảnh phải khớp với cấu trúc `【Cảnh N】` trong `description` của phân cảnh
- **Cỡ cảnh/chuyển động máy quay**: mỗi đoạn một trạng thái cảnh quay (cận cảnh/trung cảnh/toàn cảnh/đặc tả; cố định/đẩy vào/kéo ra/lia/theo); chuyển động máy quay liên tục trong một cảnh con, có thể đổi cách chuyển động sau khi chuyển cảnh
- **Hành động**: mỗi đoạn một hành động chính, động từ cụ thể có thể nhìn thấy (đi, quay người, ngẩng đầu, siết chặt, dừng lại)
- **Toàn bộ cảm xúc chuyển thành mô tả có thể nhìn thấy**: không viết những từ trừu tượng kiểu "anh ấy rất buồn/bầu không khí căng thẳng", hãy viết thành "anh ấy cúi đầu, ngón tay siết chặt miệng ly, hơi thở nặng nề hơn"
- **Lời thoại/lời dẫn**: viết「Tên nhân vật nói: "lời thoại"」, lời dẫn viết「Lời dẫn: nội dung」; lời thoại dài 3 giây không đọc hết thì tách sang nhiều đoạn; đoạn không có lời thoại có thể viết âm thanh môi trường/âm thanh hành động (như "tiếng máy móc gầm rú liên tục")

## Quy tắc tham chiếu

- `@Tên bối cảnh` — tham chiếu bối cảnh, tên phải khớp hoàn toàn với địa điểm trong danh sách bối cảnh
- `@Tên nhân vật` — tham chiếu nhân vật, tên phải khớp hoàn toàn với tên trong danh sách nhân vật
- `@Tên đạo cụ` — tham chiếu đạo cụ, tên phải khớp hoàn toàn với tên trong danh sách đạo cụ; khi đạo cụ xuất hiện rõ ràng, được sử dụng hoặc quay cận trong khung hình thì tham chiếu
- Khi tạo, hệ thống sẽ tự động thay `@Tên` bằng ký hiệu ảnh tham chiếu tương ứng (ví dụ `@Tiểu Minh` → `@Ảnh1 Tiểu Minh`), vì vậy tên phải khớp chính xác, không viết tắt hay thêm ký hiệu thừa
- **Mỗi đoạn ít nhất một tham chiếu @ để neo khung hình**; đoạn nào có nhân vật xuất hiện thì bắt buộc phải @ nhân vật đó; chỉ tham chiếu bối cảnh/nhân vật/đạo cụ đã được gắn cho đoạn phân cảnh đó

## Quy tắc trục thời gian

- Số đoạn = thời lượng đoạn phân cảnh ÷ 3 giây (làm tròn lên), tổng các khoảng thời gian của các đoạn phải bằng đúng tổng thời lượng của đoạn phân cảnh
- Nhịp nội dung: đoạn đầu thiết lập → đoạn giữa đẩy hành động/xung đột → đoạn cuối đi đến kết quả hoặc điểm cảm xúc

## Điều cấm

- Chuyển bối cảnh, hồi tưởng (một đoạn phân cảnh chỉ diễn ra trong một bối cảnh)
- Tham chiếu bối cảnh/nhân vật ngoài danh sách đã cho
- Mô tả tâm lý trừu tượng, ẩn dụ văn học (mô hình chỉ hiểu được hình ảnh có thể nhìn thấy)
- Lẫn tiếng Anh trong prompt (toàn bộ video_prompt, kể cả lời thoại/lời dẫn đã dịch, đều dùng tiếng Trung)

## Lưu

Gọi `update_storyboard` chỉ cập nhật trường `video_prompt` của đoạn phân cảnh đó, không thay đổi các trường khác, không chia tách lại toàn tập.
