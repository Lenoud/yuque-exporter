# yuque-exporter

语雀文档批量导出工具，支持导出为 Markdown 格式并下载图片，适配 Obsidian 笔记软件。

## 功能

- 批量导出语雀知识库为 Markdown 文档
- 保持原始知识库目录结构
- 支持导出失败自动重试
- 导出文档中的图片到本地
- 支持 Obsidian 格式（图片存放 attachments 目录，Markdown 使用相对路径）
- 首次手动登录后自动保存 Cookie，后续无需重复登录

## 使用

### 1. 安装依赖

需要 Node.js >= 18 和 Python 3。

```bash
git clone git@github.com:Lenoud/yuque-exporter.git
cd yuque-exporter
npm install
```

### 2. 导出文档

```bash
# 设置导出目录（可选，默认为 ./output）
EXPORT_PATH=/path/to/export node main.js
```

首次运行会弹出浏览器窗口，手动完成登录后脚本自动保存 Cookie 并开始导出。后续运行无需再次登录。

### 3. 处理图片（Obsidian 适配）

```bash
python3 scripts/obsidian-image.py
```

会将 Markdown 中的远程图片下载到 `attachments/` 目录，并将链接替换为 Obsidian 兼容的相对路径。

如需自定义图片处理行为，可设置环境变量：

| 环境变量 | 描述 | 默认值 |
|--|--|--|
| `MARKDOWN_DIR` | Markdown 文件目录 | `./output` |
| `DOWNLOAD_IMAGE` | 是否下载图片 | `true` |
| `UPDATE_MDIMG_URL` | 是否更新图片链接 | `false` |
| `REPLACE_IMAGE_HOST` | 自定义图片 CDN 地址 | 无 |

### 环境变量

| 变量 | 必填 | 描述 |
|--|--|--|
| `EXPORT_PATH` | 否 | 导出路径，默认 `./output` |

## 目录结构

```
yuque-exporter/
├── main.js                # 入口文件
├── src/
│   ├── const.js           # 常量定义
│   ├── login.js           # 登录（手动/Cookie）
│   ├── toc.js             # 获取知识库目录
│   └── export.js          # 导出 Markdown
└── scripts/
    ├── export-image.py    # 原版图片处理
    └── obsidian-image.py  # Obsidian 图片处理
```

## 注意事项

- 需要 macOS 上安装 Google Chrome（`/Applications/Google Chrome.app`）
- 无法导出纯表格、思维导图类型的文档（语雀不支持此类文档的 Markdown 导出）
- 文件名以 `.` 开头的文档可能导出超时，脚本会自动重试

## License

MIT
