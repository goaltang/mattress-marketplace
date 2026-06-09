export interface City {
  name: string;
  slug: string;
  pinyin: string;
  isHot?: boolean;
}

// 热门城市 (20 个)
export const HOT_CITIES: City[] = [
  { name: "北京", slug: "beijing", pinyin: "beijing", isHot: true },
  { name: "上海", slug: "shanghai", pinyin: "shanghai", isHot: true },
  { name: "广州", slug: "guangzhou", pinyin: "guangzhou", isHot: true },
  { name: "深圳", slug: "shenzhen", pinyin: "shenzhen", isHot: true },
  { name: "杭州", slug: "hangzhou", pinyin: "hangzhou", isHot: true },
  { name: "成都", slug: "chengdu", pinyin: "chengdu", isHot: true },
  { name: "武汉", slug: "wuhan", pinyin: "wuhan", isHot: true },
  { name: "南京", slug: "nanjing", pinyin: "nanjing", isHot: true },
  { name: "西安", slug: "xian", pinyin: "xian", isHot: true },
  { name: "重庆", slug: "chongqing", pinyin: "chongqing", isHot: true },
  { name: "苏州", slug: "suzhou", pinyin: "suzhou", isHot: true },
  { name: "天津", slug: "tianjin", pinyin: "tianjin", isHot: true },
  { name: "长沙", slug: "changsha", pinyin: "changsha", isHot: true },
  { name: "东莞", slug: "dongguan", pinyin: "dongguan", isHot: true },
  { name: "宁波", slug: "ningbo", pinyin: "ningbo", isHot: true },
  { name: "佛山", slug: "foshan", pinyin: "foshan", isHot: true },
  { name: "合肥", slug: "hefei", pinyin: "hefei", isHot: true },
  { name: "青岛", slug: "qingdao", pinyin: "qingdao", isHot: true },
  { name: "沈阳", slug: "shenyang", pinyin: "shenyang", isHot: true },
  { name: "郑州", slug: "zhengzhou", pinyin: "zhengzhou", isHot: true },
];

// 兜底的全国主要三四线城市列表 (用于模糊搜索匹配)
export const ALL_CITIES: City[] = [
  ...HOT_CITIES,
  { name: "无锡", slug: "wuxi", pinyin: "wuxi" },
  { name: "徐州", slug: "xuzhou", pinyin: "xuzhou" },
  { name: "常州", slug: "changzhou", pinyin: "changzhou" },
  { name: "南通", slug: "nantong", pinyin: "nantong" },
  { name: "温州", slug: "wenzhou", pinyin: "wenzhou" },
  { name: "绍兴", slug: "shaoxing", pinyin: "shaoxing" },
  { name: "嘉兴", slug: "jiaxing", pinyin: "jiaxing" },
  { name: "金华", slug: "jinhua", pinyin: "jinhua" },
  { name: "台州", slug: "taizhou", pinyin: "taizhou" },
  { name: "扬州", slug: "yangzhou", pinyin: "yangzhou" },
  { name: "泰州", slug: "taizhou-js", pinyin: "taizhou" },
  { name: "盐城", slug: "yancheng", pinyin: "yancheng" },
  { name: "临沂", slug: "linyi", pinyin: "linyi" },
  { name: "潍坊", slug: "weifang", pinyin: "weifang" },
  { name: "烟台", slug: "yantai", pinyin: "yantai" },
  { name: "济南", slug: "jinan", pinyin: "jinan" },
  { name: "泉州", slug: "quanzhou", pinyin: "quanzhou" },
  { name: "福州", slug: "fuzhou", pinyin: "fuzhou" },
  { name: "厦门", slug: "xiamen", pinyin: "xiamen" },
  { name: "南昌", slug: "nanchang", pinyin: "nanchang" },
  { name: "赣州", slug: "ganzhou", pinyin: "ganzhou" },
  { name: "九江", slug: "jiujiang", pinyin: "jiujiang" },
  { name: "石家庄", slug: "shijiazhuang", pinyin: "shijiazhuang" },
  { name: "唐山", slug: "tangshan", pinyin: "tangshan" },
  { name: "保定", slug: "baoding", pinyin: "baoding" },
  { name: "邯郸", slug: "handan", pinyin: "handan" },
  { name: "太原", slug: "taiyuan", pinyin: "taiyuan" },
  { name: "大同", slug: "datong", pinyin: "datong" },
  { name: "哈尔滨", slug: "haerbin", pinyin: "haerbin" },
  { name: "长春", slug: "changchun", pinyin: "changchun" },
  { name: "大连", slug: "dalian", pinyin: "dalian" },
  { name: "昆明", slug: "kunming", pinyin: "kunming" },
  { name: "贵阳", slug: "guiyang", pinyin: "guiyang" },
  { name: "南宁", slug: "nanning", pinyin: "nanning" },
  { name: "海口", slug: "haikou", pinyin: "haikou" },
  { name: "三亚", slug: "sanya", pinyin: "sanya" },
  { name: "兰州", slug: "lanzhou", pinyin: "lanzhou" },
  { name: "西宁", slug: "xining", pinyin: "xining" },
  { name: "银川", slug: "yinchuan", pinyin: "yinchuan" },
  { name: "乌鲁木齐", slug: "wulumuqi", pinyin: "wulumuqi" },
  { name: "呼和浩特", slug: "huhehaote", pinyin: "huhehaote" },
  { name: "包头", slug: "baotou", pinyin: "baotou" },
];

/**
 * 根据城市拼音 slug 获取城市汉字名称。
 */
export function getCityName(slug: string): string {
  const city = ALL_CITIES.find((c) => c.slug === slug);
  return city ? city.name : "未知城市";
}

/**
 * 模糊匹配城市。支持汉字和拼音前缀。
 */
export function searchCities(query: string): City[] {
  if (!query) return [];
  const cleanQuery = query.trim().toLowerCase();
  return ALL_CITIES.filter(
    (c) =>
      c.name.includes(cleanQuery) ||
      c.pinyin.startsWith(cleanQuery) ||
      c.slug.startsWith(cleanQuery)
  );
}
