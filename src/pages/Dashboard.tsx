import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Initiative } from '../types';
import { Plus, ArrowRight, Target, Users, Zap, TrendingUp, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '../lib/utils';
import Saathi from '../components/Saathi';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'initiatives'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Initiative));
      setInitiatives(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this initiative? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'initiatives', id));
      } catch (error) {
        console.error('Failed to delete initiative:', error);
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-12">
      {/* Hero Section / Intro */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white border border-brand-line/10 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-brand-primary/5"
      >
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-brand-ink serif leading-[1.1]">
              Turn your Ideas into <span className="text-brand-primary italic">Impact.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-ink/60 font-medium serif italic leading-relaxed">
              Karya Shaastra helps you get things done. Plan your vision, track your daily tasks, and build a real record of the impact you are making.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/builder"
                className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
              >
                <Plus size={20} />
                Launch New Initiative
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center gap-2 bg-brand-bg text-brand-ink px-8 py-4 rounded-2xl font-bold border border-brand-line/10 hover:bg-white transition-all active:scale-95"
              >
                Learn How to Use
              </Link>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <Saathi 
              emotion="excited" 
              message={`Welcome back, ${profile?.displayName?.split(' ')[0] || 'Builder'}! Ready to make a dent?`} 
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-bg rounded-full blur-3xl -ml-32 -mb-32" />
      </motion.section>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-ink font-serif">Your Ongoing Projects</h2>
        </div>

        {initiatives.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-dashed border-brand-line/10 rounded-[40px] p-12 md:p-20 text-center"
          >
            <div className="w-20 h-20 bg-brand-bg rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Zap size={40} className="text-brand-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 serif text-brand-ink">Start your first project.</h2>
            <p className="text-brand-ink/60 mb-10 max-w-sm mx-auto text-lg leading-relaxed font-medium italic serif">
              "Every great achievement starts with a simple plan." Build your first project today and track your progress.
            </p>
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 text-brand-primary font-bold border-b-2 border-brand-primary pb-1 hover:gap-4 transition-all text-lg"
            >
              Start Building <ArrowRight size={20} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  to={`/initiative/${initiative.id}`}
                  className="group block bg-white border border-brand-line/10 rounded-[32px] p-6 h-full hover:border-brand-primary hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-brand-ink">
                    <TrendingUp size={80} />
                  </div>
                  
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      initiative.type === 'profit' ? "bg-blue-50 text-blue-600" :
                      initiative.type === 'non-profit' ? "bg-green-50 text-green-600" :
                      "bg-red-50 text-red-600"
                    )}>
                      {initiative.type}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, initiative.id)}
                      className="p-2 text-brand-ink/40 hover:text-red-600 transition-colors relative z-10 active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black mb-4 group-hover:text-brand-primary transition-colors serif text-brand-ink relative z-10 leading-tight break-words line-clamp-2">{initiative.name}</h3>
                  <p className="text-brand-ink/60 text-sm line-clamp-3 mb-8 leading-relaxed font-medium relative z-10 break-words">
                    {initiative.problemStatement}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-brand-line/5 relative z-10">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-brand-primary" />
                      <span className="text-[10px] font-black text-brand-ink/70 uppercase tracking-widest">{initiative.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-brand-secondary" />
                      <span className="text-[10px] font-black text-brand-ink/70 uppercase tracking-widest">Team Sync</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
