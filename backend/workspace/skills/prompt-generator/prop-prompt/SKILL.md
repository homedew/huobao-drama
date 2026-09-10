---
name: prop-prompt
description: "Quy chuẩn prompt cuối cùng cho đạo cụ — ảnh tĩnh vật nền trắng, góc chụp sản phẩm chuẩn: tỷ lệ chính xác, viền trọn vẹn, nền không mang tính tự sự"
---

# Prompt cuối cùng cho đạo cụ (ảnh đơn vật nền trắng · chụp sản phẩm chuẩn)

Kết quả tạo ra là một tấm ảnh đơn vật nền trắng (product shot): **dùng góc chụp sản phẩm chuẩn**, trong khung hình chỉ có đạo cụ, đặt độc lập trên nền trắng tinh, **không pha lẫn bất kỳ yếu tố nào khác** — không có vật phẩm khác, không có nhân vật, không có môi trường bối cảnh, không có tay cầm.

Ba yêu cầu bắt buộc:
1. **Tỷ lệ các bộ phận của vật phẩm chính xác** — không cường điệu, biến dạng hay kéo giãn theo phong cách hóa, quan hệ kích thước tương đối của đạo cụ phải chân thực
2. **Viền trọn vẹn** — toàn bộ đạo cụ nằm trọn trong khung hình, có khoảng trống xung quanh, bất kỳ phần nào cũng không được bị cắt xén ở mép khung hình
3. **Nền không mang bất kỳ nội dung tự sự nào** — nền trắng tinh chỉ là phông nền, không mang cảm giác bối cảnh, không gợi ý tình tiết, không có yếu tố trang trí

## Cấu trúc đầu ra (ghép thành một đoạn liền mạch theo thứ tự này)

```
Ảnh sản phẩm đơn vật, góc chụp sản phẩm chuẩn, [tên đạo cụ + chất liệu/màu sắc/hình dạng/kích thước + độ mới cũ và chi tiết hao mòn],
tỷ lệ các bộ phận của vật phẩm chính xác, đặt độc lập trên nền trắng tinh, nằm giữa khung hình trọn vẹn, viền trọn vẹn không bị cắt xén,
nền tinh khiết không mang bất kỳ nội dung tự sự nào, không có vật phẩm khác, không có nhân vật, không có bối cảnh,
ánh sáng studio đều và mềm mại, bóng đổ nhạt, độ chi tiết cao
```

## Quy tắc tạo sinh

- Lấy `name` (tên) và `description` (ngoại hình vật thể) của đạo cụ làm trọng tâm: chất liệu, màu sắc, hình dạng, kích thước, độ mới cũ, dấu vết hao mòn... **triển khai đầy đủ từng chi tiết vật lý**, đây là nguồn gốc của tính nhận diện đạo cụ
- Góc chụp sản phẩm chuẩn: góc 3/4 hơi từ trên xuống (nhìn rõ cả mặt trên lẫn mặt bên, cho cảm giác nổi khối tốt nhất); đạo cụ dẹt (giấy tờ, giấy chứng nhận, ảnh) dùng góc nhìn thẳng từ trên xuống, trải phẳng
- Vật phẩm đơn nằm giữa khung hình trọn vẹn, có khoảng trống xung quanh, tỷ lệ chính xác, viền trọn vẹn, không cắt xén phần chính của đạo cụ
- Ánh sáng studio đều và mềm mại, bóng đổ nhạt, độ chi tiết cao
- Chỉ mô tả bản thân vật phẩm, không đề cập đến cốt truyện, nhân vật hay công dụng (cả nền lẫn khung hình đều không mang nội dung tự sự)
- Toàn bộ đầu ra viết thành một đoạn liền mạch, không lẫn từ tiếng Anh; **không** dùng các từ kiểu "chất lượng điện ảnh" (ảnh đạo cụ là ảnh sản phẩm chứ không phải cảnh phim)

## Điều cấm

- Tay cầm, nhân vật, vật phẩm khác, môi trường bối cảnh xuất hiện trong khung hình
- Bao bì, đế đặt, giá trưng bày (trừ khi nó chính là một phần của bản thân đạo cụ)
- Chữ viết, watermark, chữ ký (chữ/hoa văn in sẵn trên chính đạo cụ thì có thể giữ lại và mô tả)
- Phản chiếu môi trường, ánh sáng có màu
- Phối cảnh cường điệu, biến dạng, sai lệch tỷ lệ, cắt xén viền

## Lưu

Gọi `save_prop_final_prompt`: tham số prompt không chứa từ phong cách, **phong cách thị giác của dự án sẽ được công cụ tự động chèn vào đầu prompt cuối cùng**.
