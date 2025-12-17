# 子供会管理アプリ (Kodomokai Management App)

子供会の運営効率化を目的としたWebアプリケーションです。会員名簿の管理、役員選出、イベント企画、お知らせ配信などの機能を一元管理します。

## 機能概要

*   **会員管理**: 名簿の登録・編集・検索（年度ごとの履歴管理）
*   **役員・役職管理**: 役員の任命、任期管理、引き継ぎ
*   **イベント管理**: 行事の企画、出欠確認、テンプレート作成
*   **お知らせ配信**: 会員向けメール/LINE配信（予定）
*   **役員ダッシュボード**: 運営状況の可視化

## 技術スタック

*   **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
*   **Backend**: Supabase (PostgreSQL, Auth, Storage)
*   **Package Manager**: pnpm (Workspace configuration)

## ディレクトリ構成

```
.
├── frontend/       # Next.js アプリケーション本体
├── backend/        # Supabase 関連 (Mygrations, Seeds 等)
├── doc/            # ドキュメント、仕様書、素材
└── package.json    # Workspace 設定
```

## セットアップ手順

### 前提条件
*   Node.js (LTS recommended)
*   pnpm

### インドール

プロジェクトルートで依存関係をインストールします。

```bash
pnpm install
```

### 環境変数設定

ルートディレクトリおよび `frontend` ディレクトリに必要な環境変数を設定してください。
（`.env.example` を参考に `.env` を作成）

### 開発サーバー起動

ルートディレクトリで以下のコマンドを実行すると、フロントエンドの開発サーバーが起動します。

```bash
pnpm dev
```

アクセス: [http://localhost:3000](http://localhost:3000)

## ライセンス

Privatue / Proprietary
