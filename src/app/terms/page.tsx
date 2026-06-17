import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "使用条款 — Restored",
  description: "Restored 平台使用条款与用户协议。",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block text-[13px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-10 transition-colors"
        >
          &larr; 返回首页
        </Link>

        <h1 className="font-headline font-bold text-4xl tracking-tight mb-6">使用条款</h1>

        <div className="space-y-6 text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            欢迎使用 Restored 平台。以下条款构成您与 Restored 之间的协议，请在使用前仔细阅读。
          </p>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">1. 平台服务</h2>
          <p>
            Restored 提供二手床垫的发布、浏览、搜索及交易撮合服务。本平台的全部床垫均需经过
            12 项卫生检查与物理清理程序，确保符合国家寝具安全规范。
          </p>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">2. 用户责任</h2>
          <p>
            发布者须确保所发布床垫信息的真实性与准确性。买家应在交易前仔细核实床垫的实际状况。
            双方应遵守同城交易的安全规范。
          </p>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">3. 卫生标准</h2>
          <p>
            所有标注「极洁净认证」的床垫均经过专业紫外真空净化处理。标注「深层清洁」的床垫
            经过标准清洁流程。具体消毒流程详见平台说明。
          </p>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">4. 交易保障</h2>
          <p>
            平台提供 15 天卫生安心审核期。如买家在审核期内发现床垫存在未披露的卫生问题，
            可申请退货退款。
          </p>

          <h2 className="font-headline font-bold text-xl text-black dark:text-white pt-4">5. 免责声明</h2>
          <p>
            Restored 作为信息撮合平台，不对交易双方的具体交易行为承担直接责任。
            建议双方通过实名认证及平台消息系统进行沟通。
          </p>
        </div>
      </div>
    </div>
  );
}
