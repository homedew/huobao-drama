---
name: storyboard-breaker
description: Quy chuẩn chuyên nghiệp về chia tách phân cảnh — chia kịch bản thành các đoạn phân cảnh có thể chứa nhiều cảnh con
---

# Hướng dẫn chia tách phân cảnh

## Định nghĩa cốt lõi: đoạn phân cảnh

Một phân cảnh = một **đoạn phân cảnh** (segment) = một tác vụ tạo video.

- Mỗi đoạn dài **8-15 giây**, bên trong chứa **2-4 cảnh con**
- Các cảnh con **có thể chuyển cảnh**: đổi cỡ cảnh, đổi góc quay, đổi đối tượng quay, chuyển cứng (hard cut)
- Các cảnh con **không được đổi bối cảnh**: một đoạn chỉ diễn ra trong một bối cảnh duy nhất (`scene_id` được gắn ở cấp độ đoạn)
- Mỗi cảnh con dài 2-6 giây, tập trung vào một đơn vị hình ảnh (một hành động, một phản ứng, một cảnh cận)

## Quy trình chia tách (bốn bước)

1. Gọi `read_storyboard_context` để đọc kịch bản, nhân vật, bối cảnh, đạo cụ, tóm tắt phân cảnh đã có
2. **Nhận diện nhịp truyện**: trước tiên nhận diện nhịp tự sự của kịch bản — các nhãn 【Mở đầu】【Khởi phát】【Cao trào】【Kết thúc】trong kịch bản, hoặc các bước ngoặt tự sự (chuyển địa điểm, hé lộ quy tắc, bùng nổ cảm xúc, twist). **Ranh giới nhịp bắt buộc phải cắt đoạn**, các cảnh con trong cùng một nhịp nên ưu tiên gộp vào cùng một đoạn, không cắt rời một chuỗi nhân quả (dẫn dắt - xảy ra - phản ứng) sang các đoạn khác nhau
3. **Neo tổng lượng**: tổng thời lượng mục tiêu = số chữ kịch bản ÷ 500 chữ/phút; số đoạn ≈ tổng thời lượng mục tiêu ÷ 14 giây, cho phép dao động ±20%. Không được vượt quá hoặc thiếu hụt rõ rệt. Việc tạo video tính phí theo mỗi lần gọi API, mỗi lần tối đa 15 giây — nên ưu tiên để thời lượng đoạn áp sát mức trần này nhằm giảm số lần gọi và giảm chi phí, chỉ cắt ngắn hơn khi cốt truyện thực sự cần chuyển cảnh nhanh
4. **Chia cảnh con trong đoạn**: cắt cảnh con theo điểm chuyển hành động, điểm chuyển góc nhìn, điểm chuyển đối tượng; điền đầy đủ các trường cho mỗi đoạn rồi gọi `save_storyboards` để lưu một lần

## Phân lớp thời lượng theo nhịp điệu

Xác định thời lượng theo chức năng của đoạn, không áp dụng một khuôn cho tất cả:

| Loại đoạn | Thời lượng | Ghi chú |
|---|---|---|
| Đoạn chuyển tiếp | 10-12 giây | Di chuyển, cảnh trống, thiết lập môi trường, chuyển cảnh |
| Đoạn tự sự | 12-15 giây | Đẩy tình tiết thông thường, hội thoại |
| Đoạn cao trào | 13-15 giây | Cận cảnh, hé lộ quy tắc, bùng nổ cảm xúc, twist; nhịp cảnh con chậm lại, một cảnh con có thể kéo dài 4-6 giây |

## Giới hạn dưới thời lượng cho lời thoại (quy tắc cứng)

**Thời lượng đoạn ≥ tổng số chữ lời thoại và lời dẫn trong đoạn (phần viết trong description) ÷ 4.5 chữ/giây + 2 giây dư diễn xuất**

Lời thoại không chứa hết bắt buộc phải tách sang đoạn kế tiếp, không được nhồi nhét lời thoại diễn không kịp vào một đoạn.

## Các yếu tố của cảnh quay

1. **Tiêu đề cảnh**: khái quát nội dung cốt lõi của đoạn trong 3-5 chữ (như "giật mình tỉnh mộng")
2. **Thời gian**: giờ cụ thể + mô tả ánh sáng
3. **Địa điểm**: mô tả đầy đủ bối cảnh + bố cục không gian + chi tiết môi trường
4. **Cỡ cảnh**: cỡ cảnh chủ đạo trong đoạn; đoạn có nhiều cỡ cảnh thì viết tổ hợp, như "trung cảnh + cận cảnh"
5. **Góc quay**: ngang tầm mắt/từ dưới lên/từ trên xuống/nghiêng/sau lưng
6. **Chuyển động máy quay**: cố định/đẩy vào/kéo ra/lia/theo/di chuyển (các cảnh con khác nhau trong đoạn có thể khác nhau)
7. **Mô tả hình ảnh** `description`: theo `【Cảnh 1】…【Cảnh 2】…` mô tả lần lượt từng cảnh con những gì khán giả thực sự nhìn thấy và nghe thấy — hình ảnh (ai + hành động cụ thể + chi tiết cử chỉ + biểu cảm) viết trước; cảnh con nào có lời thoại thì viết「Tên nhân vật nói: "lời thoại"」trong `【Cảnh N】` tương ứng, lời dẫn viết「Lời dẫn: nội dung」
8. **Kết quả hình ảnh** `result`: hậu quả tức thời ở cuối đoạn + chi tiết thị giác
9. **Không khí** `atmosphere`: ánh sáng + tông màu + âm thanh + không khí tổng thể
10. **Thời lượng** `duration`: tổng thời lượng đoạn 8-15 giây, và phải thỏa mãn giới hạn dưới thời lượng lời thoại
11. **Liên kết bối cảnh**: nếu khớp được với bối cảnh đã có, bắt buộc phải điền `scene_id`
12. **Liên kết nhân vật**: điền `character_ids`, gắn 0 đến nhiều nhân vật xuất hiện trong đoạn hiện tại
13. **Liên kết đạo cụ**: điền `prop_ids`, gắn các đạo cụ trọng yếu xuất hiện trong đoạn hiện tại (0 đến nhiều)

## Quy tắc liên kết bối cảnh

- Ưu tiên dùng `scenes` mà `read_storyboard_context` trả về
- Khi `location + time` khớp rõ ràng, bắt buộc phải điền đúng `scene_id`
- Không được tự bịa ra ID bối cảnh không tồn tại
- Nếu nội dung kịch bản rõ ràng thuộc bối cảnh đã có, không tạo lại mô tả bối cảnh mới

## Quy tắc gắn nhân vật

- `character_ids` phải chọn từ danh sách nhân vật mà `read_storyboard_context` trả về
- Một đoạn có thể không có nhân vật nào, cũng có thể gắn nhiều nhân vật
- Chỉ cần trong đoạn có nhân vật xuất hiện rõ ràng, được nhìn thấy, có hành động hoặc nói chuyện thì đều phải gắn vào
- Đoạn thuần môi trường, cảnh trống, cận cảnh vật thể có thể truyền mảng rỗng

## Quy tắc gắn đạo cụ

- `prop_ids` phải chọn từ danh sách đạo cụ (`props`) mà `read_storyboard_context` trả về
- Đạo cụ được nhân vật sử dụng, trao đổi, quay cận, hoặc xuất hiện rõ ràng trong khung hình và có ý nghĩa với mạch truyện thì bắt buộc phải gắn vào đoạn đó
- Đoạn cận cảnh đạo cụ (không có nhân vật) cũng nên gắn đạo cụ, `character_ids` có thể để rỗng
- Vật dụng nền và bài trí bối cảnh không liên quan đến cốt truyện thì không gắn; đoạn không có đạo cụ xuất hiện thì truyền mảng rỗng
- Đạo cụ đã gắn sẽ được dùng làm ảnh tham chiếu khi tạo video (ảnh đơn vật nền trắng), đảm bảo ngoại hình đạo cụ nhất quán xuyên suốt các đoạn

## Yêu cầu chất lượng

- `description` phải phù hợp để con người đọc, mô tả chi tiết theo từng cảnh con những gì khán giả thực sự nhìn thấy và nghe thấy; lời thoại/lời dẫn viết trực tiếp trong `【Cảnh N】` tương ứng; lời thoại/lời dẫn phải giữ nguyên ngôn ngữ trong kịch bản gốc (kịch bản là tiếng Việt thì viết tiếng Việt), không dịch sang tiếng Trung hay ngôn ngữ khác; phần mô tả hình ảnh có thể dùng tiếng Trung
- `image_prompt` phải làm nổi bật bố cục khung hình đơn, ngoại hình nhân vật, môi trường và ánh sáng (tương ứng với cảnh con đầu tiên của đoạn)
- `bgm_prompt` và `sound_effect` dùng cụm từ ngắn gọn là được, nhưng không được mơ hồ chỉ có "căng thẳng", "buồn bã"
- Nếu cần điều chỉnh, gọi `update_storyboard` để sửa đoạn cụ thể
