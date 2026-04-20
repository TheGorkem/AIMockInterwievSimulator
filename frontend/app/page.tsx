"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { getConfig, type CompanyInfo } from "@/lib/api";

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "Product Manager",
  "UX Designer",
  "QA Engineer",
  "Machine Learning Engineer",
  "Cloud Architect",
  "Cybersecurity Analyst",
];

const LEVELS = ["Junior", "Mid-Level", "Senior", "Lead", "Principal"];

const DIFFICULTY_VALUES = [
  { value: "easy",   icon: "🟢", labelKey: "setup.diffEasy",   descKey: "setup.diffEasyDesc" },
  { value: "medium", icon: "🟡", labelKey: "setup.diffMedium", descKey: "setup.diffMediumDesc" },
  { value: "hard",   icon: "🟠", labelKey: "setup.diffHard",   descKey: "setup.diffHardDesc" },
  { value: "expert", icon: "🔴", labelKey: "setup.diffExpert", descKey: "setup.diffExpertDesc" },
];

const COMPANY_ICONS: Record<string, string> = {
  google: "🔍",
  amazon: "📦",
  meta: "Ⓜ️",
  microsoft: "🪟",
  startup: "🚀",
  corporate: "🏢",
};

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState("technical");
  const [techStack, setTechStack] = useState("");
  const [company, setCompany] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  useEffect(() => {
    getConfig()
      .then((cfg) => setCompanies(cfg.companies))
      .catch(() => {
        setCompanies([
          { id: "google",    name: "Google",    style: "analytical, algorithmic" },
          { id: "amazon",    name: "Amazon",    style: "behavioral, leadership principles" },
          { id: "meta",      name: "Meta",      style: "coding-heavy, system design" },
          { id: "microsoft", name: "Microsoft", style: "problem-solving, collaborative" },
          { id: "startup",   name: "Startup",   style: "practical, fast-paced" },
          { id: "corporate", name: "Corporate", style: "structured, traditional" },
        ]);
      });
  }, []);

  const canStart = role && level;

  const handleStart = () => {
    if (!canStart) return;
    const params = new URLSearchParams({ role, level, mode });
    if (techStack) params.set("techStack", techStack);
    if (company) params.set("company", company);
    if (difficulty) params.set("difficulty", difficulty);
    router.push(`/interview?${params.toString()}`);
  };

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">IP</div>
          <span className="brand-name">InterviewPro</span>
        </div>
        <div className="navbar-actions">
          <div className="nav-links">
            <a href="#features">{t('nav.features')}</a>
            <a href="#setup">{t('setup.title')}</a>
          </div>
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-pill">
              <span className="pill-dot"></span>
              AI-Powered Interview Practice
            </div>

            <h1 className="hero-title">
              {t('hero.title').split('\n')[0] || 'Master Your'}
              <br />
              <span className="hero-title-gradient">
                {t('hero.title').split('\n')[1] || 'Interview Skills'}
              </span>
            </h1>

            <p className="hero-description">
              {t('hero.subtitle')}
            </p>

            <div className="hero-cta-group">
              <button
                onClick={() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })}
                className="cta-primary"
              >
                {t('hero.startInterview')} →
              </button>
            </div>

            <div className="hero-features-row">
              <div className="hero-feature-item">
                <span className="feature-dot feature-dot-green"></span>
                {t('features.smartFollowups.title')}
              </div>
              <div className="hero-feature-item">
                <span className="feature-dot feature-dot-blue"></span>
                {t('features.adaptiveQuestions.title')}
              </div>
              <div className="hero-feature-item">
                <span className="feature-dot feature-dot-purple"></span>
                {t('features.hintSystem.title')}
              </div>
            </div>
          </div>

          {/* Right Column - Preview Card */}
          <div className="hero-right">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-avatar-group">
                  <div className="preview-avatar">🤖</div>
                  <div>
                    <div className="preview-name">AI Interviewer</div>
                    <div className="preview-role">Google-style Technical</div>
                  </div>
                </div>
                <div className="preview-time">
                  <span className="difficulty-badge difficulty-hard">Hard</span>
                </div>
              </div>

              <div className="preview-question-box">
                <div className="preview-q-label">Question 3/10 — Scenario</div>
                <div className="preview-q-text">
                  &ldquo;Design a URL shortener that handles 100M+ daily requests. Walk me through your architecture decisions.&rdquo;
                </div>
              </div>

              <div className="preview-analyzing">
                <div className="bounce-dots">
                  <span></span><span></span><span></span>
                </div>
                <span>AI is analyzing your response...</span>
              </div>

              <div className="preview-input">
                <span>Type your answer here...</span>
              </div>

              <div className="preview-glow preview-glow-1"></div>
              <div className="preview-glow preview-glow-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section id="setup" className="setup-section">
        <div className="section-container">
          <div className="section-header">
            <h2>{t('setup.title')}</h2>
            <p>{t('setup.subtitle')}</p>
          </div>

          <div className="setup-card">
            {/* Row 1: Role + Level + Mode */}
            <div className="setup-grid">
              <div className="setup-field">
                <label>{t('setup.targetRole')}</label>
                <div className="select-wrapper">
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="">{t('setup.selectRole')}</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{t(`roles.${r}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="setup-field">
                <label>{t('setup.seniorityLevel')}</label>
                <div className="select-wrapper">
                  <select value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="">{t('setup.selectLevel')}</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{t(`levels.${l}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="setup-field">
                <label>{t('setup.interviewMode')}</label>
                <div className="mode-radio-group">
                  {[
                    { value: "technical", label: t('setup.technical'), icon: "⚙️" },
                    { value: "behavioral", label: t('setup.behavioral'), icon: "🤝" },
                    { value: "mixed", label: t('setup.mixed'), icon: "🔄" }
                  ].map((option) => (
                    <label key={option.value} className={`mode-radio-item ${mode === option.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="mode"
                        value={option.value}
                        checked={mode === option.value}
                        onChange={(e) => setMode(e.target.value)}
                      />
                      <span className="mode-radio-icon">{option.icon}</span>
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Tech Stack */}
            <div className="setup-row">
              <div className="setup-field setup-field-wide">
                <label>
                  {t('setup.techStackLabel')} <span className="label-optional">({t('setup.optional')})</span>
                </label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder={t('setup.techStackPlaceholder')}
                  className="setup-input"
                />
              </div>
            </div>

            {/* Row 3: Company Selection (Optional) */}
            <div className="setup-row">
              <div className="setup-field setup-field-wide">
                <label>
                  {t('setup.companyLabel')} <span className="label-optional">({t('setup.optional')})</span>
                </label>
                <div className="company-grid">
                  <label
                    className={`company-card ${company === null ? 'active' : ''}`}
                    onClick={() => setCompany(null)}
                  >
                    <input type="radio" name="company" checked={company === null} readOnly />
                    <span className="company-icon">🌐</span>
                    <span className="company-name">{t('setup.noCompany')}</span>
                    <span className="company-desc">{t('setup.noCompanyDesc')}</span>
                  </label>
                  {companies.map((c) => (
                    <label
                      key={c.id}
                      className={`company-card ${company === c.id ? 'active' : ''}`}
                      onClick={() => setCompany(c.id)}
                    >
                      <input type="radio" name="company" checked={company === c.id} readOnly />
                      <span className="company-icon">
                        {COMPANY_ICONS[c.id] ?? "🏢"}
                      </span>
                      <span className="company-name">{c.name}</span>
                      <span className="company-desc">{c.style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Difficulty Selection (Optional) */}
            <div className="setup-row">
              <div className="setup-field setup-field-wide">
                <label>
                  {t('setup.difficultyLabel')} <span className="label-optional">({t('setup.difficultyHint')})</span>
                </label>
                <div className="difficulty-grid">
                  <label
                    className={`difficulty-option ${difficulty === null ? 'active' : ''}`}
                    onClick={() => setDifficulty(null)}
                  >
                    <input type="radio" name="difficulty" checked={difficulty === null} readOnly />
                    <span className="diff-icon">🔄</span>
                    <div>
                      <span className="diff-label">{t('setup.diffAuto')}</span>
                      <span className="diff-desc">{t('setup.diffAutoDesc')}</span>
                    </div>
                  </label>
                  {DIFFICULTY_VALUES.map((d) => (
                    <label
                      key={d.value}
                      className={`difficulty-option ${difficulty === d.value ? 'active' : ''}`}
                      onClick={() => setDifficulty(d.value)}
                    >
                      <input type="radio" name="difficulty" checked={difficulty === d.value} readOnly />
                      <span className="diff-icon">{d.icon}</span>
                      <div>
                        <span className="diff-label">{t(d.labelKey)}</span>
                        <span className="diff-desc">{t(d.descKey)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="setup-submit">
              <button
                onClick={handleStart}
                disabled={!canStart}
                className={`cta-primary cta-full ${!canStart ? 'cta-disabled' : ''}`}
              >
                {canStart ? `🚀 ${t('setup.startInterview')}` : t('setup.selectToContinue')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>{t('features.title')}</h2>
            <p>{t('features.subtitle')}</p>
          </div>

          <div className="features-grid">
            {[
              { icon: "🧠", title: t('features.adaptiveQuestions.title'), description: t('features.adaptiveQuestions.description') },
              { icon: "🎯", title: t('features.instantScoring.title'), description: t('features.instantScoring.description') },
              { icon: "🏢", title: t('features.smartFollowups.title'), description: t('features.smartFollowups.description') },
              { icon: "💡", title: t('features.voiceInteraction.title'), description: t('features.voiceInteraction.description') },
              { icon: "📋", title: t('features.performanceTracking.title'), description: t('features.performanceTracking.description') },
              { icon: "📊", title: t('features.hintSystem.title'), description: t('features.hintSystem.description') },
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="navbar-brand">
            <div className="brand-icon">IP</div>
            <span className="brand-name">InterviewPro</span>
          </div>
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
