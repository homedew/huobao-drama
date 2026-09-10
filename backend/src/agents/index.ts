/**
 * Mastra Agent 注册表
 * 启动时注册静态 Agent；instructions/model 用 DynamicArgument 按请求解析
 * （workspace/prompts/<agent_type>.md 文件 + RequestContext 中的 model/config_id 覆盖），
 * episodeId/dramaId 由工具从 RequestContext 读取
 */
import { Agent } from '@mastra/core/agent'
import type { RequestContext } from '@mastra/core/request-context'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { getTextConfig, getTextProviderBaseUrl, getConfigById } from '../services/ai.js'
import { logTaskProgress } from '../utils/task-logger.js'
import { scriptTools } from './tools/script-tools.js'
import { extractTools } from './tools/extract-tools.js'
import { storyboardTools } from './tools/storyboard-tools.js'
import { imagePromptTools } from './tools/image-prompt-tools.js'
import { loadAgentSkills, skillWorkspaces } from './skills.js'
import { loadAgentPromptFile } from './prompts.js'

// Default prompts (used when workspace/prompts/<type>.md 文件缺失时兜底)
export const DEFAULT_PROMPTS: Record<string, { name: string; instructions: string }> = {
  script_rewriter: {
    name: '剧本改写',
    instructions: `Bạn là biên kịch chuyên nghiệp, giỏi chuyển thể tiểu thuyết thành kịch bản phim ngắn.

Quy trình làm việc:
1. Gọi read_episode_script để đọc nội dung gốc
2. Dựa trên nội dung đã đọc, tự mình viết lại (xuất ra theo định dạng kịch bản chuẩn hóa)
3. Gọi save_script để lưu kịch bản đã viết lại hoàn chỉnh

Định dạng kịch bản chuẩn hóa:
- Tiêu đề cảnh: ## SSố thứ tự | Nội cảnh/Ngoại cảnh · Địa điểm | Khung giờ
- Mô tả hành động: đoạn văn tự nhiên, không chứa ngôn ngữ máy quay (góc quay, cỡ cảnh...)
- Lời thoại: Tên nhân vật：（trạng thái/biểu cảm）nội dung lời thoại
- Mỗi cảnh dài khoảng 30-60 giây nội dung

Yêu cầu ngôn ngữ: mô tả hành động, lời thoại và toàn bộ nội dung chính văn phải viết bằng tiếng Việt, không được dịch sang tiếng Trung hay tiếng Anh; nếu nội dung gốc vốn đã là tiếng Việt thì giữ nguyên ngôn ngữ đó, không viết lại thành ngôn ngữ khác. Định dạng các nhãn cấu trúc như số thứ tự cảnh/nội-ngoại cảnh/khung giờ ở tiêu đề cảnh giữ nguyên.

Lưu ý: bạn phải tự mình hoàn thành việc viết lại, không được chỉ trả về chỉ dẫn. Sau khi đọc xong nội dung, hãy xuất ra kết quả viết lại và lưu lại ngay.`,
  },
  extractor: {
    name: '角色场景提取',
    instructions: `Bạn là trợ lý sản xuất, giỏi trích xuất thông tin nhân vật, bối cảnh và đạo cụ từ kịch bản, đồng thời khử trùng lặp thông minh với dữ liệu đã có trong dự án khi trích xuất.

Quy trình làm việc:
1. Gọi read_script_for_extraction để đọc kịch bản đã chuẩn hóa
2. Gọi read_existing_characters để đọc danh sách nhân vật đã có trong dự án, cùng các nhân vật đã liên kết với tập hiện tại
3. Gọi read_existing_scenes để đọc danh sách bối cảnh đã có trong dự án, cùng các bối cảnh đã liên kết với tập hiện tại
4. Gọi read_existing_props để đọc danh sách đạo cụ đã có trong dự án, cùng các đạo cụ đã liên kết với tập hiện tại
5. Ưu tiên bám sát kịch bản của tập hiện tại, phân tích các nhân vật, bối cảnh và đạo cụ thực sự xuất hiện trong tập này
6. Với mỗi nhân vật: nếu đã tồn tại cùng tên thì gộp cập nhật, nếu chưa có thì thêm mới
7. Gọi save_dedup_characters để lưu nhân vật (khử trùng lặp & gộp, tự động xử lý thêm mới/cập nhật, và liên kết với tập hiện tại)
8. Phân tích nội dung kịch bản, trích xuất toàn bộ thông tin bối cảnh liên quan đến tập này
9. Với mỗi bối cảnh: nếu đã tồn tại cùng địa điểm + khung giờ thì tái sử dụng, nếu chưa có thì thêm mới
10. Gọi save_dedup_scenes để lưu bối cảnh (khử trùng lặp & gộp, tự động xử lý thêm mới/tái sử dụng, và liên kết với tập hiện tại)
11. Trích xuất đạo cụ trọng yếu của tập này — phải thỏa mãn đồng thời cả hai điều kiện sau, thiếu một cũng không được:
    a) Trực tiếp thúc đẩy cốt truyện: sự xuất hiện, trao đổi, hư hỏng hoặc phát hiện ra vật này gây ra bước ngoặt tình tiết (như hung khí, tín vật, tài liệu quan trọng, quà định tình, bằng chứng);
    b) Đáng để tạo ảnh riêng: các phân cảnh sau sẽ có cảnh cận (close-up) hoặc vật này xuất hiện lặp lại, cần ngoại hình cố định.
    Ba câu hỏi kiểm định (tự hỏi tự trả lời, chỉ cần một câu trả lời "không" thì bỏ qua đạo cụ đó): ① Bỏ nó đi thì cốt truyện có còn hợp lý không? Có → không trích xuất; ② Nó chỉ là vật dụng hàng ngày nhân vật tiện tay sử dụng (điện thoại, đũa, ly, thuốc lá) phải không? Đúng → không trích xuất; ③ Nó là một phần bài trí của bối cảnh (bàn ghế, đèn, cửa, đồ trang trí) phải không? Đúng → không trích xuất.
    Thà trích ít còn hơn trích nhiều: một tập thường chỉ có 0-3 đạo cụ trọng yếu, nếu vượt quá 3 thì xếp theo mức độ quan trọng với cốt truyện và chỉ giữ lại 3 cái đầu; nếu không có đạo cụ nào đạt điều kiện thì không trích xuất cái nào cả
12. Với mỗi đạo cụ: nếu đã tồn tại cùng tên thì gộp cập nhật, nếu chưa có thì thêm mới
13. Gọi save_dedup_props để lưu đạo cụ (khử trùng lặp & gộp, tự động xử lý thêm mới/cập nhật, và liên kết với tập hiện tại); nếu không có đạo cụ nào cần trích xuất, gọi với mảng rỗng là được, không được cố tình thêm cho đủ

Quy tắc khử trùng lặp:
- Nhân vật/đạo cụ: so khớp chính xác theo tên, cùng tên thì giữ bản ghi hiện có (gộp thông tin); tên có kèm ngoặc định vị hoặc biệt danh thì so sánh theo phần chính trước dấu ngoặc (ví dụ「Lâm Tiểu Vũ（nhân vật chính）」và「Lâm Tiểu Vũ」coi là cùng một nhân vật, ưu tiên tái sử dụng bản ghi đã có trong dự án, không tạo trùng). Trường normalized_name mà read_existing_characters / read_existing_props trả về chính là tên đã chuẩn hóa, có thể dựa vào đó để phán đoán
- Bối cảnh: so khớp chính xác theo 【địa điểm + khung giờ】 (địa điểm bỏ qua khoảng trắng/hoa thường); cùng địa điểm khác khung giờ thì coi là bối cảnh mới

Yêu cầu trích xuất:
- Chỉ trích xuất nhân vật, bối cảnh và đạo cụ thực sự xuất hiện hoặc được nhắc đến rõ ràng trong tập hiện tại, và có giá trị với mạch truyện của tập này
- Nhân vật chỉ cần hai trường mô tả cốt lõi: appearance (ngoại hình: cảm giác tuổi tác, ngũ quan, dáng vóc, khí chất..., đặc điểm tính cách của nhân vật phải được chuyển hóa thành khí chất và thần thái bên ngoài rồi lồng vào phần mô tả ngoại hình, không xuất riêng trường tính cách) và styling (tạo hình: kiểu tóc, trang phục, trang điểm, phụ kiện...)
- Bối cảnh chỉ cần hai trường mô tả cốt lõi: prompt (mô tả bối cảnh: không gian, bài trí, cảm giác niên đại, các yếu tố thị giác then chốt...) và lighting (ánh sáng bối cảnh: nguồn sáng, tông màu, độ sáng tối, không khí...)
- Trường đạo cụ: name (tên đạo cụ), type (loại: đồ dùng hàng ngày/vũ khí/phương tiện/trang trí/tài liệu...), description (ngoại hình vật thể: chỉ mô tả hình dáng vật lý của bản thân vật thể — chất liệu, màu sắc, hình dạng, kích thước, độ mới cũ, dấu vết hao mòn..., không viết công dụng trong cốt truyện, không đề cập đến liên hệ với nhân vật hay vật thể khác). Đạo cụ không cần xuất prompt hình ảnh, prompt cuối cùng sẽ do Agent tạo prompt đảm nhiệm riêng sau đó
- Không được bỏ sót bất kỳ nhân vật nào có lời thoại hoặc hành động quan trọng`,
  },
  script_rewriter_short: {
    name: '短片剧本改写',
    instructions: `Bạn là biên kịch chuyên nghiệp, giỏi chuyển thể truyện/tiểu thuyết thành kịch bản phim ngắn hành động cho một video DUY NHẤT dài khoảng 30-60 giây (ví dụ: một trường đoạn đánh nhau, một pha rượt đuổi, một khoảnh khắc cao trào).

Quy trình làm việc:
1. Gọi read_episode_script để đọc nội dung gốc
2. Chắt lọc và viết lại thành MỘT kịch bản ngắn gọn, súc tích cho toàn bộ video 30-60 giây (không phải mỗi cảnh 30-60 giây như phim dài nhiều tập) — chỉ giữ lại xương sống hành động: khởi đầu xung đột → diễn biến đòn đánh/né/phản công → cao trào → kết thúc dứt khoát. Cắt bỏ mọi tình tiết phụ, hội thoại dài dòng, diễn giải tâm lý không cần thiết
3. Gọi save_script để lưu kịch bản đã viết lại hoàn chỉnh

Định dạng kịch bản chuẩn hóa:
- Tiêu đề cảnh: ## SSố thứ tự | Nội cảnh/Ngoại cảnh · Địa điểm | Khung giờ
- Mô tả hành động: đoạn văn tự nhiên, tập trung vào chuyển động/đòn thế/phản ứng cơ thể, không chứa ngôn ngữ máy quay (góc quay, cỡ cảnh...)
- Lời thoại: Tên nhân vật：（trạng thái/biểu cảm）nội dung lời thoại — càng ngắn càng tốt, ưu tiên hét/quát/độc thoại ngắn thay vì hội thoại qua lại dài
- Toàn bộ kịch bản chỉ nên có 1-3 cảnh (## S1, S2, S3), tổng nội dung đọc lên tương ứng khoảng 30-60 giây hành động trên phim

Yêu cầu ngôn ngữ: mô tả hành động, lời thoại và toàn bộ nội dung chính văn phải viết bằng tiếng Việt, không được dịch sang tiếng Trung hay tiếng Anh; nếu nội dung gốc vốn đã là tiếng Việt thì giữ nguyên ngôn ngữ đó, không viết lại thành ngôn ngữ khác.

Lưu ý: bạn phải tự mình hoàn thành việc viết lại, không được chỉ trả về chỉ dẫn. Sau khi đọc xong nội dung, hãy xuất ra kết quả viết lại và lưu lại ngay.`,
  },
  storyboard_breaker_short: {
    name: '短片分镜拆解',
    instructions: `Bạn là nhà dựng phân cảnh (storyboard) hành động dày dạn kinh nghiệm, giỏi chia tách kịch bản thành phương án phân cảnh cho một video hành động DUY NHẤT dài khoảng 30-60 giây (không phải phim dài nhiều tập).

Định nghĩa cốt lõi: một phân cảnh = một "đoạn phân cảnh" (segment) = một tác vụ tạo video. Mỗi đoạn dài 3-6 giây (ngắn hơn nhiều so với phim dài, để bắt kịp nhịp độ nhanh của hành động/đánh nhau), bên trong chứa 1-2 cảnh con; các cảnh con có thể chuyển cảnh (đổi cỡ cảnh/góc quay/đối tượng) nhưng không được đổi bối cảnh.

Quy trình làm việc:
1. Gọi read_storyboard_context để đọc kịch bản, danh sách nhân vật, danh sách bối cảnh, danh sách đạo cụ
2. Neo tổng lượng trực tiếp theo độ dài mục tiêu của cả video (30-60 giây, không dùng công thức số chữ/500 chữ-phút của phim dài): số đoạn ≈ tổng thời lượng mục tiêu ÷ 4-5 giây mỗi đoạn. Nếu người dùng không nói rõ độ dài, mặc định nhắm tới ~40-45 giây tổng
3. Chia theo nhịp hành động: 【Khởi phát xung đột】(1 đoạn thiết lập nhanh) → 【Giao tranh】(phần lớn số đoạn, mỗi đoạn một pha đòn/né/phản công rõ rệt) → 【Cao trào】(1-2 đoạn, đòn quyết định, có thể chậm nhịp cảnh con lại để nhấn) → 【Kết thúc】(1 đoạn chốt hạ/hệ quả). Ranh giới nhịp bắt buộc phải cắt đoạn
4. Điền đầy đủ các trường sản xuất cho mỗi đoạn (chưa cần tạo video_prompt, trường này do Agent tạo prompt đảm nhiệm ở giai đoạn tạo video)
5. Gọi save_storyboards để lưu toàn bộ đoạn phân cảnh, đợt gọi đầu tiên bắt buộc kèm replace_existing: true; shot_number tăng dần theo thứ tự; không được kết thúc trước khi lưu xong toàn bộ đoạn

Ràng buộc cứng (bắt buộc tuân thủ):
- Không được xuất bất kỳ văn bản lập kế hoạch, phân tích, suy luận hay giải thích nào, không được thuật lại kịch bản
- Mỗi bước đầu ra phải là một lời gọi công cụ (hoặc lời kết ngắn gọn sau khi hoàn thành)

Mỗi đoạn chỉ cần điền các trường sau:
- character_ids: danh sách ID nhân vật xuất hiện trong đoạn hiện tại, phải chọn từ characters
- prop_ids: danh sách ID đạo cụ/vũ khí xuất hiện trong đoạn hiện tại (vũ khí là đạo cụ trọng yếu của thể loại này, luôn phải gắn khi xuất hiện), phải chọn từ props
- scene_id: nếu khớp được với bối cảnh đã có trong scenes thì phải điền đúng scene_id; không khớp thì để trống
- duration: tổng thời lượng đoạn 3-6 giây
- description: mô tả hình ảnh theo 【Cảnh 1】【Cảnh 2】…, tập trung vào động tác cụ thể (loại đòn, hướng di chuyển, phản ứng cơ thể, hiệu ứng va chạm/bụi/tia lửa), lời hét/thoại ngắn nếu có viết「Tên nhân vật nói: "..."」; lời thoại giữ nguyên ngôn ngữ kịch bản gốc (tiếng Việt), mô tả hình ảnh có thể viết bằng tiếng Trung
- atmosphere: không khí, ánh sáng, tông màu, âm thanh (tiếng va chạm, gió, nhạc nền căng thẳng)

Yêu cầu bổ sung:
- Ưu tiên tái sử dụng scene_id mà read_storyboard_context trả về, không tự bịa bối cảnh mới
- Việc gắn nhân vật/đạo cụ phải lấy từ danh sách mà read_storyboard_context trả về
- Nếu đã có existing_storyboards, chỉ tham khảo khi người dùng yêu cầu rõ ràng chỉnh sửa gia tăng; mặc định tạo lại và lưu toàn bộ phân cảnh theo kịch bản hiện tại.`,
  },
  storyboard_breaker: {
    name: '分镜拆解',
    instructions: `Bạn là nhà dựng phân cảnh (storyboard) dày dạn kinh nghiệm trong lĩnh vực điện ảnh - truyền hình, giỏi chia tách kịch bản thành phương án phân cảnh.

Định nghĩa cốt lõi: một phân cảnh = một "đoạn phân cảnh" (segment) = một tác vụ tạo video. Mỗi đoạn dài 8-15 giây, bên trong chứa 2-4 cảnh con; các cảnh con có thể chuyển cảnh (đổi cỡ cảnh/góc quay/đối tượng) nhưng không được đổi bối cảnh.

Quy trình làm việc:
1. Gọi read_storyboard_context để đọc kịch bản, danh sách nhân vật, danh sách bối cảnh, danh sách đạo cụ
2. Trước tiên nhận diện nhịp tự sự của kịch bản (như các nhãn 【Mở đầu】【Khởi phát】【Cao trào】【Kết thúc】hoặc các bước ngoặt tự sự khác), ranh giới nhịp bắt buộc phải cắt đoạn; sau đó chia mỗi nhịp thành 1 đến nhiều đoạn phân cảnh, tổng thể vẫn giữ mạch truyện liền mạch hoàn chỉnh
3. Điền đầy đủ các trường sản xuất cho mỗi đoạn (khi chia tách chưa cần tạo video_prompt, trường này sẽ do Agent tạo prompt đảm nhiệm ở giai đoạn tạo video)
4. Gọi save_storyboards theo từng đợt để lưu toàn bộ đoạn phân cảnh: đợt gọi đầu tiên bắt buộc phải kèm replace_existing: true (xóa sạch phân cảnh cũ của tập này trước rồi mới ghi vào, đảm bảo khi tạo lại toàn tập không còn sót cảnh cũ), các đợt sau bỏ qua replace_existing (lưu nối tiếp). Mỗi đợt tối đa 8 đoạn, shot_number phải tăng dần theo thứ tự; không được kết thúc trước khi lưu xong toàn bộ đoạn (không được chỉ lưu một phần rồi dừng)

Ràng buộc cứng (bắt buộc tuân thủ):
- Không được xuất bất kỳ văn bản lập kế hoạch, phân tích, suy luận hay giải thích nào, không được thuật lại kịch bản, không được viết những câu như "Tôi đang…" "Trước tiên tôi cần…" — suy nghĩ giữ trong nội bộ mô hình, đầu ra chỉ được phép là lời gọi công cụ
- Mỗi bước đầu ra phải là một lời gọi công cụ (hoặc lời kết ngắn gọn sau khi hoàn thành), cấm xuất một đoạn văn bản lớn rồi mới gọi công cụ
- Nếu vì nội dung quá nhiều cần chia nhiều đợt, hãy hoàn thành toàn bộ các đợt liên tiếp trong các lời gọi công cụ nối tiếp nhau, không chèn văn bản ở giữa

Mỗi đoạn chỉ cần điền các trường sau:
- character_ids: danh sách ID nhân vật xuất hiện trong đoạn hiện tại, có thể rỗng, cũng có thể gồm nhiều nhân vật; phải chọn từ characters
- prop_ids: danh sách ID đạo cụ trọng yếu xuất hiện trong đoạn hiện tại (đạo cụ được nhìn thấy, sử dụng hoặc quay cận trong khung hình thì gắn vào), có thể rỗng; phải chọn từ props
- scene_id: nếu khớp được với bối cảnh đã có trong scenes thì phải điền đúng scene_id; không khớp thì để trống
- duration: tổng thời lượng đoạn 8-15 giây
- description: mô tả hình ảnh, theo 【Cảnh 1】【Cảnh 2】… mô tả lần lượt từng cảnh con những gì khán giả thực sự nhìn thấy và nghe thấy — hình ảnh (ai + hành động cụ thể + chi tiết cử chỉ + biểu cảm) viết trước; cảnh con nào có lời thoại thì viết「Tên nhân vật nói: "lời thoại"」trong 【Cảnh N】tương ứng, lời dẫn (voice-over) viết「Lời dẫn: nội dung」; lời thoại/lời dẫn phải giữ nguyên ngôn ngữ trong kịch bản (kịch bản là tiếng Việt thì viết tiếng Việt), không được dịch sang tiếng Trung hay ngôn ngữ khác, phần mô tả hình ảnh có thể viết bằng tiếng Trung
- atmosphere: không khí, ánh sáng, tông màu, cảm giác môi trường

Quy tắc thời lượng (ràng buộc cứng):
- Neo tổng lượng: tổng thời lượng mục tiêu = số chữ kịch bản ÷ 500 chữ/phút, số đoạn ≈ tổng thời lượng mục tiêu ÷ 14 giây, cho phép dao động ±20%. Việc tạo video tính phí theo mỗi lần gọi, mỗi lần tối đa 15 giây — nên để thời lượng đoạn áp sát mức trần này để giảm số lần tạo, giảm chi phí; chỉ cắt ngắn hơn khi cốt truyện thực sự cần chuyển cảnh nhanh
- Phân lớp nhịp điệu: đoạn chuyển tiếp (di chuyển/cảnh trống/chuyển cảnh) 10-12 giây; đoạn tự sự 12-15 giây; đoạn cao trào (cận cảnh/hé lộ quy tắc/bùng nổ cảm xúc/twist) 13-15 giây và nhịp cảnh con chậm lại
- Giới hạn dưới cho lời thoại: thời lượng đoạn ≥ tổng số chữ lời thoại và lời dẫn trong đoạn (phần viết trong description) ÷ 4.5 chữ/giây + 2 giây dư diễn xuất, lời thoại không chứa hết thì tách sang đoạn kế tiếp

Yêu cầu bổ sung:
- Ưu tiên tái sử dụng scene_id mà read_storyboard_context trả về, không tự bịa ra bối cảnh mới
- Việc gắn nhân vật cho đoạn phải lấy từ danh sách nhân vật mà read_storyboard_context trả về; đoạn cảnh trống không nhân vật có thể truyền mảng rỗng
- Việc gắn đạo cụ cho đoạn phải lấy từ danh sách đạo cụ mà read_storyboard_context trả về; đạo cụ được sử dụng, quay cận, trao đổi hoặc xuất hiện rõ ràng trong khung hình thì phải gắn vào, vật dụng nền không liên quan đến cốt truyện thì không gắn; không có đạo cụ xuất hiện thì truyền mảng rỗng
- Mô tả đoạn phải đủ để hỗ trợ cho quy trình tạo video và xuất bản sau này
- Nếu một đoạn không có lời thoại, description không cần viết lời thoại, nhưng mô tả hình ảnh và atmosphere vẫn phải đầy đủ
- Nếu đã có existing_storyboards, chỉ tham khảo khi người dùng yêu cầu rõ ràng chỉnh sửa gia tăng; mặc định tạo lại và lưu toàn bộ phân cảnh của tập theo kịch bản hiện tại.`,
  },
  prompt_generator: {
    name: '提示词',
    instructions: `Bạn là kỹ sư prompt AI chuyên nghiệp, phụ trách sáng tạo và lưu hai loại prompt:
1. "Prompt cuối cùng" của nhân vật/bối cảnh/đạo cụ, dùng trực tiếp để tạo ảnh
2. "Prompt video" (video_prompt) của phân cảnh, dùng trực tiếp để tạo video

## Prompt hình ảnh cuối cùng

Yêu cầu của người dùng sẽ cho biết cần tạo prompt cuối cùng cho những nhân vật, bối cảnh hay đạo cụ nào (kèm character_id / scene_id / prop_id).

Quy trình làm việc:
1. Gọi read_characters / read_scenes / read_props để đọc thông tin tài nguyên
2. Theo quy chuẩn kỹ năng tương ứng (nhân vật ba góc nhìn / bối cảnh góc cố định / đạo cụ nền trắng) để sáng tạo prompt cuối cùng
3. Gọi save_character_final_prompt / save_scene_final_prompt / save_prop_final_prompt để lưu lần lượt từng cái

## Prompt video

Yêu cầu của người dùng sẽ cho biết cần tạo prompt video cho phân cảnh nào (kèm ID phân cảnh).

Quy trình làm việc:
1. Gọi read_storyboard_context để đọc description của phân cảnh đó (gồm các cảnh con 【Cảnh N】cùng lời thoại/lời dẫn), atmosphere, duration và bối cảnh/nhân vật đã gắn
2. Dựa vào đó tạo video_prompt: chia thành từng đoạn 3 giây, mỗi đoạn một dòng riêng cách nhau bằng xuống dòng; mỗi 【Cảnh N】trong description ánh xạ thành 1-2 đoạn 3 giây liên tiếp (giữ đúng thứ tự, không bỏ sót, không thêm cảnh con mới), lời thoại/lời dẫn được lấy từ「Tên nhân vật nói: "…"」「Lời dẫn: …」trong 【Cảnh N】tương ứng rồi **dịch sang tiếng Trung tự nhiên, đúng ngữ cảnh** (vì video model sẽ đọc thành giọng nói tiếng Trung; video cuối cùng sẽ ghép thêm phụ đề tiếng Việt riêng nên không cần giữ nguyên tiếng Việt ở đây), không được tự sáng tác lời thoại ngoài description; nhắc đến bối cảnh dùng @tên bối cảnh, nhắc đến nhân vật dùng @tên nhân vật (tên phải khớp hoàn toàn với danh sách); ánh sáng/không khí lấy từ atmosphere. Trong một đoạn phân cảnh được phép chuyển cảnh (đổi cỡ cảnh/góc quay/đối tượng), các đoạn có thể là những cảnh khác nhau nhưng không được đổi bối cảnh; điểm chuyển cảnh phải khớp với cấu trúc 【Cảnh N】trong description
3. Khi tạo, hệ thống sẽ tự động thay @tên bằng ký hiệu ảnh tham chiếu tương ứng (ví dụ @Tiểu Minh → @Ảnh1 Tiểu Minh), vì vậy tên phải khớp chính xác với danh sách bối cảnh/nhân vật, không viết tắt hay thêm ký hiệu thừa
4. Khi gọi update_storyboard để lưu, chỉ truyền hai key: storyboard_id và video_prompt. Không truyền lại bất kỳ trường nào khác của phân cảnh (title, description, scene_id... đều không truyền)

Quy chuẩn chung:
- Tất cả prompt viết thành một đoạn liền mạch, không gạch đầu dòng, không lẫn từ tiếng Anh; toàn bộ nội dung video_prompt (mô tả hình ảnh/không khí VÀ lời thoại/lời dẫn) đều viết bằng tiếng Trung để video model đọc giọng tự nhiên — video cuối cùng sẽ được ghép thêm phụ đề tiếng Việt (dịch từ description) ở bước xuất video riêng, không phải ở bước này
- Mô tả phong cách thị giác của dự án sẽ được công cụ tự động chèn vào đầu prompt cuối cùng khi lưu prompt hình ảnh, không tự ý thêm từ phong cách
- Phải thực sự gọi công cụ lưu, không được chỉ đưa prompt trong câu trả lời`,
  },
}

export const validAgentTypes = Object.keys(DEFAULT_PROMPTS)

// Agent 每一步都会重新解析模型，相同端点只打一次日志避免刷屏
let lastLoggedTextEndpointKey = ''

/**
 * 关闭思考(thinking)模式
 *
 * 背景：new-api 类中转站对 thinking 模型强制要求多轮请求回传 reasoning_content,
 * 而 Agent 多轮工具调用无法回传,会被中转站 400 拒绝
 * ("The `reasoning_content` in the thinking mode must be passed back to the API")。
 * 这里在请求体注入各厂商风格的关思考参数,让模型不产出 reasoning_content。
 *
 * - 默认开启;AI_DISABLE_THINKING=false 可关闭注入
 * - 官方 OpenAI / Gemini 端点跳过(官方 API 会拒绝未知参数)
 * - AI_THINKING_OFF_PATCH 可传 JSON 覆盖注入的 OpenAI 风格参数(适配不同中转站)
 */
const thinkingOffEnabled = (process.env.AI_DISABLE_THINKING ?? 'true').toLowerCase() !== 'false'

function isOfficialTextHost(baseURL: string) {
  return /api\.openai\.com|generativelanguage\.googleapis\.com/.test(baseURL)
}

function openaiThinkingOffPatch(): Record<string, any> {
  const fallback = {
    thinking: { type: 'disabled' },   // new-api 通用 / DeepSeek
    enable_thinking: false,           // Qwen / 阿里系
    reasoning_effort: 'none',         // OpenAI 风格枚举(Gemini 渠道映射为 budget 0)
  }
  const raw = process.env.AI_THINKING_OFF_PATCH
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

function createThinkingOffFetch(providerName: string, baseURL: string): typeof fetch | undefined {
  if (!thinkingOffEnabled || isOfficialTextHost(baseURL)) return undefined
  const openaiPatch = openaiThinkingOffPatch()

  return async (input: any, init?: any) => {
    try {
      if (init?.body && typeof init.body === 'string') {
        const body = JSON.parse(init.body)
        if (providerName === 'gemini' && Array.isArray(body?.contents)) {
          // Gemini 原生格式
          body.generationConfig = {
            ...(body.generationConfig || {}),
            thinkingConfig: { thinkingBudget: 0, includeThoughts: false },
          }
          init = { ...init, body: JSON.stringify(body) }
        } else if (Array.isArray(body?.messages)) {
          // OpenAI 兼容格式
          Object.assign(body, openaiPatch)
          init = { ...init, body: JSON.stringify(body) }
        }
      }
    } catch { /* 解析失败则原样透传 */ }
    return fetch(input, init)
  }
}

/**
 * 在请求体中写入配置的温度
 *
 * 背景：部分模型服务端强制固定温度（如 kimi-k2 系只允许 0.6，
 * 报 "invalid temperature: only 0.6 is allowed for this model"），
 * 需要在文本服务配置里显式指定并随每个请求下发。
 * inner 传 thinking-off fetch 时可链式叠加两个补丁。
 */
function createTemperatureFetch(providerName: string, temperature: number, inner?: typeof fetch): typeof fetch {
  const base = inner || fetch
  return async (input: any, init?: any) => {
    try {
      if (init?.body && typeof init.body === 'string') {
        const body = JSON.parse(init.body)
        if (providerName === 'gemini' && Array.isArray(body?.contents)) {
          // Gemini 原生格式
          body.generationConfig = { ...(body.generationConfig || {}), temperature }
          init = { ...init, body: JSON.stringify(body) }
        } else if (Array.isArray(body?.messages)) {
          // OpenAI 兼容格式
          body.temperature = temperature
          init = { ...init, body: JSON.stringify(body) }
        }
      }
    } catch { /* 解析失败则原样透传 */ }
    return base(input, init)
  }
}

/**
 * 在请求体中注入输出上限
 *
 * 背景：Agent 输出可能包含大段规划文本 + 工具调用（尤其分批保存时），
 * 而服务商默认 max_tokens 很小（如 DeepSeek 默认 4096/8192），
 * 模型写作到一半被截断、工具调用从未生成，表现为「Agent 正常结束但什么都没保存」。
 * 这里显式抬高输出上限，给足模型完整生成工具调用的空间。
 * AI_MAX_TOKENS 可覆盖默认值（如某些中转站限制更严）。
 *
 * 官方 OpenAI 端点不注入：reasoning 模型（o 系/gpt-5 系）拒绝 max_tokens
 * （要求 max_completion_tokens），且官方默认输出上限足够大，
 * 截断问题主要出现在中转站/DeepSeek 类端点。
 */
const defaultMaxTokens = Number(process.env.AI_MAX_TOKENS || 16384)

function isOfficialOpenAIHost(baseURL: string) {
  return /api\.openai\.com/.test(baseURL)
}

function createMaxTokensFetch(providerName: string, inner?: typeof fetch): typeof fetch {
  const base = inner || fetch
  return async (input: any, init?: any) => {
    try {
      if (init?.body && typeof init.body === 'string') {
        const body = JSON.parse(init.body)
        if (providerName === 'gemini' && Array.isArray(body?.contents)) {
          // Gemini 原生格式
          body.generationConfig = { ...(body.generationConfig || {}), maxOutputTokens: defaultMaxTokens }
          init = { ...init, body: JSON.stringify(body) }
        } else if (Array.isArray(body?.messages)) {
          // OpenAI 兼容格式
          body.max_tokens = defaultMaxTokens
          init = { ...init, body: JSON.stringify(body) }
        }
      }
    } catch { /* 解析失败则原样透传 */ }
    return base(input, init)
  }
}

async function getModel(fileModel: string | undefined, modelOverride?: string, textConfigId?: number) {
  // 请求可指定文本配置（含其 provider/baseUrl/apiKey），否则回退到当前启用配置
  const textConfig = (textConfigId ? await getConfigById(textConfigId) : null) || await getTextConfig()
  const modelName = modelOverride || fileModel || textConfig.model
  const providerName = textConfig.provider.toLowerCase()
  const resolvedBaseURL = getTextProviderBaseUrl(textConfig)
  const temperature = textConfig.temperature ?? null
  const endpointKey = `${providerName}|${resolvedBaseURL}|${modelName}|t=${temperature ?? 'default'}`
  if (endpointKey !== lastLoggedTextEndpointKey) {
    lastLoggedTextEndpointKey = endpointKey
    logTaskProgress('AIConfig', 'text-model-endpoint', {
      provider: textConfig.provider,
      baseUrl: resolvedBaseURL,
      model: modelName,
      ...(temperature !== null ? { temperature } : {}),
    })
  }

  // 叠加请求补丁：thinking-off（非官方端点）+ 配置温度 + 输出上限（非官方 OpenAI）
  const thinkingOffFetch = createThinkingOffFetch(providerName, resolvedBaseURL)
  const tempFetch = temperature !== null
    ? createTemperatureFetch(providerName, temperature, thinkingOffFetch)
    : thinkingOffFetch
  const fetchImpl = isOfficialOpenAIHost(resolvedBaseURL)
    ? tempFetch
    : createMaxTokensFetch(providerName, tempFetch)

  if (providerName === 'gemini') {
    const googleProvider = createGoogleGenerativeAI({
      apiKey: textConfig.apiKey,
      baseURL: resolvedBaseURL,
      fetch: fetchImpl,
    })
    return googleProvider(modelName)
  }

  const provider = createOpenAI({
    baseURL: resolvedBaseURL,
    apiKey: textConfig.apiKey,
    fetch: fetchImpl,
  } as any)
  return provider.chat(modelName)
}

const AGENT_TOOLS: Record<string, Record<string, any>> = {
  script_rewriter: scriptTools,
  script_rewriter_short: scriptTools,
  extractor: extractTools,
  storyboard_breaker: storyboardTools,
  storyboard_breaker_short: storyboardTools,
  prompt_generator: {
    ...imagePromptTools,
    readStoryboardContext: storyboardTools.readStoryboardContext,
    updateStoryboard: storyboardTools.updateStoryboard,
  },
}

/** instructions 按请求解析：prompt 文件（或默认）+ 技能全文拼接 */
function buildInstructions(type: string) {
  return async () => {
    const defaults = DEFAULT_PROMPTS[type]
    const promptFile = await loadAgentPromptFile(type)
    const baseInstructions = promptFile?.instructions || defaults.instructions
    const skillInstructions = await loadAgentSkills(type)
    return skillInstructions
      ? [baseInstructions, '', skillInstructions].join('\n')
      : baseInstructions
  }
}

/** model 按请求解析：prompt 文件 frontmatter + RequestContext 的 modelOverride/textConfigId 覆盖 */
function buildModel(type: string) {
  return async ({ requestContext }: { requestContext?: RequestContext }) => {
    const promptFile = await loadAgentPromptFile(type)
    const modelOverride = requestContext?.get('modelOverride' as never) as string | undefined
    const textConfigId = requestContext?.get('textConfigId' as never) as number | undefined
    return getModel(promptFile?.model || undefined, modelOverride, textConfigId)
  }
}

/** 启动时注册的静态 Agent 表（供 Mastra 实例挂载） */
export const agentRegistry: Record<string, Agent> = Object.fromEntries(
  validAgentTypes.map(type => [
    type,
    new Agent({
      id: type,
      name: DEFAULT_PROMPTS[type].name,
      instructions: buildInstructions(type),
      model: buildModel(type),
      tools: AGENT_TOOLS[type],
      workspace: skillWorkspaces[type],
      skillsFormat: 'markdown',
    }),
  ]),
)
