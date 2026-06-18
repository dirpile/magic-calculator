# 神奇计算器

一个 React/Vite 单页项目。它看起来像普通计算器，用户可以点击按钮或使用键盘输入表达式；点击 `=` 后不会在本机计算，而是把表达式带到百度搜索，由百度页面里的计算器展示结果。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会生成在 `dist` 目录。

## 部署上线

推荐用 Vercel、Netlify、Cloudflare Pages 或任意静态网站托管服务。

通用配置：

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 实现说明

项目不会使用 `eval` 或本地计算表达式。点击 `=` 时会跳转到：

```text
https://www.baidu.com/s?wd=<表达式>
```

例如 `12×8+5` 会转换为 `12*8+5` 后编码进百度搜索参数。
