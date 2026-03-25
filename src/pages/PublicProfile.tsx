import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Initiative, Action, Milestone, TeamMember } from '../types';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Trophy, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  ExternalLink,
  Globe,
  Briefcase,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function PublicProfile() {
  const { initiativeId } = useParams<{ initiativeId: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initiativeId) return;

    const unsubInitiative = onSnapshot(doc(db, 'initiatives', initiativeId), (doc) => {
      if (doc.exists()) {
        setInitiative({ id: doc.id, ...doc.data() } as Initiative);
      }
      setLoading(false);
    });

    const unsubActions = onSnapshot(query(collection(db, 'initiatives', initiativeId, 'actions'), orderBy('timestamp', 'desc')), (snapshot) => {
      setActions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Action)));
    });

    const unsubMilestones = onSnapshot(collection(db, 'initiatives', initiativeId, 'milestones'), (snapshot) => {
      setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
    });

    const unsubTeam = onSnapshot(collection(db, 'initiatives', initiativeId, 'team'), (snapshot) => {
      setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    });

    return () => {
      unsubInitiative();
      unsubActions();
      unsubMilestones();
      unsubTeam();
    };
  }, [initiativeId]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#F9F9F8]">Loading...</div>;
  if (!initiative) return <div className="flex items-center justify-center h-screen bg-[#F9F9F8]">Initiative not found.</div>;

  const typeIcon = {
    profit: Briefcase,
    'non-profit': Heart,
    community: Globe,
  }[initiative.type];

  const Icon = typeIcon || Zap;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-brand-ink text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-10 transition-colors">
            <ArrowLeft size={18} />
            Back to Karya Shaastra
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-ink shadow-2xl shadow-black/20">
              <Icon size={32} />
            </div>
            <div>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/80 mb-2 inline-block">
                {initiative.type} Initiative
              </span>
              <h1 className="text-5xl font-black tracking-tight font-serif">{initiative.name}</h1>
            </div>
          </div>
          
          <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-medium">
            {initiative.problemStatement}
          </p>
        </div>
        
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <TrendingUp size={400} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* The Solution */}
            <section className="bg-white border border-brand-line/10 rounded-3xl p-10 shadow-xl shadow-brand-ink/5">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-6">The Solution</h2>
              <p className="text-xl font-bold leading-relaxed text-brand-ink">
                {initiative.proposedSolution}
              </p>
              <div className="mt-10 pt-10 border-t border-brand-line/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-4">Expected Outcome</h3>
                <p className="text-brand-ink/70 leading-relaxed">
                  {initiative.expectedOutcome}
                </p>
              </div>
            </section>

            {/* Proof of Work Timeline */}
            <section>
              <h2 className="text-2xl font-black mb-10 flex items-center gap-3 font-serif">
                <Zap size={24} className="text-brand-primary" />
                Proof of Work
              </h2>
              <div className="relative pl-8 space-y-10 before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-0.5 before:bg-brand-line/10">
                {actions.length === 0 ? (
                  <p className="text-brand-ink/40 italic">No actions logged yet.</p>
                ) : (
                  actions.map((action) => (
                    <div key={action.id} className="relative">
                      <div className="absolute -left-[25px] top-2 w-4 h-4 rounded-full bg-brand-primary border-4 border-brand-bg" />
                      <div className="bg-white border border-brand-line/10 rounded-2xl p-8 hover:border-brand-primary transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40">
                            {action.timestamp?.toDate ? format(action.timestamp.toDate(), 'MMMM d, yyyy') : 'Recently'}
                          </span>
                          <span className="px-3 py-1 bg-brand-bg rounded-full text-[10px] font-black uppercase tracking-widest text-brand-ink/60">{action.category}</span>
                        </div>
                        <h4 className="text-xl font-bold mb-2 text-brand-ink">{action.description}</h4>
                        {action.notes && <p className="text-brand-ink/60 leading-relaxed">{action.notes}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-white border border-brand-line/10 rounded-3xl p-8 shadow-xl shadow-brand-ink/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-6">Initiative Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-brand-ink/60">
                    <Zap size={18} />
                    <span className="font-bold">Actions</span>
                  </div>
                  <span className="font-black text-xl text-brand-ink">{actions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-brand-ink/60">
                    <Users size={18} />
                    <span className="font-bold">Team</span>
                  </div>
                  <span className="font-black text-xl text-brand-ink">{team.length + 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-brand-ink/60">
                    <Trophy size={18} />
                    <span className="font-bold">Milestones</span>
                  </div>
                  <span className="font-black text-xl text-brand-ink">{milestones.filter(m => m.completed).length}</span>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white border border-brand-line/10 rounded-3xl p-8 shadow-xl shadow-brand-ink/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-6">Milestones</h3>
              <div className="space-y-4">
                {milestones.length === 0 ? (
                  <p className="text-xs text-brand-ink/40 italic">No milestones defined.</p>
                ) : (
                  milestones.map((m) => (
                    <div key={m.id} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 flex-shrink-0",
                        m.completed ? "text-green-600" : "text-brand-line/20"
                      )}>
                        <CheckCircle2 size={16} />
                      </div>
                      <span className={cn(
                        "text-sm font-bold",
                        m.completed ? "text-brand-ink" : "text-brand-ink/40"
                      )}>
                        {m.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-brand-ink text-white rounded-3xl p-8 shadow-2xl shadow-brand-ink/20 text-center">
              <h3 className="text-lg font-bold mb-4">Inspired by this?</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Start your own initiative and build your proof of work with Karya Shaastra.
              </p>
              <Link
                to="/login"
                className="block w-full bg-brand-primary text-white py-4 rounded-2xl font-black hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
              >
                Start Now
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
