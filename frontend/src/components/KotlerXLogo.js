import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Default logo image URL - Vertical logo for hero section
const DEFAULT_LOGO_URL = "https://customer-assets.emergentagent.com/job_984a459f-bca4-4f6b-93c3-f060eda8d982/artifacts/jyzi0nv2_IMG_0354.png";

const KOTLERX_HEADER_LOGO = "https://customer-assets.emergentagent.com/job_b4ac6a41-177f-4a95-b224-80c582d4333d/artifacts/mctfn4tr_Typograpghy%20White%20Transparent-04.png";

const KotlerXLogo = ({ size = 'md', className = '', variant = 'default' }) => {
  const [settings, setSettings] = useState({ 
    logo_text_1: 'KX', 
    logo_text_2: 'GRID',
    logo_image: DEFAULT_LOGO_URL
  });

  useEffect(() => {
    fetchLogoSettings();
  }, []);

  const fetchLogoSettings = async () => {
    try {
      const response = await axios.get(`${API}/cms/settings`);
      if (response.data) {
        setSettings({
          logo_text_1: response.data.logo_text_1 || 'KX',
          logo_text_2: response.data.logo_text_2 || 'GRID',
          logo_image: response.data.logo_image || DEFAULT_LOGO_URL
        });
      }
    } catch (error) {
      // Use defaults
    }
  };

  const sizes = {
    sm: { text: 'text-xl', img: 'h-16' },
    md: { text: 'text-2xl', img: 'h-20' },
    lg: { text: 'text-3xl', img: 'h-28' },
    xl: { text: 'text-4xl', img: 'h-36' },
    xxl: { text: 'text-6xl', img: 'h-44' },
    hero: { text: 'text-8xl md:text-9xl', img: 'h-56 md:h-72 lg:h-80' }
  };

  const s = sizes[size] || sizes.md;

  // Header variant - KOTLERX typography logo image
  if (variant === 'header') {
    return (
      <div className={`flex items-center overflow-hidden h-8 md:h-10 ${className}`}>
        <img 
          src={KOTLERX_HEADER_LOGO}
          alt="KotlerX" 
          className="h-32 md:h-44 w-auto object-contain"
        />
      </div>
    );
  }

  // Default - vertical logo image
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={settings.logo_image} 
        alt="KotlerX" 
        className={`${s.img} w-auto object-contain`}
      />
    </div>
  );
};

export default KotlerXLogo;
