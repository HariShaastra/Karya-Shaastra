import { signInWithGoogle } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-brand-primary/5 border border-[#E5E5E0] text-center"
      >
        <div className="flex justify-center mb-8">
          <Logo className="w-20 h-20" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-brand-ink mb-2 serif">Karya Shaastra</h1>
        <p className="text-brand-primary font-medium mb-10 italic serif">From Idea to Impact</p>
        
        <div className="space-y-6 text-left mb-10">
          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded-full bg-brand-bg flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-xs font-bold text-brand-primary">1</span>
            </div>
            <p className="text-sm text-brand-ink/70">Define your initiative with a structured blueprint.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded-full bg-brand-bg flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-xs font-bold text-brand-primary">2</span>
            </div>
            <p className="text-sm text-brand-ink/70">Follow guided pathways to launch and scale.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded-full bg-brand-bg flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-xs font-bold text-brand-primary">3</span>
            </div>
            <p className="text-sm text-brand-ink/70">Log real actions and build a proof-of-work portfolio.</p>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-brand-primary text-white py-4 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all duration-300 shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
        >
          <LogIn size={20} />
          Continue with Google
        </button>
        
        <p className="mt-8 text-xs text-brand-ink/40 leading-relaxed">
          By signing in, you agree to build meaningful things and execute with discipline.
        </p>
      </motion.div>
    </div>
  );
}
