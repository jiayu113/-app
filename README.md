# 智绘时间 (SmartTime) - Flutter Mobile App

这是一个由 **Flutter** 构建的智能时间管理移动端应用，支持 AI 任务拆解、番茄专注钟和数据分析。

## 📱 功能特性

*   **智能 AI 拆解**：调用 Google Gemini 2.5 Flash 模型自动拆解目标。
*   **任务管理**：优先级、预估时间、截止日期提醒。
*   **专注时钟**：正/倒计时模式，美观的环形进度条。
*   **数据统计**：可视化的周/月/年数据图表。

## 🛠️ 部署步骤

1.  **安装 Flutter**：
    确保您已安装 Flutter SDK 并配置好环境。
    ```bash
    flutter doctor
    ```

2.  **获取依赖**：
    在项目根目录运行：
    ```bash
    flutter pub get
    ```

3.  **配置 API Key**：
    打开 `lib/providers/app_provider.dart`，找到 `_apiKey` 变量，填入您的 Google Gemini API Key。

4.  **运行应用**：
    连接设备或启动模拟器，然后运行：
    ```bash
    flutter run
    ```

5.  **构建发布包**：
    *   Android APK: `flutter build apk`
    *   iOS IPA: `flutter build ipa` (需要 macOS)
