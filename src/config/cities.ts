import pc from "china-division/dist/pc.json";
import { pinyin } from "pinyin-pro";

export interface City {
  name: string;
  slug: string;
  pinyin: string;
  isHot?: boolean;
  districtLabel?: string;
}

// 直辖市列表（在 china-division 的 pc key 中）
const MUNICIPALITIES = new Set(["北京市", "天津市", "上海市", "重庆市"]);

// 中国少数民族名称，用于从自治州全称中提取地名前缀
const ETHNIC_GROUPS =
  "蒙古族|回族|藏族|维吾尔族|苗族|彝族|壮族|布依族|朝鲜族|满族|侗族|瑶族|白族|土家族|哈尼族|哈萨克族|傣族|黎族|傈僳族|佤族|畲族|高山族|拉祜族|水族|东乡族|纳西族|景颇族|柯尔克孜族|土族|达斡尔族|仫佬族|羌族|布朗族|撒拉族|毛南族|仡佬族|锡伯族|阿昌族|普米族|塔吉克族|怒族|乌孜别克族|俄罗斯族|鄂温克族|德昂族|保安族|裕固族|京族|塔塔尔族|独龙族|鄂伦春族|赫哲族|门巴族|珞巴族|基诺族";

// 同名城市 slug 冲突处理（拼音相同但不同省份）
const SLUG_OVERRIDES: Record<string, string> = {
  "宿州市": "suzhou-ah",
  "抚州市": "fuzhou-jx",
  "泰州市": "taizhou-js",
  "伊春市": "yichun-hlj",
  "玉林市": "yulin-gx",
};

function generateSlug(rawName: string): string {
  // 显式覆盖同名城市冲突
  if (SLUG_OVERRIDES[rawName]) return SLUG_OVERRIDES[rawName];

  // 1. 去掉行政区划后缀
  let base = rawName
    .replace(/自治州$/, "")
    .replace(/地区$/, "")
    .replace(/盟$/, "")
    .replace(/市$/, "");

  // 2. 自治州去掉民族后缀，保留地名前缀（如 "黔南布依族苗族" → "黔南"）
  const ethnicRegex = new RegExp(`^(.+?)(?:${ETHNIC_GROUPS})`);
  const match = base.match(ethnicRegex);
  if (match) base = match[1];

  // 3. 转拼音并清理
  const py = pinyin(base, { toneType: "none", type: "array" })
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return py || rawName;
}

function generatePinyin(name: string): string {
  return pinyin(name.replace(/[市州区盟县]$/, ""), { toneType: "none", type: "array" })
    .join("")
    .toLowerCase();
}

/**
 * 从 china-division 生成全国城市列表。
 * 覆盖直辖市、地级市、自治州、盟、地区。
 */
function generateCitiesFromDatabase(): City[] {
  const cities: City[] = [];

  Object.entries(pc).forEach(([provinceName, cityNames]) => {
    if (MUNICIPALITIES.has(provinceName)) {
      // 直辖市：省份名即城市名
      const name = provinceName.replace(/市$/, "");
      const slug = generateSlug(provinceName);
      cities.push({ name, slug, pinyin: slug });
      return;
    }

    cityNames.forEach((rawName) => {
      // 过滤县、区、市辖区等县级/区级单位
      if (/^(县|区|市辖区)$/.test(rawName)) return;
      if (!/(市|州|盟|地区)$/.test(rawName)) return;

      const name = rawName.replace(/市$/, "");
      const slug = generateSlug(rawName);
      const py = generatePinyin(rawName);

      // 避免空 slug
      if (!slug) return;

      cities.push({ name, slug, pinyin: py });
    });
  });

  return cities;
}

// 热门城市（保留人工维护的 districtLabel 与运营属性）
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

// 兜底城市：china-division 全国城市数据 + 热门城市覆盖
const DB_CITIES = generateCitiesFromDatabase();
const HOT_CITY_SLUGS = new Set(HOT_CITIES.map((c) => c.slug));

export const ALL_CITIES: City[] = [
  ...HOT_CITIES,
  ...DB_CITIES.filter((c) => !HOT_CITY_SLUGS.has(c.slug)),
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
 */
export const CITY_GROUPS: { name: string; cities: City[] }[] = [
  {
    name: "华北",
    cities: ALL_CITIES.filter((c) =>
      ["beijing", "tianjin", "shijiazhuang", "tangshan", "qinhuangdao", "baoding", "handan", "xingtai", "zhangjiakou", "chengde", "cangzhou", "langfang", "hengshui", "taiyuan", "datong", "yangquan", "changzhi", "jincheng", "shuozhou", "jinzhong", "yuncheng", "xinzhou", "linfen", "lvliang", "huhehaote", "baotou", "wuhai", "chifeng", "tongliao", "eerduosi", "hulunbeier", "bayannaoer", "wulanchabu"].includes(c.slug)
    ),
  },
  {
    name: "华东",
    cities: ALL_CITIES.filter((c) =>
      ["shanghai", "hangzhou", "nanjing", "suzhou", "ningbo", "wuxi", "xuzhou", "changzhou", "nantong", "lianyungang", "huaian", "yancheng", "yangzhou", "zhenjiang", "taizhou-js", "suqian", "wenzhou", "shaoxing", "jiaxing", "huzhou", "jinhua", "taizhou", "quzhou", "zhoushan", "lishui", "hefei", "wuhu", "bengbu", "huainan", "maanshan", "huaibei", "tongling", "anqing", "huangshan", "chuzhou", "fuyang", "suzhou-ah", "luan", "bozhou", "chizhou", "xuancheng", "fuzhou", "xiamen", "putian", "sanming", "quanzhou", "zhangzhou", "nanping", "longyan", "ningde", "nanchang", "jingdezhen", "pingxiang", "jiujiang", "xinyu", "yingtan", "ganzhou", "jian", "yichun", "fuzhou-jx", "shangrao"].includes(c.slug)
    ),
  },
  {
    name: "华南",
    cities: ALL_CITIES.filter((c) =>
      ["guangzhou", "shenzhen", "foshan", "dongguan", "shaoguan", "zhuhai", "shantou", "jiangmen", "zhanjiang", "maoming", "zhaoqing", "huizhou", "meizhou", "shanwei", "heyuan", "yangjiang", "qingyuan", "zhongshan", "chaozhou", "jieyang", "yunfu", "nanning", "liuzhou", "guilin", "wuzhou", "beihai", "fangchenggang", "qinzhou", "guigang", "yulin-gx", "baise", "hezhou", "hechi", "laibin", "chongzuo", "haikou", "sanya", "sansha", "danzhou"].includes(c.slug)
    ),
  },
  {
    name: "华中",
    cities: ALL_CITIES.filter((c) =>
      ["wuhan", "huangshi", "shiyan", "yichang", "xiangyang", "ezhou", "jingmen", "xiaogan", "jingzhou", "huanggang", "xianning", "suizhou", "enshi", "xiangtan", "zhuzhou", "hengyang", "shaoyang", "yueyang", "changde", "zhangjiajie", "yiyang", "chenzhou", "yongzhou", "huaihua", "loudi", "xiangxi", "zhengzhou", "kaifeng", "luoyang", "pingdingshan", "anyang", "hebi", "xinxiang", "jiaozuo", "puyang", "xuchang", "luohe", "sanmenxia", "nanyang", "shangqiu", "xinyang", "zhoukou", "zhumadian", "jiyuan"].includes(c.slug)
    ),
  },
  {
    name: "西南",
    cities: ALL_CITIES.filter((c) =>
      ["chengdu", "zigong", "panzhihua", "luzhou", "deyang", "mianyang", "guangyuan", "suining", "neijiang", "leshan", "nanchong", "meishan", "yibin", "guangan", "dazhou", "yaan", "bazhong", "ziyang", "aba", "ganzi", "liangshan", "chongqing", "kunming", "qujing", "yuxi", "baoshan", "zhaotong", "lijiang", "puer", "lincang", "chuxiong", "honghe", "wenshan", "xishuangbanna", "dali", "dehong", "nujiang", "diqing", "guiyang", "zunyi", "liupanshui", "anshun", "bijie", "tongren", "qianxinan", "qiandongnan", "qiannan", "lasa", "rikaze", "changdu", "linzhi", "shannan", "naqu", "ali"].includes(c.slug)
    ),
  },
  {
    name: "西北",
    cities: ALL_CITIES.filter((c) =>
      ["xian", "tongchuan", "baoji", "xianyang", "weinan", "yanan", "hanzhong", "yulin", "ankang", "shangluo", "lanzhou", "jiayuguan", "jinchang", "baiyin", "tianshui", "wuwei", "zhangye", "pingliang", "jiuquan", "qingyang", "dingxi", "longnan", "linxia", "gannan", "xining", "haidong", "haibei", "huangnan", "hainan-qh", "guoluo", "yushu", "haixi", "yinchuan", "shizuishan", "wuzhong", "guyuan", "zhongwei", "wulumuqi", "kelamayi", "tulufan", "hami", "changji", "boertala", "bayinguoleng", "akesu", "kezileisu", "kashi", "hetian", "yili", "tacheng", "aletai"].includes(c.slug)
    ),
  },
  {
    name: "东北",
    cities: ALL_CITIES.filter((c) =>
      ["shenyang", "dalian", "anshan", "fushun", "benxi", "dandong", "jinzhou", "yingkou", "fuxin", "liaoyang", "panjin", "tieling", "chaoyang", "huludao", "changchun", "jilin", "siping", "liaoyuan", "tonghua", "baishan", "songyuan", "baicheng", "yanbian", "haerbin", "qiqihaer", "jixi", "hegang", "shuangyashan", "daqing", "yichun-hlj", "jiamusi", "qitaihe", "mudanjiang", "heihe", "suihua", "daxinganling"].includes(c.slug)
    ),
  },
];
