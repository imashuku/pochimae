import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜ダレウリ",
  description:
    "ダレウリ（Amazon販売元チェックツール）のプライバシーポリシー。貼り付けた販売元情報や商品URLをサーバーに保存しない設計と、電話番号のマスク・匿名化した特徴量のみをAIに渡す仕組みについて説明します。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full px-5 py-12">
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-primary-active mb-3">
            PRIVACY POLICY
          </p>
          <h1 className="font-bold text-2xl text-ink mb-2">
            プライバシーポリシー
          </h1>
          <p className="text-sm text-muted mb-10">最終更新日: 2026年7月10日</p>

          <div className="space-y-8 text-sm text-body leading-relaxed">
            <section>
              <p>
                ステップアウトマーケティング合同会社（以下「当社」）は、当社が提供するウェブサービス「ダレウリ」（https://dareuri.app、以下「本サービス」）およびChrome拡張機能「ダレウリ
                — Amazon販売元チェック」（以下「本拡張機能」）における利用者情報の取り扱いを、以下のとおり定めます。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                1. 収集しない情報
              </h2>
              <p className="mb-3">
                本サービスおよび本拡張機能は、利用者を個人として識別できる情報を収集しません。具体的には、以下のいずれも収集・保存・第三者提供を行いません。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>氏名、メールアドレス、住所、電話番号などの個人情報</li>
                <li>認証情報（ID・パスワード等）</li>
                <li>閲覧履歴、検索履歴、位置情報</li>
                <li>利用者を継続的に識別するための識別子</li>
              </ul>
              <p className="mt-3">
                本サービスは利用登録を必要とせず、データベースを持ちません。本拡張機能は、ブラウザのストレージを一切使用しません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                2. 販売元情報の取り扱い
              </h2>
              <p className="mb-3">
                本サービスは、利用者が入力・貼り付けた販売元情報（Amazonの商品ページおよび販売元プロフィールに公開されている事業者情報）を、確認レベルの判定のためにサーバー上で一時的に処理します。処理結果は返信後に破棄され、サーバーに保存されることはありません。
              </p>
              <p className="mb-3">
                本拡張機能は、利用者がツールバーのアイコンをクリックした時点でのみ、表示中のAmazon商品ページから販売元情報を読み取ります。読み取った情報は本サービスをURLフラグメント（URLの「#」以降）で開くために使用します。URLフラグメントはブラウザの仕様上サーバーへ送信されないため、商品URLがサーバーのログに記録されることはありません。
              </p>
              <p>
                貼り付けられたテキストに電話番号と推定される文字列が含まれる場合、判定処理の前にブラウザ内で自動的にマスクされ、サーバーに送信されません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                3. 外部サービスの利用
              </h2>
              <p>
                本サービスは、判定結果に添える講評文の生成のためAnthropic社のClaude
                APIを利用します。同APIには、国名・表記の種別・判定結果といった匿名化された特徴量のみを送信します。事業者名、個人名、住所、電話番号、商品URL、販売元の識別子を送信することはありません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                4. アクセス情報
              </h2>
              <p>
                本サービスはホスティング事業者であるVercel
                Inc.のインフラ上で提供されており、同社によりIPアドレス等のアクセスログが記録される場合があります。これらはサービスの安定運用および不正利用防止のために利用され、当社が個人の特定に用いることはありません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                5. Cookie等
              </h2>
              <p>
                本サービスおよび本拡張機能は、広告配信・行動追跡を目的としたCookieやトラッキング技術を使用しません。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                6. 本ポリシーの変更
              </h2>
              <p>
                本ポリシーを変更する場合は、本ページに変更後の内容を掲載します。
              </p>
            </section>

            <section>
              <h2 className="font-bold text-lg text-ink mb-3">
                7. お問い合わせ
              </h2>
              <p>
                ステップアウトマーケティング合同会社
                <br />
                メール: hiroaki.imashuku@step-out.jp
              </p>
            </section>
          </div>

          <p className="mt-12">
            <Link
              href="/"
              className="text-sm text-primary-active hover:text-ink transition-colors"
            >
              ← ダレウリに戻る
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
