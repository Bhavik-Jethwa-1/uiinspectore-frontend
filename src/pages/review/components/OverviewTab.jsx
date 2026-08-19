import { Image as ImageIcon, CheckCircle2, Lightbulb, HelpCircle } from 'lucide-react';
import { AnnotatedScreenshot } from './AnnotatedScreenshot';
import { ReportGuide } from './ReportGuide';
import { AILoadingState } from './AILoadingState';
import { AIErrorState } from './AIErrorState';
import { getScoreColor, getScoreBg, getScoreLabel, getScoreSummary, SCORE_EXPLANATIONS, SCORE_STATUS } from '../reviewHelpers';

/**
 * Overview Tab Content
 */
export function OverviewTab({
  review,
  annotations,
  scores,
  isCompleted,
  isAnalyzing,
  isFailed,
  overall,
  selectedAnnotationId,
  pulsingAnnotationId,
  onPinClick,
  screenshotRef,
  errorMsg,
  errorCode,
  onRetry,
  onBack,
  retrying,
  navigate,
}) {
  const scoreEntries = Object.entries(SCORE_EXPLANATIONS).filter(([key]) => scores[key] != null && scores[key] > 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* How to read this report */}
      {isCompleted && <ReportGuide reviewId={review?.id} />}

      {/* Screenshot with annotations */}
      {review.screenshot_url && (
        <AnnotatedScreenshot
          screenshotUrl={review.screenshot_url}
          annotations={annotations}
          selectedAnnotationId={selectedAnnotationId}
          pulsingAnnotationId={pulsingAnnotationId}
          onAnnotationClick={onPinClick}
          onRequestScroll={null}
        />
      )}

      {/* No screenshot */}
      {!review.screenshot_url && (
        <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <ImageIcon size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No screenshot available</p>
        </div>
      )}

      {/* Overall Score Card */}
      <div className="card" style={{ padding: '20px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Overall Score
        </p>

        {isCompleted && overall != null ? (
          <>
            {/* Circular score */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: getScoreBg(overall),
                border: `4px solid ${getScoreColor(overall)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: getScoreColor(overall), lineHeight: 1 }}>
                  {overall}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: getScoreColor(overall),
                background: getScoreBg(overall),
                padding: '3px 12px', borderRadius: 20,
              }}>
                {getScoreLabel(overall)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
              {getScoreSummary(overall)}
            </p>
          </>
        ) : isAnalyzing ? (
          <AILoadingState />
        ) : isFailed ? (
          <AIErrorState
            error={errorMsg}
            errorCode={errorCode}
            onRetry={onRetry}
            onBack={() => navigate('/dashboard')}
            retrying={retrying}
          />
        ) : (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-muted)', margin: '0 auto 8px' }}>—</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting for analysis...</p>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      {isCompleted && scoreEntries.length > 0 && (
        <div className="card" style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
            Score Breakdown
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, overflowX: 'auto' }}>
            {scoreEntries.map(([key, info]) => {
              const val = scores[key];
              const status = val >= 80 ? 'good' : val >= 60 ? 'improvement' : 'attention';
              return (
                <div key={key} style={{
                  padding: '12px 14px', borderRadius: 9,
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {info.label}
                      </span>
                      <button
                        className="btn-icon"
                        style={{ width: 16, height: 16 }}
                        aria-label={`What is ${info.label}?`}
                        title={info.desc}
                      >
                        <HelpCircle size={11} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(val), lineHeight: 1 }}>
                      {val}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 5, marginBottom: 5 }}>
                    <div
                      className={`progress-bar-fill ${val >= 80 ? 'success' : val >= 60 ? 'warning' : 'error'}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {info.desc}
                  </p>
                  <p style={{ fontSize: 10, color: getScoreColor(val), fontWeight: 500, marginTop: 3 }}>
                    {SCORE_STATUS[status]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {isCompleted && scores.summary && (
        <div className="card" style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            AI Summary
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {scores.summary}
          </p>
        </div>
      )}

      {/* Strengths / Key Findings */}
      {isCompleted && scores.strengths && scores.strengths.length > 0 && (
        <div className="card" style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={14} style={{ color: 'var(--warning)' }} />
            Key Findings
          </p>
          <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
            {scores.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
