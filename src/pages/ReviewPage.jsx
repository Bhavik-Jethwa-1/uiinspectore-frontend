import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, RefreshCw, Plus, AlertCircle,
  Loader2, CheckCircle2, Lightbulb,
} from 'lucide-react';

// Components
import {
  IssueCard,
  OverviewTab,
  AnnotationsTab,
  SuggestionsTab,
} from './review/components';

// Hooks
import { useReviewData, useAnnotationNavigation } from './review/hooks/useReviewData';

// Helpers
import { SEVERITY_ORDER } from './review/reviewHelpers';

/**
 * Right Panel - Issues List
 */
function RightPanel({
  issues,
  filteredIssues,
  severityFilter,
  setSeverityFilter,
  sortOrder,
  setSortOrder,
  selectedIssueId,
  setSelectedIssueId,
  issueRefs,
  findAnnotationByIssueId,
  getAnnotationDisplayNum,
  handleIssueViewAnnotation,
  handleIssueHighlight,
  review,
  suggestions,
  handleRetry,
  retrying,
  onNavigateNew,
  rightTab,
  setRightTab,
}) {
  const sevCounts = issues.reduce((acc, iss) => {
    const s = (iss.severity || 'low').toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="right-panel">
      {/* Actions */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Review Actions</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { if (handleRetry) handleRetry(); }}
            disabled={!review || retrying || review?.status === 'completed' || review?.status === 'analyzing'}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 34, opacity: (!review || retrying || review?.status === 'completed' || review?.status === 'analyzing') ? 0.5 : 1 }}
            title={!review || retrying || review?.status === 'analyzing' ? 'Please wait...' : review?.status === 'completed' ? 'Cannot retry completed review' : 'Retry this review'}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: 1 }}>↻</span> {retrying ? 'Retrying...' : 'Retry'}
          </button>
          <button
            onClick={() => { if (onNavigateNew) onNavigateNew(); }}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 34 }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 16, lineHeight: 1, fontWeight: 700 }}>+</span> New
          </button>
        </div>
      </div>

      {/* Issues / Tips tabs */}
      <div style={{ padding: '0 14px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
          {[
            { key: 'issues', label: `Issues (${severityFilter !== 'all' ? `${filteredIssues.length}/${issues.length}` : issues.length})` },
            { key: 'tips',  label: `Tips (${suggestions.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setRightTab(t.key)}
              className={`tab-btn ${rightTab === t.key ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '10px 0' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Issues Tab */}
        {rightTab === 'issues' && (
          <div style={{ paddingBottom: 16 }}>
            {/* Filter bar */}
            {issues.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {/* Severity filters */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                  {[
                    { key: 'all',      label: `All (${issues.length})` },
                    { key: 'critical', label: `Critical${sevCounts.critical ? ` (${sevCounts.critical})` : ''}`,  color: 'var(--error)' },
                    { key: 'high',     label: `High${sevCounts.high ? ` (${sevCounts.high})` : ''}`,         color: 'var(--warning)' },
                    { key: 'medium',   label: `Medium${sevCounts.medium ? ` (${sevCounts.medium})` : ''}`,     color: 'var(--secondary)' },
                    { key: 'low',      label: `Low${sevCounts.low ? ` (${sevCounts.low})` : ''}`,            color: 'var(--text-muted)' },
                  ].map(({ key, label, color }) => (
                    <button
                      key={key}
                      onClick={() => setSeverityFilter(key)}
                      style={{
                        padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontSize: 10, fontWeight: 600,
                        background: severityFilter === key
                          ? (color || 'var(--primary)')
                          : 'var(--hover)',
                        color: severityFilter === key
                          ? '#fff'
                          : (color || 'var(--text-secondary)'),
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {/* Sort control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sort:</span>
                  {[
                    { key: 'severity', label: 'Most severe' },
                    { key: 'newest',   label: 'Newest first' },
                    { key: 'oldest',   label: 'Oldest first' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSortOrder(key)}
                      style={{
                        padding: '2px 7px', borderRadius: 4, border: 'none', cursor: 'pointer',
                        fontSize: 10, fontWeight: 500,
                        background: sortOrder === key ? 'var(--primary-light)' : 'transparent',
                        color: sortOrder === key ? 'var(--primary)' : 'var(--text-muted)',
                        textDecoration: sortOrder === key ? 'underline' : 'none',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredIssues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--success-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
                  {severityFilter === 'all' ? 'All clear!' : 'None found'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {severityFilter === 'all'
                    ? 'No issues detected in this review.'
                    : `No ${severityFilter} issues found.`}
                </p>
                {severityFilter !== 'all' && (
                  <button
                    onClick={() => setSeverityFilter('all')}
                    style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Show all issues
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredIssues.map((iss) => {
                  const matchingAnn = findAnnotationByIssueId(iss.id);
                  const displayNum = matchingAnn ? getAnnotationDisplayNum(matchingAnn.id) : null;
                  const isSelected = selectedIssueId === iss.id;

                  return (
                    <div
                      key={iss.id}
                      ref={el => { if (el) issueRefs.current[iss.id] = el; }}
                    >
                      <IssueCard
                        issue={iss}
                        issueId={iss.id}
                        annotationId={matchingAnn?.id || null}
                        displayNum={displayNum}
                        isSelected={isSelected}
                        onViewAnnotation={() => handleIssueViewAnnotation(iss.id)}
                        onHighlight={() => handleIssueHighlight(iss.id)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tips Tab */}
        {rightTab === 'tips' && (
          <div style={{ paddingBottom: 16 }}>
            {suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                }}>
                  <Lightbulb size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  No tips yet
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  AI recommendations will appear after analysis is completed.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestions.map((sug, i) => (
                  <div key={sug.id || i} style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {sug.priority || ' tip'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {sug.title || 'Suggestion'}
                    </p>
                    {sug.problem && (
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {sug.problem}
                      </p>
                    )}
                    {sug.recommendation && (
                      <p style={{ fontSize: 10, color: 'var(--primary)', marginTop: 4, fontWeight: 500 }}>
                        Fix: {sug.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ReviewPage ────────────────────────────────────────────────────────
export default function ReviewPage() {
  const urlId = window.location.pathname.split('/').filter(Boolean).pop();
  const { id: paramId } = useParams();
  const rawId = paramId !== undefined ? paramId : urlId;
  const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : urlId;

  const { token } = useAuth();
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [rightTab, setRightTab] = useState('issues');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('severity');

  // Refs for scrolling
  const screenshotRef = useRef(null);
  const issueRefs = useRef({});

  // ─── Review Data Hook ───────────────────────────────────────────────────
  const {
    review,
    loading,
    retrying,
    errorMsg,
    errorCode,
    annotations,
    issues,
    scores,
    isCompleted,
    isAnalyzing,
    isFailed,
    overall,
    selectedAnnotationId,
    setSelectedAnnotationId,
    selectedIssueId,
    setSelectedIssueId,
    pulsingAnnotationId,
    loadReview,
    handleRetry,
    triggerPulse,
  } = useReviewData(id, token);

  // ─── Annotation Navigation Hook ─────────────────────────────────────────
  const {
    findAnnotationByIssueId,
    findIssueByAnnotationId,
    getAnnotationDisplayNum,
    navigateToIssueAnnotation,
    handlePinClick,
  } = useAnnotationNavigation(
    annotations,
    issues,
    activeTab,
    setActiveTab,
    issueRefs,
    screenshotRef,
    triggerPulse,
  );

  // ─── Derived: filtered and sorted issues ─────────────────────────────────
  const filteredIssues = (() => {
    let result = issues;
    if (severityFilter !== 'all') {
      result = result.filter(iss => (iss.severity || '').toLowerCase() === severityFilter);
    }
    if (sortOrder === 'severity') {
      result = [...result].sort((a, b) => {
        const ord = (s) => SEVERITY_ORDER[(s || '').toLowerCase()] ?? 99;
        return ord(a.severity) - ord(b.severity);
      });
    } else if (sortOrder === 'newest') {
      result = [...result].sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortOrder === 'oldest') {
      result = [...result].sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    return result;
  })();

  // ─── Event Handlers ──────────────────────────────────────────────────────
  const onPinClick = (annotationId) => {
    handlePinClick(
      annotationId,
      setSelectedAnnotationId,
      setSelectedIssueId,
      issueRefs,
      triggerPulse,
    );
  };

  const onIssueViewAnnotation = (issueId) => {
    navigateToIssueAnnotation(
      issueId,
      setSelectedIssueId,
      setSelectedAnnotationId,
      setActiveTab,
      triggerPulse,
    );
  };

  const onIssueHighlight = (issueId) => {
    navigateToIssueAnnotation(
      issueId,
      setSelectedIssueId,
      setSelectedAnnotationId,
      setActiveTab,
      triggerPulse,
    );
  };

  const onIssueSelect = (issueId) => {
    setSelectedIssueId(prev => prev === issueId ? null : issueId);
  };

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading review...</p>
    </div>
  );

  // ─── Review load error ───────────────────────────────────────────────────
  if (errorMsg && !review) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <AlertCircle size={24} style={{ color: 'var(--error)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{errorMsg}</p>
      <Link to="/dashboard" className="btn-primary" style={{ fontSize: 12 }}>Back to Dashboard</Link>
    </div>
  );

  // ─── No review ───────────────────────────────────────────────────────────
  if (!review) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <AlertCircle size={24} style={{ color: 'var(--error)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Review not found</p>
      <Link to="/dashboard" className="btn-primary" style={{ fontSize: 12 }}>Back to Dashboard</Link>
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* ─── Top bar ─────────────────────────────────────────────────── */}
      <div className="review-topbar">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-icon"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="review-breadcrumb">
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {review.project_name || 'Project'} / {review.page_goal ? `"${review.page_goal}"` : 'Page Review'}
          </span>
        </div>
        {isCompleted && overall != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{overall}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/100</span>
          </div>
        )}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: 11, height: 32, flexShrink: 0 }}
        >
          <Plus size={12} /> New Review
        </button>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '0 16px' }}>
        {[
          { key: 'overview',     label: 'Overview' },
          { key: 'annotations',  label: `Annotations${annotations.length > 0 ? ` (${annotations.length})` : ''}` },
          { key: 'suggestions',  label: `Suggestions${(review?.suggestions || []).length > 0 ? ` (${(review?.suggestions || []).length})` : ''}` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Main layout ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 53px)' }}>
        {/* Left: main content */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          <div style={{ padding: '20px 16px', maxWidth: 760 }}>

            {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <OverviewTab
                review={review}
                annotations={annotations}
                scores={scores}
                isCompleted={isCompleted}
                isAnalyzing={isAnalyzing}
                isFailed={isFailed}
                overall={overall}
                selectedAnnotationId={selectedAnnotationId}
                pulsingAnnotationId={pulsingAnnotationId}
                onPinClick={onPinClick}
                screenshotRef={screenshotRef}
                errorMsg={errorMsg}
                errorCode={errorCode}
                onRetry={handleRetry}
                onBack={() => navigate('/dashboard')}
                retrying={retrying}
                navigate={navigate}
              />
            )}

            {/* ── ANNOTATIONS TAB ────────────────────────────────────── */}
            {activeTab === 'annotations' && (
              <AnnotationsTab
                annotations={annotations}
                selectedAnnotationId={selectedAnnotationId}
                onPinClick={onPinClick}
                onNavigateToIssue={onIssueViewAnnotation}
              />
            )}

            {/* ── SUGGESTIONS TAB ────────────────────────────────────── */}
            {activeTab === 'suggestions' && (
              <SuggestionsTab
                issues={review?.suggestions || []}
                selectedIssueId={selectedIssueId}
                onIssueSelect={onIssueSelect}
              />
            )}
          </div>
        </div>

        {/* Right Panel */}
        <RightPanel
          issues={issues}
          filteredIssues={filteredIssues}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          selectedIssueId={selectedIssueId}
          setSelectedIssueId={setSelectedIssueId}
          issueRefs={issueRefs}
          findAnnotationByIssueId={findAnnotationByIssueId}
          getAnnotationDisplayNum={getAnnotationDisplayNum}
          handleIssueViewAnnotation={onIssueViewAnnotation}
          handleIssueHighlight={onIssueHighlight}
          review={review}
          suggestions={review?.suggestions || []}
          handleRetry={handleRetry}
          retrying={retrying}
          onNavigateNew={() => navigate('/dashboard')}
          rightTab={rightTab}
          setRightTab={setRightTab}
        />
      </div>
    </div>
  );
}
