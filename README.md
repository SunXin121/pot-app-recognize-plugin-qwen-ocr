# Pot-APP Qwen OCR 插件

一个基于阿里云通义千问（Qwen）AI 的 OCR 文字识别插件，为 Pot-APP 提供强大的图像文字识别能力。

## 功能特点

- 🚀 支持多种文本类型识别（普通文本、数学公式、代码块、验证码等）
- 🔄 支持多个 Cookie 自动切换，提高成功率
- 📝 支持 LaTeX 数学公式识别和格式化
- 🎯 支持 Markdown 格式保留
- 🛡️ 完善的错误处理和日志记录
- ⚙️ 可自定义识别提示词和模型

## 使用方法

### 添加插件到 Pot

1.下载并安装 [Pot](https://pot-app.com/)

2.从 [releases](https://github.com/sun-i/pot-app-recognize-plugin-qwen-ocr/releases) 下载插件

3.打开 Pot-服务设置-文字识别-添加外部插件-安装外部插件，选择下载得到的 `plugin.com.pot-app.qwen-ocr.potext` 文件；

<img src="https://5a352de.webp.li/2025/01/ab995281f9d7f9cdac04a55e0dd48d68.png" alt="插件安装界面" width="600">

### 获取 cookie

打开 [Qwen](https://chat.qwenlm.ai/) 注册并登陆账户

`F12` 打开控制台-网络，进行对话，查看 `completions` 请求头里面的 cookie

<img src="https://s2.loli.net/2025/02/11/Dr9xnSGzqVXgceW.png" alt="获取cookie界面" width="600">

### 配置插件

1.点击 QwenOCR

<img src="https://5a352de.webp.li/2025/01/b58c75b149d9cdd35e64426bad251a9d.png" alt="点击QwenOCR" width="500">

2.输入刚才获得的 cookie，Prompt 和模型均为可选配置，不填则使用默认 Prompt 和模型

<img src="https://5a352de.webp.li/2025/09/4132ddcac3805a64f0cc6e1bb235006d.png" alt="配置插件界面" width="600">

3. 在 Pot-热键设置 里面可以设置文字识别的快捷键

<img src="https://5a352de.webp.li/2025/01/297511e346842b7cc15a35f6f0bf2161.png" alt="热键设置界面" width="600">

4.使用设置的快捷键截图，享受 Qwen 强大的 OCR 能力

<img src="https://5a352de.webp.li/2025/01/1d80cd8843fff9889de4de90b6729568.png" alt="OCR识别效果演示" width="650">

## 配置说明

### Cookie 配置
- **多 Cookie 支持**：可以配置多个 Cookie，用逗号分隔，插件会自动尝试每个 Cookie 直到成功

### 模型配置（可选）
- **默认模型**：`qwen-max-latest`
- 其他可选模型参见 Qwen 官网
- **留空使用默认值**

### 自定义提示词（可选）
- 可以根据需要自定义识别提示词
- 留空将使用插件内置的优化提示词
- 内置提示词已针对数学公式、代码块、Markdown 格式进行优化

## 故障排除

### 常见错误及解决方案

1. **"所有 Cookie 均已失效"**
   - 解决方案：重新获取 Cookie 并更新配置

2. **"Cookie 格式无效"**
   - 检查 Cookie 是否包含 `token=` 字段
   - 确保 Cookie 完整且没有被截断

3. **"无法读取截图文件"**
   - 检查 Pot-APP 是否有足够的文件访问权限
   - 尝试重新截图

4. **"网络连接失败"**
   - 检查网络连接
   - 确认能正常访问 `chat.qwenlm.ai`
