/**
 * [INPUT]: 依赖浏览器 Web Speech API (SpeechRecognition / SpeechSynthesis)，类型定义来自 ../../types/speech.d.ts
 * [OUTPUT]: 导出 checkSupport()、startListening()、speak()、stopSpeaking()
 * [POS]: speaking 模块的语音 API 封装，被 SpeakingPage 调用
 * [PROTOCOL]: 修改语音参数或兼容性策略时更新本头注释
 */

/** 检查浏览器是否支持 Web Speech API */
export function checkSupport(): { recognition: boolean; synthesis: boolean } {
  const recognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  const synthesis = 'speechSynthesis' in window
  return { recognition, synthesis }
}

/**
 * 开始语音识别，同时录音。
 * 返回 { promise, stop } —— promise 返回识别文本 + 录音 URL，stop() 手动停止录音。
 */
export function startListening(lang = 'en-US'): {
  promise: Promise<{ text: string; audioUrl: string }>
  stop: () => void
} {
  let recognition: SpeechRecognition | null = null
  let mediaRecorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  const audioChunks: Blob[] = []
  let isResolved = false // 防止 promise 被 resolve 两次

  const promise = new Promise<{ text: string; audioUrl: string }>((resolve, reject) => {

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      // 目标用户：中国开发者，中文错误提示更友好
      return reject(new Error('浏览器不支持语音识别（请使用 Chrome）'))
    }

    // 请求麦克风权限并开始录音
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(s => {
        stream = s
        mediaRecorder = new MediaRecorder(stream)

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        mediaRecorder.onstop = () => {
          // 停止录音后释放麦克风
          stream?.getTracks().forEach(track => track.stop())
        }

        // 开始录音
        mediaRecorder.start()

        // 开始语音识别
        recognition = new SpeechRecognitionCtor()
        recognition.lang = lang
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (isResolved) return
          isResolved = true

          const transcript = event.results[0][0].transcript
          mediaRecorder?.stop()

          // 等待 onstop 触发生成 audioUrl
          setTimeout(() => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            const audioUrl = URL.createObjectURL(audioBlob)
            resolve({ text: transcript, audioUrl })
          }, 100)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (isResolved) return
          isResolved = true

          mediaRecorder?.stop()
          stream?.getTracks().forEach(track => track.stop())
          // 目标用户：中国开发者，中文错误提示更友好
          reject(new Error(`识别失败: ${event.error}`))
        }

        recognition.onend = () => {
          // 识别结束（用户主动停止或超时）
          // 如果还没有通过 onresult resolve，在这里 resolve
          if (!isResolved) {
            isResolved = true
            mediaRecorder?.stop()

            setTimeout(() => {
              if (audioChunks.length > 0) {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
                const audioUrl = URL.createObjectURL(audioBlob)
                // 文本可能为空（用户主动停止且没说话）
                resolve({ text: '', audioUrl })
              } else {
                resolve({ text: '', audioUrl: '' })
              }
            }, 100)
          }
        }

        recognition.start()
      })
      .catch(err => {
        reject(new Error(`无法访问麦克风: ${err.message}`))
      })
  })

  const stop = () => {
    if (recognition) {
      recognition.stop() // 触发 onend 事件
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
  }

  return { promise, stop }
}

/**
 * 朗读文本（AI 回复或单词）。
 * 使用浏览器内置的语音合成，自动选择最佳英文语音。
 */
export function speak(text: string, lang = 'en-US'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      // 目标用户：中国开发者，中文错误提示更友好
      return reject(new Error('浏览器不支持语音合成'))
    }

    // 先取消之前可能还在播放的语音
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9 // 稍慢一点，更清晰
    utterance.pitch = 0.7 // 降低音调，避免尖锐
    utterance.volume = 1.0

    utterance.onend = () => resolve()
    utterance.onerror = (event) => {
      console.error('TTS error:', event)
      reject(new Error(`朗读失败: ${event.error}`))
    }

    let voicesLoadedTimeout: number | null = null
    let hasSpoken = false

    function setVoiceAndSpeak(utterance: SpeechSynthesisUtterance) {
      if (hasSpoken) return // 防止重复播放
      hasSpoken = true

      if (voicesLoadedTimeout !== null) {
        clearTimeout(voicesLoadedTimeout)
      }

      const voices = window.speechSynthesis.getVoices()

      console.log('=== 可用语音列表 ===')
      voices.forEach((v, i) => {
        console.log(`[${i}] ${v.name} | ${v.lang} | local:${v.localService}`)
      })

      // 优先选择质量好的英文语音
      // 1. 优先 Google/Microsoft 的在线语音（通常质量更好）
      // 2. 其次选择本地的美式英语
      // 3. 最后任何英文语音
      const enVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en-'))
                   || voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en-'))
                   || voices.find(v => v.lang === 'en-US' && !v.localService) // 在线语音
                   || voices.find(v => v.lang === 'en-US')
                   || voices.find(v => v.lang.startsWith('en-'))

      if (enVoice) {
        console.log(`✅ 选择语音: ${enVoice.name} | ${enVoice.lang} | local:${enVoice.localService}`)
        utterance.voice = enVoice
      } else {
        console.warn('⚠️ 未找到合适的英文语音，使用系统默认')
      }

      window.speechSynthesis.speak(utterance)
    }

    // 等待语音列表加载（Safari/Chrome 有时需要这个）
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      // 语音列表还没加载，等待 voiceschanged 事件
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak(utterance)
      }

      // 添加超时回退：如果 1 秒后还没加载，直接播放（用系统默认语音）
      voicesLoadedTimeout = window.setTimeout(() => {
        if (!hasSpoken) {
          console.warn('语音列表加载超时，使用默认语音')
          setVoiceAndSpeak(utterance)
        }
      }, 1000)
    } else {
      setVoiceAndSpeak(utterance)
    }
  })
}

/** 停止当前朗读 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
