async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch, cacheDir, readBinaryFile, http } = utils;
    let { tokens, customPrompt} = config;
  
    let file_path = `${cacheDir}pot_screenshot_cut.png`;
    let fileContent = await readBinaryFile(file_path);

    let prompt = '';
    if(!customPrompt) {
      prompt= `
            请识别图片中的内容。对于数学公式和数学符号，请使用标准的LaTeX格式输出，并用美元符号$或$$括起来。要求：
            1. 所有数学公式和单个数学符号都要用LaTeX格式，按照标准LaTeX格式转换，并用美元符号$或$$括起来。
            2. 普通文本保持原样。
            3. 严格保持原文的段落格式和换行，不需要显式输出换行符，只需保持原文的样式。
            4. 对于代码块，请使用 markdown 格式输出，使用\`\`\`包裹代码块。
            5. 对于非数学符号的特殊字符或格式，请按照原文格式处理。
            6. 对于公式中的变量或特殊符号，请确保其准确性和一致性。
            7. 对于复杂的数学公式，如矩阵、方程组等，请使用相应的LaTeX环境（如matrix、align等）进行转换，并用美元符号$或$$括起来。
            8. 对于上下标、分数、根号等特殊数学符号，请确保其格式正确无误，并用美元符号$或$$括起来。
            9.表格内容请以Markdown格式呈现。
            `;
    }else {
      prompt = customPrompt;
    }
      
    let token = '';
    if (tokens) {
      const tokenArray = tokens.split(',');
      const randomIndex = Math.floor(Math.random() * tokenArray.length);
      token = tokenArray[randomIndex].trim();
    } else {
      throw new Error('No tokens available');
    }
  
    const uploadResponse = await fetch('https://chat.qwenlm.ai/api/v1/files/', {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
        'authorization': 'Bearer ' + token,
      },
      body: http.Body.form(
        {
          file: {
            file: fileContent,
            mime: 'image/png',
            fileName: 'pot_screenshot_cut.png',
          }
        }
      )
    });
  
    const uploadData = uploadResponse.data;
  
    if (!uploadData.id) throw new Error('文件上传失败');
    let imageId = uploadData.id;
  
    const res = await fetch('https://chat.qwenlm.ai/api/chat/completions', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'authorization': `Bearer ` + token,
        'Content-Type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
      },
      body: {
        type: 'Json',
        payload: {
          stream: false,
          model: 'qwen2.5-vl-72b-instruct',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt},
                { type: 'image', image: imageId } // 使用上传后的图片 ID
              ],
            },
          ],
          session_id: '1',
          chat_id: '2',
          id: '3',
        }
      }
    });
  
    if (res.ok) {
      const data = res.data;
      return data.choices[0].message.content;
    } else {
      throw `Http Reques
      t Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
  
  }
  
