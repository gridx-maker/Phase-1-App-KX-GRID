import React, { useState, useEffect } from 'react';
import axios from 'axios';
import kotlerxLogo from '../images/Vertical Logo with BG-01.png';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KotlerXLogo = ({ size = 'md', className = '', imgClassName = '', variant = 'default' }) => {
  const [logoImage, setLogoImage] = useState(kotlerxLogo);

  useEffect(() => {
    fetchLogoSettings();
  }, []);

  const fetchLogoSettings = async () => {
    try {
      const response = await axios.get(`${API}/cms/settings`);
      if (response.data?.logo_image) {
        setLogoImage(response.data.logo_image);
      }
    } catch (error) {
      // Use default bundled logo
    }
  };

  const sizes = {
    sm:   { img: 'h-10' },
    md:   { img: 'h-14' },
    lg:   { img: 'h-20' },
    xl:   { img: 'h-28' },
    xxl:  { img: 'h-36' },
    hero: { img: 'h-48 md:h-64 lg:h-72' }
  };

  const s = sizes[size] || sizes.md;

  // Header variant — compact logo for navbar
  if (variant === 'header') {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src={logoImage}
          alt="KotlerX"
          className={`h-10 w-auto object-contain ${imgClassName}`}
        />
      </div>
    );
  }

  // Default — full logo image
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoImage}
        alt="KotlerX"
        className={`${s.img} w-auto object-contain ${imgClassName}`}
      />
    </div>
  );
};

export default KotlerXLogo;
