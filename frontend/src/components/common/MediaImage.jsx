import { useState } from "react";
import { resolveMediaUrl } from "../../api/client.js";

// 缺圖／載入失敗時顯示的灰底佔位圖（inline SVG data-URI，不需額外請求）
const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
       <rect width="100%" height="100%" fill="#e5e5ec"/>
       <text x="50%" y="50%" fill="#9a9aa8" font-family="sans-serif"
             font-size="42" text-anchor="middle" dominant-baseline="middle">無圖片</text>
     </svg>`
  );

/**
 * 統一的媒體圖片元件：
 * - 自動用 resolveMediaUrl 補上後端 origin
 * - 來源為空或載入失敗時，改顯示灰底「無圖片」佔位圖，避免破圖 icon
 */
export default function MediaImage({ src, alt = "", className = "", ...rest }) {
  const resolved = resolveMediaUrl(src);
  const [failed, setFailed] = useState(false);
  const finalSrc = !resolved || failed ? PLACEHOLDER : resolved;

  return (
    <img
      className={className}
      src={finalSrc}
      alt={alt}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
