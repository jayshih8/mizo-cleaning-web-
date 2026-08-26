import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Star, Trash2, Upload } from 'lucide-react';
import './ImageGallery.css';

const MAX_SOURCE_FILE_BYTES = 25 * 1024 * 1024;
const TARGET_IMAGE_BYTES = 650 * 1024;
const MAX_IMAGE_DIMENSION = 1280;

const dataUrlBytes = (dataUrl) => {
  if (!dataUrl || !dataUrl.includes(',')) return 0;
  const base64 = dataUrl.split(',')[1];
  return Math.ceil((base64.length * 3) / 4);
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const loadImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error(`無法讀取「${file.name}」`));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error(`「${file.name}」格式無法解析，請改用 JPG、PNG 或 WebP`));
    image.onload = () => resolve(image);
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

const compressImage = async (file) => {
  if (!file.type.startsWith('image/')) throw new Error(`「${file.name}」不是圖片檔`);
  if (file.size > MAX_SOURCE_FILE_BYTES) throw new Error(`「${file.name}」超過 25 MB，請先縮小後再上傳`);

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
  let width = Math.max(1, Math.round(image.width * scale));
  let height = Math.max(1, Math.round(image.height * scale));
  let quality = 0.8;
  let result = '';

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('瀏覽器無法處理圖片，請重新整理後再試一次');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    result = canvas.toDataURL('image/jpeg', quality);

    if (dataUrlBytes(result) <= TARGET_IMAGE_BYTES) break;

    if (quality > 0.58) {
      quality -= 0.08;
    } else {
      width = Math.max(480, Math.round(width * 0.86));
      height = Math.max(360, Math.round(height * 0.86));
      quality = 0.68;
    }
  }

  return result;
};

export default function MultiImageUpload({
  inputId,
  images,
  onChange,
  onStatus,
  emptyText = '點擊或拖曳，一次選擇多張圖片',
  helpText = '可一次選擇 6 張以上，圖片會自動壓縮。',
  maxImages = 30,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  const currentImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    return [...new Set(images.filter((source) => typeof source === 'string' && source.trim()))];
  }, [images]);

  const totalBytes = useMemo(
    () => currentImages.reduce((sum, source) => sum + dataUrlBytes(source), 0),
    [currentImages],
  );

  const notify = (message) => {
    if (typeof onStatus === 'function') onStatus(message);
  };

  const processFiles = async (fileList) => {
    if (isProcessing) return;

    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) {
      setErrorMessage('請選擇 JPG、PNG 或 WebP 圖片檔。');
      return;
    }

    const remainingSlots = Math.max(0, maxImages - currentImages.length);
    if (remainingSlots === 0) {
      setErrorMessage(`每個項目最多可放 ${maxImages} 張圖片。`);
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    setErrorMessage('');
    setIsProcessing(true);
    setProgress({ current: 0, total: selectedFiles.length });

    try {
      const compressedImages = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const compressed = await compressImage(selectedFiles[index]);
        compressedImages.push(compressed);
        setProgress({ current: index + 1, total: selectedFiles.length });
      }

      const nextImages = [...currentImages, ...compressedImages].slice(0, maxImages);
      onChange(nextImages);

      const skippedCount = files.length - selectedFiles.length;
      const message = skippedCount > 0
        ? `已新增 ${compressedImages.length} 張；因上限為 ${maxImages} 張，另有 ${skippedCount} 張未加入。`
        : `已一次新增 ${compressedImages.length} 張圖片，第一張會作為封面。`;
      notify(message);
    } catch (error) {
      setErrorMessage(error.message || '圖片處理失敗，請重新選擇圖片。');
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    const nextImages = [...currentImages];
    const [selected] = nextImages.splice(index, 1);
    nextImages.unshift(selected);
    onChange(nextImages);
    notify('已更新封面圖片。');
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;
    const nextImages = [...currentImages];
    [nextImages[index], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[index]];
    onChange(nextImages);
  };

  const deleteImage = (index) => {
    if (!window.confirm('確定要刪除這張圖片嗎？')) return;
    const nextImages = currentImages.filter((_, imageIndex) => imageIndex !== index);
    onChange(nextImages);
    notify('圖片已刪除。');
  };

  const openPicker = () => {
    if (!isProcessing) inputRef.current?.click();
  };

  return (
    <div className="multi-image-upload-panel">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => processFiles(event.target.files)}
      />

      <button
        type="button"
        className={`multi-image-upload-trigger ${isDragging ? 'is-dragging' : ''}`}
        onClick={openPicker}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          processFiles(event.dataTransfer.files);
        }}
        disabled={isProcessing}
      >
        {isProcessing ? <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={28} />}
        <strong>{isProcessing ? `正在處理 ${progress.current} / ${progress.total}` : emptyText}</strong>
        <span>{helpText}</span>
      </button>

      <div className="multi-image-upload-summary">
        <span>目前 {currentImages.length} / {maxImages} 張</span>
        <span>圖片資料約 {formatBytes(totalBytes)}</span>
      </div>

      {errorMessage && <p className="multi-image-upload-error">{errorMessage}</p>}

      {currentImages.length > 0 && (
        <div className="multi-image-upload-grid">
          {currentImages.map((source, index) => (
            <div className="multi-image-upload-card" key={`${source.slice(0, 40)}-${index}`}>
              <img src={source} alt={`已上傳圖片 ${index + 1}`} />
              {index === 0 && <span className="multi-image-upload-cover-badge">封面</span>}
              <div className="multi-image-upload-actions">
                <button
                  type="button"
                  className="multi-image-upload-action"
                  onClick={() => setAsCover(index)}
                  disabled={index === 0}
                  title="設為封面"
                  aria-label={`將第 ${index + 1} 張設為封面`}
                >
                  <Star size={15} />
                </button>
                <button
                  type="button"
                  className="multi-image-upload-action"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  title="往前移"
                  aria-label={`將第 ${index + 1} 張往前移`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="multi-image-upload-action"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === currentImages.length - 1}
                  title="往後移"
                  aria-label={`將第 ${index + 1} 張往後移`}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  className="multi-image-upload-action is-delete"
                  onClick={() => deleteImage(index)}
                  title="刪除圖片"
                  aria-label={`刪除第 ${index + 1} 張圖片`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
