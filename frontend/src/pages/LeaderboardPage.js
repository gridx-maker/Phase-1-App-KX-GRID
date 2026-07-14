import SplitText from '@/components/ui/SplitText';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Trophy, Medal, Star, ChevronLeft, Crown } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setLeaderboard(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'from-yellow-400 to-orange-500', text: 'text-black' };
    if (rank === 2) return { icon: Medal, color: 'from-gray-300 to-gray-400', text: 'text-black' };
    if (rank === 3) return { icon: Medal, color: 'from-amber-600 to-amber-700', text: 'text-white' };
    return null;
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
            <Trophy className="w-6 h-6 text-accent-warning" />
            <SplitText text="Leaderboard" tag="h1" className="font-unbounded font-bold text-xl text-white" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-12">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-3">
                <span className="font-unbounded font-bold text-2xl text-black">2</span>
              </div>
              <p className="font-inter text-white text-sm mb-1">{leaderboard[1]?.name}</p>
              <div className="flex items-center justify-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <span className="font-mono text-sm">{leaderboard[1]?.average_rating?.toFixed(1)}</span>
              </div>
              <div className="w-20 h-24 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg mt-4" />
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-3 animate-pulse-glow">
                <span className="font-unbounded font-bold text-3xl text-black">1</span>
              </div>
              <p className="font-inter text-white mb-1">{leaderboard[0]?.name}</p>
              <div className="flex items-center justify-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <span className="font-mono text-sm">{leaderboard[0]?.average_rating?.toFixed(1)}</span>
              </div>
              <div className="w-24 h-32 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg mt-4" />
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-3">
                <span className="font-unbounded font-bold text-2xl text-white">3</span>
              </div>
              <p className="font-inter text-white text-sm mb-1">{leaderboard[2]?.name}</p>
              <div className="flex items-center justify-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <span className="font-mono text-sm">{leaderboard[2]?.average_rating?.toFixed(1)}</span>
              </div>
              <div className="w-20 h-16 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-lg mt-4" />
            </div>
          </div>
        )}

        {/* Full List */}
        <div className="telemetry-card rounded-xl p-6">
          <h2 className="font-unbounded font-semibold text-lg text-white mb-6">Rankings</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((student) => {
                const badge = getRankBadge(student.rank);
                return (
                  <div
                    key={student.student_id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      student.rank <= 3
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {badge ? (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                          <span className={`font-unbounded font-bold ${badge.text}`}>{student.rank}</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="font-unbounded font-bold text-zinc-400">{student.rank}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-inter text-white">{student.name}</p>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span>{student.total_attendance} sessions</span>
                          {student.badges?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-accent-warning" />
                              {student.badges.length} badges
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-5 h-5 fill-primary" />
                      <span className="font-mono font-bold text-lg">{student.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-inter">No rankings available yet</p>
              <p className="text-sm text-zinc-600">Complete assessments to appear on the leaderboard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
