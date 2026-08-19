import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

/**
 * AI Error State
 */
export function AIErrorState({ error, onRetry, onBack, retrying, errorCode }) {
  let explanation = 'The AI analysis could not be completed.';
  let hint = 'Please try again. If the problem persists, try a different screenshot.';

  if (errorCode === 'RATE_LIMITED') {
    explanation = 'The AI service is temporarily busy.';
    hint = 'Please wait a moment and try again.';
  } else if (errorCode === 'AUTH_ERROR') {
    explanation = 'There is a configuration issue with the AI service.';
    hint = 'Please contact an administrator.';
  } else if (errorCode === 'SCREENSHOT_MISSING' || errorCode === 'SCREENSHOT_FILE_MISSING') {
    explanation = 'The screenshot for this review is no longer available.';
    hint = 'Please upload a new screenshot and try again.';
  } else if (errorCode === 'ALREADY_COMPLETED') {
    explanation = 'This review has already been completed.';
    hint = 'You can view the results above.';
  } else {
    const errMsg = error || '';
    const isFileError = errMsg.toLowerCase().includes('file') || errMsg.toLowerCase().includes('image') || errMsg.toLowerCase().includes('upload');
    const isNetworkError = errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('connection') || errMsg.toLowerCase().includes('timeout');
    const isServerError = errMsg.toLowerCase().includes('server') || errMsg.toLowerCase().includes('500');
    if (isFileError) {
      explanation = 'There was a problem with your screenshot file.';
      hint = 'Please make sure you upload a valid PNG, JPG, or WEBP image that is under 10MB.';
    } else if (isNetworkError) {
      explanation = 'A network connection issue occurred.';
      hint = 'Please check your internet connection and try again.';
    } else if (isServerError) {
      explanation = 'Our servers are experiencing issues right now.';
      hint = 'Please try again in a few minutes.';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--error-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AlertCircle size={28} style={{ color: 'var(--error)' }} />
      </div>

      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          We couldn't complete your UI analysis.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.5 }}>
          {explanation}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.5, marginTop: 4 }}>
          {hint}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} className="btn-secondary" style={{ fontSize: 13 }}>
          Back to Review
        </button>
        <button onClick={onRetry} disabled={retrying} className="btn-primary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {retrying ? <><Loader2 size={12} className="animate-spin" /> Retrying...</> : <><RefreshCw size={12} /> Retry Analysis</>}
        </button>
      </div>
    </div>
  );
}
