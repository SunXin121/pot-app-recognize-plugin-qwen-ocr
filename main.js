/**
 * Qwen OCR 识别函数
 * @param {string} base64 - 图片的 base64 编码（未使用，通过缓存文件读取）
 * @param {string} lang - 语言设置
 * @param {Object} options - 选项配置
 * @returns {Promise<string>} 识别结果
 */
async function recognize(base64, lang, options) {
  const { config, utils } = options;
  const { tauriFetch: fetch, cacheDir, readBinaryFile, http } = utils;
  let { cookie, customPrompt, model } = config;

  // 参数验证
  if (!cookie) {
    throw new Error("Cookie 未提供，请在插件设置中配置 Cookie");
  }

  if (!cacheDir) {
    throw new Error("缓存目录未找到");
  }

  // 如果没有设定 model，使用默认值
  if (!model || model.trim() === "") {
    model = "qwen-max-latest";
  }

  // 将 cookie 按逗号分隔成数组并验证
  const cookies = cookie
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c && c.length > 0);

  if (cookies.length === 0) {
    throw new Error("未提供有效的 Cookie，请检查 Cookie 格式");
  }

  let lastError = null;
  let attemptCount = 0;

  console.log(`开始尝试 ${cookies.length} 个 Cookie 进行 OCR 识别`);

  // 遍历尝试每个 cookie
  for (const singleCookie of cookies) {
    attemptCount++;
    
    try {
      console.log(`尝试第 ${attemptCount} 个 Cookie...`);
      
      // 从 cookie 中提取 token
      const tokenMatch = singleCookie.match(/token=([^;]+)/);
      if (!tokenMatch) {
        console.warn(`第 ${attemptCount} 个 Cookie 格式无效，跳过`);
        lastError = new Error(`Cookie 格式无效: ${singleCookie.substring(0, 50)}...`);
        continue;
      }
      const token = tokenMatch[1];

      // 构建文件路径并读取截图
      const filePath = `${cacheDir}pot_screenshot_cut.png`;
      let fileContent;
      
      try {
        fileContent = await readBinaryFile(filePath);
        if (!fileContent || fileContent.length === 0) {
          throw new Error("截图文件为空");
        }
        console.log(`成功读取截图文件，大小: ${fileContent.length} 字节`);
      } catch (fileError) {
        throw new Error(`无法读取截图文件: ${fileError.message}`);
      }

      // 获取识别提示词
      const prompt = getRecognitionPrompt(customPrompt);

      // 执行 OCR 识别
      const result = await performOCR(fetch, http, token, singleCookie, model, fileContent, prompt);
      
      if (result) {
        console.log(`第 ${attemptCount} 个 Cookie 识别成功`);
        return result;
      }
      
    } catch (error) {
      console.error(`第 ${attemptCount} 个 Cookie 识别失败:`, error.message);
      lastError = error;
      
      // 如果是认证相关错误，继续尝试下一个 Cookie
      if (isAuthenticationError(error)) {
        continue;
      }
      
      // 如果是其他类型错误且只有一个 Cookie，直接抛出
      if (cookies.length === 1) {
        throw error;
      }
    }
  }

  // 所有 Cookie 都失败时的错误处理
  console.error(`所有 ${cookies.length} 个 Cookie 都无法正常工作`);
  
  if (lastError) {
    // 根据错误类型提供更具体的错误信息
    if (isAuthenticationError(lastError)) {
      throw new Error("所有 Cookie 均已失效，请更新 Cookie 并重新配置插件");
    } else if (lastError.message.includes("网络")) {
      throw new Error("网络连接失败，请检查网络设置并重试");
    } else {
      throw new Error(`OCR 识别失败: ${lastError.message}`);
    }
  } else {
    throw new Error("所有 Cookie 均已失效，请更新 Cookie");
  }
}

/**
 * 获取识别提示词
 * @param {string} customPrompt - 自定义提示词
 * @returns {string} 最终使用的提示词
 */
function getRecognitionPrompt(customPrompt) {
  if (customPrompt && customPrompt.trim() !== "") {
    return customPrompt.trim();
  }

  return `请识别图片中的内容，注意以下要求：

对于数学公式和普通文本：
1. 所有数学公式和数学符号都必须使用标准的 LaTeX 格式
2. 行内公式使用单个 \`$\` 符号包裹，如：\`$x^2$\`
3. 独立公式块使用两个 \`$$\` 符号包裹，如：\`$$\\sum_{i=1}^n i^2$$\`
4. 普通文本保持原样，不要使用 LaTeX 格式
5. 保持原文的段落格式和换行
6. 对于图片中存在的 Markdown 格式，在输出中保留其原始的 Markdown 格式（如：勾选框 - [ ] 和 - [x]，引用块 > 的格式以及内容，嵌套引用，嵌套列表，以及其他更多 Markdown 语法）
7. 确保所有数学符号都被正确包裹在 \`$\` 或 \`$$\` 中
8. 对于代码块，使用 Markdown 格式输出，使用 \`\`\` 包裹代码块

对于验证码图片：
1. 只输出验证码字符，不要加任何额外解释
2. 忽略干扰线和噪点
3. 注意区分相似字符，如 0 和 O、1 和 l、2 和 Z、5 和 S、6 和 G、8 和 B、9 和 q、7 和 T、4 和 A 等
4. 验证码通常为 4-6 位字母数字组合`;
}

/**
 * 执行 OCR 识别
 * @param {Function} fetch - 网络请求函数
 * @param {Object} http - HTTP 工具对象
 * @param {string} token - 认证 token
 * @param {string} cookie - Cookie 字符串
 * @param {string} model - 使用的模型
 * @param {Uint8Array} fileContent - 图片文件内容
 * @param {string} prompt - 识别提示词
 * @returns {Promise<string|null>} 识别结果或 null
 */
async function performOCR(fetch, http, token, cookie, model, fileContent, prompt) {
  try {
    // 上传图片文件
    console.log("开始上传图片文件...");
    const uploadResponse = await fetch("https://chat.qwenlm.ai/api/v1/files/", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data",
        "authorization": `Bearer ${token}`,
        "cookie": cookie,
      },
      body: http.Body.form({
        file: {
          file: fileContent,
          mime: "image/png",
          fileName: "pot_screenshot_cut.png",
        },
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`文件上传失败: HTTP ${uploadResponse.status}`);
    }

    const uploadData = uploadResponse.data;
    if (!uploadData || !uploadData.id) {
      throw new Error("文件上传失败：未返回文件 ID");
    }

    const imageId = uploadData.id;
    console.log(`图片上传成功，ID: ${imageId}`);

    // 发送 OCR 识别请求
    console.log("开始 OCR 识别...");
    const recognitionResponse = await fetch("https://chat.qwenlm.ai/api/chat/completions", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "authorization": `Bearer ${token}`,
        "cookie": cookie,
        "Content-Type": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
      },
      body: {
        type: "Json",
        payload: {
          stream: false,
          model: model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image", image: imageId },
              ],
            },
          ],
          session_id: generateSessionId(),
          chat_id: generateChatId(),
          id: generateRequestId(),
        },
      },
    });

    if (!recognitionResponse.ok) {
      throw new Error(`OCR 请求失败: HTTP ${recognitionResponse.status}`);
    }

    const recognitionData = recognitionResponse.data;
    if (!recognitionData || !recognitionData.choices || !recognitionData.choices[0]) {
      throw new Error("OCR 响应格式错误：未找到识别结果");
    }

    const result = recognitionData.choices[0].message?.content;
    if (!result) {
      throw new Error("OCR 识别结果为空");
    }

    console.log("OCR 识别成功");
    return result.trim();

  } catch (error) {
    console.error("OCR 执行失败:", error.message);
    throw error;
  }
}

/**
 * 判断是否为认证相关错误
 * @param {Error} error - 错误对象
 * @returns {boolean} 是否为认证错误
 */
function isAuthenticationError(error) {
  const authErrorMessages = [
    "unauthorized",
    "token",
    "cookie",
    "authentication",
    "401",
    "403",
    "invalid token",
    "expired"
  ];
  
  const errorMessage = error.message.toLowerCase();
  return authErrorMessages.some(msg => errorMessage.includes(msg));
}

/**
 * 生成会话 ID
 * @returns {string} 会话 ID
 */
function generateSessionId() {
  return Date.now().toString();
}

/**
 * 生成聊天 ID
 * @returns {string} 聊天 ID
 */
function generateChatId() {
  return (Date.now() + Math.random() * 1000).toString();
}

/**
 * 生成请求 ID
 * @returns {string} 请求 ID
 */
function generateRequestId() {
  return (Date.now() + Math.random() * 10000).toString();
}
