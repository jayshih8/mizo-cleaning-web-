import React, { useState } from 'react';
import { Save, Download, RotateCcw, AlertTriangle, FileText, Info, Plus, Trash, LogOut, Rocket, Settings, CheckCircle2, XCircle, Loader } from 'lucide-react';

export default function AdminEditor({ configData, onSave, onReset, setActiveTab }) {
  const [localData, setLocalData] = useState(JSON.parse(JSON.stringify(configData)));
  const [activeSubTab, setActiveSubTab] = useState('company');
  const [toastMessage, setToastMessage] = useState('');

  // GitHub publish state
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('mizo_gh_token') || '');
  const [publishStatus, setPublishStatus] = useState('idle'); // idle | loading | success | error
  const [publishMessage, setPublishMessage] = useState('');

  // GitHub API publish function
  const handlePublish = async () => {
    if (!githubToken.trim()) {
      setPublishStatus('error');
      setPublishMessage('請先輸入 GitHub Personal Access Token！');
      return;
    }

    const OWNER = 'jayshih8';
    const REPO = 'mizo-cleaning-web-';
    const FILE_PATH = 'src/data/contentConfig.json';
    const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

    setPublishStatus('loading');
    setPublishMessage('正在連線至 GitHub…');

    try {
      // Step 1: Get current file SHA (required for update)
      const getRes = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!getRes.ok) {
        const errData = await getRes.json();
        throw new Error(errData.message || `取得檔案失敗 (${getRes.status})`);
      }

      const fileData = await getRes.json();
      const sha = fileData.sha;

      setPublishMessage('正在上傳新內容…');

      // Step 2: Encode new content as Base64
      const newContent = JSON.stringify(localData, null, 2);
      const encoded = btoa(unescape(encodeURIComponent(newContent)));

      // Step 3: Commit updated file
      const putRes = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '📝 [Admin] 更新網站內容設定',
          content: encoded,
          sha: sha,
          branch: 'main',
        }),
      });

      if (!putRes.ok) {
        const errData = await putRes.json();
        throw new Error(errData.message || `發布失敗 (${putRes.status})`);
      }

      setPublishStatus('success');
      setPublishMessage('✅ 已成功推送至 GitHub！網站將在約 2-3 分鐘後自動更新。');

      // Also save locally
      onSave(localData);

    } catch (err) {
      setPublishStatus('error');
      setPublishMessage(`❌ 發布失敗：${err.message}`);
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem('mizo_gh_token', githubToken);
    showToast('GitHub Token 已儲存至本機！');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const handleCompanyChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };

  const handleHomeChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        [field]: value
      }
    }));
  };

  // Image Upload helper to convert file to Base64
  const handleImageUpload = (fieldPath, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;

      // Deep-clone to avoid shared reference mutations with nested arrays
      const newData = JSON.parse(JSON.stringify(localData));
      let current = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = base64Data;

      setLocalData(newData);
      showToast('圖片上傳並轉換 Base64 成功！');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(localData);
    showToast('設定已套用並儲存至瀏覽器暫存！重新整理即可看到效果。');
  };

  const handleReset = () => {
    if (window.confirm('確定要還原成專案的預設設定嗎？未下載的修改將會遺失。')) {
      onReset();
      // Reload page to refresh state or let state bubble up
      showToast('已重設為專案預設值！');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "contentConfig.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('contentConfig.json 下載成功！請將此檔案複製覆蓋專案 src/data/contentConfig.json');
  };

  const getServiceDefaultImage = (id) => {
    switch (id) {
      case 'building-factory': return 'images/banner_building.png';
      case 'hotel-cleaning': return 'images/hotel.jpg';
      case 'office-cleaning': return 'images/history.jpg';
      case 'hospital-cleaning': return 'images/training.jpg';
      default: return 'images/banner_building.png';
    }
  };

  const handleAddService = () => {
    const newId = `custom-service-${Date.now()}`;
    const newService = {
      id: newId,
      title: '新增清潔服務項目',
      description: '請輸入此服務項目的詳細描述，介紹您如何提供這項專業清潔維護服務。',
      features: [
        '服務特色要點一',
        '服務特色要點二'
      ],
      image: ''
    };
    setLocalData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        items: [...prev.services.items, newService]
      }
    }));
    showToast('已新增一個服務項目！請在下方進行編輯。');
  };

  const handleDeleteService = (index) => {
    if (window.confirm('確定要刪除此服務項目嗎？此操作將會移除前台的對應分頁。')) {
      const newItems = localData.services.items.filter((_, i) => i !== index);
      setLocalData(prev => ({
        ...prev,
        services: {
          ...prev.services,
          items: newItems
        }
      }));
      showToast('已刪除服務項目！');
    }
  };

  const handleAddHistory = () => {
    const newHist = {
      year: '民國 年 (20XX 年)',
      title: '請輸入歷史事件標題',
      description: '請在此輸入該發展階段的具體大事紀或成就描述。'
    };
    setLocalData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        history: [...prev.about.history, newHist]
      }
    }));
    showToast('已新增一筆歷史沿革！');
  };

  const handleDeleteHistory = (index) => {
    if (window.confirm('確定要刪除此沿革節點嗎？')) {
      const newHistory = localData.about.history.filter((_, i) => i !== index);
      setLocalData(prev => ({
        ...prev,
        about: {
          ...prev.about,
          history: newHistory
        }
      }));
      showToast('已刪除歷史沿革！');
    }
  };

  const handleAddCert = () => {
    const newCert = {
      title: '新增專業證書/公會榮譽',
      description: '請輸入證書主管機關、核發緣由或安全標準等法規說明。',
      image: ''
    };
    setLocalData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        certs: [...prev.credentials.certs, newCert]
      }
    }));
    showToast('已新增一筆證書/榮譽！請上傳證照照片。');
  };

  const handleDeleteCert = (index) => {
    if (window.confirm('確定要刪除此證書榮譽嗎？')) {
      const newCerts = localData.credentials.certs.filter((_, i) => i !== index);
      setLocalData(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          certs: newCerts
        }
      }));
      showToast('已刪除證書項目！');
    }
  };

  return (
    <div className="admin-layout animate-fade-in">
      <div className="container">
        
        {/* Toast Notifications */}
        {toastMessage && (
          <div className="toast-container">
            <div className="toast toast-success">
              <Info size={18} />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="admin-header">
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>網站內容管理後台</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              視覺化修改全站文字與證照，匯出設定檔即可發布！
            </p>
          </div>
          <div className="admin-actions">
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn btn-outline"
              style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
              title="離開後台並回到前台網站"
            >
              <LogOut size={16} />
              <span>返回前台</span>
            </button>
            <button onClick={handleSave} className="btn btn-primary" title="套用暫存並在瀏覽器預覽">
              <Save size={16} />
              <span>即時套用</span>
            </button>
            <button onClick={handleDownload} className="btn btn-secondary" title="下載 JSON 檔案以永久替換">
              <Download size={16} />
              <span>下載設定檔</span>
            </button>
            <button onClick={handleReset} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} title="還原至專案初始預設">
              <RotateCcw size={16} />
              <span>還原預設</span>
            </button>
          </div>
        </div>

        {/* Info Instruction */}
        <div style={{ backgroundColor: 'rgba(217, 119, 6, 0.05)', borderLeft: '4px solid var(--accent-color)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '0.15rem' }} />
          <div style={{ fontSize: '0.9rem', color: '#78350f' }}>
            <strong>💡 如何讓變更永久生效？</strong><br />
            點擊「即時套用」僅會將修改暫存在您的瀏覽器中（方便直接預覽成果）。要永久保存：
            <ol style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
              <li>點擊右上角<strong>「下載設定檔」</strong>，會得到 <code>contentConfig.json</code>。</li>
              <li>將此檔案複製覆蓋專案目錄下 <strong><code>src/data/contentConfig.json</code></strong> 即可永久生效。</li>
            </ol>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="admin-container">
          
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <button
              onClick={() => setActiveSubTab('company')}
              className={`admin-nav-btn ${activeSubTab === 'company' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>公司基本資訊</span>
            </button>
            <button
              onClick={() => setActiveSubTab('home')}
              className={`admin-nav-btn ${activeSubTab === 'home' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>首頁橫幅與優勢</span>
            </button>
            <button
              onClick={() => setActiveSubTab('about')}
              className={`admin-nav-btn ${activeSubTab === 'about' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>關於我們與培訓</span>
            </button>
            <button
              onClick={() => setActiveSubTab('services')}
              className={`admin-nav-btn ${activeSubTab === 'services' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>服務項目管理</span>
            </button>
            <button
              onClick={() => setActiveSubTab('process')}
              className={`admin-nav-btn ${activeSubTab === 'process' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>施工過程管理</span>
            </button>
            <button
              onClick={() => setActiveSubTab('credentials')}
              className={`admin-nav-btn ${activeSubTab === 'credentials' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>證照與榮譽</span>
            </button>
            <button
              onClick={() => setActiveSubTab('contact')}
              className={`admin-nav-btn ${activeSubTab === 'contact' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>聯絡我們頁面</span>
            </button>

            {/* Publish Button - visually separated */}
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveSubTab('publish')}
                className={`admin-nav-btn ${activeSubTab === 'publish' ? 'active' : ''}`}
                style={{ background: activeSubTab === 'publish' ? '' : 'linear-gradient(135deg, #0f5132 0%, #146c43 100%)', color: '#fff', borderRadius: 'var(--radius-sm)' }}
              >
                <Rocket size={16} />
                <span>🚀 發布至官網</span>
              </button>
            </div>
          </aside>

          {/* Editor Content Area */}
          <main className="admin-content">

            {/* SUBTAB PUBLISH */}
            {activeSubTab === 'publish' && (
              <div>
                <h2 className="admin-section-title">🚀 發布管理：一鍵發布至公開官網</h2>

                {/* How it works */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15,81,50,0.1) 0%, rgba(20,108,67,0.1) 100%)',
                  border: '1px solid rgba(15,81,50,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  marginBottom: '2rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.8'
                }}>
                  <strong>💡 使用方式：</strong><br />
                  1︎ 在左邊各分頁修改想要更新的內容<br />
                  2︎ 回到此頁面，點【立即發布至官網】按鈕<br />
                  3︎ 等待約 2～3 分鐘，官網內容自動更新完成 ✅
                </div>

                {/* Token Settings */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={16} />
                    發布權限設定（次設定即可）
                  </h3>
                  <div className="form-group">
                    <label>GitHub Personal Access Token</label>
                    <input
                      type="password"
                      className="form-control"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="輸入您收到的 GitHub Token（ghp_xxxx...)"
                    />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                      Token 將加密儲存於您的本機，不會上傳至任何地方。
                    </small>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={handleSaveToken}
                  >
                    <Save size={16} />
                    <span>儲存 Token 至本機</span>
                  </button>
                  {githubToken && (
                    <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#146c43' }}>
                      ✅ Token 已設定
                    </span>
                  )}
                </div>

                {/* Publish Button */}
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  {publishStatus !== 'loading' ? (
                    <button
                      onClick={handlePublish}
                      disabled={!githubToken.trim()}
                      style={{
                        background: githubToken.trim() ? 'linear-gradient(135deg, #0f5132 0%, #146c43 100%)' : 'var(--bg-secondary)',
                        color: githubToken.trim() ? '#fff' : 'var(--text-muted)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: githubToken.trim() ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: githubToken.trim() ? '0 4px 15px rgba(15,81,50,0.4)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Rocket size={20} />
                      立即發布至官網
                    </button>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)', fontSize: '1rem', fontWeight: '600' }}>
                      <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      發布中，請稍候…
                    </div>
                  )}

                  {/* Status Message */}
                  {publishMessage && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: publishStatus === 'success' ? 'rgba(15,81,50,0.1)' : publishStatus === 'error' ? 'rgba(220,53,69,0.1)' : 'rgba(0,0,0,0.05)',
                      color: publishStatus === 'success' ? '#0f5132' : publishStatus === 'error' ? '#dc3545' : 'var(--text-body)',
                      border: `1px solid ${publishStatus === 'success' ? 'rgba(15,81,50,0.3)' : publishStatus === 'error' ? 'rgba(220,53,69,0.3)' : 'var(--border-color)'}`,
                      fontSize: '0.95rem',
                      fontWeight: '500',
                    }}>
                      {publishMessage}
                      {publishStatus === 'success' && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          可前往 <a href="https://github.com/jayshih8/mizo-cleaning-web-/actions" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>GitHub Actions</a> 查看建置進度。
                        </div>
                      )}
                    </div>
                  )}

                  {!githubToken.trim() && (
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      請先在上方輸入發布 Token 才能使用此功能。
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 1: COMPANY INFO */}
            {activeSubTab === 'company' && (
              <div>
                <h2 className="admin-section-title">公司聯絡與基本資訊</h2>
                <div className="admin-grid">
                  <div className="form-group">
                    <label>公司完整全銜</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.name}
                      onChange={(e) => handleCompanyChange('name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>標誌文字 (Logo Text - 如：東亞美裝 TB)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.logoText}
                      onChange={(e) => handleCompanyChange('logoText', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>標誌縮寫圖標 (Logo Icon Text - 如：TB)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.logoIconText || ''}
                      onChange={(e) => handleCompanyChange('logoIconText', e.target.value)}
                      placeholder="例如：TB"
                    />
                  </div>
                  <div className="form-group admin-grid-full" style={{ marginBottom: '1.5rem' }}>
                    <label>Logo 專屬圖檔 (選填，上傳圖片後將取代上述縮寫圖標，自動轉 Base64)</label>
                    <div className="image-upload-zone" onClick={() => document.getElementById('logoImageUpload').click()}>
                      <Info size={24} style={{ color: 'var(--text-muted)' }} />
                      <span>點擊上傳圖片以設置您公司的 Logo 圖檔</span>
                      <input
                        type="file"
                        id="logoImageUpload"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(['company', 'logoImage'], e.target.files[0])}
                      />
                      {localData.company.logoImage && (
                        <img src={localData.company.logoImage} alt="Logo Preview" className="image-preview-thumbnail" />
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>電話 (系統撥打用，僅限數字)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.phone}
                      onChange={(e) => handleCompanyChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>電話格式化 (網頁顯示用)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.phoneFormatted}
                      onChange={(e) => handleCompanyChange('phoneFormatted', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>傳真號碼</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.fax}
                      onChange={(e) => handleCompanyChange('fax', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>電子信箱</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.email}
                      onChange={(e) => handleCompanyChange('email', e.target.value)}
                    />
                  </div>
                  <div className="form-group admin-grid-full">
                    <label>地址</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.address}
                      onChange={(e) => handleCompanyChange('address', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Line ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.lineId}
                      onChange={(e) => handleCompanyChange('lineId', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Line 連結 (網頁跳轉用)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.lineUrl}
                      onChange={(e) => handleCompanyChange('lineUrl', e.target.value)}
                    />
                  </div>
                  <div className="form-group admin-grid-full">
                    <label>服務營業時間</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.workHours}
                      onChange={(e) => handleCompanyChange('workHours', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: HOME PAGE */}
            {activeSubTab === 'home' && (
              <div>
                <h2 className="admin-section-title">首頁形象宣傳與優勢</h2>
                <div className="form-group">
                  <label>大標題 (Hero Title)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={localData.home.heroTitle}
                    onChange={(e) => handleHomeChange('heroTitle', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>副標語描述</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '80px' }}
                    value={localData.home.heroSubtitle}
                    onChange={(e) => handleHomeChange('heroSubtitle', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>CTA 按鈕文字 (首頁行動呼籲按鈕)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={localData.home.ctaText || ''}
                    onChange={(e) => handleHomeChange('ctaText', e.target.value)}
                    placeholder="例如：免費現場評估與估價"
                  />
                </div>
                
                {/* Banner Image upload */}
                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <label>首頁形象大圖 (Hero Banner Image)</label>
                  <div className="image-upload-zone" onClick={() => document.getElementById('heroBannerUpload').click()}>
                    <Info size={24} style={{ color: 'var(--text-muted)' }} />
                    <span>點擊上傳圖片以自動轉為 Base64 格式嵌入網頁</span>
                    <input
                      type="file"
                      id="heroBannerUpload"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(['home', 'heroBanner'], e.target.files[0])}
                    />
                    {localData.home.heroBanner && (
                      <img src={localData.home.heroBanner} alt="Hero Banner Preview" className="image-preview-thumbnail" />
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>四大核心優勢</h3>
                <div className="admin-grid">
                  {localData.home.features.map((feat, index) => (
                    <div key={index} className="admin-list-item">
                      <div className="admin-list-item-header">
                        <span className="admin-badge">優勢 {index + 1}</span>
                      </div>
                      <div className="form-group">
                        <label>優勢標題</label>
                        <input
                          type="text"
                          className="form-control"
                          value={feat.title}
                          onChange={(e) => {
                            const newFeats = [...localData.home.features];
                            newFeats[index].title = e.target.value;
                            setLocalData(prev => ({ ...prev, home: { ...prev.home, features: newFeats } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>優勢描述</label>
                        <textarea
                          className="form-control"
                          style={{ minHeight: '60px' }}
                          value={feat.description}
                          onChange={(e) => {
                            const newFeats = [...localData.home.features];
                            newFeats[index].description = e.target.value;
                            setLocalData(prev => ({ ...prev, home: { ...prev.home, features: newFeats } }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: '1.15rem', marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>四大統計數字 (Stats)</h3>
                <div className="admin-grid">
                  {(localData.home.stats || []).map((stat, index) => (
                    <div key={index} className="admin-list-item">
                      <div className="admin-list-item-header">
                        <span className="admin-badge">統計 {index + 1}</span>
                      </div>
                      <div className="form-group">
                        <label>數值 (例如：47+)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={stat.number}
                          onChange={(e) => {
                            const newStats = JSON.parse(JSON.stringify(localData.home.stats));
                            newStats[index].number = e.target.value;
                            setLocalData(prev => ({ ...prev, home: { ...prev.home, stats: newStats } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>標籤文字</label>
                        <input
                          type="text"
                          className="form-control"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = JSON.parse(JSON.stringify(localData.home.stats));
                            newStats[index].label = e.target.value;
                            setLocalData(prev => ({ ...prev, home: { ...prev.home, stats: newStats } }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: ABOUT & TRAINING */}
            {activeSubTab === 'about' && (
              <div>
                <h2 className="admin-section-title">關於我們品牌與培訓管理</h2>
                <div className="admin-grid">
                  <div className="form-group">
                    <label>頁面大標題</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.about.title || ''}
                      onChange={(e) => setLocalData(prev => ({ ...prev, about: { ...prev.about, title: e.target.value } }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>頁面副標題</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.about.subtitle || ''}
                      onChange={(e) => setLocalData(prev => ({ ...prev, about: { ...prev.about, subtitle: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>公司經營理念簡述 (Philosophy)</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '90px' }}
                    value={localData.about.philosophy}
                    onChange={(e) => {
                      setLocalData(prev => ({ ...prev, about: { ...prev.about, philosophy: e.target.value } }));
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', margin: 0 }}>
                    發展沿革歷史節點 (History Timelines)
                  </h3>
                  <button
                    onClick={handleAddHistory}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                    <span>新增沿革節點</span>
                  </button>
                </div>
                <div>
                  {localData.about.history.map((hist, index) => (
                    <div key={index} className="admin-list-item">
                      <div className="admin-list-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="admin-badge">沿革 {index + 1}</span>
                        <button
                          onClick={() => handleDeleteHistory(index)}
                          className="btn btn-outline"
                          style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          <Trash size={12} />
                          <span>刪除節點</span>
                        </button>
                      </div>
                      <div className="admin-grid">
                        <div className="form-group">
                          <label>年份 (例如: 1979 年 (民國 68 年))</label>
                          <input
                            type="text"
                            className="form-control"
                            value={hist.year}
                            onChange={(e) => {
                              const newHist = [...localData.about.history];
                              newHist[index].year = e.target.value;
                              setLocalData(prev => ({ ...prev, about: { ...prev.about, history: newHist } }));
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>沿革標題</label>
                          <input
                            type="text"
                            className="form-control"
                            value={hist.title}
                            onChange={(e) => {
                              const newHist = [...localData.about.history];
                              newHist[index].title = e.target.value;
                              setLocalData(prev => ({ ...prev, about: { ...prev.about, history: newHist } }));
                            }}
                          />
                        </div>
                        <div className="form-group admin-grid-full" style={{ marginBottom: 0 }}>
                          <label>沿革具體內容</label>
                          <textarea
                            className="form-control"
                            style={{ minHeight: '60px' }}
                            value={hist.description}
                            onChange={(e) => {
                              const newHist = [...localData.about.history];
                              newHist[index].description = e.target.value;
                              setLocalData(prev => ({ ...prev, about: { ...prev.about, history: newHist } }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: '1.15rem', marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                  員工教育訓練 (Training Programs)
                </h3>
                <div className="admin-grid">
                  <div className="form-group">
                    <label>培訓區塊大標題</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.about.training.title}
                      onChange={(e) => {
                        const newTraining = { ...localData.about.training, title: e.target.value };
                        setLocalData(prev => ({ ...prev, about: { ...prev.about, training: newTraining } }));
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>培訓區塊副標語</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.about.training.subtitle}
                      onChange={(e) => {
                        const newTraining = { ...localData.about.training, subtitle: e.target.value };
                        setLocalData(prev => ({ ...prev, about: { ...prev.about, training: newTraining } }));
                      }}
                    />
                  </div>
                  
                  {/* Training Image mock upload */}
                  <div className="form-group admin-grid-full">
                    <label>培訓照片 (Training Image)</label>
                    <div className="image-upload-zone" onClick={() => document.getElementById('trainingUpload').click()}>
                      <Info size={24} style={{ color: 'var(--text-muted)' }} />
                      <span>點擊上傳培訓照片自動轉 Base64</span>
                      <input
                        type="file"
                        id="trainingUpload"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(['about', 'training', 'image'], e.target.files[0])}
                      />
                      {localData.about.training.image && (
                        <img src={localData.about.training.image} alt="Training Preview" className="image-preview-thumbnail" />
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  {localData.about.training.items.map((item, index) => (
                    <div key={index} className="admin-list-item">
                      <div className="admin-list-item-header">
                        <span className="admin-badge">培訓項目 {index + 1}</span>
                      </div>
                      <div className="form-group">
                        <label>培訓項目名稱</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...localData.about.training.items];
                            newItems[index].title = e.target.value;
                            const newTraining = { ...localData.about.training, items: newItems };
                            setLocalData(prev => ({ ...prev, about: { ...prev.about, training: newTraining } }));
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>培訓具體內容</label>
                        <textarea
                          className="form-control"
                          style={{ minHeight: '60px' }}
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...localData.about.training.items];
                            newItems[index].description = e.target.value;
                            const newTraining = { ...localData.about.training, items: newItems };
                            setLocalData(prev => ({ ...prev, about: { ...prev.about, training: newTraining } }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 4: SERVICES */}
            {activeSubTab === 'services' && (
              <div>
                <h2 className="admin-section-title">服務項目內容維護</h2>
                <div className="admin-grid">
                  <div className="form-group">
                    <label>頁面大標題</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.services.title || ''}
                      onChange={(e) => setLocalData(prev => ({ ...prev, services: { ...prev.services, title: e.target.value } }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>頁面副標題</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.services.subtitle || ''}
                      onChange={(e) => setLocalData(prev => ({ ...prev, services: { ...prev.services, subtitle: e.target.value } }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', margin: 0 }}>
                    具體清潔服務清單 (Services List)
                  </h3>
                  <button
                    onClick={handleAddService}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                    <span>新增服務項目</span>
                  </button>
                </div>
                
                {localData.services.items.map((service, index) => (
                  <div key={service.id} className="admin-list-item">
                    <div className="admin-list-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="admin-badge" style={{ backgroundColor: 'var(--secondary-color)' }}>{service.title || '新服務項目'}</span>
                      <button
                        onClick={() => handleDeleteService(index)}
                        className="btn btn-outline"
                        style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                      >
                        <Trash size={12} />
                        <span>刪除項目</span>
                      </button>
                    </div>
                    <div className="form-group">
                      <label>服務名稱</label>
                      <input
                        type="text"
                        className="form-control"
                        value={service.title}
                        onChange={(e) => {
                          const newServices = [...localData.services.items];
                          newServices[index].title = e.target.value;
                          setLocalData(prev => ({ ...prev, services: { ...prev.services, items: newServices } }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>服務詳細描述</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '80px' }}
                        value={service.description}
                        onChange={(e) => {
                          const newServices = [...localData.services.items];
                          newServices[index].description = e.target.value;
                          setLocalData(prev => ({ ...prev, services: { ...prev.services, items: newServices } }));
                        }}
                      />
                    </div>

                    {/* Service Image upload */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label>服務大圖 (點擊或拖曳上傳，自動轉 Base64)</label>
                      <div className="image-upload-zone" onClick={() => document.getElementById(`serviceUpload-${index}`).click()}>
                        <Info size={24} style={{ color: 'var(--text-muted)' }} />
                        <span>點擊上傳圖片以替換此服務的顯示大圖 (建議寬比高長之橫幅照片)</span>
                        <input
                          type="file"
                          id={`serviceUpload-${index}`}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(['services', 'items', index, 'image'], e.target.files[0])}
                        />
                        {(service.image || getServiceDefaultImage(service.id)) && (
                          <img src={service.image || getServiceDefaultImage(service.id)} alt="Service Banner Preview" className="image-preview-thumbnail" />
                        )}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>服務要點細項 (一行一項)</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '80px' }}
                        value={service.features.join('\n')}
                        onChange={(e) => {
                          const newServices = [...localData.services.items];
                          newServices[index].features = e.target.value.split('\n').filter(l => l.trim() !== '');
                          setLocalData(prev => ({ ...prev, services: { ...prev.services, items: newServices } }));
                        }}
                        placeholder="請每行輸入一個特色細項..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUBTAB 5: CREDENTIALS */}
            {activeSubTab === 'credentials' && (
              <div>
                <h2 className="admin-section-title">專業證照與公會獎章管理</h2>
                <div className="admin-grid">
                  <div className="form-group">
                    <label>頁面大標題</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.credentials.title || ''}
                      onChange={(e) => setLocalData(prev => ({ ...prev, credentials: { ...prev.credentials, title: e.target.value } }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>頁面副標題</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.credentials.subtitle || ''}
                      onChange={(e) => setLocalData(prev => ({ ...prev, credentials: { ...prev.credentials, subtitle: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>證照介紹導言</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '90px' }}
                    value={localData.credentials.intro}
                    onChange={(e) => {
                      setLocalData(prev => ({ ...prev, credentials: { ...prev.credentials, intro: e.target.value } }));
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', margin: 0 }}>
                    公會會員證書與勞安證照 (Certificates List)
                  </h3>
                  <button
                    onClick={handleAddCert}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                    <span>新增證書榮譽</span>
                  </button>
                </div>

                {localData.credentials.certs.map((cert, index) => (
                  <div key={index} className="admin-list-item">
                    <div className="admin-list-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="admin-badge">證書/合規照 {index + 1}</span>
                      <button
                        onClick={() => handleDeleteCert(index)}
                        className="btn btn-outline"
                        style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                      >
                        <Trash size={12} />
                        <span>刪除項目</span>
                      </button>
                    </div>
                    <div className="form-group">
                      <label>證書標題</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cert.title}
                        onChange={(e) => {
                          const newCerts = [...localData.credentials.certs];
                          newCerts[index].title = e.target.value;
                          setLocalData(prev => ({ ...prev, credentials: { ...prev.credentials, certs: newCerts } }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>證書細部說明文字</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '80px' }}
                        value={cert.description}
                        onChange={(e) => {
                          const newCerts = [...localData.credentials.certs];
                          newCerts[index].description = e.target.value;
                          setLocalData(prev => ({ ...prev, credentials: { ...prev.credentials, certs: newCerts } }));
                        }}
                      />
                    </div>

                    {/* Cert Image mock upload */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>證書掃描檔照片 (Certificate Image)</label>
                      <div className="image-upload-zone" onClick={() => document.getElementById(`certUpload-${index}`).click()}>
                        <Info size={24} style={{ color: 'var(--text-muted)' }} />
                        <span>點擊上傳證書照片自動轉 Base64 儲存</span>
                        <input
                          type="file"
                          id={`certUpload-${index}`}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(['credentials', 'certs', index, 'image'], e.target.files[0])}
                        />
                        {cert.image && (
                          <img src={cert.image} alt="Cert Preview" className="image-preview-thumbnail" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUBTAB 4.5: PROCESS TIMELINE */}
            {activeSubTab === 'process' && (
              <div>
                <h2 className="admin-section-title">施工/清潔服務過程管理</h2>
                <div className="form-group">
                  <label>施工過程頁大標題</label>
                  <input
                    type="text"
                    className="form-control"
                    value={localData.process.title || ''}
                    onChange={(e) => {
                      setLocalData(prev => ({ ...prev, process: { ...prev.process, title: e.target.value } }));
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>施工過程頁副標題</label>
                  <input
                    type="text"
                    className="form-control"
                    value={localData.process.subtitle || ''}
                    onChange={(e) => {
                      setLocalData(prev => ({ ...prev, process: { ...prev.process, subtitle: e.target.value } }));
                    }}
                  />
                </div>

                <div style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', margin: 0 }}>
                    清潔施工作業步驟 (SOP Steps)
                  </h3>
                </div>

                {localData.process.steps && localData.process.steps.map((step, index) => (
                  <div key={index} className="admin-list-item">
                    <div className="admin-list-item-header">
                      <span className="admin-badge" style={{ backgroundColor: 'var(--secondary-color)' }}>
                        步驟 {step.stepNumber || `0${index + 1}`}
                      </span>
                    </div>
                    <div className="form-group">
                      <label>步驟標題</label>
                      <input
                        type="text"
                        className="form-control"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...localData.process.steps];
                          newSteps[index].title = e.target.value;
                          setLocalData(prev => ({ ...prev, process: { ...prev.process, steps: newSteps } }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>步驟詳細描述</label>
                      <textarea
                        className="form-control"
                        style={{ minHeight: '70px' }}
                        value={step.description}
                        onChange={(e) => {
                          const newSteps = [...localData.process.steps];
                          newSteps[index].description = e.target.value;
                          setLocalData(prev => ({ ...prev, process: { ...prev.process, steps: newSteps } }));
                        }}
                      />
                    </div>

                    {/* Step Image upload */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>施工現場照片 (點擊上傳圖片，自動轉 Base64)</label>
                      <div className="image-upload-zone" onClick={() => document.getElementById(`stepUpload-${index}`).click()}>
                        <Info size={24} style={{ color: 'var(--text-muted)' }} />
                        <span>點擊上傳照片以替換此步驟的現場相片</span>
                        <input
                          type="file"
                          id={`stepUpload-${index}`}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(['process', 'steps', index, 'image'], e.target.files[0])}
                        />
                        {step.image && (
                          <img src={step.image} alt={`Step ${index + 1} Preview`} className="image-preview-thumbnail" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUBTAB 6: CONTACT PAGE */}
            {activeSubTab === 'contact' && (
              <div>
                <h2 className="admin-section-title">聯絡我們頁面設定</h2>
                <div className="form-group">
                  <label>頁面大標題</label>
                  <input
                    type="text"
                    className="form-control"
                    value={(localData.contact && localData.contact.pageTitle) || ''}
                    onChange={(e) => setLocalData(prev => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), pageTitle: e.target.value }
                    }))}
                    placeholder="例如：聯絡我們"
                  />
                </div>
                <div className="form-group">
                  <label>頁面副標題</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: '70px' }}
                    value={(localData.contact && localData.contact.subtitle) || ''}
                    onChange={(e) => setLocalData(prev => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), subtitle: e.target.value }
                    }))}
                    placeholder="例如：免費預約估價或業務洽詢，我們將有專人與您聯絡"
                  />
                </div>
                <div className="form-group">
                  <label>表單區塊標題</label>
                  <input
                    type="text"
                    className="form-control"
                    value={(localData.contact && localData.contact.formTitle) || ''}
                    onChange={(e) => setLocalData(prev => ({
                      ...prev,
                      contact: { ...(prev.contact || {}), formTitle: e.target.value }
                    }))}
                    placeholder="例如：線上預約與需求諮詢"
                  />
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  💡 聯絡表單的欄位（姓名、電話、地址、服務類型、留言）為固定欄位，電話/傳真/Email/地址等公司聯絡資訊請至「公司基本資訊」分頁修改。
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
