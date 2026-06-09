import CityBrowsePage from "./[city]/page";

/**
 * 根路由兜底页面。
 * 正常流程中，中间件会将 / 重定向到 /beijing（或 cookie 中记录的城市）。
 * 如果中间件因某些原因未触发，则直接渲染北京页面的内容（无额外跳转）。
 */
export default function RootPage() {
  return CityBrowsePage({ params: { city: "beijing" } });
}
