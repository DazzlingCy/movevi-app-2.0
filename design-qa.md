# Design QA

- Source visual truth: `C:/Users/14629/AppData/Local/Temp/codex-clipboard-6020869f-059d-4536-a04c-94458dd80f30.png`
- Implementation evidence: Codex in-app Browser tab 2 capture of `http://127.0.0.1:3000/` (browser evidence is retained in the task; the API does not expose a filesystem screenshot path)
- Source pixels: 378 × 264 px
- Implementation viewport: 938 × 898 px with the existing 430 px mobile application shell; browser density unchanged
- State:环球等级页，规则弹层打开，LV.4，5 个已完成城市

## Full-view comparison evidence

- 默认等级页只保留等级概览、等级进度和已完成城市记录，底部不再常驻显示规则卡片。
- 顶部导航右侧新增“规则”按钮，与返回按钮和居中标题形成稳定的三栏布局。
- 点击后以底部弹层展示截图中的标题、副标题和三条编号规则。

## Focused-region comparison evidence

- 字体与层级：规则标题、辅助说明、编号和正文保持现有等级页字号层级，标题最醒目，正文清晰可读。
- 间距与布局：弹层宽度对齐手机页面内边距，三条规则使用一致的纵向节奏和分隔线。
- 颜色与视觉变量：沿用现有深色卡片、紫色规则图标与编号、浅灰说明文字。
- 图像与图标：使用项目现有 Lucide 图标体系，没有新增位图或替代占位资源。
- 文案内容：规则内容与原卡片保持一致，包括国家去重示例与 LV.195 上限。

## Interaction and runtime checks

- 顶部“规则”按钮可以打开弹层。
- 关闭按钮可以关闭弹层，键盘 Escape 也支持关闭。
- 弹层使用 `role="dialog"`、`aria-modal="true"`，打开后自动聚焦关闭按钮。
- 减少动态效果模式下关闭弹层动画。
- 浏览器控制台无 warning 或 error。
- TypeScript 检查、11 项自动化测试和生产构建通过。

## Findings

- P0: none
- P1: none
- P2: none

## Comparison history

- 修改前：规则卡片常驻页面底部，需要继续下滑查看。
- 修改后：规则收纳到右上角按钮，点击后展示同内容弹层，默认页面更聚焦等级与完成记录。
- 浏览器复查确认打开、关闭和无常驻规则卡片三个状态均正常。

final result: passed
