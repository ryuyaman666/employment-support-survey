// CORS設定
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        // OPTIONSリクエスト（プリフライト）への対応
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // 事前問診データの投稿
            if (path === '/api/consultations' && request.method === 'POST') {
                const data = await request.json();
                
                // データベースに保存
                const result = await env.DB.prepare(`
                    INSERT INTO pre_consultations (
                        facility_name, full_name, furigana, age, phone, email, 
                        residence_area, emergency_contact, disability_type, 
                        disability_handbook, support_classification, previous_support_usage,
                        previous_facility_name, previous_usage_period, general_employment_experience,
                        living_situation, health_considerations, medical_visits, daily_rhythm,
                        desired_work_frequency, desired_work_hours, work_style_preference,
                        interested_work, strengths, weaknesses, usage_purpose,
                        interview_support_interest, communication_preference, support_notes,
                        trial_visit_interest, additional_comments, timestamp, ip_address
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    data.facility_name, data.full_name, data.furigana, data.age, data.phone, 
                    data.email, data.residence_area, data.emergency_contact, data.disability_type,
                    data.disability_handbook, data.support_classification, data.previous_support_usage,
                    data.previous_facility_name, data.previous_usage_period, data.general_employment_experience,
                    data.living_situation, data.health_considerations, data.medical_visits, data.daily_rhythm,
                    data.desired_work_frequency, data.desired_work_hours, data.work_style_preference,
                    data.interested_work, data.strengths, data.weaknesses, data.usage_purpose,
                    data.interview_support_interest, data.communication_preference, data.support_notes,
                    data.trial_visit_interest, data.additional_comments, data.timestamp,
                    request.headers.get('CF-Connecting-IP')
                ).run();

                return new Response(JSON.stringify({ success: true, id: result.lastRowId }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 事前問診データの取得（管理者用）
            if (path === '/api/consultations' && request.method === 'GET') {
                const facility = url.searchParams.get('facility');
                
                const { results } = await env.DB.prepare(`
                    SELECT * FROM pre_consultations 
                    WHERE facility_name = ? 
                    ORDER BY timestamp DESC
                `).bind(facility).all();

                return new Response(JSON.stringify(results), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            return new Response('Not Found', { status: 404 });

        } catch (error) {
            console.error('エラー:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
```

---

## 🚀 デプロイ手順

### GitHub Pagesへのデプロイ

```bash
# 全ファイルをGitに追加
git add .
git commit -m "初期構築完了"
git push origin main

# GitHubリポジトリのSettings > Pagesで以下を設定:
# Source: Deploy from a branch
# Branch: main / (root)
# Save
```

公開URL: `https://YOUR_USERNAME.github.io/employment-support-survey/`

### Cloudflare Workersへのデプロイ

```bash
# Wranglerでデプロイ
wrangler deploy

# デプロイ後、表示されるURLをメモ
# 例: https://employment-support-api.YOUR_SUBDOMAIN.workers.dev
```

### APIエンドポイントの更新

`js/app.js` と `js/admin-dashboard.js` の `API_ENDPOINT` を更新：

```javascript
const API_ENDPOINT = 'https://employment-support-api.YOUR_SUBDOMAIN.workers.dev';
```

更新後、再度GitHubにプッシュ：

```bash
git add .
git commit -m "APIエンドポイント更新"
git push origin main
```

---

## 🎨 カスタマイズ方法

### 1. 施設名の設定

利用者向けURLに施設名パラメータを追加：
```
https://YOUR_USERNAME.github.io/employment-support-survey/?facility=YOUR_FACILITY_NAME
```

### 2. 質問項目の追加・削除

`index.html` のフォーム部分と、`schema.sql` のカラムを編集。

### 3. パスワード認証の強化

`js/admin-dashboard.js` のログイン処理を、Cloudflare Workers側で検証するように変更することを強く推奨します。

### 4. デザインのカスタマイズ

`css/style.css` のカラー変数を変更：
```css
:root {
    --primary-color: #5dade2;
    --secondary-color: #3498db;
    --background-color: #f5f7fa;
}
```

---

## ⚠️ セキュリティ注意事項

1. **パスワード認証の改善**: 本番環境では必ずサーバー側で検証
2. **HTTPS必須**: GitHub PagesとCloudflare Workersは自動でHTTPS対応
3. **個人情報保護**: データベースへのアクセス制限を適切に設定
4. **CORS設定**: 本番環境では特定のドメインのみ許可するよう変更

---

## 📞 サポート

このテンプレートに関する質問は、GitHubのIssuesで受け付けます。

---

## 📄 ライセンス

MIT License
