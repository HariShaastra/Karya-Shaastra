import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../App';
import { Initiative, Action, TeamMember, Resource, Milestone, InitiativeStage, ActionCategory } from '../types';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

type Tab = 'overview' | 'pathways' | 'actions' | 'team' | 'resources' | 'milestones' | 'proof';

export default function InitiativeDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  // Sub-collections state
  const [actions, setActions] = useState<Action[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isEditingInitiative, setIsEditingInitiative] = useState(false);

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

    return () => {
      unsubInitiative();
      unsubActions();
      unsubTeam();
      unsubResources();
      unsubMilestones();
    };
  }, [id, navigate]);

  if (loading || !initiative) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pathways', label: 'Pathways', icon: Rocket },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'resources', label: 'Finance', icon: DollarSign },
    { id: 'milestones', label: 'Milestones', icon: Trophy },
    { id: 'proof', label: 'Proof', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              initiative.type === 'profit' ? "bg-[#E0F2FE] text-[#0369A1]" :
              initiative.type === 'non-profit' ? "bg-[#F0FDF4] text-[#15803D]" :
              "bg-[#FEF2F2] text-[#B91C1C]"
            )}>
              {initiative.type}
            </span>
            <span className="text-[10px] font-black text-[#999990] uppercase tracking-widest">
              Stage: {initiative.stage}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">{initiative.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingInitiative(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-brand-line/10 rounded-xl font-bold hover:border-brand-primary transition-all text-brand-ink"
          >
            <Edit2 size={18} />
            Edit Initiative
          </button>
          <Link
            to={`/p/${initiative.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
          >
            <Share2 size={18} />
            Public Profile
          </Link>
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
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                : "bg-white border border-brand-line/10 text-brand-ink/60 hover:border-brand-primary hover:text-brand-primary"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
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
            {activeTab === 'actions' && <ActionsTab initiative={initiative} actions={actions} />}
            {activeTab === 'team' && <TeamTab initiative={initiative} team={team} />}
            {activeTab === 'resources' && <ResourcesTab initiative={initiative} resources={resources} />}
            {activeTab === 'milestones' && <MilestonesTab initiative={initiative} milestones={milestones} />}
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
    <div className="grid grid-cols-1 gap-6">
      {fields.map((field) => (
        <div key={field.label} className="bg-white border border-brand-line/10 rounded-3xl p-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-4">{field.label}</h3>
          <p className="text-lg font-medium text-brand-ink leading-relaxed whitespace-pre-wrap">{field.value}</p>
        </div>
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

function ActionsTab({ initiative, actions }: { initiative: Initiative; actions: Action[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [newAction, setNewAction] = useState({
    description: '',
    category: 'operations' as ActionCategory,
    timeSpent: 30,
    notes: '',
  });

  const handleSaveAction = async () => {
    if (!newAction.description) return;
    try {
      if (editingAction) {
        await updateDoc(doc(db, 'initiatives', initiative.id, 'actions', editingAction.id), {
          ...newAction,
        });
      } else {
        await addDoc(collection(db, 'initiatives', initiative.id, 'actions'), {
          ...newAction,
          initiativeId: initiative.id,
          userId: auth.currentUser?.uid,
          timestamp: serverTimestamp(),
        });
      }
      setIsAdding(false);
      setEditingAction(null);
      setNewAction({ description: '', category: 'operations', timeSpent: 30, notes: '' });
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
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black font-serif text-brand-ink">Daily Log</h3>
        <button
          onClick={() => {
            setEditingAction(null);
            setNewAction({ description: '', category: 'operations', timeSpent: 30, notes: '' });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={18} />
          Log Work
        </button>
      </div>

      {(isAdding || editingAction) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-brand-primary rounded-3xl p-8 space-y-6 shadow-xl shadow-brand-primary/5"
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
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Notes (Optional)</label>
            <textarea
              value={newAction.notes}
              onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
              rows={3}
              className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-medium"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingAction(null); }} className="px-6 py-3 font-bold text-brand-ink/60 hover:bg-brand-line/5 rounded-xl transition-all">Cancel</button>
            <button onClick={handleSaveAction} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
              {editingAction ? 'Update Action' : 'Save Action'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="bg-white border border-brand-line/10 rounded-2xl p-6 flex items-start gap-6 group hover:border-brand-primary transition-all">
            <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center text-brand-primary flex-shrink-0">
              <Zap size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-lg truncate text-brand-ink">{action.description}</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingAction(action);
                      setNewAction({
                        description: action.description,
                        category: action.category,
                        timeSpent: action.timeSpent,
                        notes: action.notes || '',
                      });
                    }}
                    className="p-2 text-brand-ink/40 hover:text-brand-primary transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAction(action.id)}
                    className="p-2 text-brand-ink/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="text-[10px] font-black text-brand-ink/40 uppercase tracking-widest ml-2">
                    {action.timestamp?.toDate ? format(action.timestamp.toDate(), 'MMM d, h:mm a') : 'Just now'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-brand-ink/60">
                <span className="flex items-center gap-1"><Clock size={14} /> {action.timeSpent}m</span>
                <span className="px-2 py-0.5 bg-brand-bg rounded text-[10px] font-black uppercase tracking-widest">{action.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamTab({ initiative, team }: { initiative: Initiative; team: TeamMember[] }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<any>('volunteer');

  const handleInvite = async () => {
    if (!email) return;
    try {
      await addDoc(collection(db, 'initiatives', initiative.id, 'team'), {
        initiativeId: initiative.id,
        email,
        role,
        invitedAt: serverTimestamp(),
        userId: '', // Will be filled when they join
      });
      setEmail('');
    } catch (error) {
      console.error('Failed to invite:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-[#E5E5E0] rounded-3xl p-8">
        <h3 className="text-xl font-black mb-6">Invite Collaborator</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 p-4 bg-[#F9F9F8] border border-[#E5E5E0] rounded-2xl focus:outline-none focus:border-[#1A1A1A] transition-all"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-4 bg-[#F9F9F8] border border-[#E5E5E0] rounded-2xl focus:outline-none focus:border-[#1A1A1A] transition-all"
          >
            <option value="volunteer">Volunteer</option>
            <option value="partner">Partner</option>
          </select>
          <button
            onClick={handleInvite}
            className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10"
          >
            Send Invite
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#999990]">Current Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E5E5E0] rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-black">F</div>
            <div>
              <p className="font-bold">Founder (You)</p>
              <p className="text-sm text-[#666660]">Primary Owner</p>
            </div>
          </div>
          {team.map((member) => (
            <div key={member.id} className="bg-white border border-[#E5E5E0] rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F0F0ED] text-[#1A1A1A] flex items-center justify-center font-black">
                  {member.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{member.email}</p>
                  <p className="text-sm text-[#666660] capitalize">{member.role}</p>
                </div>
              </div>
              <button onClick={() => deleteDoc(doc(db, 'initiatives', initiative.id, 'team', member.id))} className="p-2 text-[#999990] hover:text-[#DC2626] transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourcesTab({ initiative, resources }: { initiative: Initiative; resources: Resource[] }) {
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-brand-line/10 rounded-3xl p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Total Inflow</p>
          <p className="text-3xl font-black text-green-600">₹{totalIn.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-brand-line/10 rounded-3xl p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-2">Total Outflow</p>
          <p className="text-3xl font-black text-red-600">₹{totalOut.toLocaleString()}</p>
        </div>
        <div className="bg-brand-ink text-white rounded-3xl p-8 shadow-xl shadow-brand-ink/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Current Balance</p>
          <p className="text-3xl font-black">₹{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black font-serif text-brand-ink">Transactions</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-brand-primary rounded-3xl p-8 space-y-6"
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
          <div className="flex items-center justify-end gap-3 pt-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 font-bold text-brand-ink/60 hover:bg-brand-line/5 rounded-xl transition-all">Cancel</button>
            <button onClick={handleAddResource} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">Save Record</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white border border-brand-line/10 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-bg/50 border-b border-brand-line/10">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-ink/40">Date</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-ink/40">Description</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-ink/40 text-right">Amount</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-ink/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line/5">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-brand-bg/30 transition-colors group">
                <td className="px-8 py-4 text-sm text-brand-ink/60">
                  {resource.timestamp?.toDate ? format(resource.timestamp.toDate(), 'MMM d, yyyy') : 'Just now'}
                </td>
                <td className="px-8 py-4 font-bold text-brand-ink">{resource.description}</td>
                <td className={cn(
                  "px-8 py-4 font-black text-right",
                  resource.type === 'in' ? "text-green-600" : "text-red-600"
                )}>
                  {resource.type === 'in' ? '+' : '-'} ₹{resource.amount.toLocaleString()}
                </td>
                <td className="px-8 py-4 text-right">
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="p-2 text-brand-ink/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MilestonesTab({ initiative, milestones }: { initiative: Initiative; milestones: Milestone[] }) {
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
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black font-serif text-brand-ink">Milestones</h3>
        <button
          onClick={() => {
            setEditingMilestone(null);
            setNewMilestone({ title: '', description: '' });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={18} />
          Add Milestone
        </button>
      </div>

      {(isAdding || editingMilestone) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-brand-primary rounded-3xl p-8 space-y-6"
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
              className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-medium"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button onClick={() => { setIsAdding(false); setEditingMilestone(null); }} className="px-6 py-3 font-bold text-brand-ink/60 hover:bg-brand-line/5 rounded-xl transition-all">Cancel</button>
            <button onClick={handleSaveMilestone} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20">
              {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              "bg-white border rounded-2xl p-6 flex items-center gap-6 transition-all group",
              milestone.completed ? "border-green-600 bg-green-50/30" : "border-brand-line/10 hover:border-brand-primary"
            )}
          >
            <div 
              onClick={() => toggleMilestone(milestone)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                milestone.completed ? "bg-green-600 text-white" : "border-2 border-brand-line/10 text-brand-line/20"
              )}
            >
              {milestone.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <div className="flex-1" onClick={() => toggleMilestone(milestone)}>
              <h4 className={cn("font-bold text-lg text-brand-ink", milestone.completed && "line-through text-green-600/60")}>{milestone.title}</h4>
              {milestone.description && <p className="text-sm text-brand-ink/60">{milestone.description}</p>}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditingMilestone(milestone);
                  setNewMilestone({ title: milestone.title, description: milestone.description || '' });
                }}
                className="p-2 text-brand-ink/40 hover:text-brand-primary transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteMilestone(milestone.id)}
                className="p-2 text-brand-ink/40 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProofTab({ initiative, actions }: { initiative: Initiative; actions: Action[] }) {
  return (
    <div className="space-y-10">
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-10 shadow-xl shadow-black/10 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4">Proof of Work</h3>
          <p className="text-white/60 text-lg max-w-xl">
            This is your automatically generated timeline of real impact. Use this to build credibility and show the world what you've achieved.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <TrendingUp size={160} />
        </div>
      </div>

      <div className="relative pl-8 space-y-12 before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-0.5 before:bg-[#E5E5E0]">
        {actions.map((action, index) => (
          <div key={action.id} className="relative">
            <div className="absolute -left-[25px] top-2 w-4 h-4 rounded-full bg-[#1A1A1A] border-4 border-[#F9F9F8]" />
            <div className="bg-white border border-[#E5E5E0] rounded-2xl p-8 hover:border-[#1A1A1A] transition-all shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-[#999990]">
                  {action.timestamp?.toDate ? format(action.timestamp.toDate(), 'MMMM d, yyyy') : 'Just now'}
                </span>
                <span className="px-3 py-1 bg-[#F0F0ED] rounded-full text-[10px] font-black uppercase tracking-widest">{action.category}</span>
              </div>
              <h4 className="text-xl font-bold mb-2">{action.description}</h4>
              {action.notes && <p className="text-[#666660] leading-relaxed">{action.notes}</p>}
              <div className="mt-6 flex items-center gap-4 text-xs font-bold text-[#999990]">
                <span className="flex items-center gap-1"><Clock size={14} /> {action.timeSpent} mins invested</span>
                <span className="flex items-center gap-1"><Users size={14} /> Logged by Founder</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
