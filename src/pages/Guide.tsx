import React from 'react';
import { motion } from 'motion/react';
import { Info, BookOpen, ShieldAlert, ArrowRight } from 'lucide-react';
import Saathi from '../components/Saathi';

export default function Guide() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
        <div className="flex-1">
          <header className="mb-10">
            <h1 className="text-5xl font-black tracking-tight serif text-brand-ink mb-4">Using Karya Shaastra</h1>
            <p className="text-xl text-brand-ink/60 font-medium italic serif">Your manual for disciplined execution.</p>
          </header>

          <section className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-2xl font-bold font-serif text-brand-ink">The Framework</h2>
              </div>
              <div className="space-y-4 text-brand-ink/70 leading-relaxed font-medium">
                <p>1. <span className="text-brand-ink font-bold">Build:</span> Start by defining your initiative. Use the structured builder to articulate the problem, your solution, and the ultimate why.</p>
                <p>2. <span className="text-brand-ink font-bold">Act:</span> Every day, log your actions. Consistency is the primary metric of Karya Shaastra.</p>
                <p>3. <span className="text-brand-ink font-bold">Prove:</span> Don't just claim impact—document it. Upload your evidence, write your findings, and build a verifiable log of your journey.</p>
                <p>4. <span className="text-brand-ink font-bold">Collaborate:</span> Add team members and partners. Work together, share documents, and track collective progress.</p>
              </div>
            </div>

            <div className="p-8 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="text-brand-primary" />
                <h2 className="text-xl font-bold font-serif text-brand-ink text-brand-primary">The Disclaimer</h2>
              </div>
              <p className="text-sm text-brand-ink/60 leading-relaxed font-medium italic">
                Karya Shaastra is a tool for organization and discipline. It does not guarantee success. The impact generated depends entirely on the user's execution and ethics. This app is provided "as is" and intended for educational and professional planning purposes only. We are not responsible for the outcome of any initiative managed here. 
              </p>
            </div>
          </section>
        </div>

        <div className="md:sticky md:top-24">
          <Saathi 
            emotion="happy" 
            message="I'm here to walk with you every step of the way!" 
          />
        </div>
      </div>
    </div>
  );
}
