---
description: Design system — màu sắc dark theme, typography, UI principles và layout conventions
globs:
  - "frontend/**"
  - "*.html"
  - "*.css"
  - "*.tsx"
alwaysApply: false
---

# Design System — ShopStyle Dark Theme

Theo style **resend.com** — tối giản, hiện đại, chuyên nghiệp.

## Màu sắc (CSS Variables)

```css
--bg-primary:    #0a0a0a   /* Nền chính — gần đen */
--bg-secondary:  #111111   /* Card, sidebar */
--bg-tertiary:   #1a1a1a   /* Input, hover states */
--border:        #262626   /* Đường viền mặc định */
--text-primary:  #ededed   /* Văn bản chính */
--text-muted:    #737373   /* Văn bản phụ, placeholder */
--accent:        #ffffff   /* Accent chính — trắng thuần */
--accent-blue:   #3b82f6   /* Link, CTA phụ */
--destructive:   #ef4444   /* Danger actions */
--success:       #22c55e   /* Success states */
```

## Typography

- **Font chính:** Inter (sans-serif) — `font-family: 'Inter', sans-serif`
- **Font mono:** JetBrains Mono — dùng cho chatbot messages, log, code blocks
- **Heading:** text-4xl (hero) / text-2xl (section) / text-xl (card title)
- **Body:** text-sm (14px) mặc định, text-xs cho metadata và timestamps

## UI Principles

- **Nền tối thuần**: không gradient rực rỡ, không màu neon — chỉ dùng `#0a0a0a` / `#111` / `#1a1a1a`
- **Spacing rộng**: padding lớn, whitespace là design element quan trọng
- **Border mỏng**: 1px solid `#262626`, không dùng box-shadow nặng
- **Hover states**: background shift subtle — `#111 → #1a1a1a → #222`
- **Buttons primary**: filled trắng trên đen (`bg-white text-black`)
- **Buttons secondary**: ghost với border mỏng (`border-[#262626]`)
- **Cards**: `bg-[#111]` với border 1px, border-radius 8px, không shadow
- **Chatbot widget**: fixed bottom-right, dark panel (`bg-[#111]`), JetBrains Mono cho messages

## Layout Conventions

| Thành phần | Spec |
|-----------|------|
| Navbar | Sticky top, height 56px — logo trái + nav links giữa + auth phải |
| Hero | Centered text, minimal — tên shop + tagline + 2 CTA buttons |
| Products grid | 3–4 columns responsive, card minimal không shadow |
| Product detail | 2-column layout: left (image) \| right (info + actions) |
| Chatbot | Floating FAB bottom-right hoặc panel bên phải product detail |
| Admin | Full-width table layout, stat cards trên cùng |

## Trạng thái đặc biệt (Attack/Defense UI)

- **Injection payload badge**: `background: rgba(239,68,68,.1)`, `color: #ef4444`, border đỏ mỏng
- **Defense toggle Vulnerable**: red pill badge — `rgba(239,68,68,.1)` bg
- **Defense toggle Hardened**: green pill badge — `rgba(34,197,94,.1)` bg
- **Attack type badges**: Direct PI → đỏ | Indirect PI → cam | Jailbreak → xanh | Normal → xám
