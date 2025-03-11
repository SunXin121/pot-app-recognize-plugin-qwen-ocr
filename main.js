async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch, cacheDir, readBinaryFile, http } = utils;
    let { tokens, customPrompt} = config;
  
    let file_path = `${cacheDir}pot_screenshot_cut.png`;
    let fileContent = await readBinaryFile(file_path);

  let prompt = "";
  if (!customPrompt) {
    prompt = `请识别图片中的内容，注意以下要求：
对于数学公式和普通文本：
1.  所有数学公式和数学符号都必须使用标准的LaTeX格式。
2.  行内公式使用单个\`$\`符号包裹，如：\`$x^2$\`
3.  独立公式块使用两个\`$$\`符号包裹，如：\`$$\\sum_{i=1}^n i^2$$\`
4.  普通文本保持原样，不要使用LaTeX格式。
5.  保持原文的段落格式和换行。
6.  对于图片中存在的 Markdown 格式,在输出中保留其原始的 Markdown 格式(如：勾选框 - [ ] 和 - [x]，引用块 > 的格式以及内容 ，嵌套引用，嵌套列表，以及其他更多 Markdown 语法)。
7.  确保所有数学符号都被正确包裹在\`$\`或\`$$\`中。
8. 对于代码块，使用 markdown 格式输出，使用\`\`\`包裹代码块。
对于验证码图片：
1.  只输出验证码字符，不要加任何额外解释。
2.  忽略干扰线和噪点。
3.  注意区分相似字符，如 0 和 O、1 和 l、2 和 Z、5 和 S、6 和 G、8 和 B、9 和 q、7 和 T、4 和 A 等。
4.  验证码通常为 4-6 位字母数字组合。`;
  } else {
    prompt = customPrompt;
  }

  // 设置请求头
  const headers = {
    "content-type": "multipart/form-data",
    authorization: "Bearer " + tokenValue,
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  };

  // 只有当使用cookie认证时才添加cookie头
  if (auth_type === "cookie") {
    headers.cookie = cookieValue;
  }

  const uploadResponse = await fetch("https://chat.qwen.ai/api/v1/files/", {
    method: "POST",
    headers: headers,
    body: http.Body.form({
      file: {
        file: fileContent,
        mime: "image/png",
        fileName: "pot_screenshot_cut.png",
      },
    }),
  });

  const uploadData = uploadResponse.data;

  if (!uploadData.id) throw new Error("文件上传失败");
  let imageId = uploadData.id;

  // 设置完成请求的请求头
  const completionHeaders = {
    accept: "*/*",
    authorization: `Bearer ${tokenValue}`,
    "Content-Type": "application/json",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  };

  // 只有当使用cookie认证时才添加cookie头
  if (auth_type === "cookie") {
    completionHeaders.cookie = cookieValue;
  }

  const res = await fetch("https://chat.qwen.ai/api/chat/completions", {
    method: "POST",
    headers: completionHeaders,
    body: {
      type: "Json",
      payload: {
        stream: false,
        model: "qwen-max-latest",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: imageId },
            ],
          },
        ],
        session_id: "1",
        chat_id: "2",
        id: "3",
      },
    },
  });

  if (res.ok) {
    const data = res.data;
    return data.choices[0].message.content;
  } else {
    throw `Http请求错误\nHttp状态码: ${res.status}\n${JSON.stringify(res.data)}`;
  }
}
