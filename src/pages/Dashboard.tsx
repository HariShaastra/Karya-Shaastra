import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Initiative } from '../types';
import { Plus, ArrowRight, Target, Users, Zap, TrendingUp, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
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
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-3 serif text-brand-ink">Welcome Back</h1>
          <p className="text-brand-ink/60 font-medium text-xl serif italic">Your journey from idea to impact continues.</p>
        </div>
        <Link
          to="/builder"
          className="flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all duration-300 shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
        >
          <Plus size={20} />
          Start New
        </Link>
      </motion.header>

      {initiatives.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-dashed border-brand-line/10 rounded-[40px] p-20 text-center"
        >
          <div className="w-24 h-24 bg-brand-bg rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Zap size={48} className="text-brand-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 serif text-brand-ink">No initiatives yet.</h2>
          <p className="text-brand-ink/60 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
            Every great impact starts with a single structured intent. Define your first initiative today.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 text-brand-primary font-bold border-b-2 border-brand-primary pb-1 hover:gap-4 transition-all text-lg"
          >
            Launch Builder <ArrowRight size={20} />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {initiatives.map((initiative, index) => (
            <motion.div
              key={initiative.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                to={`/initiative/${initiative.id}`}
                className="group block bg-white border border-brand-line/10 rounded-[32px] p-8 hover:border-brand-primary hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-brand-ink">
                  <TrendingUp size={100} />
                </div>
                
                <div className="flex items-start justify-between mb-8">
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
                    className="p-2 text-brand-ink/40 hover:text-red-600 transition-colors relative z-10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-3xl font-black mb-4 group-hover:text-brand-primary transition-colors serif text-brand-ink">{initiative.name}</h3>
                <p className="text-brand-ink/60 text-sm line-clamp-2 mb-10 leading-relaxed">
                  {initiative.problemStatement}
                </p>

                <div className="flex items-center gap-8 pt-8 border-t border-brand-line/5">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-brand-primary" />
                    <span className="text-xs font-bold text-brand-ink/70 uppercase tracking-widest">{initiative.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-brand-secondary" />
                    <span className="text-xs font-bold text-brand-ink/70 uppercase tracking-widest">Active Team</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
