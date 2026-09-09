import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWidget from './components/FloatingWidget';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Credentials from './pages/Credentials';
import Process from './pages/Process';
import Contact from './pages/Contact';
import initialConfig from './data/siteContent.generated.json';
import { applyPageSeo, pageFromPath, PUBLIC_PAGES } from './lib/seo';

// Load original editable images and admin code only when the admin portal opens.
const AdminPage = lazy(() => import('./pages/AdminPage'));

export default function App({ initialPath }) {
  const [pathname, setPathname] = useState(() => initialPath ?? (typeof window === 'undefined' ? '/' : window.location.pathname));
  const [config, setConfig] = useState(initialConfig);
  const [adminDraft, setAdminDraft] = useState(null);
  const page = useMemo(() => pageFromPath(pathname), [pathname]);

  const navigate = (tab) => {
    const path = tab === 'admin' ? '/admin-portal' : PUBLIC_PAGES.find(item => item.id === tab)?.path || '/';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setPathname(path);
  };

  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  useEffect(() => {
    applyPageSeo(page, config);
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page, config]);

  useEffect(() => {
    const id = config.company.gaId?.trim();
    if (!/^G-[A-Z0-9]+$/.test(id || '')) return;
    window.dataLayer ||= [];
    window.gtag ||= function () { window.dataLayer.push(arguments); };
    let loader = document.getElementById('google-analytics-gtag-loader');
    if (!loader) {
      loader = document.createElement('script');
      loader.id = 'google-analytics-gtag-loader';
      loader.async = true;
      loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.append(loader);
      window.gtag('js', new Date());
    }
    window.gtag('config', id, { send_page_view: false });
  }, [config.company.gaId]);

  useEffect(() => {
    if (window.gtag && /^G-[A-Z0-9]+$/.test(config.company.gaId || '') && !['admin', 'not-found'].includes(page.id)) {
      window.gtag('event', 'page_view', { send_to: config.company.gaId, page_path: page.path, page_location: window.location.href, page_title: document.title });
    }
  }, [page, config.company.gaId]);

  const saveConfig = (next) => {
    setAdminDraft(next);
    setConfig({ ...next, seoAssets: initialConfig.seoAssets });
    try { localStorage.setItem('mizo_config', JSON.stringify(next)); }
    catch (error) { console.error('Failed to save local preview', error); }
  };
  const resetConfig = () => {
    setConfig(initialConfig);
    setAdminDraft(null);
    try { localStorage.removeItem('mizo_config'); }
    catch (error) { console.error('Failed to reset local preview', error); }
  };

  const content = () => {
    switch (page.id) {
      case 'home': return <Home homeData={config.home} companyInfo={config.company} servicesData={config.services} />;
      case 'about': return <About aboutData={config.about} />;
      case 'services': return <Services servicesData={config.services} />;
      case 'process': return <Process processData={config.process} />;
      case 'credentials': return <Credentials credentialsData={config.credentials} />;
      case 'contact': return <Contact companyInfo={config.company} contactData={config.contact} />;
      case 'admin': return <Suspense fallback={<p className="container section-padding" role="status">正在載入管理後台…</p>}><AdminPage draft={adminDraft} onSave={saveConfig} onReset={resetConfig} setActiveTab={navigate} /></Suspense>;
      default: return <section className="container section-padding"><h1>找不到這個頁面</h1><p>連結可能已變更，請回到首頁，或查看目前提供的清潔服務。</p><p className="not-found-links"><a href="/" className="btn btn-primary">返回首頁</a><a href="/services" className="btn btn-outline">查看清潔服務</a></p></section>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a className="skip-link" href="#main-content">跳至主要內容</a>
      <Header activeTab={page.id} setActiveTab={navigate} companyInfo={config.company} />
      <main id="main-content" style={{ flexGrow: 1 }}>
        {!['home', 'admin', 'not-found'].includes(page.id) && <nav className="container breadcrumbs" aria-label="麵包屑"><ol><li><a href="/">首頁</a></li><li aria-current="page">{page.name}</li></ol></nav>}
        {content()}
      </main>
      <Footer activeTab={page.id} setActiveTab={navigate} companyInfo={config.company} />
      <FloatingWidget companyInfo={config.company} />
    </div>
  );
}
