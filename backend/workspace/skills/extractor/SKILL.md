---
name: extractor
description: Quy chuẩn và phương pháp trích xuất nhân vật, bối cảnh và đạo cụ
---

# Hướng dẫn trích xuất nhân vật, bối cảnh và đạo cụ

## Quy chuẩn trích xuất nhân vật

Các trường nhân vật cần trích xuất (tương ứng 1-1 với tham số công cụ `save_dedup_characters`):
- **name** (bắt buộc): tên đầy đủ của nhân vật
- **role**: vai trò — nhân vật chính/phụ/quần chúng
- **appearance**: mô tả ngoại hình (300-500 chữ) — giới tính, cảm giác tuổi tác, ngũ quan, dáng vóc, khí chất. **Không xuất riêng đặc điểm tính cách, phải chuyển hóa thành khí chất và thần thái bên ngoài rồi lồng vào mô tả ngoại hình** (ví dụ "tính cách lạnh lùng" nên viết thành "ánh mắt lạnh, biểu cảm kiềm chế, ít khi cười")
- **styling**: tạo hình — kiểu tóc, trang phục, trang điểm, phụ kiện...
- **description**: bối cảnh câu chuyện và mối quan hệ nhân vật (bổ sung tùy chọn)

## Quy chuẩn trích xuất bối cảnh

Các trường bối cảnh cần trích xuất (tương ứng 1-1 với tham số công cụ `save_dedup_scenes`):
- **location** (bắt buộc): tên địa điểm cụ thể
- **time**: khung giờ (như ban ngày/hoàng hôn/đêm khuya), cùng địa điểm khác khung giờ được coi là bối cảnh mới
- **prompt**: mô tả bối cảnh — không gian, bài trí, cảm giác niên đại, yếu tố thị giác then chốt (chỉ bối cảnh nền, không có nhân vật)
- **lighting**: ánh sáng bối cảnh — nguồn sáng, tông màu, độ sáng tối, không khí

## Quy chuẩn trích xuất đạo cụ

**Nguyên tắc cốt lõi: thà trích ít còn hơn trích nhiều.** Đạo cụ dùng để tạo ảnh nền trắng đơn vật và làm ảnh tham chiếu cận cảnh cho video, là tài nguyên có chi phí cao, chỉ những đạo cụ trọng yếu với cốt truyện mới đáng trích xuất. Một tập thường chỉ có **0-3** đạo cụ trọng yếu, nếu vượt quá 3 thì xếp theo mức độ quan trọng với cốt truyện và chỉ giữ lại 3 cái đầu.

Phải **thỏa mãn đồng thời** hai điều kiện sau, thiếu một cũng không được:
1. **Trực tiếp thúc đẩy cốt truyện**: sự xuất hiện, trao đổi, hư hỏng hoặc phát hiện ra vật này gây ra bước ngoặt tình tiết (như hung khí, tín vật, tài liệu quan trọng, quà định tình, bằng chứng quan trọng).
2. **Đáng để tạo ảnh riêng**: các phân cảnh sau sẽ có cảnh cận (close-up) hoặc vật này xuất hiện lặp lại, cần ngoại hình cố định.

**Ba câu hỏi kiểm định** (tự hỏi tự trả lời với mỗi đạo cụ ứng viên, chỉ cần một câu trả lời "không" thì bỏ qua):
- ① Bỏ nó đi thì cốt truyện có còn hợp lý không? → Còn hợp lý thì **không trích xuất** (nó chỉ là vật trang trí nền)
- ② Nó chỉ là vật dụng hàng ngày nhân vật tiện tay sử dụng phải không (điện thoại, đũa, ly nước, thuốc lá, ô)? → Đúng thì **không trích xuất**
- ③ Nó là một phần bài trí của bối cảnh phải không (bàn ghế, đèn, cửa, tranh treo tường, bát đĩa)? → Đúng thì **không trích xuất** (những thứ này thuộc mô tả bối cảnh)

**Những thứ điển hình không tính là đạo cụ**: vật dụng thông thường được sử dụng tiện tay nhưng không ảnh hưởng đến diễn biến cốt truyện; bài trí và đồ nội thất của bối cảnh; vật chỉ được nhắc đến một lần rồi không xuất hiện lại; trang phục thường ngày của nhân vật (xếp vào tạo hình nhân vật).

Nếu không có đạo cụ nào đạt điều kiện, **không được cố tình trích xuất**, khi gọi `save_dedup_props` truyền mảng rỗng là được.

Các trường đạo cụ cần trích xuất (tương ứng 1-1 với tham số công cụ `save_dedup_props`):
- **name** (bắt buộc): tên đạo cụ
- **type**: loại — đồ dùng hàng ngày/vũ khí/phương tiện/trang trí/tài liệu...
- **description**: ngoại hình vật thể — chỉ mô tả hình dáng vật lý của bản thân vật thể (chất liệu, màu sắc, hình dạng, kích thước, độ mới cũ, dấu vết hao mòn...), không viết công dụng trong cốt truyện, không đề cập đến liên hệ với nhân vật hay vật thể khác

Đạo cụ **không cần xuất prompt hình ảnh** — prompt cuối cùng của đạo cụ sẽ do Agent tạo prompt đảm nhiệm riêng trước khi tạo ảnh (theo quy chuẩn ảnh nền trắng đơn vật).

## Các bước thực hiện

1. Gọi `read_script_for_extraction` để đọc kịch bản của tập hiện tại
2. Gọi `read_existing_characters` để xem nhân vật đã có trong dự án và nhân vật đã liên kết với tập hiện tại
3. Gọi `read_existing_scenes` để xem bối cảnh đã có trong dự án và bối cảnh đã liên kết với tập hiện tại
4. Gọi `read_existing_props` để xem đạo cụ đã có trong dự án và đạo cụ đã liên kết với tập hiện tại
5. Chỉ trích xuất nhân vật, bối cảnh và đạo cụ thực sự liên quan đến tập hiện tại
6. Gọi `save_dedup_characters` để lưu nhân vật và tự động liên kết với tập hiện tại
7. Gọi `save_dedup_scenes` để lưu bối cảnh và tự động liên kết với tập hiện tại
8. Gọi `save_dedup_props` để lưu đạo cụ và tự động liên kết với tập hiện tại

## Quy tắc cho tập hiện tại

- Mục tiêu là bổ sung đầy đủ nhân vật, bối cảnh và đạo cụ cần cho "tập hiện tại", không phải quét lại toàn bộ dự án
- Nếu đã tồn tại trong dự án nhưng chưa liên kết với tập hiện tại, vẫn nên tái sử dụng và liên kết vào tập hiện tại
- Quy tắc khử trùng lặp: nhân vật/đạo cụ so khớp chính xác theo tên, bối cảnh so khớp chính xác theo 【địa điểm + khung giờ】, khớp trúng thì ưu tiên tái sử dụng, không tạo trùng
- Khử trùng lặp theo tên gần giống: tên có kèm ngoặc định vị hoặc biệt danh thì so sánh theo phần chính trước dấu ngoặc (ví dụ「Lâm Tiểu Vũ（nhân vật chính）」và「Lâm Tiểu Vũ」coi là cùng một nhân vật/đạo cụ, tái sử dụng bản ghi đã có); trường normalized_name mà read_existing_characters / read_existing_props trả về chính là tên đã chuẩn hóa, normalized_location của bối cảnh cũng tương tự, dựa vào đó để phán đoán
