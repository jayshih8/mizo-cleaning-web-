import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWidget from './components/FloatingWidget';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Credentials from './pages/Credentials';
import Contact from './pages/Contact';
import AdminEditor from './pages/AdminEditor';

// Import initial static content JSON
import initialConfig from './data/contentConfig.json';

export default function App() {
  // Navigation active tab state: 'home' | 'about' | 'services' | 'credentials' | 'contact' | 'admin'
  const [activeTab, setActiveTab] = useState('home');

  // Monitor hash change for secret admin login and general routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin-portal' || hash === '#/admin' || hash === '#admin') {
        setActiveTab('admin');
      } else if (hash === '#/home' || hash === '#home') {
        setActiveTab('home');
      } else if (hash === '#/about' || hash === '#about') {
        setActiveTab('about');
      } else if (hash === '#/services' || hash === '#services') {
        setActiveTab('services');
      } else if (hash === '#/credentials' || hash === '#credentials') {
        setActiveTab('credentials');
      } else if (hash === '#/contact' || hash === '#contact') {
        setActiveTab('contact');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when activeTab changes
  useEffect(() => {
    const hash = window.location.hash;
    if (activeTab === 'admin') {
      if (hash !== '#/admin-portal') {
        window.location.hash = '#/admin-portal';
      }
    } else {
      if (hash === '#/admin-portal' || hash === '#/admin' || hash === '#admin') {
        window.location.hash = '#/home';
      }
    }
  }, [activeTab]);

  // Load configuration from localStorage if edit session exists, fallback to imported json
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mizo_config');
      return saved ? JSON.parse(saved) : initialConfig;
    } catch (e) {
      console.error('Failed to parse saved config from localStorage', e);
      return initialConfig;
    }
  });

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
        return <Home homeData={config.home} companyInfo={config.company} setActiveTab={setActiveTab} />;
      case 'about':
        return <About aboutData={config.about} />;
      case 'services':
        return <Services servicesData={config.services} />;
      case 'credentials':
        return <Credentials credentialsData={config.credentials} />;
      case 'contact':
        return <Contact companyInfo={config.company} />;
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
