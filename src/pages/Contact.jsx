import React, { useState } from 'react';
import { Phone, Mail, MapPin, Printer, Send, Clock, CheckCircle } from 'lucide-react';

export default function Contact({ companyInfo }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    serviceType: 'building-factory',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send an API request.
    // For now, we simulate success.
    setIsSubmitted(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      serviceType: 'building-factory',
      message: ''
    });
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="section-padding animate-fade-in">
      <div className="container">
        {/* Page Title */}
        <div className="section-title-container">
          <h1 className="section-title">聯絡我們</h1>
          <p className="section-subtitle">免費預約估價或業務洽詢，我們將有專人與您聯絡</p>
        </div>

        <div className="contact-grid">
          {/* Left Column: Contact details cards */}
          <div className="contact-info-cards">
            <div className="contact-card">
              <div className="contact-card-icon">
                <Phone size={20} />
              </div>
              <div className="contact-card-info">
                <h3>諮詢專線</h3>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)', margin: '0.25rem 0' }}>
                  {companyInfo.phoneFormatted || companyInfo.phone}
                </p>
                <a href={`tel:${companyInfo.phone}`}>點擊直接撥打</a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <Printer size={20} />
              </div>
              <div className="contact-card-info">
                <h3>傳真號碼</h3>
                <p style={{ margin: '0.25rem 0' }}>{companyInfo.fax}</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>業務合作合約傳真專用</span>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <Mail size={20} />
              </div>
              <div className="contact-card-info">
                <h3>電子信箱</h3>
                <p style={{ margin: '0.25rem 0', fontWeight: '500' }}>{companyInfo.email}</p>
                <a href={`mailto:${companyInfo.email}`}>點擊發送郵件</a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <MapPin size={20} />
              </div>
              <div className="contact-card-info">
                <h3>總公司地址</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{companyInfo.address}</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>台北市中山區民權東路一段53號11樓</span>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <Clock size={20} />
              </div>
              <div className="contact-card-info">
                <h3>服務時間</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{companyInfo.workHours}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="contact-form-wrap">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
              線上預約與需求諮詢
            </h2>

            {isSubmitted && (
              <div 
                style={{ 
                  backgroundColor: '#ecfdf5', 
                  border: '1px solid #10b981', 
                  color: '#065f46',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <CheckCircle size={20} style={{ color: '#10b981' }} />
                <span>感謝您的留言！需求已送出，我們將在 24 小時之內派專人撥電話給您。</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">貴賓姓名 / 單位名稱</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="請輸入您的姓名或單位名稱"
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
                <div className="form-group">
                  <label htmlFor="phone">聯絡電話</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="例如: 0912345678"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">電子信箱</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="example@mail.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">會勘或清潔地址</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="請輸入欲會勘的實際大樓或廠辦地址"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceType">需求項目</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="building-factory">大樓與大型工廠清潔維護</option>
                  <option value="hotel-cleaning">國際觀光飯店日常保養</option>
                  <option value="office-cleaning">企業商辦大樓派駐清潔</option>
                  <option value="hospital-cleaning">醫療院所高規格消毒清潔</option>
                  <option value="other">其他清潔管理諮詢</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">需求詳述 / 備註</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="請簡述您的需求，例如：欲清潔之坪數、大樓用途、偏好的會勘時間等。"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} />
                <span>送出線上諮詢單</span>
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="map-container">
          <div className="map-placeholder">
            <MapPin size={48} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>{companyInfo.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{companyInfo.address}</p>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              (此處為 Google 地圖嵌入區域)
            </span>
            <div 
              style={{ 
                marginTop: '1.5rem', 
                border: '1px solid #cbd5e1', 
                padding: '0.75rem 1.5rem', 
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'white',
                color: 'var(--text-dark)',
                fontSize: '0.9rem'
              }}
            >
              台北市中山區民權東路一段53號11樓 (捷運中山國小站旁)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
