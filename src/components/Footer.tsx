import React, { useState } from 'react';
import Modal from './Modal';
import './Footer.css';
import termsOfUse from '../assets/docs/이용약관.md?raw';
import privacyPolicy from '../assets/docs/개인정보처리방침.md?raw';

const Footer: React.FC = () => {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: '',
  });

  const openModal = (title: string, content: string) => {
    setModalConfig({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-links">
          <button onClick={() => openModal('이용약관', termsOfUse)} className="footer-link-btn">
            이용약관
          </button>
          <span className="footer-divider">|</span>
          <button onClick={() => openModal('개인정보처리방침', privacyPolicy)} className="footer-link-btn">
            개인정보처리방침
          </button>
        </div>
        <p className="footer-info">
          정보관리책임자: 윤서희 (서울잠동초등학교)
        </p>
        <p className="footer-copyright">
          © 2026 To Do List (개발자: 윤서희). All rights reserved.
        </p>
      </div>
      
      <Modal 
        isOpen={modalConfig.isOpen} 
        onClose={closeModal} 
        title={modalConfig.title} 
        content={modalConfig.content} 
      />
    </footer>
  );
};

export default Footer;
