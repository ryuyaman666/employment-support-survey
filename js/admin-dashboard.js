// API エンドポイント
const API_ENDPOINT = 'https://YOUR_WORKER_NAME.YOUR_SUBDOMAIN.workers.dev';

let allData = [];
let facilityName = '';

// ログイン処理
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    facilityName = document.getElementById('facility-name').value;
    const password = document.getElementById('password').value;
    
    // 簡易認証（実際にはサーバー側で検証すべき）
    if (password === 'admin123') {  // ⚠️ 本番環境では必ず変更してください
        await loadDashboard();
    } else {
        alert('パスワードが正しくありません');
    }
});

// ダッシュボード読み込み
async function loadDashboard() {
    try {
        const response = await fetch(`${API_ENDPOINT}/api/consultations?facility=${facilityName}`);
        allData = await response.json();
        
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('dashboard-page').classList.add('active');
        
        updateStatistics();
        drawCharts();
        displayDataTable();
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        alert('データの読み込みに失敗しました');
    }
}

// 統計情報の更新
function updateStatistics() {
    document.getElementById('total-count').textContent = allData.length;
    
    const currentMonth = new Date().getMonth();
    const monthlyData = allData.filter(d => new Date(d.timestamp).getMonth() === currentMonth);
    document.getElementById('monthly-count').textContent = monthlyData.length;
    
    const visitInterest = allData.filter(d => d.trial_visit_interest === 'すぐにしたい').length;
    document.getElementById('visit-interest-count').textContent = visitInterest;
}

// グラフ描画
function drawCharts() {
    // 障害区分別グラフ
    const disabilityCount = {};
    allData.forEach(d => {
        const types = d.disability_type.split(', ');
        types.forEach(type => {
            const cleanType = type.replace(/\(.*?\)/g, '').trim();
            disabilityCount[cleanType] = (disabilityCount[cleanType] || 0) + 1;
        });
    });
    
    new Chart(document.getElementById('disability-chart'), {
        type: 'pie',
        data: {
            labels: Object.keys(disabilityCount),
            datasets: [{
                data: Object.values(disabilityCount),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        }
    });
    
    // 利用目的別グラフ
    const purposeCount = {};
    allData.forEach(d => {
        const purposes = d.usage_purpose.split(', ');
        purposes.forEach(purpose => {
            purposeCount[purpose] = (purposeCount[purpose] || 0) + 1;
        });
    });
    
    new Chart(document.getElementById('purpose-chart'), {
        type: 'bar',
        data: {
            labels: Object.keys(purposeCount),
            datasets: [{
                label: '人数',
                data: Object.values(purposeCount),
                backgroundColor: '#5DADE2'
            }]
        },
        options: {
            indexAxis: 'y'
        }
    });
}

// データテーブル表示
function displayDataTable(filteredData = allData) {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';
    
    filteredData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.full_name}</td>
            <td>${row.age}</td>
            <td>${row.disability_type}</td>
            <td>${row.usage_purpose}</td>
            <td>${row.trial_visit_interest}</td>
            <td>${new Date(row.timestamp).toLocaleDateString('ja-JP')}</td>
            <td><button class="btn-small" onclick="showDetail(${row.id})">詳細</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// フィルタリング
function filterData() {
    const searchText = document.getElementById('search-box').value.toLowerCase();
    const disabilityFilter = document.getElementById('disability-filter').value;
    
    let filtered = allData;
    
    if (searchText) {
        filtered = filtered.filter(d => d.full_name.toLowerCase().includes(searchText));
    }
    
    if (disabilityFilter) {
        filtered = filtered.filter(d => d.disability_type.includes(disabilityFilter));
    }
    
    displayDataTable(filtered);
}

// 詳細表示
function showDetail(id) {
    const data = allData.find(d => d.id === id);
    if (!data) return;
    
    const content = document.getElementById('detail-content');
    content.innerHTML = `
        <h2>${data.full_name}さんの詳細情報</h2>
        <div class="detail-section">
            <h3>基本情報</h3>
            <p><strong>フリガナ:</strong> ${data.furigana}</p>
            <p><strong>年齢:</strong> ${data.age}歳</p>
            <p><strong>電話:</strong> ${data.phone}</p>
            <p><strong>メール:</strong> ${data.email || '未記入'}</p>
            <p><strong>居住地域:</strong> ${data.residence_area}</p>
            <p><strong>緊急連絡先:</strong> ${data.emergency_contact || '未記入'}</p>
        </div>
        
        <div class="detail-section">
            <h3>障害・手帳・支援状況</h3>
            <p><strong>障害区分:</strong> ${data.disability_type}</p>
            <p><strong>障害者手帳:</strong> ${data.disability_handbook}</p>
            <p><strong>支援区分:</strong> ${data.support_classification}</p>
        </div>
        
        <div class="detail-section">
            <h3>利用歴・就労歴</h3>
            <p><strong>以前の利用:</strong> ${data.previous_support_usage}</p>
            <p><strong>事業所名:</strong> ${data.previous_facility_name || '未記入'}</p>
            <p><strong>利用期間:</strong> ${data.previous_usage_period || '未記入'}</p>
            <p><strong>一般就労経験:</strong> ${data.general_employment_experience}</p>
        </div>
        
        <div class="detail-section">
            <h3>生活・体調リズム</h3>
            <p><strong>生活状況:</strong> ${data.living_situation}</p>
            <p><strong>配慮事項:</strong> ${data.health_considerations || '未記入'}</p>
            <p><strong>通院・服薬:</strong> ${data.medical_visits}</p>
            <p><strong>生活リズム:</strong> ${data.daily_rhythm}</p>
        </div>
        
        <div class="detail-section">
            <h3>働き方の希望</h3>
            <p><strong>勤務頻度:</strong> ${data.desired_work_frequency}</p>
            <p><strong>作業時間:</strong> ${data.desired_work_hours}</p>
            <p><strong>通所/在宅:</strong> ${data.work_style_preference}</p>
        </div>
        
        <div class="detail-section">
            <h3>興味・得意分野</h3>
            <p><strong>興味のある作業:</strong> ${data.interested_work}</p>
            <p><strong>得意なこと:</strong> ${data.strengths || '未記入'}</p>
            <p><strong>苦手なこと:</strong> ${data.weaknesses || '未記入'}</p>
        </div>
        
        <div class="detail-section">
            <h3>目的・ゴール</h3>
            <p><strong>利用目的:</strong> ${data.usage_purpose}</p>
            <p><strong>面接サポート:</strong> ${data.interview_support_interest}</p>
        </div>
        
        <div class="detail-section">
            <h3>コミュニケーション</h3>
            <p><strong>人との関わり:</strong> ${data.communication_preference}</p>
            <p><strong>支援員への伝達事項:</strong> ${data.support_notes || '未記入'}</p>
        </div>
        
        <div class="detail-section">
            <h3>最後の確認</h3>
            <p><strong>見学希望:</strong> ${data.trial_visit_interest}</p>
            <p><strong>その他:</strong> ${data.additional_comments || '未記入'}</p>
        </div>
        
        <p><strong>登録日時:</strong> ${new Date(data.timestamp).toLocaleString('ja-JP')}</p>
    `;
    
    document.getElementById('detail-modal').style.display = 'block';
}

// モーダルを閉じる
function closeDetailModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

// PDFエクスポート（実装例）
function exportPDF() {
    alert('PDF機能は実装中です');
    // jsPDFなどのライブラリを使って実装
}

// ログアウト
function logout() {
    document.getElementById('dashboard-page').classList.remove('active');
    document.getElementById('login-page').classList.add('active');
    document.getElementById('login-form').reset();
}
