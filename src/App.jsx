import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWidget from './components/FloatingWidget';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Credentials from './pages/Credentials';
import Process from './pages/Process';
import Contact from './pages/Contact';
import AdminEditor from './pages/AdminEditor';

// Import initial static content JSON
import initialConfig from './data/contentConfig.json';

export default function App() {
  // Navigation active tab state: 'home' | 'about' | 'services' | 'credentials' | 'contact' | 'admin'
  const [activeTab, setActiveTab] = useState('home');

  // Helper to map pathname to activeTab ID
  const getTabFromPath = (pathname) => {
    // Remove leading and trailing slashes and split by query string
    const cleanPath = pathname.split('?')[0].replace(/^\/|\/$/g, '');
    if (cleanPath === 'admin-portal' || cleanPath === 'admin') {
      return 'admin';
    }
    if (!cleanPath || cleanPath === 'home') {
      return 'home';
    }
    const validTabs = ['about', 'services', 'process', 'credentials', 'contact'];
    if (validTabs.includes(cleanPath)) {
      return cleanPath;
    }
    return 'home';
  };

  // Monitor pathname changes (popstate event for browser back/forward buttons)
  useEffect(() => {
    const handleLocationChange = () => {
      const tab = getTabFromPath(window.location.pathname);
      setActiveTab(tab);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Sync pathname to activeTab whenever tab changes
  useEffect(() => {
    const currentTab = getTabFromPath(window.location.pathname);
    if (activeTab !== currentTab) {
      let newPath = '/';
      if (activeTab === 'admin') {
        newPath = '/admin-portal';
      } else if (activeTab !== 'home') {
        newPath = `/${activeTab}`;
      }
      window.history.pushState({}, '', newPath);
    }
  }, [activeTab]);

  // Load configuration from localStorage if edit session exists, fallback to imported json
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mizo_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          company: { ...initialConfig.company, ...parsed.company },
          home: { ...initialConfig.home, ...parsed.home },
          about: { ...initialConfig.about, ...parsed.about },
          services: { ...initialConfig.services, ...parsed.services },
          credentials: { ...initialConfig.credentials, ...parsed.credentials },
          process: { ...initialConfig.process, ...parsed.process },
          contact: { ...initialConfig.contact, ...(parsed.contact || {}) },
        };
      }
      return initialConfig;
    } catch (e) {
      console.error('Failed to parse saved config from localStorage', e);
      return initialConfig;
    }
  });

  // Dynamic Favicon Update Effect
  useEffect(() => {
    const faviconUrl = config?.company?.favicon;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (faviconUrl) {
      link.href = faviconUrl;
      link.type = faviconUrl.startsWith('data:image/svg+xml') ? 'image/svg+xml' : 'image/png';
    } else {
      // Default fallback SVG SOAP emoji
      link.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧼</text></svg>";
      link.type = 'image/svg+xml';
    }
  }, [config?.company?.favicon]);

  // Dynamic Page Title & SEO Meta Description Update Effect
  useEffect(() => {
    const baseTitle = config?.company?.name || '美裝公寓大廈管理維護';
    const tabTitles = {
      home: `首頁 | ${baseTitle}`,
      about: `關於我們 | ${baseTitle}`,
      services: `服務項目 | ${baseTitle}`,
      process: `施工過程 | ${baseTitle}`,
      credentials: `專業證照 | ${baseTitle}`,
      contact: `聯絡我們 | ${baseTitle}`,
      admin: `管理後台 | ${config?.company?.logoText || baseTitle}`
    };
    
    // Set page title
    document.title = tabTitles[activeTab] || baseTitle;

    // Set page meta description dynamically (except for admin portal)
    if (activeTab !== 'admin') {
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.getElementsByTagName('head')[0].appendChild(metaDesc);
      }
      
      const tabDescriptions = {
        home: `美裝公寓大廈管理維護股份有限公司創立於 1979 年中日合資技術合作，引進日本東京美裝興業高標準 SOP，為大型工廠、商辦大樓、國際飯店與大型醫院提供極致品質與職業安全雙重合規的清潔維護服務。`,
        about: `了解美裝公寓大廈管理維護股份有限公司的經營理念與發展沿革。我們引進日式精密工法與嚴格的員工安全教育培訓，提供頂級的清潔管理服務。`,
        services: `探索我們提供的全方位清潔維護服務：大樓與大型工廠清潔、國際觀光飯店日常保養、企業商辦派駐清潔、醫療院所高規格消毒清潔。`,
        process: `查看美裝的日式標準施工清潔作業流程。包含施工前會勘、安全防護準備、日式工法施作、領班雙重檢驗到完工驗收的完整 SOP。`,
        credentials: `美裝公寓大廈管理維護是台北市清潔公會金質獎優良廠商，擁有齊全的甲種職業安全衛生主管、吊籠操作、勞安等各項專業證照及合規合法的公會會員資格。`,
        contact: `歡迎填寫線上諮詢預約單進行免費現場會勘與估價。我們將派專人與您聯繫，提供量身規劃的大樓與廠辦清潔管理方案。`
      };
      metaDesc.content = tabDescriptions[activeTab] || tabDescriptions.home;
    }

    // Trigger Google Analytics Page View when tab changes
    const gaId = config?.company?.gaId;
    if (window.gtag && gaId) {
      window.gtag('config', gaId, {
        page_path: window.location.pathname,
        page_title: document.title
      });
    }
  }, [activeTab, config]);

  // Dynamic Google Tracking Integration (GA4 & Google Search Console Verification)
  useEffect(() => {
    const gaId = config?.company?.gaId;
    const googleVerification = config?.company?.googleVerification;

    // Handle Google Search Console Verification Meta Tag
    let verificationMeta = document.querySelector("meta[name='google-site-verification']");
    if (googleVerification) {
      if (!verificationMeta) {
        verificationMeta = document.createElement('meta');
        verificationMeta.name = 'google-site-verification';
        document.getElementsByTagName('head')[0].appendChild(verificationMeta);
      }
      verificationMeta.content = googleVerification;
    } else if (verificationMeta) {
      verificationMeta.remove();
    }

    // Handle Google Analytics 4 (GA4) Script Tags
    const gaScriptId1 = 'google-analytics-gtag-loader';
    const gaScriptId2 = 'google-analytics-gtag-init';

    // Remove old tags if they exist
    document.getElementById(gaScriptId1)?.remove();
    document.getElementById(gaScriptId2)?.remove();

    if (gaId) {
      // Tag 1: External script loader
      const script1 = document.createElement('script');
      script1.id = gaScriptId1;
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      // Tag 2: Initialization script
      const script2 = document.createElement('script');
      script2.id = gaScriptId2;
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { page_path: window.location.pathname });
      `;
      document.head.appendChild(script2);
    }
  }, [config?.company?.gaId, config?.company?.googleVerification]);

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('mizo_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  };

  const handleResetConfig = () => {
    try {
      localStorage.removeItem('mizo_config');
      setConfig(initialConfig);
    } catch (e) {
      console.error('Failed to reset config in localStorage', e);
    }
  };

  // Render correct subpage based on state router
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home homeData={config.home} companyInfo={config.company} servicesData={config.services} setActiveTab={setActiveTab} />;
      case 'about':
        return <About aboutData={config.about} />;
      case 'services':
        return <Services servicesData={config.services} />;
      case 'process':
        return <Process processData={config.process} />;
      case 'credentials':
        return <Credentials credentialsData={config.credentials} />;
      case 'contact':
        return <Contact companyInfo={config.company} contactData={config.contact} />;
      case 'admin':
        return (
          <AdminEditor
            configData={config}
            onSave={handleSaveConfig}
            onReset={handleResetConfig}
            setActiveTab={setActiveTab}
          />
        );
      default:
        return <Home homeData={config.home} companyInfo={config.company} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} companyInfo={config.company} />
      
      {/* Main content router viewport */}
      <main style={{ flexGrow: 1 }}>
        {renderContent()}
      </main>

      {/* Footer Details */}
      <Footer setActiveTab={setActiveTab} companyInfo={config.company} />

      {/* Floating Widget Action Panel */}
      <FloatingWidget companyInfo={config.company} />
    </div>
  );
}
