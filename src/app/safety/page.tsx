import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "安全须知 — Restored",
  description: "Restored 平台交易安全须知与注意事项。",
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block text-[13px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-10 transition-colors"
        >
          &larr; 返回首页
        </Link>

        <h1 className="font-headline font-bold text-4xl tracking-tight mb-6">安全须知</h1>

        <div className="space-y-6 text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            为保障您的交易安全，请务必遵循以下建议。
          </p>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">交易安全</h2>
          <ul className="space-y-3 list-none pl-0">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>建议通过双方实名认证后再进行交易</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>优先使用平台内消息系统沟通，保留聊天记录</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>避免在未确认商品状况前预付全款</span>
            </li>
          </ul>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">搬运安全</h2>
          <ul className="space-y-3 list-none pl-0">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>建议使用楼宇电梯进行搬运，避免楼梯磕碰</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>大型床垫搬运建议两人以上协作</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2.5 shrink-0" />
              <span>可选择在小区保安处等开阔场合进行无接触交接</span>
            </li>
          </ul>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">卫生检查</h2>
          <p>
            收到床垫后，请在 15 天审核期内仔细检查床垫的卫生状况。如发现任何未披露的问题，
            请立即通过平台消息系统联系卖家并申请退货。
          </p>
        </div>
      </div>
    </div>
  );
}
