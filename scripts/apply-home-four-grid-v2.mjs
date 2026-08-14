import fs from 'node:fs';

const homePath = 'src/pages/Home.jsx';
const adminPath = 'src/pages/AdminEditor.jsx';
const configPath = 'src/data/contentConfig.json';

function mustReplace(source, search, replacement, label) {
  if (!source.includes(search)) throw new Error(`Missing marker: ${label}`);
  return source.replace(search, replacement);
}

function replaceBetween(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing start marker: ${label}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end === -1) throw new Error(`Missing end marker: ${label}`);
  return source.slice(0, start) + replacement + source.slice(end);
}

function normalizeCard(item = {}, fallback = {}) {
  return {
    title: item.title || fallback.title || '清潔工程實績',
    category: item.category || fallback.category || '專業清潔維護',
    description: item.description || fallback.description || '依照現場需求提供專業清潔與維護服務。',
    image: item.image || fallback.image || 'images/banner_building.png',
  };
}

// 1) Normalize persisted content data.
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.home ||= {};
config.services ||= { items: [] };
const hardFallbacks = [
  { title: '馥華艾美酒店清潔維護', category: '飯店清潔與日常保養', description: '頂級飯店公共區域與客房長期日常維護。', image: 'images/hotel.jpg' },
  { title: '商辦大樓與廠辦清潔', category: '商辦大樓與廠辦清潔', description: '大型園區、辦公大樓與廠辦空間的高標準清潔維護。', image: 'images/banner_building.png' },
  { title: '綜合醫院消毒清潔服務', category: '醫療院所高規格清潔', description: '針對病房與公共區域執行高規格清潔及衛生管理。', image: 'images/training.jpg' },
  { title: '企業辦公空間日常維護', category: '辦公空間清潔', description: '依照企業需求規劃穩定、細緻的日常環境維護。', image: 'images/history.jpg' },
];
const serviceFallbacks = (Array.isArray(config.services.items) ? config.services.items : []).map((s) => normalizeCard({
  title: s.title,
  category: '專業清潔服務',
  description: s.description,
  image: s.image,
}));
let cases = Array.isArray(config.home.cases) ? config.home.cases.map((item) => normalizeCard(item)) : [];
const casePool = [...cases, ...serviceFallbacks, ...hardFallbacks];
while (cases.length < 4) cases.push(normalizeCard(casePool[cases.length] || hardFallbacks[cases.length]));
config.home.cases = cases.slice(0, 4);
let coreProjects = Array.isArray(config.home.coreProjects) ? config.home.coreProjects.map((item) => normalizeCard(item)) : [];
while (coreProjects.length < 4) coreProjects.push(normalizeCard(config.home.cases[coreProjects.length] || hardFallbacks[coreProjects.length]));
config.home.coreProjects = coreProjects.slice(0, 4);
delete config.home.testimonials;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

// 2) Patch homepage.
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace("import { Award, Zap, ShieldCheck, BookOpen, ArrowRight, Star, MessageSquare } from 'lucide-react';", "import { Award, Zap, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';");

const returnMarker = '\n  return (\n    <div className="animate-fade-in">';
const homePrelude = [
  '',
  '  const fallbackCoreProjects = [',
  '    ...(homeData.cases || []),',
  '    ...((servicesData && servicesData.items) || []).map((item) => ({',
  "      title: item.title,",
  "      category: '專業清潔服務',",
  '      description: item.description,',
  '      image: getServiceImage(item),',
  '    })),',
  "    { title: '馥華艾美酒店清潔維護', category: '飯店清潔與日常保養', description: '頂級飯店公共區域與客房長期日常維護。', image: 'images/hotel.jpg' },",
  "    { title: '商辦大樓與廠辦清潔', category: '商辦大樓與廠辦清潔', description: '大型園區、辦公大樓與廠辦空間的高標準清潔維護。', image: 'images/banner_building.png' },",
  "    { title: '綜合醫院消毒清潔服務', category: '醫療院所高規格清潔', description: '針對病房與公共區域執行高規格清潔及衛生管理。', image: 'images/training.jpg' },",
  "    { title: '企業辦公空間日常維護', category: '辦公空間清潔', description: '依照企業需求規劃穩定、細緻的日常環境維護。', image: 'images/history.jpg' },",
  '  ];',
  '  const coreProjects = (homeData.coreProjects && homeData.coreProjects.length > 0 ? homeData.coreProjects : fallbackCoreProjects).slice(0, 4);',
  '',
  '  return (',
  '    <div className="animate-fade-in">',
].join('\n');
home = mustReplace(home, returnMarker, homePrelude, 'home return insertion');

const collageReplacement = [
  '            {/* Core Projects Four-grid */}',
  "            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>",
  '              {coreProjects.map((project, index) => (',
  '                <article',
  '                  key={index}',
  "                  style={{ position: 'relative', minHeight: '200px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: '#e2e8f0' }}",
  '                >',
  '                  <img',
  "                    src={project.image || 'images/banner_building.png'}",
  "                    alt={project.title || ('核心工程實績 ' + (index + 1))}",
  "                    style={{ width: '100%', height: '100%', minHeight: '200px', objectFit: 'cover', display: 'block' }}",
  '                  />',
  "                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,28,61,0.04) 35%, rgba(11,28,61,0.78) 100%)' }} />",
  "                  <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem', color: '#fff' }}>",
  "                    <span style={{ fontSize: '0.72rem', fontWeight: '700', opacity: 0.92 }}>{project.category || '核心工程實績'}</span>",
  "                    <h4 style={{ margin: '0.2rem 0 0', color: '#fff', fontSize: '1rem', lineHeight: 1.35 }}>{project.title}</h4>",
  '                  </div>',
  '                </article>',
  '              ))}',
  '            </div>',
].join('\n');
home = replaceBetween(
  home,
  '            {/* Visual Collage Card */}',
  '          </div>\n        </div>\n      </section>\n\n      {/* Stats Counter Section (Moved to 3rd block) */}',
  collageReplacement + '\n',
  'corporate four-grid'
);

home = mustReplace(
  home,
  '<div className="grid-3" style={{ gap: \'2rem\' }}>\n              {homeData.cases.map((c, idx) => (',
  '<div className="grid-4" style={{ gap: \'1.5rem\' }}>\n              {homeData.cases.slice(0, 4).map((c, idx) => (',
  'recent cases four-grid'
);

home = replaceBetween(
  home,
  '      {/* NEW: Client Testimonials Section */}',
  '\n\n      {/* Dynamic CTA Banner */}',
  '',
  'remove homepage testimonials'
);
fs.writeFileSync(homePath, home);

// 3) Patch admin editor.
let admin = fs.readFileSync(adminPath, 'utf8');
const stateLine = '  const [localData, setLocalData] = useState(JSON.parse(JSON.stringify(configData)));';
const normalizedState = [
  '  const [localData, setLocalData] = useState(() => {',
  '    const cloned = JSON.parse(JSON.stringify(configData));',
  '    cloned.home ||= {};',
  '    const normalizedCases = Array.isArray(cloned.home.cases) ? cloned.home.cases : [];',
  '    while (normalizedCases.length < 4) {',
  '      normalizedCases.push({ title: \'工程實績 \' + (normalizedCases.length + 1), category: \'專業清潔維護\', description: \'請在後台更新此格工程實績說明。\', image: \'\' });',
  '    }',
  '    cloned.home.cases = normalizedCases.slice(0, 4);',
  '    const normalizedCore = Array.isArray(cloned.home.coreProjects) ? cloned.home.coreProjects : [];',
  '    while (normalizedCore.length < 4) normalizedCore.push(JSON.parse(JSON.stringify(cloned.home.cases[normalizedCore.length])));',
  '    cloned.home.coreProjects = normalizedCore.slice(0, 4);',
  '    delete cloned.home.testimonials;',
  '    return cloned;',
  '  });',
].join('\n');
admin = mustReplace(admin, stateLine, normalizedState, 'admin state normalization');

const coreEditor = [
  '                {/* 首頁核心工程實績四格圖 */}',
  "                <div style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>",
  "                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '0.35rem' }}>首頁核心工程實績四格圖</h3>",
  "                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>固定四格，對應前台「日式標準，頂規施工」右側圖片。每格皆可更新圖片、類別、標題與說明。</p>",
  '                </div>',
  '                <div className="admin-grid">',
  '                  {(localData.home.coreProjects || []).slice(0, 4).map((project, index) => (',
  '                    <div key={index} className="admin-list-item">',
  '                      <div className="admin-list-item-header"><span className="admin-badge">核心實績 {index + 1}</span></div>',
  '                      <div className="form-group">',
  '                        <label>標題</label>',
  '                        <input type="text" className="form-control" value={project.title || \'\'} onChange={(e) => {',
  '                          const items = [...localData.home.coreProjects]; items[index] = { ...items[index], title: e.target.value };',
  '                          setLocalData(prev => ({ ...prev, home: { ...prev.home, coreProjects: items } }));',
  '                        }} />',
  '                      </div>',
  '                      <div className="form-group">',
  '                        <label>類別標籤</label>',
  '                        <input type="text" className="form-control" value={project.category || \'\'} onChange={(e) => {',
  '                          const items = [...localData.home.coreProjects]; items[index] = { ...items[index], category: e.target.value };',
  '                          setLocalData(prev => ({ ...prev, home: { ...prev.home, coreProjects: items } }));',
  '                        }} />',
  '                      </div>',
  '                      <div className="form-group">',
  '                        <label>圖片</label>',
  '                        <div className="image-upload-zone" onClick={() => document.getElementById(\'coreProjectUpload-\' + index).click()}>',
  '                          <Info size={24} style={{ color: \'var(--text-muted)\' }} />',
  '                          <span>點擊上傳四格圖片</span>',
  '                          <input type="file" id={\'coreProjectUpload-\' + index} style={{ display: \'none\' }} accept="image/*" onChange={(e) => handleImageUpload([\'home\', \'coreProjects\', index, \'image\'], e.target.files[0])} />',
  '                          {project.image && <img src={project.image} alt={\'核心實績 \' + (index + 1)} className="image-preview-thumbnail" />}',
  '                        </div>',
  '                      </div>',
  '                      <div className="form-group" style={{ marginBottom: 0 }}>',
  '                        <label>說明</label>',
  '                        <textarea className="form-control" style={{ minHeight: \'60px\' }} value={project.description || \'\'} onChange={(e) => {',
  '                          const items = [...localData.home.coreProjects]; items[index] = { ...items[index], description: e.target.value };',
  '                          setLocalData(prev => ({ ...prev, home: { ...prev.home, coreProjects: items } }));',
  '                        }} />',
  '                      </div>',
  '                    </div>',
  '                  ))}',
  '                </div>',
  '',
].join('\n');
admin = mustReplace(admin, '                {/* 近期施工實績管理 (NEW) */}', coreEditor + '                {/* 近期施工實績管理 (NEW) */}', 'insert admin core editor');
admin = admin.replace('近期施工實績 (Recent Case Showcase)', '近期施工實績四格圖 (Recent Case Showcase)');
admin = replaceBetween(
  admin,
  '                {/* 客戶口碑見證管理 (NEW) */}',
  '\n              </div>\n            )}\n\n            {/* SUBTAB 3: ABOUT & TRAINING */}',
  '',
  'remove admin testimonials'
);
fs.writeFileSync(adminPath, admin);

console.log('Homepage four-grid v2 migration completed.');
