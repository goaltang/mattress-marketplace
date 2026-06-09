export interface Mattress {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  size: number; // 1.2 | 1.5 | 1.8 | 2.0
  type: "latex" | "coco" | "spring" | "memory"; // 乳胶, 椰棕, 弹簧, 记忆棉
  city: string; // beijing, shanghai ...
  imageUrl: string;
  condition: string; // 99新, 95新, 90新, 85新
  distance: string; // "0.8km", "1.5km" 等
  sellerName: string;
  description: string;
}

export const MOCK_MATTRESSES: Mattress[] = [
  {
    id: "1",
    title: "【九成新】喜临门 1.8米 天然乳胶独立袋装弹簧床垫",
    price: 680,
    originalPrice: 3299,
    size: 1.8,
    type: "latex",
    city: "beijing",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=60",
    condition: "95新",
    distance: "1.2km",
    sellerName: "李先生",
    description: "搬家低价转让，喜临门正品，买来不到一年，一直套着床笠保护，非常干净，无任何塌陷污渍，乳胶+独立弹簧，静音效果特别好。需要自提。"
  },
  {
    id: "2",
    title: "宜家 1.5米 记忆棉舒享床垫，软硬适中",
    price: 350,
    originalPrice: 1699,
    size: 1.5,
    type: "memory",
    city: "beijing",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60",
    condition: "90新",
    distance: "2.5km",
    sellerName: "王女士",
    description: "放在客房的床垫，基本没人睡过。软硬适中，贴合度极佳，护脊椎。因为客房要改成书房，所以低价处理，回龙观自提。"
  },
  {
    id: "3",
    title: "【全椰棕】顾家家居 1.8米 护脊偏硬椰棕床垫",
    price: 590,
    originalPrice: 2800,
    size: 1.8,
    type: "coco",
    city: "beijing",
    imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=60",
    condition: "99新",
    distance: "0.5km",
    sellerName: "张老师",
    description: "买给老人的，老人嫌买薄了，只睡了两个星期就换了。非常硬实，适合腰椎不好的人或者青少年使用。跟全新的一模一样，无折损。"
  },
  {
    id: "4",
    title: "雅兰 1.2米 弹簧床垫，单人自提超划算",
    price: 180,
    originalPrice: 999,
    size: 1.2,
    type: "spring",
    city: "beijing",
    imageUrl: "https://images.unsplash.com/photo-1505693395321-883724634266?w=600&auto=format&fit=crop&q=60",
    condition: "85新",
    distance: "4.1km",
    sellerName: "刘同学",
    description: "毕业租房留下的，现在工作搬家带不走，便宜处理。床垫弹性依然很好，无塌陷。仅限本周末前自提。"
  },
  // 上海数据
  {
    id: "5",
    title: "【99新】慕思 1.8米 奢华乳胶静音弹簧床垫",
    price: 1200,
    originalPrice: 5888,
    size: 1.8,
    type: "latex",
    city: "shanghai",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=60",
    condition: "99新",
    distance: "1.8km",
    sellerName: "赵先生",
    description: "高档奢华款，慕思专柜正品。由于置换更大的床，现低价转手这块床垫。乳胶层很厚，睡感极度舒适。陆家嘴附近自提。"
  },
  {
    id: "6",
    title: "大自然 1.5米 环保山棕床垫，安全无甲醛",
    price: 480,
    originalPrice: 2400,
    size: 1.5,
    type: "coco",
    city: "shanghai",
    imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=60",
    condition: "90新",
    distance: "3.2km",
    sellerName: "周阿姨",
    description: "纯天然山棕，不含胶水甲醛。给孩子用的，现在孩子去外地读大学了，房间整理出来低价卖。保养得很好，有需要的联系。"
  },
  // 广州数据
  {
    id: "7",
    title: "【95新】金可儿 2.0米 超大双人深睡乳胶床垫",
    price: 1500,
    originalPrice: 7999,
    size: 2.0,
    type: "latex",
    city: "guangzhou",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60",
    condition: "95新",
    distance: "0.9km",
    sellerName: "钱先生",
    description: "金可儿经典深睡系列，宽2米长2.2米。睡感绝佳，五星级酒店同款。买的时候接近八千，现在换房低价抛售。天河区自提。"
  }
];

export function getFilteredMattresses(city: string, filters: { size?: number; type?: string }): Mattress[] {
  return MOCK_MATTRESSES.filter((m) => {
    // 城市匹配
    if (m.city !== city) return false;
    // 尺寸匹配
    if (filters.size && m.size !== filters.size) return false;
    // 材质匹配
    if (filters.type && m.type !== filters.type) return false;
    return true;
  });
}
