import React, { useState, useEffect } from 'react';
import kotlerxLogo from '../images/Vertical Logo with BG-01.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Plus, Minus, Users, GraduationCap, Briefcase } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TeamPage = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [expandedBio, setExpandedBio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      const members = response.data || [];
      setInstructors(members.filter(m => m.category === 'instructor'));
      setStaff(members.filter(m => m.category === 'staff'));
    } catch (error) {
      console.log('Error fetching team members');
    } finally {
      setLoading(false);
    }
  };

  const toggleBio = (memberId) => {
    setExpandedBio(expandedBio === memberId ? null : memberId);
  };

  const TeamMemberCard = ({ member }) => {
    const isExpanded = expandedBio === member.member_id;
    
    return (
      <div className="flex flex-col items-center text-center" data-testid={`team-member-${member.member_id}`}>
        {/* Photo */}
        <div className="w-48 h-48 md:w-56 md:h-56 mb-4 overflow-hidden rounded-lg bg-zinc-800">
          {member.photo_url || member.photo_base64 ? (
            <img 
              src={member.photo_base64 || member.photo_url}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
              <Users className="w-20 h-20 text-zinc-500" />
            </div>
          )}
        </div>
        
        {/* Name */}
        <h3 className="text-xl md:text-2xl font-bold text-red-500 mb-1">
          {member.name}
        </h3>
        
        {/* Divider */}
        <div className="w-16 h-0.5 bg-amber-500 mb-2"></div>
        
        {/* Role */}
        <p className="text-zinc-300 text-lg mb-3">
          {member.role}
        </p>
        
        {/* View Bio Button */}
        {member.bio && (
          <>
            <button
              onClick={() => toggleBio(member.member_id)}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold transition-colors"
              data-testid={`view-bio-${member.member_id}`}
            >
              View Bio
              {isExpanded ? (
                <Minus className="w-5 h-5 p-0.5 bg-red-500 text-white rounded-full" />
              ) : (
                <Plus className="w-5 h-5 p-0.5 bg-red-500 text-white rounded-full" />
              )}
            </button>
            
            {/* Expanded Bio */}
            {isExpanded && (
              <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg max-w-md text-left animate-in slide-in-from-top-2 duration-300">
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {member.bio}
                </p>
                {member.email && (
                  <p className="mt-3 text-cyan-400 text-sm">
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            data-testid="back-to-home"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </button>
          <img 
            src={kotlerxLogo}
            alt="KotlerX"
            className="h-16 md:h-20"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 text-center bg-gradient-to-b from-zinc-900/50 to-transparent">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Meet The <span className="text-cyan-400">Team</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Our team of dedicated professionals support our students in every way possible to achieve their goals in motorsport education.
        </p>
        <p className="text-white font-semibold mt-4">
          Monday to Friday 9.00am — 5.00pm IST
        </p>
      </section>

      {/* Instructors Section */}
      {instructors.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-10 justify-center">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
              <h2 className="text-3xl font-bold text-white">Instructors & Tutors</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {instructors.map(member => (
                <TeamMemberCard key={member.member_id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      {instructors.length > 0 && staff.length > 0 && (
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
        </div>
      )}

      {/* Support Staff Section */}
      {staff.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <Briefcase className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-white">Support Staff</h2>
            </div>
            <p className="text-zinc-400 text-center mb-10 max-w-2xl mx-auto">
              Our dedicated support team is here to help with admissions, coordination, and any assistance you may need throughout your journey.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {staff.map(member => (
                <TeamMemberCard key={member.member_id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Team Members Message */}
      {instructors.length === 0 && staff.length === 0 && (
        <section className="py-20 px-6 text-center">
          <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-400 mb-2">Team Coming Soon</h2>
          <p className="text-zinc-500">Our team profiles are being updated. Check back soon!</p>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-t from-zinc-900 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Accelerate Your Motorsport Career?
          </h2>
          <button
            onClick={() => navigate('/register')}
            className="mt-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
            data-testid="apply-online-btn"
          >
            APPLY ONLINE
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center">
        <p className="text-zinc-500 text-sm">© 2024 KotlerX. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default TeamPage;

