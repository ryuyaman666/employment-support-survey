-- 事前問診データテーブル
CREATE TABLE IF NOT EXISTS pre_consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_name TEXT NOT NULL,
    -- 基本情報
    full_name TEXT NOT NULL,
    furigana TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    email TEXT,
    residence_area TEXT,
    emergency_contact TEXT,
    -- 障害・手帳・支援状況
    disability_type TEXT,
    disability_handbook TEXT,
    support_classification TEXT,
    -- 利用歴・就労歴
    previous_support_usage TEXT,
    previous_facility_name TEXT,
    previous_usage_period TEXT,
    general_employment_experience TEXT,
    -- 現在の生活・体調リズム
    living_situation TEXT,
    health_considerations TEXT,
    medical_visits TEXT,
    daily_rhythm TEXT,
    -- 働き方の希望
    desired_work_frequency TEXT,
    desired_work_hours TEXT,
    work_style_preference TEXT,
    -- やってみたい仕事・得意なこと
    interested_work TEXT,
    strengths TEXT,
    weaknesses TEXT,
    -- 目的・ゴール
    usage_purpose TEXT,
    interview_support_interest TEXT,
    -- コミュニケーション・配慮
    communication_preference TEXT,
    support_notes TEXT,
    -- 最後の確認
    trial_visit_interest TEXT,
    additional_comments TEXT,
    -- メタデータ
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_facility_name ON pre_consultations(facility_name);
CREATE INDEX IF NOT EXISTS idx_timestamp ON pre_consultations(timestamp);
CREATE INDEX IF NOT EXISTS idx_disability_type ON pre_consultations(disability_type);
```

データベースに適用：

```bash
wrangler d1 execute employment-support-db --file=schema.sql
```
