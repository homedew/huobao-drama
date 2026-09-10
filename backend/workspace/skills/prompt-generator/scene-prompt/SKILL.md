---
name: scene-prompt
description: "Quy chuẩn prompt cuối cùng cho bối cảnh — cảnh thiết lập góc rộng rõ ràng: vị trí tương đối cố định của tiền cảnh/trung cảnh/hậu cảnh/lối ra vào/mặt sàn/mặt tường/bài trí chính, không gian liền mạch tự thân và tái sử dụng được, không có nhân vật"
---

# Prompt cuối cùng cho bối cảnh (cảnh thiết lập góc rộng · cảnh trống không người)

Kết quả tạo ra là một tấm ảnh bối cảnh **cảnh thiết lập góc rộng rõ ràng** (establishing shot): cảnh trống thuần túy **hoàn toàn không có nhân vật**, thể hiện đầy đủ **tiền cảnh, trung cảnh, hậu cảnh, lối ra vào, mặt sàn, mặt tường và vị trí tương đối cố định của bài trí chính**, cấu trúc không gian liền mạch, tự thân hợp lý và tái sử dụng được.

Tấm ảnh này sẽ làm điểm neo tham chiếu nền cho mọi cảnh quay trong bối cảnh đó: cả khán giả lẫn mô hình đều phải đọc hiểu được toàn bộ bố cục không gian qua tấm ảnh này — lối vào ra ở đâu, mặt sàn và mặt tường có chất liệu gì, các món bài trí cốt lõi cố định ở vị trí nào. Góc nhìn phải ổn định, thông dụng.

## Cấu trúc đầu ra (ghép thành một đoạn liền mạch theo thứ tự này)

```
Góc quay rộng cố định, cảnh thiết lập rõ ràng, [địa điểm + cảm giác niên đại], [khung giờ],
bố cục ba lớp gồm tiền cảnh ([yếu tố tiền cảnh]), trung cảnh ([không gian chủ thể trung cảnh]), hậu cảnh ([chiều sâu hậu cảnh]),
lối ra vào ([vị trí và kiểu dáng cửa/lối đi]), mặt sàn ([chất liệu và tình trạng mặt sàn]), mặt tường ([chất liệu và màu sắc mặt tường]),
[các món bài trí chính và vị trí tương đối cố định của chúng],
cấu trúc không gian liền mạch, tự thân hợp lý,
[nguồn sáng + nhiệt độ màu + độ tương phản sáng tối], [không khí],
trong khung hình không có bất kỳ nhân vật nào, cảnh trống, chất lượng điện ảnh
```

## Quy tắc cấu trúc không gian

Không gian phải **đọc hiểu được, khớp logic, tái sử dụng được**:

- **Tiền cảnh**: vật che khung/vật cản (khung cửa, góc bàn, cây cảnh, mép thiết bị), tạo chiều sâu — viết ra 1-2 yếu tố cụ thể
- **Trung cảnh**: không gian chủ thể và bài trí cốt lõi của bối cảnh (dây chuyền sản xuất, giường, quầy)
- **Hậu cảnh**: phần mở rộng của không gian (bức tường xa, cửa sổ, hành lang, đường chân trời thành phố)
- **Lối ra vào**: vị trí và kiểu dáng của cửa, cầu thang, lối đi phải rõ ràng (như "một cánh cửa sắt ở bên trái khung hình"), đây là căn cứ để các cảnh quay sau bố trí nhân vật ra vào
- **Mặt sàn và mặt tường**: chất liệu, màu sắc, tình trạng phải cụ thể (như "sàn xi măng có vết dầu loang", "tường vôi bong tróc lốm đốm")
- **Bài trí chính**: viết ra 2-4 món bài trí cốt lõi và **vị trí tương đối cố định** của chúng (như "dây chuyền sản xuất xếp dọc theo tường, cuối dãy là quầy bar"), quan hệ trái phải/xa gần giữa các món bài trí phải tự thân hợp lý, không chỉ liệt kê tên vật phẩm

Bài trí, cảm giác niên đại, yếu tố thị giác then chốt trong `prompt` (mô tả bối cảnh) phải được triển khai đầy đủ; `lighting` (ánh sáng bối cảnh) phải cụ thể hóa: hướng nguồn sáng, nhiệt độ màu nóng lạnh, độ tương phản sáng tối (như "ống đèn trên trần hắt ánh sáng trắng lạnh, dưới máy móc đổ bóng gắt").

## Góc nhìn và không khí

- Góc rộng ngang tầm mắt hoặc hơi từ trên xuống ổn định, không dùng góc cực đoan, mắt cá, hay bố cục nghiêng (vì cần dùng lại nhiều lần làm bối cảnh cố định)
- Dùng `location` + `time` để xác định khung giờ và tông ánh sáng (ánh sáng ngày/đêm/hoàng hôn hoàn toàn khác nhau)
- Cụ thể hóa từ ngữ không khí: "ngột ngạt" → "không khí oi bức, ánh sáng u ám", không chỉ viết từ cảm xúc trừu tượng
- Toàn bộ đầu ra viết thành một đoạn liền mạch, không lẫn từ tiếng Anh

## Điều cấm

- Bất kỳ nhân vật nào — kể cả bóng lưng, bóng đổ, người trong ảnh/màn hình (phải nêu rõ "trong khung hình không có bất kỳ nhân vật nào")
- Chữ viết, chữ có thể đọc được trên biển hiệu, watermark, chữ ký
- Chuyển động mờ nhòe, vật thể đang chuyển động (ảnh tham chiếu bối cảnh phải tĩnh và ổn định)
- Chỉ liệt kê danh sách bài trí mà không nói rõ vị trí tương đối (cấu trúc không gian phải liền mạch, tự thân hợp lý)

## Lưu

Gọi `save_scene_final_prompt`: tham số prompt không chứa từ phong cách, **phong cách thị giác của dự án sẽ được công cụ tự động chèn vào đầu prompt cuối cùng**.
