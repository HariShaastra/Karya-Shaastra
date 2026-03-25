import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { InitiativeType, InitiativeStage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Target, Users, Zap, Briefcase, Heart, Globe } from 'lucide-react';

const STEPS = [
  { id: 'type', title: 'Initiative Type', description: 'What kind of impact are you building?' },
  { id: 'basics', title: 'Core Identity', description: 'Name and the problem you solve.' },
  { id: 'solution', title: 'The Strategy', description: 'How do you plan to solve it?' },
  { id: 'outcome', title: 'Expected Impact', description: 'What does success look like?' },
];

export default function InitiativeBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: 'profit' as InitiativeType,
    problemStatement: '',
    targetGroup: '',
    proposedSolution: '',
    why: '',
    expectedOutcome: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    const initiativeId = doc(collection(db, 'initiatives')).id;
    const newInitiative = {
      ...formData,
      id: initiativeId,
      ownerId: user.uid,
      stage: 'idea' as InitiativeStage,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'initiatives', initiativeId), newInitiative);
      navigate(`/initiative/${initiativeId}`);
    } catch (error) {
      console.error('Failed to create initiative:', error);
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) return !!formData.type;
    if (currentStep === 1) return !!formData.name && !!formData.problemStatement;
    if (currentStep === 2) return !!formData.proposedSolution && !!formData.targetGroup;
    if (currentStep === 3) return !!formData.expectedOutcome && !!formData.why;
    return false;
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-brand-line/5 rounded-full transition-colors text-brand-ink">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight font-serif text-brand-ink">Initiative Builder</h1>
            <p className="text-brand-ink/60 font-medium">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-brand-line/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      <div className="bg-white border border-brand-line/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-brand-ink/5 min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <h2 className="text-2xl font-bold mb-2 text-brand-ink font-serif">{STEPS[currentStep].title}</h2>
            <p className="text-brand-ink/60 mb-10">{STEPS[currentStep].description}</p>

            {currentStep === 0 && (
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'profit', label: 'Profit', icon: Briefcase, desc: 'Building a sustainable business model.' },
                  { id: 'non-profit', label: 'Non-Profit', icon: Heart, desc: 'Solving social problems for impact.' },
                  { id: 'community', label: 'Community', icon: Globe, desc: 'Gathering people for a shared purpose.' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id as InitiativeType })}
                    className={cn(
                      "flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left",
                      formData.type === type.id
                        ? "border-brand-primary bg-brand-bg/50 shadow-lg shadow-brand-primary/5"
                        : "border-brand-line/10 hover:border-brand-primary"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      formData.type === type.id ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-ink/40"
                    )}>
                      <type.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-brand-ink">{type.label}</h3>
                      <p className="text-sm text-brand-ink/60">{type.desc}</p>
                    </div>
                    {formData.type === type.id && (
                      <div className="ml-auto w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Initiative Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Project Green Earth"
                    className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-lg font-bold text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Problem Statement</label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    placeholder="What specific problem are you trying to solve?"
                    rows={4}
                    className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all leading-relaxed font-medium text-brand-ink"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Target Group</label>
                  <input
                    type="text"
                    value={formData.targetGroup}
                    onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                    placeholder="Who are you building this for?"
                    className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-bold text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Proposed Solution</label>
                  <textarea
                    value={formData.proposedSolution}
                    onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
                    placeholder="How does your solution work?"
                    rows={4}
                    className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all leading-relaxed font-medium text-brand-ink"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Expected Outcome</label>
                  <textarea
                    value={formData.expectedOutcome}
                    onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                    placeholder="What is the ultimate goal?"
                    rows={4}
                    className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all leading-relaxed font-medium text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-ink/40 mb-3">Why this initiative?</label>
                  <textarea
                    value={formData.why}
                    onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                    placeholder="What motivates you to start this?"
                    rows={3}
                    className="w-full p-4 bg-brand-bg/50 border border-brand-line/10 rounded-2xl focus:outline-none focus:border-brand-primary transition-all leading-relaxed font-medium text-brand-ink"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-10 mt-auto border-t border-brand-line/5">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
              currentStep === 0 ? "opacity-0 pointer-events-none" : "text-brand-ink/60 hover:bg-brand-line/5"
            )}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]",
              isStepValid() 
                ? "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-brand-primary/20" 
                : "bg-brand-line/10 text-brand-ink/20 cursor-not-allowed"
            )}
          >
            {currentStep === STEPS.length - 1 ? 'Finish & Launch' : 'Continue'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
