const replaceBetween = (source, startMarker, endMarker, replacement, label) => {
  const startIndex = source.indexOf(startMarker)
  if (startIndex < 0) throw new Error(`[multi-image] Missing start marker: ${label}`)

  const endIndex = source.indexOf(endMarker, startIndex + startMarker.length)
  if (endIndex < 0) throw new Error(`[multi-image] Missing end marker: ${label}`)

  return `${source.slice(0, startIndex)}${replacement}${source.slice(endIndex)}`
}

const transformAdminEditor = (source) => {
  let code = source

  code = code.replace(
    "import { Save, Download, RotateCcw, AlertTriangle, FileText, Info, Plus, Trash, LogOut, Rocket, Settings, CheckCircle2, XCircle, Loader, Upload, Lock } from 'lucide-react';\n",
    "import { Save, Download, RotateCcw, AlertTriangle, FileText, Info, Plus, Trash, LogOut, Rocket, Settings, CheckCircle2, XCircle, Loader, Upload, Lock } from 'lucide-react';\nimport MultiImageUpload from '../components/MultiImageUpload';\n",
  )

  const saveMarker = '\n\n  const handleSave = () => {'
  const galleryHelpers = `

  const getGalleryImages = (item) => {
    if (Array.isArray(item?.images) && item.images.length > 0) {
      return item.images.filter(Boolean);
    }
    return item?.image ? [item.image] : [];
  };

  const handleGalleryChange = (itemPath, images) => {
    setLocalData((previousData) => {
      const nextData = JSON.parse(JSON.stringify(previousData));
      let current = nextData;
      for (let index = 0; index < itemPath.length; index += 1) {
        current = current[itemPath[index]];
      }

      const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];
      current.images = normalizedImages;
      current.image = normalizedImages[0] || '';
      return nextData;
    });
  };`

  if (!code.includes(saveMarker)) throw new Error('[multi-image] AdminEditor helper insertion marker not found')
  code = code.replace(saveMarker, `${galleryHelpers}${saveMarker}`)

  code = replaceBetween(
    code,
    `                      <div className="form-group">
                        <label>圖片</label>
                        <div className="image-upload-zone" onClick={() => document.getElementById('coreProjectUpload-' + index).click()}>`,
    `                      <div className="form-group" style={{ marginBottom: 0 }}>`,
    `                      <div className="form-group">
                        <label>圖片集</label>
                        <MultiImageUpload
                          inputId={'coreProjectUpload-' + index}
                          images={getGalleryImages(project)}
                          onChange={(images) => handleGalleryChange(['home', 'coreProjects', index], images)}
                          onStatus={showToast}
                          emptyText="點擊或拖曳，一次選擇多張核心實績照片"
                          helpText="可一次上傳 6 張以上；第一張為封面，可排序或刪除，最多 30 張。"
                        />
                      </div>
`,
    'AdminEditor core project upload',
  )

  code = replaceBetween(
    code,
    `                    {/* Step Image upload */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>施工現場照片 (點擊上傳圖片，自動轉 Base64)</label>`,
    `                  </div>
                ))}
              </div>
            )}`,
    `                    {/* Step Image upload */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>施工現場照片</label>
                      <MultiImageUpload
                        inputId={'stepUpload-' + index}
                        images={getGalleryImages(step)}
                        onChange={(images) => handleGalleryChange(['process', 'steps', index], images)}
                        onStatus={showToast}
                        emptyText="點擊或拖曳，一次選擇此類型的多張現場照片"
                        helpText="可一次上傳 6 張以上；第一張為封面，可排序或刪除，最多 30 張。"
                      />
                    </div>
`,
    'AdminEditor process step upload',
  )

  return code.replace(
    '固定四格，對應前台「日式標準，頂規施工」右側圖片。每格皆可更新圖片、類別、標題與說明。',
    '固定四格，對應前台「日式標準，頂規施工」右側圖片。每格可一次上傳多張照片，並更新封面、順序、類別、標題與說明。',
  )
}

const transformHome = (source) => {
  let code = source.replace(
    "import React from 'react';\n",
    "import React from 'react';\nimport ImageGallery from '../components/ImageGallery';\n",
  )

  code = replaceBetween(
    code,
    `                  <SiteImage
                    src={project.image || '/images/banner_building.png'}
                    alt={project.title || ('核心工程實績 ' + (index + 1))}`,
    `                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,28,61,0.04) 35%, rgba(11,28,61,0.78) 100%)' }} />`,
    `                  <ImageGallery
                    images={project.images}
                    fallback={project.image || '/images/banner_building.png'}
                    alt={project.title || ('核心工程實績 ' + (index + 1))}
                    className="core-project-image-gallery"
                    sizes="(max-width: 768px) 45vw, 280px"
                    style={{ position: 'absolute', inset: 0 }}
                  />
`,
    'Home core project gallery',
  )

  code = code.replace(
    `                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,28,61,0.04) 35%, rgba(11,28,61,0.78) 100%)' }} />`,
    `                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,28,61,0.04) 35%, rgba(11,28,61,0.78) 100%)', pointerEvents: 'none' }} />`,
  )

  return code.replace(
    `                  <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem', color: '#fff' }}>`,
    `                  <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem', color: '#fff', pointerEvents: 'none' }}>`,
  )
}

const transformProcess = (source) => {
  let code = source.replace(
    "import React from 'react';\n",
    "import React from 'react';\nimport ImageGallery from '../components/ImageGallery';\n",
  )

  return replaceBetween(
    code,
    `                  <SiteImage
                    src={step.image}
                    alt={step.title}`,
    `                </div>

                {/* Content Section */}`,
    `                  <ImageGallery
                    images={step.images}
                    fallback={step.image || '/images/banner_building.png'}
                    alt={step.title || ('施工步驟 ' + (index + 1))}
                    className="process-step-gallery"
                  />
`,
    'Process step gallery',
  )
}

export default function multiImageGalleryPlugin() {
  return {
    name: 'mizo-multi-image-gallery',
    enforce: 'pre',
    transform(source, id) {
      source = source.replace(/\r\n/g, '\n')
      const normalizedId = id.replace(/\\/g, '/')
      if (normalizedId.endsWith('/src/pages/AdminEditor.jsx')) {
        return { code: transformAdminEditor(source), map: null }
      }
      if (normalizedId.endsWith('/src/pages/Home.jsx')) {
        return { code: transformHome(source), map: null }
      }
      if (normalizedId.endsWith('/src/pages/Process.jsx')) {
        return { code: transformProcess(source), map: null }
      }
      return null
    },
  }
}
