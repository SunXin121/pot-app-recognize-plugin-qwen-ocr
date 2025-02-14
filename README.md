# Pot-APP Qwen OCR 插件



## 使用方法

### 添加插件到 Pot

1.[下载插件](https://github.com/sun-i/pot-app-recognize-plugin-qwen-ocr/releases)；

2.打开 Pot-服务设置-文字识别-添加外部插件-安装外部插件，选择下载得到的 `plugin.com.pot-app.qwen-ocr.potext` 文件；

![image-20250113230159492](https://5a352de.webp.li/2025/01/ab995281f9d7f9cdac04a55e0dd48d68.png)

### 获取 cookie

打开 [Qwen](https://chat.qwenlm.ai/) 注册并登陆账户

`F12` 打开控制台-网络，进行对话，查看 `completions` 请求头里面的 cookie

![image.png](https://s2.loli.net/2025/02/11/Dr9xnSGzqVXgceW.png)

### 配置插件

1.点击 QwenOCR

![image-20250113230602351](https://5a352de.webp.li/2025/01/b58c75b149d9cdd35e64426bad251a9d.png)

2.输入刚才获得的 cookie，Prompt 为可选配置，不填则使用默认 Prompt

[![image.png](https://s2.loli.net/2025/02/11/TKridMqHt6OnfoZ.png)](https://s2.loli.net/2025/02/11/TKridMqHt6OnfoZ.png)

3. 在 Pot-热键设置 里面可以设置文字识别的快捷键

![image-20250113230811218](https://5a352de.webp.li/2025/01/297511e346842b7cc15a35f6f0bf2161.png)

4.使用设置的快捷键截图，享受 Qwen 强大的 OCR 能力

![image-20250113231330652](https://5a352de.webp.li/2025/01/1d80cd8843fff9889de4de90b6729568.png)
