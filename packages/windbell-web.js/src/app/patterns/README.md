# 纹样

新增一个纹样只需要往这个目录里放文件：

- `foo.svg`：纹样本体，文件名就是 pattern id。
- `foo.pattern.ts`：可选元数据，和 SVG 同名。

SVG 约定：

- 透明背景。
- 单色线稿，只画 stroke / fill，不要依赖具体颜色；
  纹样会通过 CSS mask 重新上色。
- 正方 viewBox，例如 `0 0 96 96`。
- 自己保证四方连续、接缝对齐。

元数据示例：

```ts
import type { PatternMeta } from "../patternTypes"

export default {
  label: { "zh-CN": "回纹", "en-US": "Meander" },
  tile: 96,
  opacity: { light: 0.08, dark: 0.14 },
  order: 20,
} satisfies PatternMeta
```

- 不写 `foo.pattern.ts` 也可以：id 会成为默认 label，
  `tile` 和 `opacity` 使用全局默认值。
- `order` 越小越靠前，也决定没有用户选择时的默认纹样。
- `tile` 是 CSS `mask-size` 的基础尺寸，单位 px。
- `opacity` 是亮色/暗色下的默认强度。

## 现有纹样

- **宝相花团窠**：取唐代团窠、联珠与宝相花层次，中心团花加四角团花，
  取“圆满、庄严、繁而不乱”之意。
- **冰梅纹**：以冰裂纹为地，点缀五瓣梅花。冰裂取“清”，梅花取“骨”，
  是明清文人器物上常见的清冷题材。
- **落花流水纹**：取宋代织锦中的流水落花意象，水波为骨，落花为眼，
  取“流水落花，自然成文”的诗意。
