import React from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import './LandingPage.css';

const FEATURES = [
  {
    icon: '✨',
    title: 'AI Generation',
    desc: 'Paste a link or text, and watch our AI create professional flashcards in seconds.',
  },
  {
    icon: '💾',
    title: 'Smart Decks',
    desc: 'Organize your learning into beautiful decks with glassmorphism UI.',
  },
  {
    icon: '⚡',
    title: 'Quick Revision',
    desc: 'Master any topic with our optimized spaced-repetition algorithm.',
  },
];

const STEPS = [
  { num: 1, title: 'Input Content', desc: 'Paste text, upload a PDF, or provide a URL.' },
  { num: 2, title: 'AI Processing', desc: 'Our AI extracts key concepts and creates 5 flashcards.' },
  { num: 3, title: 'Learn & Master', desc: 'Study in short 5-minute bursts and track progress.' },
];

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__badge">AI-Powered Learning</div>
        <h1 className="hero__title">
          Learn in <span>5</span>
        </h1>
        <p className="hero__tagline">
          Generate 5 AI-powered flashcards instantly and master anything in just minutes a day.
        </p>
        
        <div className="flex gap-md justify-center">
          <Button variant="primary" size="lg" onClick={onGetStarted}>
            Start Learning
          </Button>
          <Button variant="secondary" size="lg">
            How it works
          </Button>
        </div>

        {/* Hero Illustration/Preview */}
        <div className="hero-card animate-slide-up">
          <div className="hero-card__preview">
             <div className="flex flex-col gap-md items-center stagger-children">
                <GlassCard compact style={{ width: '280px' }}>
                  <div className="flex items-center gap-sm">
                    <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    <div>
                      <div className="font-semibold">React Hooks</div>
                      <div className="text-sm">5 Flashcards generated</div>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard compact style={{ width: '320px', marginLeft: '40px' }}>
                  <div className="flex items-center gap-sm">
                    <span style={{ fontSize: '1.5rem' }}>🔬</span>
                    <div>
                        <div className="font-semibold">Quantum Physics</div>
                        <div className="text-sm">Ready for review</div>
                    </div>
                  </div>
                </GlassCard>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="section-title">Why Learn in 5?</h2>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <GlassCard key={i} hoverable className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={i} className="step">
                <div className="step__num">{s.num}</div>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center mt-3xl mb-3xl">
        <GlassCard style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-2xl)' }}>
          <h2 className="mb-md">Ready to accelerate your learning?</h2>
          <p className="mb-xl">Join thousands of students learning faster than ever.</p>
          <Button variant="primary" size="lg" onClick={onGetStarted}>
            Start Learning for Free
          </Button>
        </GlassCard>
      </section>
    </div>
  );
}
