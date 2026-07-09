import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { FileCheck, ChevronLeft, Download, QrCode, Shield, Award } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CertificatesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${API}/certificates/student/${user?.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgramTypeColor = (type) => {
    switch (type) {
      case 'certification': return 'from-cyan-500 to-blue-500';
      case 'diploma': return 'from-purple-500 to-pink-500';
      case 'pg_diploma': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-zinc-400 hover:text-white"
            data-testid="back-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-secondary" />
            <h1 className="font-unbounded font-bold text-xl text-white">My Certificates</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.certificate_id}
                className="telemetry-card rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedCert(cert)}
              >
                {/* Certificate Preview */}
                <div className={`relative h-48 bg-gradient-to-br ${getProgramTypeColor(cert.program_type)} p-6`}>
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="certificate-watermark">KOTLERX</div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <Award className="w-8 h-8 text-white/80" />
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-mono uppercase">
                        {cert.program_type?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-white/70 text-sm mb-1">Certificate of Completion</p>
                      <h3 className="font-unbounded font-bold text-xl text-white">{cert.program_name}</h3>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-inter text-white">{cert.student_name}</p>
                      <p className="text-xs text-zinc-500">
                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent-success" />
                      <span className="text-xs text-accent-success">Verified</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 mb-1">Certificate ID</p>
                      <p className="font-mono text-sm text-white truncate">{cert.certificate_id}</p>
                    </div>
                    {cert.qr_code && (
                      <div className="w-12 h-12 bg-white rounded p-1">
                        <img 
                          src={`data:image/png;base64,${cert.qr_code}`} 
                          alt="QR Code"
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="telemetry-card rounded-xl p-12 text-center">
            <FileCheck className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="font-unbounded font-semibold text-xl text-white mb-2">No Certificates Yet</h3>
            <p className="text-zinc-500 font-inter mb-6">
              Complete a program to earn your certificate
            </p>
            <Button
              onClick={() => navigate('/programs')}
              className="btn-primary"
              data-testid="browse-programs-btn"
            >
              Browse Programs
            </Button>
          </div>
        )}

        {/* Certificate Modal */}
        {selectedCert && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedCert(null)}
          >
            <div 
              className="bg-surface border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Full Certificate View */}
              <div className={`relative h-64 bg-gradient-to-br ${getProgramTypeColor(selectedCert.program_type)} p-8`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="certificate-watermark">KOTLERX</div>
                
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                  <Award className="w-12 h-12 text-white/80 mb-4" />
                  <p className="text-white/70 text-sm mb-2">Certificate of Completion</p>
                  <h2 className="font-unbounded font-bold text-3xl text-white mb-2">{selectedCert.program_name}</h2>
                  <p className="text-white/80 text-lg">Awarded to</p>
                  <p className="font-unbounded font-semibold text-2xl text-white">{selectedCert.student_name}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Certificate ID</p>
                    <p className="font-mono text-primary">{selectedCert.certificate_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 mb-1">Issue Date</p>
                    <p className="text-white">{new Date(selectedCert.issued_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-white text-sm">QR Verification</p>
                      <p className="text-xs text-zinc-500">Scan to verify authenticity</p>
                    </div>
                  </div>
                  {selectedCert.qr_code && (
                    <div className="w-16 h-16 bg-white rounded p-1">
                      <img 
                        src={`data:image/png;base64,${selectedCert.qr_code}`} 
                        alt="QR Code"
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                    onClick={() => setSelectedCert(null)}
                  >
                    Close
                  </Button>
                  <Button className="flex-1 btn-primary gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
