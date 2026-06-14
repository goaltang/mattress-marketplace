export interface City {
  name: string;
  slug: string;
  pinyin: string;
  isHot?: boolean;
  districtLabel?: string;
}

// 热门城市 (20 个)
export const HOT_CITIES: City[] = [
  { name: "北京", slug: "beijing", pinyin: "beijing", isHot: true, districtLabel: "朝阳与海淀" },
  { name: "上海", slug: "shanghai", pinyin: "shanghai", isHot: true, districtLabel: "浦东与静安" },
  { name: "广州", slug: "guangzhou", pinyin: "guangzhou", isHot: true, districtLabel: "天河与番禺" },
  { name: "深圳", slug: "shenzhen", pinyin: "shenzhen", isHot: true, districtLabel: "南山与福田" },
  { name: "杭州", slug: "hangzhou", pinyin: "hangzhou", isHot: true, districtLabel: "滨江与西湖" },
  { name: "成都", slug: "chengdu", pinyin: "chengdu", isHot: true, districtLabel: "高新与锦江" },
  { name: "武汉", slug: "wuhan", pinyin: "wuhan", isHot: true, districtLabel: "武昌与汉口" },
  { name: "南京", slug: "nanjing", pinyin: "nanjing", isHot: true, districtLabel: "鼓楼与建邺" },
  { name: "西安", slug: "xian", pinyin: "xian", isHot: true, districtLabel: "雁塔与高新" },
  { name: "重庆", slug: "chongqing", pinyin: "chongqing", isHot: true, districtLabel: "渝中与江北" },
  { name: "苏州", slug: "suzhou", pinyin: "suzhou", isHot: true, districtLabel: "园区与姑苏" },
  { name: "天津", slug: "tianjin", pinyin: "tianjin", isHot: true, districtLabel: "和平与南开" },
  { name: "长沙", slug: "changsha", pinyin: "changsha", isHot: true, districtLabel: "岳麓与天心" },
  { name: "东莞", slug: "dongguan", pinyin: "dongguan", isHot: true, districtLabel: "南城与松山湖" },
  { name: "宁波", slug: "ningbo", pinyin: "ningbo", isHot: true, districtLabel: "鄞州与海曙" },
  { name: "佛山", slug: "foshan", pinyin: "foshan", isHot: true, districtLabel: "禅城与南海" },
  { name: "合肥", slug: "hefei", pinyin: "hefei", isHot: true, districtLabel: "蜀山与包河" },
  { name: "青岛", slug: "qingdao", pinyin: "qingdao", isHot: true, districtLabel: "市南与崂山" },
  { name: "沈阳", slug: "shenyang", pinyin: "shenyang", isHot: true, districtLabel: "和平与沈河" },
  { name: "郑州", slug: "zhengzhou", pinyin: "zhengzhou", isHot: true, districtLabel: "金水与二七" },
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

export function getCityInfo(slug: string): City | undefined {
  return ALL_CITIES.find((c) => c.slug === slug);
}

/**
 * 按地理大区分组的城市列表。
 * 用于城市选择器按区域浏览等未来扩展场景。
 * 注意：分组中的 City 对象与 ALL_CITIES 中为同一引用。
 */
export const CITY_GROUPS: { name: string; cities: City[] }[] = [
  {
    name: "华北",
    cities: ALL_CITIES.filter((c) =>
      ["beijing", "tianjin", "shijiazhuang", "tangshan", "baoding", "handan", "taiyuan", "datong", "huhehaote", "baotou"].includes(c.slug)
    ),
  },
  {
    name: "华东",
    cities: ALL_CITIES.filter((c) =>
      ["shanghai", "hangzhou", "nanjing", "suzhou", "ningbo", "wuxi", "xuzhou", "changzhou", "nantong", "wenzhou", "shaoxing", "jiaxing", "jinhua", "taizhou", "yangzhou", "taizhou-js", "yancheng", "jinan", "qingdao", "yantai", "weifang", "linyi", "fuzhou", "xiamen", "quanzhou", "hefei"].includes(c.slug)
    ),
  },
  {
    name: "华南",
    cities: ALL_CITIES.filter((c) =>
      ["guangzhou", "shenzhen", "foshan", "dongguan", "nanning", "haikou", "sanya"].includes(c.slug)
    ),
  },
  {
    name: "华中",
    cities: ALL_CITIES.filter((c) =>
      ["wuhan", "changsha", "zhengzhou", "nanchang", "ganzhou", "jiujiang"].includes(c.slug)
    ),
  },
  {
    name: "西南",
    cities: ALL_CITIES.filter((c) =>
      ["chengdu", "chongqing", "kunming", "guiyang"].includes(c.slug)
    ),
  },
  {
    name: "西北",
    cities: ALL_CITIES.filter((c) =>
      ["xian", "lanzhou", "xining", "yinchuan", "wulumuqi"].includes(c.slug)
    ),
  },
  {
    name: "东北",
    cities: ALL_CITIES.filter((c) =>
      ["shenyang", "dalian", "changchun", "haerbin"].includes(c.slug)
    ),
  },
];
