import fs from 'node:fs';

const homePath = 'src/pages/Home.jsx';
const adminPath = 'src/pages/AdminEditor.jsx';
const configPath = 'src/data/contentConfig.json';

function replaceOrFail(source, matcher, replacement, label) {
  const next = source.replace(matcher, replacement);
  if (next === source) throw new Error(`Patch failed: ${label}`);
  return next;
}

function normalizeCard(item = {}, fallback = {}) {
  return {
    title: item.title || fallback.title || '清潔工程實績',
    category: item.category || fallback.category || '專業清潔維護',
    description: item.description || fallback.description || '依照現場需求提供專業清潔與維護服務。',
    image: item.image || fallback.image || 'images/banner_building.png',
  };
}

// ----- contentConfig.json -----
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.home ||= {};
config.services ||= { items: [] };
const services = Array.isArray(config.services.items) ? config.services.items : [];
const cases = Array.isArray(config.home.cases) ? config.home.cases.map((c) => normalizeCard(c)) : [];
const fallbackCards = services.map((s) => normalizeCard({
  title: s.title,
  category: '專業清潔服務',
  description: s.description,
  image: s.image,
}));
const hardFallbacks = [
  { title: '馥華艾美酒店清潔維護', category: '飯店清潔與日常保養', description: '頂級飯店公共區域與客房長期日常維護。', image: 'images/hotel.jpg' },
  { title: '商辦大樓與廠辦清潔', category: '商辦大樓與廠辦清潔', description: '大型園區、辦公大樓與廠辦空間的高標準清潔維護。', image: 'images/banner_building.png' },
  { title: '綜合醫院消毒清潔服務', category: '醫療院所高規格清潔', description: '針對病房與公共區域執行高規格清潔及衛生管理。', image: 'images/training.jpg' },
  { title: '企業辦公空間日常維護', category: '辦公空間清潔', description: '依照企業需求規劃穩定、細緻的日常環境維護。', image: 'images/history.jpg' },
].map((c) => normalizeCard(c));
const pool = [...cases, ...fallbackCards, ...hardFallbacks];
while (cases.length < 4) cases.push(normalizeCard(pool[cases.length] || hardFallbacks[cases.length]));
config.home.cases = cases.slice(0, 4);
const coreProjects = Array.isArray(config.home.coreProjects) ? config.home.coreProjects.map((c) => normalizeCard(c)) : [];
while (coreProjects.length < 4) coreProjects.push(normalizeCard(config.home.cases[coreProjects.length] || hardFallbacks[coreProjects.length]));
config.home.coreProjects = coreProjects.slice(0, 4);
delete config.home.testimonials;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

// ----- Home.jsx -----
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace("import { Award, Zap, ShieldCheck, BookOpen, ArrowRight, Star, MessageSquare } from 'lucide-react';", "import { Award, Zap, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';");

home = replaceOrFail(
  home,
  /\n  return \(\n    <div className="animate-fade-in">/,
  `\n  const fallbackCoreProjects = [\n    ...(homeData.cases || []),\n    ...((servicesData && servicesData.items) || []).map((item) => ({\n      title: item.title,\n      category: '專業清潔服務',\n      description: item.description,\n      image: getServiceImage(item),\n    })),\n    { title: '馥華艾美酒店清潔維護', category: '飯店清潔與日常保養', description: '頂級飯店公共區域與客房長期日常維護。', image: 'images/hotel.jpg' },\n    { title: '商辦大樓與廠辦清潔', category: '商辦大樓與廠辦清潔', description: '大型園區、辦公大樓與廠辦空間的高標準清潔維護。', image: 'images/banner_building.png' },\n    { title: '綜合醫院消毒清潔服務', category: '醫療院所高規格清潔', description: '針對病房與公共區域執行高規格清潔及衛生管理。', image: 'images/training.jpg' },\n    { title: '企業辦公空間日常維護', category: '辦公空間清潔', description: '依照企業需求規劃穩定、細緻的日常環境維護。', image: 'images/history.jpg' },\n  ];\n  const coreProjects = (homeData.coreProjects && homeData.coreProjects.length > 0 ? homeData.coreProjects : fallbackCoreProjects).slice(0, 4);\n\n  return (\n    <div className="animate-fade-in">`,
  'insert coreProjects fallback'
);

home = replaceOrFail(
  home,
  /            \{\/\* Visual Collage Card \*\/\}[\s\S]*?\n            <\/div>(?=\n          <\/div>\n        <\/div>\n      <\/section>\n\n      \{\/\* Stats Counter)/,
  `            {/* Core Projects Four-grid */}\n            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>\n              {coreProjects.map((project, index) => (\n                <article\n                  key={index}\n                  style={{\n                    position: 'relative',\n                    minHeight: '200px',\n                    borderRadius: 'var(--radius-lg)',\n                    overflow: 'hidden',\n                    boxShadow: 'var(--shadow-md)',\n                    background: '#e2e8f0',\n                  }}\n                >\n                  <img\n                    src={project.image || 'images/banner_building.png'}\n                    alt={project.title || \\`核心工程實績 \\${index + 1}\\`}\n                    style={{ width: '100%', height: '100%', minHeight: '200px', objectFit: 'cover', display: 'block' }}\n                  />\n                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,28,61,0.04) 35%, rgba(11,28,61,0.78) 100%)' }} />\n                  <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem', color: '#fff' }}>\n                    <span style={{ fontSize: '0.72rem', fontWeight: '700', opacity: 0.92 }}>{project.category || '核心工程實績'}</span>\n                    <h4 style={{ margin: '0.2rem 0 0', color: '#fff', fontSize: '1rem', lineHeight: 1.35 }}>{project.title}</h4>\n                  </div>\n                </article>\n              ))}\n            </div>`,
  'replace corporate visual with four-grid'
);

home = replaceOrFail(
  home,
  `<div className="grid-3" style={{ gap: '2rem' }}>\n              {homeData.cases.map((c, idx) => (`,
  `<div className="grid-4" style={{ gap: '1.5rem' }}>\n              {homeData.cases.slice(0, 4).map((c, idx) => (`,
  'cases four-grid'
);

home = replaceOrFail(
  home,
  /\n      \{\/\* NEW: Client Testimonials Section \*\/\}[\s\S]*?(?=\n\n      \{\/\* Dynamic CTA Banner \*\/\})/,
  '',
  'remove testimonials section'
);
fs.writeFileSync(homePath, home);

// ----- AdminEditor.jsx -----
let admin = fs.readFileSync(adminPath, 'utf8');
admin = replaceOrFail(
  admin,
  "  const [localData, setLocalData] = useState(JSON.parse(JSON.stringify(configData)));",
  `  const [localData, setLocalData] = useState(() => {\n    const cloned = JSON.parse(JSON.stringify(configData));\n    cloned.home ||= {};\n    const fallbackCases = Array.isArray(cloned.home.cases) ? cloned.home.cases : [];\n    while (fallbackCases.length < 4) {\n      fallbackCases.push({\n        title: \\`工程實績 \\${fallbackCases.length + 1}\\`,\n        category: '專業清潔維護',\n        description: '請在後台更新此格工程實績說明。',\n        image: '',\n      });\n    }\n    cloned.home.cases = fallbackCases.slice(0, 4);\n    const coreProjects = Array.isArray(cloned.home.coreProjects) ? cloned.home.coreProjects : [];\n    while (coreProjects.length < 4) coreProjects.push(JSON.parse(JSON.stringify(cloned.home.cases[coreProjects.length])));\n    cloned.home.coreProjects = coreProjects.slice(0, 4);\n    delete cloned.home.testimonials;\n    return cloned;\n  });`,
  'normalize admin homepage data'
);

admin = replaceOrFail(
  admin,
  /  const handleAddCase = \(\) => \{[\s\S]*?\n  \};\n\n  const handleDeleteCase/,
  `  const handleAddCase = () => {\n    if ((localData.home.cases || []).length >= 4) {\n      showToast('首頁施工實績固定顯示 4 格，請直接編輯現有四格內容。');\n      return;\n    }\n    const newCase = {\n      title: '新增工程實績案例',\n      category: '施工項目類別',\n      description: '請輸入此實績的詳細施工內容、地點或成果說明。',\n      image: ''\n    };\n    setLocalData(prev => ({ ...prev, home: { ...prev.home, cases: [...(prev.home.cases || []), newCase] } }));\n  };\n\n  const handleDeleteCase`,
  'limit cases to four'
);

admin = replaceOrFail(
  admin,
  /  const handleDeleteCase = \(index\) => \{[\s\S]*?\n  \};\n\n  const handleAddTestimonial/,
  `  const handleDeleteCase = (index) => {\n    if ((localData.home.cases || []).length <= 4) {\n      showToast('首頁施工實績固定保留 4 格，請直接修改內容，不需刪除。');\n      return;\n    }\n    if (window.confirm('確定要刪除此施工實績嗎？')) {\n      const newCases = (localData.home.cases || []).filter((_, i) => i !== index);\n      setLocalData(prev => ({ ...prev, home: { ...prev.home, cases: newCases } }));\n    }\n  };\n\n  const handleAddTestimonial`,
  'protect four cases'
);

admin = replaceOrFail(
  admin,
  /\n  const handleAddTestimonial = \(\) => \{[\s\S]*?(?=\n  if \(!isAuthenticated\))/,
  '',
  'remove testimonial handlers'
);

const coreEditor = `\n                {/* 首頁核心工程實績四格圖 */}\n                <div style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>\n                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '0.35rem' }}>首頁核心工程實績四格圖</h3>\n                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>固定四格，對應前台「日式標準，頂規施工」右側圖片。每格皆可更新圖片、類別、標題與說明。</p>\n                </div>\n                <div className="admin-grid">\n                  {(localData.home.coreProjects || []).slice(0, 4).map((project, index) => (\n                    <div key={index} className="admin-list-item">\n                      <div className="admin-list-item-header"><span className="admin-badge">核心實績 {index + 1}</span></div>\n                      <div className="form-group">\n                        <label>標題</label>\n                        <input type="text" className="form-control" value={project.title || ''} onChange={(e) => {\n                          const items = [...localData.home.coreProjects]; items[index] = { ...items[index], title: e.target.value };\n                          setLocalData(prev => ({ ...prev, home: { ...prev.home, coreProjects: items } }));\n                        }} />\n                      </div>\n                      <div className="form-group">\n                        <label>類別標籤</label>\n                        <input type="text" className="form-control" value={project.category || ''} onChange={(e) => {\n                          const items = [...localData.home.coreProjects]; items[index] = { ...items[index], category: e.target.value };\n                          setLocalData(prev => ({ ...prev, home: { ...prev.home, coreProjects: items } }));\n                        }} />\n                      </div>\n                      <div className="form-group">\n                        <label>圖片</label>\n                        <div className="image-upload-zone" onClick={() => document.getElementById(\\`coreProjectUpload-\\${index}\\`).click()}>\n                          <Info size={24} style={{ color: 'var(--text-muted)' }} />\n                          <span>點擊上傳四格圖片</span>\n                          <input type="file" id={\\`coreProjectUpload-\\${index}\\`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(['home', 'coreProjects', index, 'image'], e.target.files[0])} />\n                          {project.image && <img src={project.image} alt={\\`核心實績 \\${index + 1}\\`} className="image-preview-thumbnail" />}\n                        </div>\n                      </div>\n                      <div className="form-group" style={{ marginBottom: 0 }}>\n                        <label>說明</label>\n                        <textarea className="form-control" style={{ minHeight: '60px' }} value={project.description || ''} onChange={(e) => {\n                          const items = [...localData.home.coreProjects]; items[index] = { ...items[index], description: e.target.value };\n                          setLocalData(prev => ({ ...prev, home: { ...prev.home, coreProjects: items } }));\n                        }} />\n                      </div>\n                    </div>\n                  ))}\n                </div>\n\n`;
admin = replaceOrFail(
  admin,
  "                {/* 近期施工實績管理 (NEW) */}",
  coreEditor + "                {/* 近期施工實績管理 (NEW) */}",
  'insert core projects editor'
);

admin = admin.replace('近期施工實績 (Recent Case Showcase)', '近期施工實績四格圖 (Recent Case Showcase)');
admin = admin.replace('<span>新增施工實績</span>', '<span>固定四格</span>');
admin = replaceOrFail(
  admin,
  /\n\s*\{\/\* 客戶口碑見證管理 \(NEW\) \*\/\}[\s\S]*?(?=\n\s*<\/div>\n\s*\)\}\n\n\s*\{\/\* SUBTAB 3: ABOUT & TRAINING \*\/\})/,
  '',
  'remove testimonials admin section'
);
fs.writeFileSync(adminPath, admin);

console.log('Homepage four-grid migration applied successfully.');
