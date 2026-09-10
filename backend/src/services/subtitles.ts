/**
 * Tạo phụ đề (.srt) tiếng Việt từ description của các đoạn phân cảnh,
 * dùng để burn cứng vào video khi xuất tập (audio đọc tiếng Trung, phụ đề tiếng Việt)
 */

interface SubtitleClip {
  description: string | null
  duration: number | null
}

interface SubtitleEntry {
  index: number
  startMs: number
  endMs: number
  text: string
}

/** Trích các dòng lời thoại/lời dẫn tiếng Việt từ description theo format 「Tên nói: "..."」/「Lời dẫn: ...」 */
function extractLines(description: string | null): string[] {
  if (!description) return []
  const lines: string[] = []

  const dialogueRe = /([^\s:：][^:：\n]{0,30}?)\s*nói[:：]\s*["“]([^"”]+)["”]/g
  const narrationRe = /Lời dẫn[:：]\s*([^\n]+)/g

  // Giữ đúng thứ tự xuất hiện trong text: gom tất cả match kèm vị trí rồi sort theo index
  const matches: { pos: number; text: string }[] = []

  let m: RegExpExecArray | null
  while ((m = dialogueRe.exec(description))) {
    matches.push({ pos: m.index, text: `${m[1].trim()}: ${m[2].trim()}` })
  }
  while ((m = narrationRe.exec(description))) {
    matches.push({ pos: m.index, text: m[1].trim() })
  }

  matches.sort((a, b) => a.pos - b.pos)
  for (const item of matches) {
    if (item.text) lines.push(item.text)
  }
  return lines
}

function formatSrtTime(ms: number): string {
  const clamped = Math.max(0, Math.round(ms))
  const h = Math.floor(clamped / 3_600_000)
  const min = Math.floor((clamped % 3_600_000) / 60_000)
  const sec = Math.floor((clamped % 60_000) / 1000)
  const msPart = clamped % 1000
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${pad(h)}:${pad(min)}:${pad(sec)},${pad(msPart, 3)}`
}

/** 转义 SRT 文本中的特殊字符（主要是换行统一处理，SRT 本身对普通文本无需转义） */
function sanitizeText(text: string): string {
  return text.replace(/\r?\n/g, ' ').trim()
}

/**
 * 根据分镜段落列表生成 SRT 内容。
 * 每段的台词/旁白在该段 duration 内均分时长展示；没有可提取台词的段落不生成字幕条目。
 */
export function buildSrtFromClips(clips: SubtitleClip[]): string {
  const entries: SubtitleEntry[] = []
  let cursorMs = 0
  let index = 1

  for (const clip of clips) {
    const durationMs = Math.max(1, Number(clip.duration) || 8) * 1000
    const lines = extractLines(clip.description)

    if (lines.length > 0) {
      const perLineMs = durationMs / lines.length
      lines.forEach((line, i) => {
        const startMs = cursorMs + i * perLineMs
        const endMs = cursorMs + (i + 1) * perLineMs
        entries.push({
          index: index++,
          startMs,
          endMs: endMs - Math.min(150, perLineMs * 0.1), // 留一点间隔，避免相邻字幕无缝闪烁
          text: sanitizeText(line),
        })
      })
    }

    cursorMs += durationMs
  }

  return entries
    .map(e => `${e.index}\n${formatSrtTime(e.startMs)} --> ${formatSrtTime(e.endMs)}\n${e.text}\n`)
    .join('\n')
}
