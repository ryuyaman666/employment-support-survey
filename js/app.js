// API エンドポイント
const API_ENDPOINT = 'https://YOUR_WORKER_NAME.YOUR_SUBDOMAIN.workers.dev';

// 施設名をURLパラメータから取得
let facilityName = '';

window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    facilityName = urlParams.get('facility') || '未設定';
    console.log('施設名:', facilityName);
});

// ページ遷移関数
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

// 前の利用歴フィールドの表示切り替え
function togglePreviousFacilityFields() {
    const usage = document.getElementById('previous-support-usage').value;
    const fields = document.getElementById('previous-facility-fields');
    fields.style.display = usage === 'あり' ? 'block' : 'none';
}

// 就労歴フィールドの表示切り替え
function toggleEmploymentFields() {
    const experience = document.getElementById('general-employment-experience').value;
    const fields = document.getElementById('employment-fields');
    fields.style.display = experience === 'あり' ? 'block' : 'none';
}

// 進捗バーの更新
function updateProgressBar() {
    const form = document.getElementById('survey-form');
    const requiredFields = form.querySelectorAll('[required]');
    let filledCount = 0;
    
    requiredFields.forEach(field => {
        if (field.type === 'checkbox' || field.type === 'radio') {
            const name = field.name;
            const checked = form.querySelector(`[name="${name}"]:checked`);
            if (checked) filledCount++;
        } else if (field.value.trim() !== '') {
            filledCount++;
        }
    });
    
    const progress = Math.round((filledCount / requiredFields.length) * 100);
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('progress-percentage').textContent = progress + '%';
}

// フォーム送信
document.getElementById('survey-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {
        facility_name: facilityName,
        full_name: formData.get('full-name'),
        furigana: formData.get('furigana'),
        age: parseInt(formData.get('age')),
        phone: formData.get('phone'),
        email: formData.get('email') || '',
        residence_area: formData.get('residence-area'),
        emergency_contact: formData.get('emergency-contact') || '',
        disability_type: formData.getAll('disability-type').join(', ') + (formData.get('disability-type-other') ? ' (' + formData.get('disability-type-other') + ')' : ''),
        disability_handbook: formData.get('disability-handbook'),
        support_classification: formData.get('support-classification'),
        previous_support_usage: formData.get('previous-support-usage'),
        previous_facility_name: formData.get('previous-facility-name') || '',
        previous_usage_period: formData.get('previous-usage-period') || '',
        general_employment_experience: formData.get('general-employment-experience') + (formData.get('employment-details') ? ' (' + formData.get('employment-details') + ')' : ''),
        living_situation: formData.get('living-situation'),
        health_considerations: formData.get('health-considerations') || '',
        medical_visits: formData.getAll('medical-visits').join(', '),
        daily_rhythm: formData.getAll('daily-rhythm').join(', '),
        desired_work_frequency: formData.get('desired-work-frequency'),
        desired_work_hours: formData.get('desired-work-hours'),
        work_style_preference: formData.get('work-style-preference'),
        interested_work: formData.getAll('interested-work').join(', ') + (formData.get('interested-work-other') ? ' (' + formData.get('interested-work-other') + ')' : ''),
        strengths: formData.get('strengths') || '',
        weaknesses: formData.get('weaknesses') || '',
        usage_purpose: formData.getAll('usage-purpose').join(', '),
        interview_support_interest: formData.get('interview-support-interest'),
        communication_preference: formData.getAll('communication-preference').join(', '),
        support_notes: formData.get('support-notes') || '',
        trial_visit_interest: formData.get('trial-visit-interest'),
        additional_comments: formData.get('additional-comments') || '',
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_ENDPOINT}/api/consultations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showPage('complete-page');
        } else {
            alert('送信に失敗しました。もう一度お試しください。');
        }
    } catch (error) {
        console.error('送信エラー:', error);
        alert('送信に失敗しました。ネットワーク接続を確認してください。');
    }
});

// フォーム入力時に進捗バーを更新
document.getElementById('survey-form').addEventListener('input', updateProgressBar);
document.getElementById('survey-form').addEventListener('change', updateProgressBar);

// 初期読み込み時に進捗バーを更新
updateProgressBar();
