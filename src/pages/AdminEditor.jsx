import React, { useState } from 'react';
import { Save, Download, RotateCcw, AlertTriangle, FileText, Info, Plus, Trash, LogOut, Rocket, Settings, CheckCircle2, XCircle, Loader, Upload, Lock } from 'lucide-react';

export default function AdminEditor({ configData, onSave, onReset, setActiveTab }) {
  const [localData, setLocalData] = useState(JSON.parse(JSON.stringify(configData)));
  const [activeSubTab, setActiveSubTab] = useState('company');
  const [toastMessage, setToastMessage] = useState('');
  
  // Password Authentication States
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('mizo_admin_auth') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');

  // GitHub publish state
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('mizo_gh_token') || '');
  const [publishStatus, setPublishStatus] = useState('idle'); // idle | loading | success | error
  const [publishMessage, setPublishMessage] = useState('');

  // GitHub API publish function
  const handlePublish = async () => {
    if (!githubToken.trim()) {
      setPublishStatus('error');
      setPublishMessage('請先輸入發布授權憑證金鑰！');
      return;
    }

    const OWNER = 'jayshih8';
    const REPO = 'mizo-cleaning-web-';
    const FILE_PATH = 'src/data/contentConfig.json';
    const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

    setPublishStatus('loading');
    setPublishMessage('正在連線至發布伺服器…');

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
      setPublishMessage('✅ 網站內容已成功發布！新內容將在約 1-2 分鐘後自動更新。');

      // Also save locally
      onSave(localData);

    } catch (err) {
      setPublishStatus('error');
      setPublishMessage(`❌ 發布失敗：${err.message}`);
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem('mizo_gh_token', githubToken);
    showToast('發布憑證金鑰已儲存至本機！');
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

  // Image Upload helper to convert file to Base64 and compress it
  const handleImageUpload = (fieldPath, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Dynamic max dimension based on field path
        let maxDim = 1200; // Default for normal page images
        const isLogo = fieldPath.includes('logoImage');
        const isFavicon = fieldPath.includes('favicon');

        if (isLogo) {
          maxDim = 400; // Logos do not need to be huge
        } else if (isFavicon) {
          maxDim = 128; // Favicon can be very small
        }

        // Resize if exceeds max dimension
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress options
        let mimeType = 'image/jpeg';
        let quality = 0.85;

        // Preserve PNG transparency for logo and favicon
        if (isLogo || isFavicon) {
          mimeType = 'image/png';
        }

        const compressedBase64 = canvas.toDataURL(mimeType, quality);

        // Deep-clone to avoid shared reference mutations with nested arrays
        const newData = JSON.parse(JSON.stringify(localData));
        let current = newData;
        for (let i = 0; i < fieldPath.length - 1; i++) {
          current = current[fieldPath[i]];
        }
        current[fieldPath[fieldPath.length - 1]] = compressedBase64;

        setLocalData(newData);
        showToast('圖片上傳並自動壓縮成功！');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };


  const handleSave = () => {
    onSave(localData);
    showToast('設定已套用並儲存至瀏覽器暫存！重新整理即可看到效果。');
  };

  const handleReset = () => {
    if (window.confirm('確定要捨棄目前所有修改，還原成官網目前發布的最新版本嗎？')) {
      onReset();
      // Reload page to refresh state or let state bubble up
      showToast('已還原至官網發布版本！');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        
        // Simple schema validation to ensure it has key sections
        if (!parsed.company || !parsed.home || !parsed.about || !parsed.services || !parsed.credentials || !parsed.process || !parsed.contact) {
          throw new Error('設定檔格式不正確，缺少必要的主頁面欄位！');
        }

        setLocalData(parsed);
        showToast('✅ 設定檔匯入成功！請點擊右上角「即時套用」以預覽，或點擊「發布至官網」完成發布。');
      } catch (err) {
        alert(`匯入失敗：${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
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

  const handleAddCase = () => {
    const newCase = {
      title: '新增工程實績案例',
      category: '施工項目類別',
      description: '請輸入此實績的詳細施工內容、地點或成果說明。',
      image: ''
    };
    setLocalData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        cases: [...(prev.home.cases || []), newCase]
      }
    }));
    showToast('已新增一筆工程實績！');
  };

  const handleDeleteCase = (index) => {
    if (window.confirm('確定要刪除此施工實績嗎？')) {
      const newCases = (localData.home.cases || []).filter((_, i) => i !== index);
      setLocalData(prev => ({
        ...prev,
        home: {
          ...prev.home,
          cases: newCases
        }
      }));
      showToast('已刪除施工實績項目！');
    }
  };

  const handleAddTestimonial = () => {
    const newTestimonial = {
      name: '客戶姓名/尊稱',
      role: '職稱',
      company: '公司或機構名稱',
      feedback: '請在此輸入客戶對我們服務的好評見證內容。'
    };
    setLocalData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        testimonials: [...(prev.home.testimonials || []), newTestimonial]
      }
    }));
    showToast('已新增一筆客戶好評見證！');
  };

  const handleDeleteTestimonial = (index) => {
    if (window.confirm('確定要刪除此客戶好評見證嗎？')) {
      const newTestimonials = (localData.home.testimonials || []).filter((_, i) => i !== index);
      setLocalData(prev => ({
        ...prev,
        home: {
          ...prev.home,
          testimonials: newTestimonials
        }
      }));
      showToast('已刪除客戶見證項目！');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b1c3d 0%, #1e3a8a 100%)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Blobs */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, rgba(0,0,0,0) 70%)', top: '-10%', left: '-10%' }}></div>
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(0,0,0,0) 70%)', bottom: '-10%', right: '-10%' }}></div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '3.5rem 2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(11, 28, 61, 0.35)',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          zIndex: 10,
          position: 'relative'
        }}>
          {/* Logo Badge */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(6, 182, 212, 0.15) 100%)',
            color: 'var(--secondary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.1)'
          }}>
            <Lock size={26} />
          </div>
          
          <h2 style={{ fontSize: '1.65rem', color: 'var(--primary-color)', marginBottom: '0.5rem', fontWeight: '700', letterSpacing: '0.05em' }}>
            網站管理後台
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            請輸入管理密碼以進行網站內容維護與發布
          </p>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'admin1357') {
              setIsAuthenticated(true);
              sessionStorage.setItem('mizo_admin_auth', 'true');
            } else {
              setErrorMsg('密碼錯誤，請重新輸入！');
            }
          }}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label htmlFor="adminPassword" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'block' }}>管理密碼</label>
              <input
                type="password"
                id="adminPassword"
                className="form-control"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="請輸入後台管理密碼"
                style={{ 
                  textAlign: 'center', 
                  letterSpacing: '0.15em',
                  fontSize: '0.95rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
                required
                autoFocus
              />
            </div>

            {errorMsg && (
              <div style={{
                color: '#dc3545',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '1.25rem',
                backgroundColor: 'rgba(220, 53, 69, 0.05)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(220, 53, 69, 0.15)'
              }}>
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="btn" 
              style={{ 
                width: '100%', 
                padding: '0.85rem', 
                background: 'linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(11, 28, 61, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              登入管理後台
            </button>
          </form>

          <button
            onClick={() => {
              setActiveTab('home');
            }}
            className="btn"
            style={{ 
              width: '100%', 
              marginTop: '1rem', 
              padding: '0.85rem', 
              border: '1px solid #cbd5e1', 
              color: 'var(--text-muted)',
              background: 'transparent',
              fontWeight: '500',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            返回前台首頁
          </button>
        </div>
      </div>
    );
  }

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
                sessionStorage.removeItem('mizo_admin_auth');
                setIsAuthenticated(false);
                setActiveTab('home');
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
            <button
              onClick={() => document.getElementById('importConfigInput').click()}
              className="btn btn-outline"
              style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}
              title="匯入先前備份的 contentConfig.json 設定檔"
            >
              <Upload size={16} />
              <span>匯入設定檔</span>
            </button>
            <input
              type="file"
              id="importConfigInput"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button onClick={handleReset} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} title="捨棄所有本機修改，還原至官網發布的版本">
              <RotateCcw size={16} />
              <span>還原已發布版</span>
            </button>
          </div>
        </div>

        {/* Info Instruction */}
        <div style={{ backgroundColor: 'rgba(217, 119, 6, 0.05)', borderLeft: '4px solid var(--accent-color)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '0.15rem' }} />
          <div style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: '1.7' }}>
            <strong>💡 如何讓變更永久生效與發布？</strong><br />
            1. 點擊右上角<strong>「即時套用」</strong>：僅會將修改暫存在您的瀏覽器中，方便您點擊「返回前台」預覽成果。<br />
            2. 確定修改無誤後：請切換至左側最下方的<strong>「🚀 發布至官網」</strong>，輸入發布 Token（僅需設定一次），點擊<strong>「立即發布至官網」</strong>，即可自動更新正式網頁（約需 2~3 分鐘）。<br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>（您也可以點擊右上角「下載設定檔」保存備份 <code>contentConfig.json</code>。）</span>
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
            <div className="admin-publish-wrapper">
              <button
                onClick={() => setActiveSubTab('publish')}
                className={`admin-nav-btn admin-btn-publish ${activeSubTab === 'publish' ? 'active' : ''}`}
              >
                <Rocket size={16} />
                <span>發布至官網</span>
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
                    發布權限設定（一次設定即可）
                  </h3>
                  <div className="form-group">
                    <label>發布授權憑證金鑰 (Publish Token)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="輸入您收到的發布授權憑證金鑰..."
                    />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                      發布憑證將安全儲存於您的瀏覽器本機，不會上傳至其他非授權的伺服器。
                    </small>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={handleSaveToken}
                  >
                    <Save size={16} />
                    <span>儲存發布憑證至本機</span>
                  </button>
                  {githubToken && (
                    <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#146c43' }}>
                      ✅ 憑證已設定
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
                    </div>
                  )}

                  {!githubToken.trim() && (
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      請先在上方輸入發布憑證金鑰才能使用此功能。
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
                  <div className="form-group admin-grid-full" style={{ marginBottom: '1.5rem' }}>
                    <label>分頁標籤圖示 Favicon (選填，上傳後將更新瀏覽器分頁圖示，建議為正方形 PNG/ICO，自動轉 Base64)</label>
                    <div className="image-upload-zone" onClick={() => document.getElementById('faviconUpload').click()}>
                      <Info size={24} style={{ color: 'var(--text-muted)' }} />
                      <span>點擊上傳圖片以設置瀏覽器分頁標籤圖示</span>
                      <input
                        type="file"
                        id="faviconUpload"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(['company', 'favicon'], e.target.files[0])}
                      />
                      {localData.company.favicon && (
                        <img src={localData.company.favicon} alt="Favicon Preview" className="image-preview-thumbnail" style={{ objectFit: 'contain' }} />
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
                  
                  {/* Google SEO & Analytics Settings */}
                  <div className="form-group admin-grid-full" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Settings size={18} />
                      🔍 Google 搜尋與流量追蹤設定 (SEO)
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      設定 Google Search Console 驗證碼與 Google Analytics 4 (GA4) 流量統計，讓您的網站更容易被搜尋並觀察客流量。
                    </p>
                  </div>
                  <div className="form-group">
                    <label>Google Analytics (GA4) 追蹤 ID (測量 ID)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.gaId || ''}
                      onChange={(e) => handleCompanyChange('gaId', e.target.value)}
                      placeholder="例如：G-K3EXXXXXXX"
                    />
                    <small style={{ color: 'var(--text-muted)' }}>
                      貼入您的 GA4 「G-」開頭測量 ID 即可自動啟用全站流量追蹤與分頁瀏覽統計。
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Google Search Console 驗證代碼</label>
                    <input
                      type="text"
                      className="form-control"
                      value={localData.company.googleVerification || ''}
                      onChange={(e) => handleCompanyChange('googleVerification', e.target.value)}
                      placeholder="貼入 google-site-verification 中 content 屬性的代碼"
                    />
                    <small style={{ color: 'var(--text-muted)' }}>
                      貼入驗證 meta 標記的內容（例如：<code>wJk..._d3E</code>），系統會自動插入對應 HTML 標記以利 Google 站長工具驗證。
                    </small>
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

                {/* 近期施工實績管理 (NEW) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', margin: 0 }}>
                    近期施工實績 (Recent Case Showcase)
                  </h3>
                  <button
                    onClick={handleAddCase}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                    <span>新增施工實績</span>
                  </button>
                </div>
                <div>
                  {(localData.home.cases || []).map((c, index) => (
                    <div key={index} className="admin-list-item">
                      <div className="admin-list-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="admin-badge" style={{ backgroundColor: 'var(--secondary-color)' }}>實績案例 {index + 1}</span>
                        <button
                          onClick={() => handleDeleteCase(index)}
                          className="btn btn-outline"
                          style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          <Trash size={12} />
                          <span>刪除案例</span>
                        </button>
                      </div>
                      <div className="admin-grid">
                        <div className="form-group">
                          <label>實績名稱/標題</label>
                          <input
                            type="text"
                            className="form-control"
                            value={c.title || ''}
                            onChange={(e) => {
                              const newCases = [...(localData.home.cases || [])];
                              newCases[index].title = e.target.value;
                              setLocalData(prev => ({ ...prev, home: { ...prev.home, cases: newCases } }));
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>施工類別 (如：大樓清潔、飯店日常保養)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={c.category || ''}
                            onChange={(e) => {
                              const newCases = [...(localData.home.cases || [])];
                              newCases[index].category = e.target.value;
                              setLocalData(prev => ({ ...prev, home: { ...prev.home, cases: newCases } }));
                            }}
                          />
                        </div>
                        <div className="form-group admin-grid-full">
                          <label>實績案例圖片 (建議橫幅照片，自動壓縮為 JPEG)</label>
                          <div className="image-upload-zone" onClick={() => document.getElementById(`caseUpload-${index}`).click()}>
                            <Info size={24} style={{ color: 'var(--text-muted)' }} />
                            <span>點擊上傳實績照片自動轉 Base64 儲存</span>
                            <input
                              type="file"
                              id={`caseUpload-${index}`}
                              style={{ display: 'none' }}
                              accept="image/*"
                              onChange={(e) => handleImageUpload(['home', 'cases', index, 'image'], e.target.files[0])}
                            />
                            {c.image && (
                              <img src={c.image} alt="Case Preview" className="image-preview-thumbnail" />
                            )}
                          </div>
                        </div>
                        <div className="form-group admin-grid-full" style={{ marginBottom: 0 }}>
                          <label>施工詳細說明</label>
                          <textarea
                            className="form-control"
                            style={{ minHeight: '60px' }}
                            value={c.description || ''}
                            onChange={(e) => {
                              const newCases = [...(localData.home.cases || [])];
                              newCases[index].description = e.target.value;
                              setLocalData(prev => ({ ...prev, home: { ...prev.home, cases: newCases } }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 客戶口碑見證管理 (NEW) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', margin: 0 }}>
                    客戶口碑見證 (Client Testimonials)
                  </h3>
                  <button
                    onClick={handleAddTestimonial}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                    <span>新增客戶見證</span>
                  </button>
                </div>
                <div>
                  {(localData.home.testimonials || []).map((t, index) => (
                    <div key={index} className="admin-list-item">
                      <div className="admin-list-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="admin-badge">口碑評價 {index + 1}</span>
                        <button
                          onClick={() => handleDeleteTestimonial(index)}
                          className="btn btn-outline"
                          style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          <Trash size={12} />
                          <span>刪除見證</span>
                        </button>
                      </div>
                      <div className="admin-grid">
                        <div className="form-group">
                          <label>客戶姓名/稱呼 (例如：張經理)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={t.name || ''}
                            onChange={(e) => {
                              const newTestimonials = [...(localData.home.testimonials || [])];
                              newTestimonials[index].name = e.target.value;
                              setLocalData(prev => ({ ...prev, home: { ...prev.home, testimonials: newTestimonials } }));
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>職稱 (例如：主任委員、房務部協理)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={t.role || ''}
                            onChange={(e) => {
                              const newTestimonials = [...(localData.home.testimonials || [])];
                              newTestimonials[index].role = e.target.value;
                              setLocalData(prev => ({ ...prev, home: { ...prev.home, testimonials: newTestimonials } }));
                            }}
                          />
                        </div>
                        <div className="form-group admin-grid-full">
                          <label>公司或大樓名稱</label>
                          <input
                            type="text"
                            className="form-control"
                            value={t.company || ''}
                            onChange={(e) => {
                              const newTestimonials = [...(localData.home.testimonials || [])];
                              newTestimonials[index].company = e.target.value;
                              setLocalData(prev => ({ ...prev, home: { ...prev.home, testimonials: newTestimonials } }));
                            }}
                          />
                        </div>
                        <div className="form-group admin-grid-full" style={{ marginBottom: 0 }}>
                          <label>好評回饋詳細文字</label>
                          <textarea
                            className="form-control"
                            style={{ minHeight: '60px' }}
                            value={t.feedback || ''}
                            onChange={(e) => {
                              const newTestimonials = [...(localData.home.testimonials || [])];
                              newTestimonials[index].feedback = e.target.value;
                              setLocalData(prev => ({ ...prev, home: { ...prev.home, testimonials: newTestimonials } }));
                            }}
                          />
                        </div>
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
                    <div className="admin-list-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="admin-badge" style={{ backgroundColor: 'var(--secondary-color)' }}>{service.title || '新服務項目'}</span>
                        {((localData.services.featuredServiceIds || []).includes(service.id)) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span className="admin-badge" style={{ backgroundColor: '#f59e0b', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                              ★ 精選實績
                            </span>
                            <button
                              onClick={() => {
                                const newIds = (localData.services.featuredServiceIds || []).filter(id => id !== service.id);
                                setLocalData(prev => ({
                                  ...prev,
                                  services: {
                                    ...prev.services,
                                    featuredServiceIds: newIds
                                  }
                                }));
                                showToast(`已取消「${service.title}」的精選實績設定！`);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444' }}
                            >
                              取消精選
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const newIds = [...(localData.services.featuredServiceIds || []), service.id];
                              setLocalData(prev => ({
                                ...prev,
                                services: {
                                  ...prev.services,
                                  featuredServiceIds: newIds
                                }
                              }));
                              showToast(`已將「${service.title}」設為精選實績！`);
                            }}
                            className="btn btn-outline"
                            style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem', borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}
                          >
                            設為精選實績
                          </button>
                        )}
                      </div>
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
