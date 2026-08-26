import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Home, Images, ListChecks, Save, Trash2, Upload, X } from 'lucide-react';
import AdminEditor from './AdminEditor';
import './MultiImageEnhancements.css';

const MAX_FILES_PER_BATCH = 30;

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const uniqueImages = (images) => {
  const seen = new Set();
  return (images || []).filter((image) => {
    if (!image || seen.has(image)) return false;
    seen.add(image);
    return true;
  });
};

const getStepImages = (step) => uniqueImages([
  step?.image,
  ...(Array.isArray(step?.images) ? step.images : []),
]);

const compressImage = (file) => new Promise((resolve, reject) => {
  if (!file || !file.type?.startsWith('image/')) {
    reject(new Error('只支援圖片檔案'));
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    try {
      const maxDimension = 1200;
      let width = image.naturalWidth || image.width;
      let height = image.naturalHeight || image.height;

      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('瀏覽器無法建立圖片壓縮畫布');

      context.drawImage(image, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', 0.78);
      URL.revokeObjectURL(objectUrl);
      resolve(compressed);
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    }
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error(`無法讀取圖片：${file.name}`));
  };

  image.src = objectUrl;
});

export default function AdminEditorEnhanced({ configData, onSave, onReset, setActiveTab }) {
  const [editorRevision, setEditorRevision] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('mizo_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeManagerTab, setActiveManagerTab] = useState('home');
  const [draft, setDraft] = useState(() => deepClone(configData));
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const syncAuthState = () => {
      try {
        setIsAuthenticated(sessionStorage.getItem('mizo_admin_auth') === 'true');
      } catch {
        setIsAuthenticated(false);
      }
    };

    syncAuthState();
    const timer = window.setInterval(syncAuthState, 500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) setDraft(deepClone(configData));
  }, [configData, isOpen]);

  const processSteps = useMemo(() => draft?.process?.steps || [], [draft]);
  const extraHomeProjects = draft?.home?.multiImageProjects || [];

  useEffect(() => {
    if (selectedStepIndex >= processSteps.length) setSelectedStepIndex(0);
  }, [processSteps.length, selectedStepIndex]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 5000);
  };

  const openManager = () => {
    setDraft(deepClone(configData));
    setActiveManagerTab('home');
    setSelectedStepIndex(0);
    setIsOpen(true);
  };

  const processSelectedFiles = async (fileList, label) => {
    const files = Array.from(fileList || []).filter((file) => file.type?.startsWith('image/'));
    if (!files.length) return [];

    const selectedFiles = files.slice(0, MAX_FILES_PER_BATCH);
    setIsProcessing(true);

    try {
      const results = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        setProcessingMessage(`${label}：正在處理第 ${index + 1} / ${selectedFiles.length} 張`);
        results.push({
          dataUrl: await compressImage(file),
          fileName: file.name,
        });
      }
      return results;
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleHomeBatchUpload = async (fileList) => {
    try {
      const uploaded = await processSelectedFiles(fileList, '首頁工程圖片');
      if (!uploaded.length) return;

      setDraft((previous) => {
        const next = deepClone(previous);
        next.home ||= {};
        next.home.multiImageProjects ||= [];
        next.home.multiImageProjects.push(...uploaded.map((item, index) => ({
          title: item.fileName.replace(/\.[^.]+$/, '').trim() || `工程實績 ${next.home.multiImageProjects.length + index + 1}`,
          category: '專業清潔維護',
          description: '請補充此工程實績的施工內容與成果說明。',
          image: item.dataUrl,
        })));
        return next;
      });

      const cappedText = Array.from(fileList || []).length > MAX_FILES_PER_BATCH
        ? `；單次最多處理 ${MAX_FILES_PER_BATCH} 張`
        : '';
      showNotice(`已加入 ${uploaded.length} 張首頁工程圖片${cappedText}`);
    } catch (error) {
      showNotice(`圖片處理失敗：${error.message}`);
    }
  };

  const handleProcessBatchUpload = async (fileList) => {
    if (!processSteps.length) {
      showNotice('目前沒有可加入照片的施工步驟。');
      return;
    }

    try {
      const uploaded = await processSelectedFiles(fileList, `步驟 ${selectedStepIndex + 1}`);
      if (!uploaded.length) return;

      setDraft((previous) => {
        const next = deepClone(previous);
        const step = next.process.steps[selectedStepIndex];
        const mergedImages = uniqueImages([
          ...getStepImages(step),
          ...uploaded.map((item) => item.dataUrl),
        ]);
        step.images = mergedImages;
        step.image = mergedImages[0] || '';
        return next;
      });

      const cappedText = Array.from(fileList || []).length > MAX_FILES_PER_BATCH
        ? `；單次最多處理 ${MAX_FILES_PER_BATCH} 張`
        : '';
      showNotice(`已加入 ${uploaded.length} 張施工現場照片${cappedText}`);
    } catch (error) {
      showNotice(`圖片處理失敗：${error.message}`);
    }
  };

  const updateHomeProject = (index, field, value) => {
    setDraft((previous) => {
      const next = deepClone(previous);
      next.home.multiImageProjects[index][field] = value;
      return next;
    });
  };

  const removeHomeProject = (index) => {
    setDraft((previous) => {
      const next = deepClone(previous);
      next.home.multiImageProjects.splice(index, 1);
      return next;
    });
  };

  const removeProcessImage = (stepIndex, imageIndex) => {
    setDraft((previous) => {
      const next = deepClone(previous);
      const step = next.process.steps[stepIndex];
      const remainingImages = getStepImages(step).filter((_, index) => index !== imageIndex);
      step.images = remainingImages;
      step.image = remainingImages[0] || '';
      return next;
    });
  };

  const applyBatchChanges = () => {
    const nextConfig = deepClone(draft);
    onSave(nextConfig);
    setIsOpen(false);
    showNotice('批次圖片已套用至本次編輯。請再按原後台的「發布至官網」完成正式更新。');

    // Wait until the parent config state has updated, then remount the original editor
    // so its publishing payload also contains the new gallery data.
    window.setTimeout(() => setEditorRevision((revision) => revision + 1), 0);
  };

  const handleReset = () => {
    onReset();
    setIsOpen(false);
    window.setTimeout(() => setEditorRevision((revision) => revision + 1), 0);
  };

  const selectedStep = processSteps[selectedStepIndex];
  const selectedStepImages = getStepImages(selectedStep);

  return (
    <>
      <AdminEditor
        key={`admin-editor-${editorRevision}`}
        configData={configData}
        onSave={onSave}
        onReset={handleReset}
        setActiveTab={setActiveTab}
      />

      {isAuthenticated && (
        <button type="button" className="multi-image-manager-trigger" onClick={openManager}>
          <Images size={19} />
          <span>批次圖片管理</span>
        </button>
      )}

      {notice && (
        <div className="multi-image-notice">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      {isOpen && (
        <div className="multi-image-modal-backdrop" role="presentation">
          <section className="multi-image-modal" role="dialog" aria-modal="true" aria-label="批次圖片管理">
            <header className="multi-image-modal-header">
              <div>
                <p className="multi-image-eyebrow">MIZO CONTENT MANAGER</p>
                <h2>批次圖片管理</h2>
                <p>單次可選擇 6 張以上，最多處理 {MAX_FILES_PER_BATCH} 張；上傳時會自動縮圖與壓縮。</p>
              </div>
              <button type="button" className="multi-image-close" onClick={() => setIsOpen(false)} disabled={isProcessing} aria-label="關閉">
                <X size={22} />
              </button>
            </header>

            <div className="multi-image-tabs" role="tablist">
              <button
                type="button"
                className={activeManagerTab === 'home' ? 'active' : ''}
                onClick={() => setActiveManagerTab('home')}
              >
                <Home size={17} />
                首頁工程圖片
              </button>
              <button
                type="button"
                className={activeManagerTab === 'process' ? 'active' : ''}
                onClick={() => setActiveManagerTab('process')}
              >
                <ListChecks size={17} />
                施工步驟照片
              </button>
            </div>

            <div className="multi-image-modal-body">
              <div className="multi-image-warning">
                使用批次管理前，請先在原後台按一次「即時套用」，避免尚未儲存的文字修改在重新載入編輯器時遺失。
              </div>

              {activeManagerTab === 'home' && (
                <div>
                  <div className="multi-image-section-heading">
                    <div>
                      <h3>首頁多圖工程實績</h3>
                      <p>原本四格圖片仍可在「首頁形象宣傳與優勢」編輯；此處可一次追加第 5 張以後的工程照片。</p>
                    </div>
                    <label className={`multi-image-upload-button ${isProcessing ? 'disabled' : ''}`}>
                      <Upload size={17} />
                      <span>一次選擇多張</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isProcessing}
                        onChange={(event) => {
                          handleHomeBatchUpload(event.target.files);
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>

                  {extraHomeProjects.length === 0 ? (
                    <div className="multi-image-empty">
                      <Images size={34} />
                      <p>尚未加入額外工程圖片。可直接一次選取 6 張、10 張或更多照片。</p>
                    </div>
                  ) : (
                    <div className="multi-image-project-grid">
                      {extraHomeProjects.map((project, index) => (
                        <article className="multi-image-project-editor" key={`${index}-${project.image?.slice(-16)}`}>
                          <div className="multi-image-thumb-wrap">
                            <img src={project.image} alt={project.title || `工程實績 ${index + 1}`} />
                            <button type="button" onClick={() => removeHomeProject(index)} title="刪除這張圖片">
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <label>
                            標題
                            <input value={project.title || ''} onChange={(event) => updateHomeProject(index, 'title', event.target.value)} />
                          </label>
                          <label>
                            類別標籤
                            <input value={project.category || ''} onChange={(event) => updateHomeProject(index, 'category', event.target.value)} />
                          </label>
                          <label>
                            說明
                            <textarea value={project.description || ''} onChange={(event) => updateHomeProject(index, 'description', event.target.value)} />
                          </label>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeManagerTab === 'process' && (
                <div>
                  <div className="multi-image-section-heading process-heading">
                    <div>
                      <h3>施工步驟現場照片</h3>
                      <p>每一個 SOP 步驟都能保留多張照片，前台會自動排成響應式圖片牆。</p>
                    </div>
                    <label className={`multi-image-upload-button ${isProcessing || !processSteps.length ? 'disabled' : ''}`}>
                      <Upload size={17} />
                      <span>加入多張照片</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isProcessing || !processSteps.length}
                        onChange={(event) => {
                          handleProcessBatchUpload(event.target.files);
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>

                  <label className="multi-image-step-selector">
                    選擇施工步驟
                    <select value={selectedStepIndex} onChange={(event) => setSelectedStepIndex(Number(event.target.value))}>
                      {processSteps.map((step, index) => (
                        <option value={index} key={`${step.stepNumber || index}-${step.title}`}>
                          步驟 {step.stepNumber || String(index + 1).padStart(2, '0')}｜{step.title || '未命名步驟'}（{getStepImages(step).length} 張）
                        </option>
                      ))}
                    </select>
                  </label>

                  {!selectedStep ? (
                    <div className="multi-image-empty"><p>目前沒有施工步驟。</p></div>
                  ) : selectedStepImages.length === 0 ? (
                    <div className="multi-image-empty">
                      <Images size={34} />
                      <p>此步驟尚未上傳現場照片。</p>
                    </div>
                  ) : (
                    <div className="multi-image-process-grid">
                      {selectedStepImages.map((image, imageIndex) => (
                        <div className="multi-image-process-item" key={`${selectedStepIndex}-${imageIndex}-${image.slice(-16)}`}>
                          <img src={image} alt={`${selectedStep.title} 現場照片 ${imageIndex + 1}`} />
                          <span>{imageIndex === 0 ? '主要圖片' : `照片 ${imageIndex + 1}`}</span>
                          <button type="button" onClick={() => removeProcessImage(selectedStepIndex, imageIndex)} title="刪除這張圖片">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="multi-image-modal-footer">
              <div className="multi-image-processing-status">
                {isProcessing ? processingMessage : '套用後，請使用原後台的發布按鈕正式更新官網。'}
              </div>
              <div>
                <button type="button" className="multi-image-secondary-action" onClick={() => setIsOpen(false)} disabled={isProcessing}>
                  取消
                </button>
                <button type="button" className="multi-image-primary-action" onClick={applyBatchChanges} disabled={isProcessing}>
                  <Save size={17} />
                  套用批次圖片
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
