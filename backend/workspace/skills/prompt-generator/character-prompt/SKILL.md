---
name: character-prompt
description: "Quy chuẩn prompt cuối cùng cho nhân vật — cận cảnh chính diện + ba góc nhìn (character turnaround: chính diện/nghiêng 90 độ/sau lưng), làm điểm neo hình ảnh cho mọi bước tạo sinh sau này"
---

# Prompt cuối cùng cho nhân vật (cận cảnh chính diện bên trái + ba góc nhìn bên phải)

Kết quả tạo ra là một tấm ảnh tham chiếu thiết lập nhân vật (character reference sheet), bố cục cố định là:

- **Bên trái: cận cảnh chính diện** — cận cảnh phần đầu và vai nhìn thẳng, ngũ quan, kiểu tóc, chất da rõ nét, làm điểm neo nhận diện khuôn mặt
- **Bên phải: xếp cạnh nhau ba góc nhìn toàn thân cao bằng nhau — chính diện, nghiêng 90 độ, sau lưng** — ba góc nhìn toàn thân của cùng một nhân vật xếp cạnh nhau cao bằng nhau, đỉnh đầu và gót chân thẳng hàng

**Nguyên tắc cốt lõi: tính nhất quán > tính thẩm mỹ.** Tấm ảnh này là điểm neo hình ảnh cho mọi ảnh nhân vật và video tham chiếu sau này, phải trung tính, rõ ràng, tái sử dụng được — không theo đuổi tính nghệ thuật của một tấm ảnh đơn lẻ.

## Cấu trúc đầu ra (ghép thành một đoạn liền mạch theo thứ tự này)

```
Ảnh tham chiếu thiết lập nhân vật, bên trái là cận cảnh chính diện, bên phải xếp cạnh nhau ba góc nhìn toàn thân cao bằng nhau — chính diện, nghiêng 90 độ, sau lưng,
cận cảnh và các góc nhìn toàn thân đều là cùng một nhân vật, toàn thân trong khung hình, tư thế đứng chữ A trung tính, ba góc nhìn toàn thân cao bằng nhau xếp cạnh nhau, đỉnh đầu và gót chân thẳng hàng,
[cảm giác tuổi tác + giới tính + dáng vóc], [đặc điểm ngũ quan], [kiểu tóc], [trang phục + phụ kiện],
khuôn mặt, kiểu tóc và trang phục ở cận cảnh chính diện và ba góc nhìn hoàn toàn giống nhau,
nền trắng tinh, ánh sáng đều và mềm mại, chất lượng điện ảnh
```

## Quy tắc thứ tự mô tả

Đặt **đặc điểm nhận diện rõ nhất lên trước**, triển khai theo thứ tự này từng yếu tố then chốt của `appearance` (ngoại hình) và `styling` (tạo hình), không bỏ sót:

1. Điểm neo nhận dạng: cảm giác tuổi tác (như "ngoài hai mươi"), giới tính, dáng vóc (cao thấp gầy béo, thói quen tư thế)
2. Ngũ quan: hình dáng khuôn mặt, đôi mắt, các đặc điểm nổi bật khác (sẹo, nốt ruồi, kính...) — phần cận cảnh chính diện đặc biệt phụ thuộc vào mô tả này
3. Kiểu tóc: màu sắc, độ dài, kiểu dáng
4. Trang phục: kiểu dáng, màu sắc, chất liệu, tình trạng (như "đồng phục công nhân có nếp nhăn và vết hàn ở cổ tay áo")
5. Phụ kiện: chỉ viết những thứ có tính nhận diện, không liệt kê tràn lan

Đặc điểm tính cách của nhân vật phải chuyển hóa thành mô tả khí chất và thần thái bên ngoài (như "tiều tụy" → "ánh mắt mệt mỏi, vai hơi chùng xuống"), không được để trực tiếp xuất hiện từ ngữ chỉ tính cách.

## Bố cục và tính nhất quán

- Cận cảnh chính diện bên trái: nhìn thẳng vào ống kính, biểu cảm trung tính, trọn vẹn từ đỉnh đầu đến vai
- Ba góc nhìn toàn thân bên phải: chính diện, nghiêng 90 độ, sau lưng của cùng một nhân vật, **xếp cạnh nhau cao bằng nhau, khoảng cách đều**, đỉnh đầu và gót chân nằm trên cùng một đường ngang
- Cận cảnh và ba góc nhìn toàn thân bắt buộc là cùng một khuôn mặt, cùng một kiểu tóc, cùng một trang phục — phải nêu rõ "khuôn mặt, kiểu tóc và trang phục ở cận cảnh chính diện và ba góc nhìn hoàn toàn giống nhau"
- Tư thế trung tính, biểu cảm tự nhiên — thuận tiện để tái sử dụng làm ảnh tham chiếu
- Ánh sáng studio đều và mềm mại, không dùng ánh sáng kịch tính (ảnh tham chiếu cần dùng được trong nhiều bối cảnh khác nhau)
- Toàn bộ đầu ra viết thành một đoạn liền mạch, không lẫn từ tiếng Anh

## Điều cấm

- Tư thế động, biểu cảm cường điệu, cầm đạo cụ trên tay, xuất hiện cùng khung hình với người khác
- Cắt xén cơ thể (góc nhìn toàn thân phải trọn vẹn full body, từ đỉnh đầu đến gót chân; cận cảnh phải trọn vẹn từ đầu đến vai)
- Chữ viết, nhãn, watermark, chữ ký
- Bóng đổ nặng, ánh sáng nền có màu, đạo cụ nền

## Lưu

Gọi `save_character_final_prompt`: tham số prompt không chứa từ phong cách, **phong cách thị giác của dự án sẽ được công cụ tự động chèn vào đầu prompt cuối cùng**.
