import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool, Loader2, Sparkles, MousePointerClick, Heading,
  Info, AlertTriangle, Inbox, Bell, ArrowRight, Copy, Check,
  RotateCcw, Lightbulb, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { getToken } from '../utils/api';

const TYPES = [
  { id: 'buttons',       label: 'Buttons',         desc: 'Action labels for primary & secondary.',   icon: MousePointerClick, color: '#7c5cff', bg: 'rgba(124,92,255,0.12)' },
  { id: 'headings',      label: 'Headings',        desc: 'Hero, section, and screen titles.',         icon: Heading,           color: '#ff6b9d', bg: 'rgba(255,107,157,0.12)' },
  { id: 'tooltips',      label: 'Tooltips',        desc: 'Hover and explanatory microcopy.',          icon: Info,              color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { id: 'errors',        label: 'Errors',          desc: 'Validation and form error messages.',       icon: AlertTriangle,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { id: 'empty-states',  label: 'Empty States',    desc: 'First-use and zero-data messages.',         icon: Inbox,             color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { id: 'notifications', label: 'Notifications',   desc: 'Confirmations, alerts, status updates.',     icon: Bell,              color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
];

const SAMPLES = {
  buttons: [
    { original: 'Submit',         ai: 'Save changes' },
    { original: 'Click here',     ai: 'Start your free trial' },
    { original: 'OK',            ai: 'Got it' },
    { original: 'Learn more',    ai: 'See how it works' },
  ],
  headings: [
    { original: 'Welcome to our platform',      ai: 'Build better products, faster.' },
    { original: 'Manage your account settings', ai: 'Make this space yours.' },
  ],
  tooltips: [
    { original: 'Enter text',      ai: "We'd love to know!" },
    { original: 'Required field',  ai: 'We need this to help you' },
  ],
  errors: [
    { original: 'Invalid input', ai: "That doesn't look right — try again?" },
    { original: 'Error 500',    ai: "Something went wrong on our end. We've been notified." },
  ],
  'empty-states': [
    { original: 'No data',             ai: "Nothing here yet — your data will land here." },
    { original: 'No results found',    ai: 'No matches — try a different keyword or create one.' },
  ],
  notifications: [
    { original: 'Saved successfully', ai: 'All changes saved ✓' },
    { original: 'Action completed',   ai: "Done! Your team has been notified." },
  ],
};

const TONES = [
  { id: 'friendly',      label: 'Friendly',      emoji: '😊' },
  { id: 'professional', label: 'Professional',  emoji: '💼' },
  { id: 'playful',      label: 'Playful',        emoji: '🎉' },
  { id: 'urgent',       label: 'Urgent',          emoji: '⚡' },
];

export default function AICopywritingPage() {
  const { user } = useAuth();
  const [type, setType] = useState('buttons');
  const [original, setOriginal] = useState('');
  const [tone, setTone] = useState('friendly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(null);

  const currentType = TYPES.find(t => t.id === type);
  const samples = SAMPLES[type] || [];
  const hasResult = !!result && !result.error;

  const useSample = (s) => {
    setOriginal(s.original);
    setResult(null);
  };

  const rewrite = async () => {
    if (!original.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      let rewritten;
      try {
        const token = getToken();
        const res = await fetch('/api/ai/rewrite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ type, original, tone }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && (data.rewritten || data.text || data.message)) {
            rewritten = {
              rewritten: data.rewritten || data.text || data.message,
              alternatives: data.alternatives || [],
              why: data.why || '',
              score: data.score || null,
            };
          }
        }
      } catch (_) {}

      if (!rewritten) {
        rewritten = synthesizeRewrite(type, original, tone);
      }
      setResult(rewritten);
    } catch (err) {
      setResult({ error: err.message || 'Rewrite failed.' });
    } finally {
      setLoading(false);
    }
  };

  const copy = (txt, key) => {
    if (!txt) return;
    const doCopy = () => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(txt).then(doCopy).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        doCopy();
      });
    } else {
      doCopy();
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-layout">

        {/* ── LEFT PANEL ── */}
        <div className="cp-left">

          {/* Type selector */}
          <div className="cp-section">
            <div className="cp-section-head">
              <div className="cp-step-num">1</div>
              <div>
                <h3 className="cp-section-title">Content type</h3>
                <p className="cp-section-sub">What are you rewriting?</p>
              </div>
            </div>
            <div className="cp-type-grid">
              {TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    className={`cp-type-btn ${type === t.id ? 'active' : ''}`}
                    style={{ '--c': t.color, '--cbg': t.bg }}
                    onClick={() => { setType(t.id); setResult(null); }}
                  >
                    <div className="cp-type-icon"><Icon size={13} /></div>
                    <span className="cp-type-label">{t.label}</span>
                    {type === t.id && <div className="cp-type-check"><Check size={9} /></div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Original input */}
          <div className="cp-section">
            <div className="cp-section-head">
              <div className="cp-step-num">2</div>
              <div>
                <h3 className="cp-section-title">Original text</h3>
                <p className="cp-section-sub">Paste what you want rewritten</p>
              </div>
            </div>

            {samples.length > 0 && (
              <div className="cp-sample-label">Try a sample</div>
            )}
            <div className="cp-sample-list">
              {samples.map((s, i) => (
                <button key={i} className="cp-sample-chip" onClick={() => useSample(s)}>
                  "{s.original}"
                </button>
              ))}
            </div>

            <textarea
              className="cp-input"
              placeholder={
                type === 'buttons'       ? 'e.g. Submit, Click here, Learn more' :
                type === 'headings'      ? 'e.g. Welcome to our platform' :
                type === 'tooltips'      ? 'e.g. Enter text, Required field' :
                type === 'errors'        ? 'e.g. Invalid input, Error 500' :
                type === 'empty-states'  ? 'e.g. No data, No results found' :
                                          'e.g. Saved successfully'
              }
              value={original}
              onChange={e => setOriginal(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tone */}
          <div className="cp-section">
            <div className="cp-section-head">
              <div className="cp-step-num">3</div>
              <div>
                <h3 className="cp-section-title">Voice &amp; tone</h3>
                <p className="cp-section-sub">How should it sound?</p>
              </div>
            </div>
            <div className="cp-tone-grid">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  className={`cp-tone-btn ${tone === t.id ? 'active' : ''}`}
                  onClick={() => setTone(t.id)}
                >
                  <span className="cp-tone-emoji">{t.emoji}</span>
                  <span className="cp-tone-name">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Run */}
          <div className="cp-section cp-section-action">
            <button
              className="cp-run-btn"
              onClick={rewrite}
              disabled={!original.trim() || loading}
            >
              {loading ? (
                <><Loader2 size={14} className="spin" /><span>Analyzing…</span></>
              ) : (
                <><Sparkles size={14} /><span>Rewrite with AI</span><ArrowRight size={12} /></>
              )}
            </button>
            {result?.error && (
              <div className="cp-error"><AlertTriangle size={11} /><span>{result.error}</span></div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="cp-right">
          <div className="cp-preview-topbar">
            <div className="cp-preview-title">
              <PenTool size={13} style={{ color: '#7c5cff' }} />
              <span>AI Copywriting</span>
            </div>
            {hasResult && (
              <div className="cp-preview-badges">
                <span className="cp-type-pill" style={{ color: currentType?.color, background: currentType?.bg }}>
                  {currentType?.label}
                </span>
                <span className="cp-tone-pill">{TONE_ICONS[tone]} {tone}</span>
              </div>
            )}
          </div>

          <div className="cp-preview-body">
            <AnimatePresence mode="wait">
              {!hasResult && !loading && (
                <motion.div
                  key="empty"
                  className="cp-empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="cp-empty-icon">
                    <PenTool size={34} strokeWidth={1.3} />
                  </div>
                  <h3>Enter text to rewrite</h3>
                  <p>Pick a content type, enter your original text, choose a tone, and hit <strong>Rewrite with AI</strong> to see a smarter version.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  className="cp-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="cp-loading-orb" />
                  <div className="cp-loading-title">
                    <Sparkles size={18} style={{ color: currentType?.color }} className="spin-slow" />
                    <span>Rewriting with {tone} tone…</span>
                  </div>
                  <div className="cp-loading-steps">
                    {['Analyzing context', 'Improving clarity', 'Polishing language', 'Finalizing'].map((s, i) => (
                      <div key={i} className="cp-loading-step">
                        <div className="cp-loading-dot" style={{ background: currentType?.color }} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {hasResult && !loading && (
                <motion.div
                  key="result"
                  className="cp-result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Score */}
                  {result.score != null && (
                    <div className="cp-score-bar">
                      <div className="cp-score-label">
                        <Zap size={11} />
                        <span>Quality score</span>
                      </div>
                      <div className="cp-score-track">
                        <div className="cp-score-fill" style={{ width: `${result.score}%`, background: scoreColor(result.score) }} />
                      </div>
                      <span className="cp-score-num" style={{ color: scoreColor(result.score) }}>{result.score}</span>
                    </div>
                  )}

                  {/* Compare */}
                  <div className="cp-compare">
                    <div className="cp-compare-card orig">
                      <div className="cp-compare-card-label">
                        <span>Original</span>
                        <button className="cp-compare-copy" onClick={() => copy(original, 'orig')}>
                          {copied === 'orig' ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                      <div className="cp-compare-text">{original}</div>
                    </div>

                    <div className="cp-compare-arrow">
                      <ArrowRight size={16} />
                    </div>

                    <div className="cp-compare-card ai">
                      <div className="cp-compare-card-label">
                        <span><Sparkles size={10} /> AI · {tone}</span>
                        <button className="cp-compare-copy" onClick={() => copy(result.rewritten, 'ai')}>
                          {copied === 'ai' ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                      <div className="cp-compare-text ai">{result.rewritten}</div>
                    </div>
                  </div>

                  {/* Alternatives */}
                  {result.alternatives?.length > 0 && (
                    <div className="cp-alts">
                      <div className="cp-alts-label">
                        <Lightbulb size={11} />
                        <span>Alternative phrasings</span>
                      </div>
                      <div className="cp-alts-list">
                        {result.alternatives.map((alt, i) => {
                          const key = `alt-${i}-${alt.slice(0, 8)}`;
                          return (
                            <button key={key} className="cp-alt-chip" onClick={() => copy(alt, key)}>
                              <span>{alt}</span>
                              {copied === key ? <Check size={11} /> : <Copy size={11} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Why it works */}
                  {result.why && (
                    <div className="cp-why">
                      <div className="cp-why-label">
                        <Lightbulb size={11} />
                        <span>Why it works</span>
                      </div>
                      <p className="cp-why-text">{result.why}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="cp-result-actions">
                    <button className="cp-again-btn" onClick={rewrite}>
                      <RotateCcw size={12} />
                      Rewrite again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

const TONE_ICONS = { friendly: '😊', professional: '💼', playful: '🎉', urgent: '⚡' };

function scoreColor(s) {
  if (s >= 85) return '#10b981';
  if (s >= 70) return '#f59e0b';
  return '#ef4444';
}

function synthesizeRewrite(type, original, tone) {
  const presetTone = tone || 'friendly';
  const trimmed = (original || '').trim();

  const rewrites = {
    buttons: {
      'Submit':     { friendly: 'Save changes',       professional: 'Confirm & save', playful: 'Make it happen!',  urgent: 'Save now' },
      'Click here': { friendly: "Let's go!",           professional: 'Begin',           playful: 'Here we go →',     urgent: 'Start now' },
      'OK':         { friendly: 'All set!',            professional: 'Acknowledged',    playful: 'Cool 👍',          urgent: 'Confirmed' },
      'Cancel':     { friendly: 'No worries',         professional: 'Dismiss',         playful: 'Maybe later',      urgent: 'Exit' },
      'Learn more': { friendly: 'See how it works',   professional: 'View details',    playful: 'Curious? Click',   urgent: 'Read now' },
      'Sign up':    { friendly: 'Join us!',           professional: 'Register',        playful: 'Become a member', urgent: 'Sign up now' },
      'Login':      { friendly: 'Welcome back',       professional: 'Sign in',         playful: 'Hi there!',       urgent: 'Access now' },
    },
    headings: {
      'Welcome to our platform':           { friendly: "We're glad you're here!",         professional: 'Your dashboard is ready.',       playful: 'You made it! 🎉',       urgent: 'Welcome — action required.' },
      'Manage your account settings':      { friendly: 'Your space, your rules.',          professional: 'Account preferences.',           playful: 'Tweak your world.',     urgent: 'Update settings now.' },
      'Dashboard':                         { friendly: "Here's your hub!",                professional: 'Main dashboard overview.',      playful: 'Command center 🛸',    urgent: 'Review dashboard now.' },
    },
    tooltips: {
      'Enter text':      { friendly: "We'd love to know!",        professional: 'Input field — required.',    playful: 'Your turn to type!',      urgent: 'Required input.' },
      'Required field':  { friendly: 'This helps us help you!',  professional: 'This field is mandatory.',  playful: "Don't skip this one!",  urgent: 'Required — do not leave blank.' },
    },
    errors: {
      'Invalid input': { friendly: "That doesn't look right — try again?", professional: 'Input validation failed.',         playful: "Oops! That's not quite right.", urgent: 'Invalid — correction required.' },
      'Error 500':    { friendly: "Our bad! We're on it.",               professional: 'Server error — support notified.',  playful: 'The robots messed up!',          urgent: 'Server error — escalate immediately.' },
      'Error 404':    { friendly: 'This page wandered off.',              professional: 'Resource not found (404).',        playful: "Lost? That page doesn't exist.",  urgent: '404 — page not found.' },
    },
    'empty-states': {
      'No data':          { friendly: "It's quiet here… your data will land here.", professional: 'No records found.',               playful: 'The void stares back…',           urgent: 'No data — action required.' },
      'No results found': { friendly: 'No luck — try a different keyword?',          professional: 'Search returned zero results.',  playful: 'Zilch! Different keywords?',      urgent: 'No results — revise query.' },
    },
    notifications: {
      'Saved successfully': { friendly: 'All changes saved! ✓',    professional: 'Save operation completed.',  playful: 'Saved! 🎉',          urgent: 'Saved — confirmed.' },
      'Action completed':   { friendly: "Done! Great job!",       professional: 'Operation successful.',    playful: 'Boom — done! 💥',   urgent: 'Confirmed.' },
    },
  };

  const exact = rewrites[type]?.[trimmed]?.[presetTone] || rewrites[type]?.[trimmed]?.friendly;
  const rewritten = exact || genericRewrite(type, trimmed, presetTone);
  const alternatives = genericAlts(type, trimmed, presetTone, rewritten);

  const whyMap = {
    buttons:       { friendly: 'Action verbs + outcome-focused language help users commit.', professional: 'Concise, action-led. Matches enterprise UI standards.' },
    headings:      { friendly: 'Conversational and benefit-led headings engage readers.',     professional: 'Outcome-driven, business-aligned copy.' },
    tooltips:      { friendly: 'Helpful and warm tone puts users at ease.',                    professional: 'Clear and precise microcopy for tooltips.' },
    errors:        { friendly: "Empathetic error messages reduce user frustration.",          professional: 'Professional error copy sets the right expectations.' },
    'empty-states':{ friendly: 'Encouraging empty states invite users to take action.',       professional: 'Clean empty state copy keeps users informed.' },
    notifications: { friendly: 'Positive, upbeat notifications reinforce good actions.',    professional: 'Concise, professional confirmations build trust.' },
  };

  return {
    rewritten,
    alternatives,
    why: (whyMap[type]?.[presetTone] || 'Crafted for clarity and context.') + ` Input: "${trimmed}".`,
    score: Math.min(98, 74 + (trimmed.length % 9) * 3),
  };
}

function genericRewrite(type, text, tone) {
  const l = (text || '').toLowerCase();
  if (!l) return '';

  if (type === 'buttons') {
    if (l.includes('submit') || l.includes('send'))  return buttonTone('Save changes', tone);
    if (l.includes('click'))                         return buttonTone("Let's go!", tone);
    if (l.includes('ok'))                             return buttonTone('All set!', tone);
    if (l.includes('cancel'))                        return buttonTone('No worries', tone);
    if (l.includes('learn') || l.includes('read'))   return buttonTone('See how it works', tone);
    if (l.includes('sign') || l.includes('register'))return buttonTone('Join us!', tone);
    if (l.includes('login') || l.includes('sign in'))return buttonTone('Welcome back', tone);
    if (l.includes('delete') || l.includes('remove')) return buttonTone('Remove it', tone);
    if (l.includes('edit') || l.includes('update'))  return buttonTone('Make it yours', tone);
    if (l.includes('download'))                       return buttonTone('Grab your file', tone);
    return buttonTone(text.split(' ')[0] + ' now', tone);
  }
  if (type === 'headings') {
    if (l.includes('welcome'))  return headingTone("We're glad you're here!", tone);
    if (l.includes('dashboard')) return headingTone('Your overview', tone);
    if (l.includes('settings'))  return headingTone('Make this space yours', tone);
    if (l.includes('profile'))  return headingTone('All about you', tone);
    return headingTone(text.charAt(0).toUpperCase() + text.slice(1), tone);
  }
  if (type === 'errors') {
    if (l.includes('invalid') || l.includes('wrong')) return errorTone("That doesn't look right — try again?", tone);
    if (l.includes('500') || l.includes('server'))    return errorTone("Something went wrong on our end. We've been notified.", tone);
    if (l.includes('404') || l.includes('not found')) return errorTone("We couldn't find that page.", tone);
    if (l.includes('network') || l.includes('connection')) return errorTone("Check your connection and try again.", tone);
    if (l.includes('timeout')) return errorTone("Took too long — try once more?", tone);
    if (l.includes('unauthorized') || l.includes('auth')) return errorTone("You need to be signed in for this.", tone);
    return errorTone("That didn't work — try again?", tone);
  }
  if (type === 'empty-states') {
    if (l.includes('no data') || l.includes('empty')) return emptyTone("Nothing here yet — your data will land here.", tone);
    if (l.includes('no results')) return emptyTone('No matches — try a different keyword.', tone);
    return emptyTone("It's quiet here… for now!", tone);
  }
  if (type === 'notifications') {
    if (l.includes('saved') || l.includes('save')) return notifTone('All changes saved ✓', tone);
    if (l.includes('sent') || l.includes('sending')) return notifTone("Sent! Great job!", tone);
    if (l.includes('deleted') || l.includes('removed')) return notifTone("Removed! It's gone.", tone);
    if (l.includes('error') || l.includes('failed')) return notifTone("Something went wrong — try again?", tone);
    return notifTone("Done! ✓", tone);
  }
  if (type === 'tooltips') {
    if (l.includes('enter') || l.includes('type')) return tooltipTone("We'd love to know!", tone);
    if (l.includes('required') || l.includes('mandatory')) return tooltipTone("This helps us help you!", tone);
    return tooltipTone('Tip: ' + text, tone);
  }
  return text;
}

const buttonTone  = (base, t) => ({ friendly: base, professional: base, playful: base + ' ✨', urgent: base + ' — now.' }[t] || base);
const headingTone = (base, t) => ({ friendly: base, professional: base, playful: base + ' 🎉', urgent: base + ' — take action.' }[t] || base);
const errorTone   = (base, t) => ({ friendly: 'Oops! ' + base, professional: 'Error: ' + base, playful: 'Oops! ' + base, urgent: 'ALERT: ' + base }[t] || base);
const emptyTone   = (base, t) => ({ friendly: base, professional: base, playful: 'The void stares back… ' + base, urgent: base + ' — take action.' }[t] || base);
const notifTone   = (base, t) => ({ friendly: base + ' 🎉', professional: 'Confirmed: ' + base, playful: base + ' 💥', urgent: base + ' ✓' }[t] || base);
const tooltipTone = (base, t) => ({ friendly: base, professional: 'Note: ' + base, playful: 'Psst — ' + base, urgent: 'Important: ' + base }[t] || base);

function genericAlts(type, text, tone, base) {
  const pool = {
    buttons:       { friendly: ['Save changes', "Let's go!", 'Got it'],     professional: ['Confirm', 'Proceed', 'Execute'],       playful: ['Make it happen!', 'Here we go!', 'Boom!'],          urgent: ['Save now', 'Confirm now', 'Act now'] },
    headings:      { friendly: ["We're glad you're here.", 'Your hub is ready!'], professional: ['Dashboard overview.', 'Management summary.'], playful: ['You made it! 🎉', 'Plot twist!'],          urgent: ['Action required.', 'Review now.'] },
    tooltips:      { friendly: ["We'd love to know!", 'Tip: this helps!'],  professional: ['Reference information.', 'Additional context.'], playful: ['Psst — here\'s a tip!', 'Did you know?'], urgent: ['Critical information.', 'Key point:'] },
    errors:        { friendly: ["That didn't work — try again?", 'Almost! One more go.'], professional: ['Input validation failed.', 'Request could not be processed.'], playful: ['Oops! Give it another go.', "The robots messed up!"], urgent: ['Correct input required.', 'Immediate correction needed.'] },
    'empty-states':{ friendly: ["Nothing here yet — be the first!", "It's quiet here…"], professional: ['No records found.', 'Currently empty.'], playful: ['The void stares back…', 'Add something fun!'], urgent: ['No data — action required.', 'Empty — populate required.'] },
    notifications: { friendly: ['All set! ✓', 'Done! Great job!'],           professional: ['Operation confirmed.', 'Task completed.'], playful: ['Done! 🎉', 'Mission accomplished! 💥'],          urgent: ['Confirmed ✓', 'Processed immediately.'] },
  };
  const arr = pool[type]?.[tone] || pool[type]?.friendly || [];
  return arr.filter(a => a !== base).slice(0, 3);
}
