import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../App';
import { Initiative, Action, TeamMember, Resource, Milestone, InitiativeStage, ActionCategory, EditLog, TeamRole } from '../types';
import { 
  LayoutDashboard, 
  Rocket, 
  Zap, 
  Users, 
  DollarSign, 
  Trophy, 
  Share2, 
  Plus, 
  Clock, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  ExternalLink,
  Edit2,
  X,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import Saathi from '../components/Saathi';

type Tab = 'overview' | 'pathways' | 'actions' | 'team' | 'resources' | 'milestones' | 'logs' | 'proof';

export default function InitiativeDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  // Sub-collections state
  const [actions, setActions] = useState<Action[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editLogs, setEditLogs] = useState<EditLog[]>([]);
  const [isEditingInitiative, setIsEditingInitiative] = useState(false);

  const isOwner = initiative?.ownerId === user?.uid;
  const isTeamMember = team.some(m => m.userId === user?.uid) || isOwner;
  const canEdit = isTeamMember;

  useEffect(() => {
    if (!id) return;

    const unsubInitiative = onSnapshot(doc(db, 'initiatives', id), (doc) => {
      if (doc.exists()) {
        setInitiative({ id: doc.id, ...doc.data() } as Initiative);
      } else {
        navigate('/');
      }
      setLoading(false);
    });

    const unsubActions = onSnapshot(query(collection(db, 'initiatives', id, 'actions'), orderBy('timestamp', 'desc')), (snapshot) => {
      setActions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Action)));
    });

    const unsubTeam = onSnapshot(collection(db, 'initiatives', id, 'team'), (snapshot) => {
      setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    });

    const unsubResources = onSnapshot(query(collection(db, 'initiatives', id, 'resources'), orderBy('timestamp', 'desc')), (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    });

    const unsubMilestones = onSnapshot(collection(db, 'initiatives', id, 'milestones'), (snapshot) => {
      setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
    });

    const unsubLogs = onSnapshot(query(collection(db, 'initiatives', id, 'editLogs'), orderBy('timestamp', 'desc')), (snapshot) => {
      setEditLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EditLog)));
    });

    return () => {
      unsubInitiative();
      unsubActions();
      unsubTeam();
      unsubResources();
      unsubMilestones();
      unsubLogs();
    };
  }, [id, navigate]);

  const logEdit = async (action: string) => {
    if (!id || !user || !profile) return;
    try {
      await addDoc(collection(db, 'initiatives', id, 'editLogs'), {
        initiativeId: id,
        userId: user.uid,
        userName: profile.displayName,
        action,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to log edit:', err);
    }
  };

  if (loading || !initiative) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pathways', label: 'Pathways', icon: Rocket },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'resources', label: 'Finance', icon: DollarSign },
    { id: 'milestones', label: 'Milestones', icon: Trophy },
    { id: 'proof', label: 'Proof', icon: FileText },
    { id: 'logs', label: 'Edit Logs', icon: History },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-brand-line/10 rounded-[2.5rem] p-8 shadow-2xl shadow-brand-primary/5">
        <div className="flex flex-col md:flex-row gap-8 items-center flex-1">
          <div className="flex-shrink-0">
            <Saathi 
              emotion={initiative.stage === 'growing' ? 'excited' : 'happy'} 
              message={initiative.stage === 'idea' ? "Let's turn this idea into reality!" : "Great progress! Keep going!"} 
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                initiative.type === 'profit' ? "bg-blue-50 text-blue-600" :
                initiative.type === 'non-profit' ? "bg-green-50 text-green-600" :
                "bg-red-50 text-red-600"
              )}>
                {initiative.type}
              </span>
              <span className="text-[10px] font-black text-brand-ink/40 uppercase tracking-widest">
                Stage: {initiative.stage}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight serif text-brand-ink mb-2">{initiative.name}</h1>
            <p className="text-brand-ink/60 font-medium italic serif line-clamp-1">{initiative.problemStatement}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {canEdit && (
            <button
              onClick={() => setIsEditingInitiative(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-brand-line/10 rounded-2xl font-bold hover:border-brand-primary transition-all text-brand-ink active:scale-95"
            >
              <Edit2 size={18} />
              Edit
            </button>
          )}
          <button
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert('Collaboration link copied!');
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-brand-line/10 text-brand-ink rounded-2xl font-bold hover:border-brand-primary transition-all active:scale-95"
          >
            <Share2 size={18} />
            Copy Link
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `*KARYA SHAASTRA: Blueprint for Impact*\n\n` +
              `*Initiative:* ${initiative.name}\n` +
              `*Focus:* ${initiative.problemStatement}\n` +
              `*Current Stage:* ${initiative.stage.toUpperCase()}\n\n` +
              `View the full framework and collaborate here: ${window.location.href}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <Zap size={18} />
            Share WhatsApp
          </a>
        </div>
      </header>

      {/* Edit Initiative Modal */}
      <AnimatePresence>
        {isEditingInitiative && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-bg w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl border border-brand-line/10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black font-serif text-brand-ink">Edit Initiative</h2>
                <button onClick={() => setIsEditingInitiative(false)} className="p-2 hover:bg-brand-line/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updates = {
                  name: formData.get('name') as string,
                  problemStatement: formData.get('problemStatement') as string,
                  targetGroup: formData.get('targetGroup') as string,
                  proposedSolution: formData.get('proposedSolution') as string,
                  why: formData.get('why') as string,
                  expectedOutcome: formData.get('expectedOutcome') as string,
                  stage: formData.get('stage') as InitiativeStage,
                };
                try {
                  await updateDoc(doc(db, 'initiatives', initiative.id), updates);
                  await logEdit('Updated Initiative Details');
                  setIsEditingInitiative(false);
                } catch (err) {
                  console.error('Failed to update initiative:', err);
                }
              }} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Initiative Name</label>
                  <input name="name" defaultValue={initiative.name} required className="w-full p-4 bg-white border border-brand-line/10 rounded-2xl focus:border-brand-primary outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Stage</label>
                    <select name="stage" defaultValue={initiative.stage} className="w-full p-4 bg-white border border-brand-line/10 rounded-2xl focus:border-brand-primary outline-none font-bold text-brand-ink">
                      <option value="idea">Idea</option>
                      <option value="pilot">Pilot</option>
                      <option value="active">Active</option>
                      <option value="growing">Growing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Problem Statement</label>
                  <textarea name="problemStatement" defaultValue={initiative.problemStatement} rows={3} className="w-full p-4 bg-white border border-brand-line/10 rounded-2xl focus:border-brand-primary outline-none font-medium text-brand-ink" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Target Group</label>
                  <input name="targetGroup" defaultValue={initiative.targetGroup} className="w-full p-4 bg-white border border-brand-line/10 rounded-2xl focus:border-brand-primary outline-none font-medium text-brand-ink" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Proposed Solution</label>
                  <textarea name="proposedSolution" defaultValue={initiative.proposedSolution} rows={3} className="w-full p-4 bg-white border border-brand-line/10 rounded-2xl focus:border-brand-primary outline-none font-medium text-brand-ink" />
                </div>
                
                <div className="pt-6 border-t border-brand-line/5">
                  <button 
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you absolutely sure? This will delete the initiative and all its data.')) {
                        try {
                          await deleteDoc(doc(db, 'initiatives', initiative.id));
                          navigate('/');
                        } catch (err) {
                          console.error('Failed to delete initiative:', err);
                        }
                      }
                    }}
                    className="flex items-center gap-2 text-red-600 font-bold hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                    Delete Initiative
                  </button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsEditingInitiative(false)} className="flex-1 py-4 font-bold text-brand-ink/60 hover:bg-brand-line/5 rounded-2xl transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-brand-line/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all flex-grow md:flex-grow-0",
              activeTab === tab.id
                ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105 z-10"
                : "bg-white border border-brand-line/10 text-brand-ink/60 hover:border-brand-primary/40 hover:text-brand-ink"
            )}
          >
            <tab.icon size={18} />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab initiative={initiative} />}
            {activeTab === 'pathways' && <PathwaysTab initiative={initiative} milestones={milestones} />}
            {activeTab === 'actions' && <ActionsTab initiative={initiative} actions={actions} canEdit={canEdit} />}
            {activeTab === 'team' && <TeamTab initiative={initiative} team={team} isOwner={isOwner} />}
            {activeTab === 'resources' && <ResourcesTab initiative={initiative} resources={resources} canEdit={canEdit} />}
            {activeTab === 'milestones' && <MilestonesTab initiative={initiative} milestones={milestones} canEdit={canEdit} />}
            {activeTab === 'logs' && <LogsTab logs={editLogs} />}
            {activeTab === 'proof' && <ProofTab initiative={initiative} actions={actions} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Tab Components ---

function OverviewTab({ initiative }: { initiative: Initiative }) {
  const fields = [
    { label: 'Problem Statement', value: initiative.problemStatement },
    { label: 'Target Group', value: initiative.targetGroup },
    { label: 'Proposed Solution', value: initiative.proposedSolution },
    { label: 'Why this initiative?', value: initiative.why },
    { label: 'Expected Outcome', value: initiative.expectedOutcome },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, idx) => (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          key={field.label} 
          className={cn(
            "bg-white border border-brand-line/10 rounded-[2.5rem] p-8 shadow-sm hover:border-brand-primary/20 transition-all",
            idx === 0 && "md:col-span-2"
          )}
        >
          <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/30 mb-4 font-serif">{field.label}</h3>
          <p className="text-xl font-medium text-brand-ink leading-[1.6] whitespace-pre-wrap serif">{field.value || 'Not specified yet.'}</p>
        </motion.div>
      ))}
    </div>
  );
}

function PathwaysTab({ initiative, milestones }: { initiative: Initiative; milestones: Milestone[] }) {
  const pathways = {
    profit: [
      { id: 'p1', title: 'Define offering', desc: 'What exactly are you selling?' },
      { id: 'p2', title: 'Identify first customers', desc: 'Who will pay for this first?' },
      { id: 'p3', title: 'Start small (MVP mindset)', desc: 'Build the simplest version.' },
    ],
    'non-profit': [
      { id: 'n1', title: 'Define cause', desc: 'What is the core social impact?' },
      { id: 'n2', title: 'Identify beneficiaries', desc: 'Who exactly are you helping?' },
      { id: 'n3', title: 'Plan first activity', desc: 'What is the first step of impact?' },
    ],
    community: [
      { id: 'c1', title: 'Define purpose', desc: 'Why should people gather?' },
      { id: 'c2', title: 'Gather people', desc: 'Find your first 5 members.' },
      { id: 'c3', title: 'Execute first event', desc: 'Make it happen.' },
    ],
  };

  const currentPath = pathways[initiative.type];

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 shadow-xl shadow-black/10">
        <h3 className="text-2xl font-black mb-2">Launch Pathway</h3>
        <p className="text-white/60">Follow these steps to move from idea to pilot.</p>
      </div>

      <div className="space-y-4">
        {currentPath.map((step, index) => (
          <div key={step.id} className="bg-white border border-[#E5E5E0] rounded-2xl p-6 flex items-center gap-6 group hover:border-[#1A1A1A] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F0ED] flex items-center justify-center font-black text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">{step.title}</h4>
              <p className="text-sm text-[#666660]">{step.desc}</p>
            </div>
            <div className="text-[#E5E5E0] group-hover:text-[#1A1A1A] transition-colors">
              <CheckCircle2 size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionsTab({ initiative, actions, canEdit }: { initiative: Initiative; actions: Action[]; canEdit: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const { profile } = useAuth();
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [newAction, setNewAction] = useState({
    description: '',
    category: 'operations' as ActionCategory,
    timeSpent: 30,
    notes: '',
    proofText: '',
    proofUrl: '',
  });

  const handleSaveAction = async () => {
    if (!newAction.description || !profile) return;
    try {
      if (editingAction) {
        await updateDoc(doc(db, 'initiatives', initiative.id, 'actions', editingAction.id), {
          ...newAction,
          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'initiatives', initiative.id, 'actions'), {
          ...newAction,
          initiativeId: initiative.id,
          userId: auth.currentUser?.uid,
          userName: profile.displayName || profile.email,
          timestamp: serverTimestamp(),
        });
      }
      setIsAdding(false);
      setEditingAction(null);
      setNewAction({ description: '', category: 'operations', timeSpent: 30, notes: '', proofText: '', proofUrl: '' });
    } catch (error) {
      console.error('Failed to save action:', error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this action?')) return;
    try {
      await deleteDoc(doc(db, 'initiatives', initiative.id, 'actions', actionId));
    } catch (error) {
      console.error('Failed to delete action:', error);
    }
  };

  return (
    <div className="space-y-8">
      {canEdit && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-2xl font-black font-serif text-brand-ink">Daily Log</h3>
          <button
            onClick={() => {
              setEditingAction(null);
              setNewAction({ description: '', category: 'operations', timeSpent: 30, notes: '', proofText: '', proofUrl: '' });
              setIsAdding(true);
            }}
            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            <Plus size={18} />
            Log Work
          </button>
        </div>
      )}

      {(isAdding || editingAction) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-brand-primary rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-brand-primary/5"
        >
          <h4 className="text-xl font-black text-brand-ink">{editingAction ? 'Edit Action' : 'Log New Action'}</h4>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">What did you do?</label>
            <input
              type="text"
              value={newAction.description}
              onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
              placeholder="e.g. Conducted first user interview"
              className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Category</label>
              <select
                value={newAction.category}
                onChange={(e) => setNewAction({ ...newAction, category: e.target.value as ActionCategory })}
                className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
              >
                <option value="outreach">Outreach</option>
                <option value="operations">Operations</option>
                <option value="finance">Finance</option>
                <option value="content">Content</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Time Spent (mins)</label>
              <input
                type="number"
                value={newAction.timeSpent}
                onChange={(e) => setNewAction({ ...newAction, timeSpent: parseInt(e.target.value) })}
                className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Proof of Work (Text Evidence)</label>
              <textarea
                value={newAction.proofText}
                onChange={(e) => setNewAction({ ...newAction, proofText: e.target.value })}
                placeholder="Mention key outcomes or data points..."
                rows={2}
                className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Proof Link (URL)</label>
              <input
                type="url"
                value={newAction.proofUrl}
                onChange={(e) => setNewAction({ ...newAction, proofUrl: e.target.value })}
                placeholder="https://..."
                className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-medium text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Private Notes (Optional)</label>
            <textarea
              value={newAction.notes}
              onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
              rows={2}
              className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-medium text-sm italic"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingAction(null); }} className="px-6 py-4 font-bold text-brand-ink/60 hover:bg-brand-line/5 rounded-xl transition-all">Cancel</button>
            <button onClick={handleSaveAction} className="px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
              {editingAction ? 'Update Action' : 'Save Action'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {actions.map((action) => (
          <div key={action.id} className="bg-white border border-brand-line/10 rounded-3xl p-6 flex flex-col sm:flex-row items-start gap-6 group hover:border-brand-primary transition-all overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-primary flex-shrink-0">
              <Zap size={24} />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-lg truncate text-brand-ink">{action.description}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-ink/40 mt-1">
                    <span className="flex items-center gap-1 font-bold"><Clock size={12} /> {action.timeSpent}m</span>
                    <span className="px-2 py-0.5 bg-brand-bg rounded-[4px] font-black uppercase tracking-[0.1em] text-[8px]">{action.category}</span>
                    <span className="flex items-center gap-1 font-bold italic"><Users size={12} /> {action.userName || 'Member'}</span>
                  </div>
                </div>
                {canEdit && (action.userId === auth.currentUser?.uid) && (
                  <div className="flex items-center gap-2 self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingAction(action);
                        setNewAction({
                          description: action.description,
                          category: action.category,
                          timeSpent: action.timeSpent,
                          notes: action.notes || '',
                          proofText: action.proofText || '',
                          proofUrl: action.proofUrl || '',
                        });
                        setIsAdding(false);
                      }}
                      className="p-2.5 bg-brand-bg text-brand-ink/40 hover:text-brand-primary hover:bg-white border border-transparent hover:border-brand-primary/20 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAction(action.id)}
                      className="p-2.5 bg-brand-bg text-brand-ink/40 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              {action.proofText && (
                <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-4 mb-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary mb-1">Evidence Summary</p>
                  <p className="text-sm font-medium text-brand-ink/70 italic serif leading-relaxed">"{action.proofText}"</p>
                </div>
              )}

              {action.proofUrl && (
                <a 
                  href={action.proofUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:underline mb-3"
                >
                  <ExternalLink size={14} />
                  View Uploaded Proof
                </a>
              )}

              {action.notes && (
                <p className="text-xs text-brand-ink/40 font-medium italic border-l-2 border-brand-line/10 pl-3 py-1">
                  {action.notes}
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-brand-line/5 text-[9px] font-black text-brand-ink/20 uppercase tracking-widest">
                {action.timestamp?.toDate ? format(action.timestamp.toDate(), 'MMMM d, h:mm a') : 'Recent'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamTab({ initiative, team, isOwner }: { initiative: Initiative; team: TeamMember[]; isOwner: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', role: 'volunteer' as TeamRole, displayName: '' });

  const handleAddMember = async () => {
    if (!newMember.email) return;
    try {
      await addDoc(collection(db, 'initiatives', initiative.id, 'team'), {
        ...newMember,
        initiativeId: initiative.id,
        invitedAt: serverTimestamp(),
      });
      setIsAdding(false);
      setNewMember({ email: '', role: 'volunteer', displayName: '' });
    } catch (error) {
      console.error('Failed to add team member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this collaborator?')) return;
    try {
      await deleteDoc(doc(db, 'initiatives', initiative.id, 'team', memberId));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <div className="space-y-8">
      {isOwner && (
        <div className="bg-white border border-brand-line/10 rounded-3xl p-8 shadow-2xl shadow-brand-primary/5">
          <h3 className="text-2xl font-black font-serif text-brand-ink mb-6">Invite Collaborator</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newMember.displayName}
              onChange={(e) => setNewMember({ ...newMember, displayName: e.target.value })}
              placeholder="Partner Name"
              className="flex-1 p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
            />
            <input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="Email address"
              className="flex-1 p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value as TeamRole })}
              className="p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
            >
              <option value="volunteer">Volunteer</option>
              <option value="partner">Partner</option>
            </select>
            <button
              onClick={handleAddMember}
              className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
            >
              Invite
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 ml-4 font-serif">Project Guardians</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Owner is always shown */}
          <div className="bg-white border border-brand-primary/30 rounded-[2rem] p-6 flex flex-col items-center text-center shadow-lg shadow-brand-primary/5">
            <div className="w-20 h-20 rounded-[2.5rem] bg-brand-primary text-white flex items-center justify-center font-black text-2xl mb-4">
              {initiative.ownerId[0].toUpperCase()}
            </div>
            <h4 className="font-bold text-brand-ink mb-1 text-lg">Founder</h4>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">Primary Owner</p>
          </div>
          
          {team.map((member) => (
            <div key={member.id} className="bg-white border border-brand-line/10 rounded-[2rem] p-6 flex flex-col items-center text-center hover:border-brand-primary transition-all group">
              <div className="w-20 h-20 rounded-[2.5rem] bg-brand-bg text-brand-ink flex items-center justify-center font-black text-2xl mb-4 group-hover:scale-105 transition-transform">
                {member.displayName ? member.displayName[0].toUpperCase() : member.email[0].toUpperCase()}
              </div>
              <h4 className="font-bold text-brand-ink mb-1 text-lg truncate w-full px-2">{member.displayName || member.email}</h4>
              <p className="text-[10px] font-black text-brand-ink/40 uppercase tracking-widest mb-4 capitalize">{member.role}</p>
              
              {isOwner && (
                <button 
                  onClick={() => handleRemoveMember(member.id)}
                  className="mt-2 text-brand-ink/30 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourcesTab({ initiative, resources, canEdit }: { initiative: Initiative; resources: Resource[]; canEdit: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newResource, setNewResource] = useState({
    amount: 0,
    description: '',
    type: 'in' as 'in' | 'out',
  });

  const handleAddResource = async () => {
    if (!newResource.description || newResource.amount <= 0) return;
    try {
      await addDoc(collection(db, 'initiatives', initiative.id, 'resources'), {
        ...newResource,
        initiativeId: initiative.id,
        timestamp: serverTimestamp(),
      });
      setIsAdding(false);
      setNewResource({ amount: 0, description: '', type: 'in' });
    } catch (error) {
      console.error('Failed to add resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!canEdit) return;
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteDoc(doc(db, 'initiatives', initiative.id, 'resources', resourceId));
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  };

  const totalIn = resources.filter(r => r.type === 'in').reduce((acc, r) => acc + r.amount, 0);
  const totalOut = resources.filter(r => r.type === 'out').reduce((acc, r) => acc + r.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <div className="space-y-8 flex flex-col max-w-full overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-brand-line/10 rounded-3xl p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Total Inflow</p>
          <p className="text-3xl font-black text-green-600">₹{totalIn.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-brand-line/10 rounded-3xl p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Total Outflow</p>
          <p className="text-3xl font-black text-red-600">₹{totalOut.toLocaleString()}</p>
        </div>
        <div className="bg-brand-ink text-white rounded-3xl p-8 shadow-xl shadow-brand-ink/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Current Balance</p>
          <p className="text-3xl font-black">₹{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-2xl font-black font-serif text-brand-ink">Transactions</h3>
        {canEdit && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            <Plus size={18} />
            Add Record
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-brand-primary rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-brand-primary/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewResource({ ...newResource, type: 'in' })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold border-2 transition-all",
                    newResource.type === 'in' ? "bg-green-50 border-green-600 text-green-600" : "border-brand-line/10 text-brand-ink/60"
                  )}
                >
                  Money In
                </button>
                <button
                  onClick={() => setNewResource({ ...newResource, type: 'out' })}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold border-2 transition-all",
                    newResource.type === 'out' ? "bg-red-50 border-red-600 text-red-600" : "border-brand-line/10 text-brand-ink/60"
                  )}
                >
                  Money Out
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Amount (₹)</label>
              <input
                type="number"
                value={newResource.amount}
                onChange={(e) => setNewResource({ ...newResource, amount: parseFloat(e.target.value) })}
                className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Description</label>
            <input
              type="text"
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              placeholder="e.g. Domain registration"
              className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-4 font-bold text-brand-ink/60 hover:bg-brand-line/5 rounded-xl transition-all">Cancel</button>
            <button onClick={handleAddResource} className="px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">Save Record</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white border border-brand-line/10 rounded-[2rem] shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-brand-bg/50 border-b border-brand-line/10">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-ink/40">Date</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-ink/40">Description</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-ink/40 text-right">Amount</th>
              {canEdit && <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-ink/40 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line/5">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-brand-bg/30 transition-colors group">
                <td className="px-8 py-5 text-xs font-bold text-brand-ink/40">
                   {resource.timestamp?.toDate ? format(resource.timestamp.toDate(), 'MMM d, yyyy') : 'Recent'}
                </td>
                <td className="px-8 py-5 font-bold text-brand-ink">{resource.description}</td>
                <td className={cn(
                  "px-8 py-5 font-black text-right",
                  resource.type === 'in' ? "text-green-600" : "text-red-600"
                )}>
                  {resource.type === 'in' ? '+' : '-'} ₹{resource.amount.toLocaleString()}
                </td>
                {canEdit && (
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="p-2 text-brand-ink/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-brand-ink/40 font-medium italic serif">
                  No records yet. The impact is just beginning.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MilestonesTab({ initiative, milestones, canEdit }: { initiative: Initiative; milestones: Milestone[]; canEdit: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '' });

  const handleSaveMilestone = async () => {
    if (!newMilestone.title) return;
    try {
      if (editingMilestone) {
        await updateDoc(doc(db, 'initiatives', initiative.id, 'milestones', editingMilestone.id), {
          ...newMilestone,
        });
      } else {
        await addDoc(collection(db, 'initiatives', initiative.id, 'milestones'), {
          ...newMilestone,
          initiativeId: initiative.id,
          completed: false,
        });
      }
      setIsAdding(false);
      setEditingMilestone(null);
      setNewMilestone({ title: '', description: '' });
    } catch (error) {
      console.error('Failed to save milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return;
    try {
      await deleteDoc(doc(db, 'initiatives', initiative.id, 'milestones', milestoneId));
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  const toggleMilestone = async (milestone: Milestone) => {
    if (!canEdit) return;
    try {
      await updateDoc(doc(db, 'initiatives', initiative.id, 'milestones', milestone.id), {
        completed: !milestone.completed,
        completedAt: !milestone.completed ? serverTimestamp() : null,
      });
    } catch (error) {
      console.error('Failed to toggle milestone:', error);
    }
  };

  return (
    <div className="space-y-8">
      {canEdit && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-2xl font-black font-serif text-brand-ink">Project Milestones</h3>
          <button
            onClick={() => {
              setEditingMilestone(null);
              setNewMilestone({ title: '', description: '' });
              setIsAdding(true);
            }}
            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            <Plus size={18} />
            Set Milestone
          </button>
        </div>
      )}

      {(isAdding || editingMilestone) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-brand-primary rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-brand-primary/5"
        >
          <h4 className="text-xl font-black text-brand-ink">{editingMilestone ? 'Edit Milestone' : 'New Milestone'}</h4>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Milestone Title</label>
            <input
              type="text"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              placeholder="e.g. Reach 100 active users"
              className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Description (Optional)</label>
            <textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              rows={2}
              className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-medium text-sm italic"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingMilestone(null); }} className="px-6 py-4 font-bold text-brand-ink/60 hover:bg-brand-line/5 rounded-xl transition-all">Cancel</button>
            <button onClick={handleSaveMilestone} className="px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
              {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {milestones.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-white border border-brand-line/10 rounded-3xl text-brand-ink/40 font-medium italic">
            No milestones defined yet. What are you aiming for?
          </div>
        )}
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              "bg-white border rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-6 transition-all group overflow-hidden",
              milestone.completed ? "border-green-600/30 bg-green-50/50" : "border-brand-line/10 hover:border-brand-primary/40"
            )}
          >
            <div 
              onClick={() => toggleMilestone(milestone)}
              className={cn(
                "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all cursor-pointer flex-shrink-0",
                milestone.completed ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "bg-brand-bg border-2 border-brand-line/10 text-brand-ink/10"
              )}
            >
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0 w-full" onClick={() => toggleMilestone(milestone)}>
              <h4 className={cn("font-bold text-xl text-brand-ink leading-tight mb-1", milestone.completed && "line-through opacity-40")}>
                {milestone.title}
              </h4>
              {milestone.description && <p className="text-sm text-brand-ink/50 font-medium italic serif line-clamp-1">{milestone.description}</p>}
            </div>
            {canEdit && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingMilestone(milestone);
                    setNewMilestone({ title: milestone.title, description: milestone.description || '' });
                    setIsAdding(false);
                  }}
                  className="p-2.5 bg-brand-bg text-brand-ink/40 hover:text-brand-primary hover:bg-white border border-transparent hover:border-brand-primary/20 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="p-2.5 bg-brand-bg text-brand-ink/40 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsTab({ logs }: { logs: EditLog[] }) {
  return (
    <div className="gap-6 flex flex-col max-w-full overflow-hidden">
      <div className="bg-white border border-brand-line/10 rounded-[2.5rem] p-8 shadow-2xl shadow-brand-primary/5">
        <h3 className="text-3xl font-black font-serif text-brand-ink mb-2 leading-tight">Architecture Ledger</h3>
        <p className="text-brand-ink/60 font-medium italic serif">Every architectural pivot and strategic update is recorded here for total collaborative transparency.</p>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id} 
            className="bg-white border border-brand-line/10 rounded-[1.5rem] p-5 flex items-start gap-5 hover:border-brand-primary/30 transition-all group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand-primary/40 group-hover:text-brand-primary flex-shrink-0 transition-colors">
              <History size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h4 className="font-bold text-brand-ink">{log.action}</h4>
                <span className="text-[9px] font-black px-2 py-0.5 bg-brand-bg rounded-md text-brand-ink/40 uppercase tracking-widest truncate">
                  {log.userName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-brand-ink/30 italic">
                <Clock size={12} />
                {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'MMM d, h:mm a') : 'Just now'}
              </div>
            </div>
          </motion.div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-24 bg-white border border-brand-line/10 border-dashed rounded-[3rem] text-brand-ink/30 font-medium italic serif">
            The scrolls are empty. The architecture remains untouched.
          </div>
        )}
      </div>
    </div>
  );
}

function ProofTab({ initiative, actions }: { initiative: Initiative; actions: Action[] }) {
  const proofActions = actions.filter(a => a.proofText || a.proofUrl);

  return (
    <div className="space-y-12 flex flex-col max-w-full overflow-hidden">
      <div className="bg-brand-ink text-white rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-4xl md:text-5xl font-black mb-6 serif leading-[1.1]">The Vault of <br/><span className="text-brand-primary italic">Impact.</span></h3>
          <p className="text-white/50 text-lg font-medium italic serif leading-relaxed">
            Truth isn't declared; it's proven. This is your verifiable record of existence—manual evidence of real-world changes.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10 rotate-12">
          <FileText size={240} />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-brand-ink to-transparent opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {proofActions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-32 bg-white border border-brand-line/10 rounded-[4rem] px-6"
          >
            <div className="w-24 h-24 bg-brand-bg rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-brand-primary/20">
              <FileText size={48} />
            </div>
            <p className="text-2xl font-black text-brand-ink mb-3 serif">The Vault is unlocked.</p>
            <p className="text-brand-ink/50 font-medium italic serif max-w-xs mx-auto">Log a new work action with text proof or a URL evidence link to build your case.</p>
          </motion.div>
        ) : (
          proofActions.map((action, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={action.id}
              className="bg-white border border-brand-line/10 rounded-[2.5rem] p-8 hover:shadow-[0_32px_64px_-16px_rgba(var(--color-brand-primary-rgb),0.1)] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 bg-brand-bg text-brand-ink/40 rounded-full">
                  {action.category}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-ink/20 italic">
                  {action.timestamp?.toDate ? format(action.timestamp.toDate(), 'MMMM d, yyyy') : ''}
                </span>
              </div>
              
              <h4 className="text-2xl font-black text-brand-ink mb-6 serif leading-tight group-hover:text-brand-primary transition-colors">
                {action.description}
              </h4>
              
              {action.proofText && (
                <div className="bg-brand-bg/50 p-6 rounded-[1.5rem] mb-6 relative border border-brand-line/5">
                  <p className="text-sm text-brand-ink/70 leading-relaxed italic relative z-10 serif font-medium">"{action.proofText}"</p>
                  <div className="absolute top-2 left-2 text-brand-primary/5 select-none -z-10">
                    <FileText size={48} />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-6 border-t border-brand-line/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-black">
                    {action.userName ? action.userName[0].toUpperCase() : 'M'}
                  </div>
                  <p className="text-[10px] font-black text-brand-ink/30 uppercase tracking-widest">
                    Verified by {action.userName || 'Member'}
                  </p>
                </div>
                {action.proofUrl && (
                  <a 
                    href={action.proofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/10 active:scale-95"
                  >
                    <ExternalLink size={14} />
                    View Proof
                  </a>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}


