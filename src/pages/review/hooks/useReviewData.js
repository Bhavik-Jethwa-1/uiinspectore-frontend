import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../../utils/api';

/**
 * Hook for loading and managing review data.
 */
export function useReviewData(id, token) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');

  // Load review on mount or when id changes
  useEffect(() => {
    if (id) loadReview(id);
  }, [id]);

  async function loadReview(targetId) {
    if (!targetId || typeof targetId !== 'string' || targetId === '[object Object]') {
      targetId = window.location.pathname.split('/').filter(Boolean).pop();
    }
    if (!targetId || typeof targetId !== 'string') return;
    setLoading(true);
    setReview(null);
    setErrorMsg('');
    setSelectedAnnotationId(null);
    setSelectedIssueId(null);
    try {
      const data = await api.getReview(targetId, token);
      if (String(targetId) !== String(id)) return;
      setReview(data.review);
    } catch (err) {
      if (String(targetId) !== String(id)) return;
      setErrorMsg(err?.message || 'Failed to load review.');
      setErrorCode(err?.code || '');
    } finally {
      if (String(targetId) !== String(id)) return;
      setLoading(false);
    }
  }

  async function handleRetry() {
    if (!token || retrying) return;
    setRetrying(true);
    setErrorMsg('');
    setReview(prev => prev ? { ...prev, status: 'analyzing' } : null);
    try {
      const response = await api.retryReview(id, token);
      if (response.review) {
        setReview(response.review);
      } else {
        await loadReview(id);
      }
    } catch (err) {
      console.error('Retry failed:', err);
      const msg = err?.message || 'Failed to retry analysis.';
      const code = err?.code || '';
      setErrorMsg(msg);
      setErrorCode(code);
      if (code !== 'ALREADY_COMPLETED') {
        setReview(prev => prev ? { ...prev, status: 'failed' } : null);
      }
    } finally {
      setRetrying(false);
    }
  }

  // Selected state
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [pulsingAnnotationId, setPulsingAnnotationId] = useState(null);

  // Derived data
  const annotations = review?.annotations || [];
  const issues = review?.issues || [];
  const scores = review?.scores || {};
  const isCompleted = review?.status === 'completed' && (scores.overall > 0 || scores.overall === 0);
  const isAnalyzing = review?.status === 'analyzing' || review?.status === 'pending';
  const isFailed = review?.status === 'failed';
  const overall = scores.overall;

  // Pulse effect
  function triggerPulse(annotationId) {
    if (!annotationId) return;
    setPulsingAnnotationId(annotationId);
    setTimeout(() => setPulsingAnnotationId(null), 4500);
  }

  return {
    // Data
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
    // Selected state
    selectedAnnotationId,
    setSelectedAnnotationId,
    selectedIssueId,
    setSelectedIssueId,
    pulsingAnnotationId,
    // Actions
    loadReview,
    handleRetry,
    triggerPulse,
  };
}

/**
 * Hook for annotation/issue selection and navigation.
 */
export function useAnnotationNavigation(
  annotations,
  issues,
  activeTab,
  setActiveTab,
  issueRefs,
  screenshotRef,
  triggerPulse,
) {
  const [pendingAnnotationScroll, setPendingAnnotationScroll] = useState(null);
  const pendingAnnIdRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    pendingAnnIdRef.current = pendingAnnotationScroll;
  }, [pendingAnnotationScroll]);

  // Find helpers
  function findAnnotationByIssueId(issueId) {
    return annotations.find(a => a.issue && a.issue.id === issueId) || null;
  }

  function findIssueByAnnotationId(annotationId) {
    const ann = annotations.find(a => a.id === annotationId);
    return ann?.issue || null;
  }

  function getAnnotationDisplayNum(annotationId) {
    const hasCoords = (a) => a.x != null || a.y != null;
    const sorted = annotations.filter(hasCoords);
    const idx = sorted.findIndex(a => a.id === annotationId);
    return idx >= 0 ? idx + 1 : null;
  }

  // Effect 1: Tab switch → scroll screenshot to top, then scroll to annotation
  useEffect(() => {
    if (activeTab !== 'overview') return;
    const annId = pendingAnnIdRef.current;
    if (!annId) return;

    const ann = annotations.find(a => a.id === annId) || null;
    const doScroll = (annToScroll) => {
      if (!annToScroll || (annToScroll.x == null && annToScroll.y == null)) {
        if (screenshotRef?.current) {
          screenshotRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      if (screenshotRef?.current) {
        screenshotRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      requestAnimationFrame(() => {
        const img = document.querySelector('.annotated-screenshot-img');
        const container = document.querySelector('.annotated-screenshot-scroll');
        if (!img || !container) return;
        const { naturalWidth, naturalHeight } = img;
        if (!naturalWidth || !naturalHeight) return;
        const fractionY = annToScroll.y / naturalHeight;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const topMargin = Math.round((container.clientHeight || window.innerHeight) * 0.30);
        const targetScrollTop = Math.round(fractionY * maxScroll) - topMargin;
        const clamped = Math.max(0, Math.min(maxScroll, targetScrollTop));
        container.scrollTo({ top: clamped, behavior: 'smooth' });
      });
    };
    doScroll(ann);
  }, [activeTab, annotations, screenshotRef]);

  // Effect 2: pendingAnnotationScroll changed → scroll to new annotation
  useEffect(() => {
    if (!pendingAnnotationScroll || activeTab !== 'overview') return;
    const ann = annotations.find(a => a.id === pendingAnnotationScroll) || null;
    if (!ann || (ann.x == null && ann.y == null)) {
      if (screenshotRef?.current) {
        screenshotRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setPendingAnnotationScroll(null);
      return;
    }
    requestAnimationFrame(() => {
      const img = document.querySelector('.annotated-screenshot-img');
      const container = document.querySelector('.annotated-screenshot-scroll');
      if (!img || !container) return;
      const { naturalWidth, naturalHeight } = img;
      if (!naturalWidth || !naturalHeight) return;
      const fractionY = ann.y / naturalHeight;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const topMargin = Math.round((container.clientHeight || window.innerHeight) * 0.30);
      const targetScrollTop = Math.round(fractionY * maxScroll) - topMargin;
      const clamped = Math.max(0, Math.min(maxScroll, targetScrollTop));
      container.scrollTo({ top: clamped, behavior: 'smooth' });
    });
    setPendingAnnotationScroll(null);
  }, [pendingAnnotationScroll, activeTab, annotations, screenshotRef]);

  // Navigate to issue annotation
  function navigateToIssueAnnotation(issueId, setSelectedIssueId, setSelectedAnnotationId, setActiveTab, triggerPulse) {
    const ann = findAnnotationByIssueId(issueId);
    const hasCoords = ann && (ann.x != null || ann.y != null);

    setSelectedIssueId(issueId);
    if (ann) setSelectedAnnotationId(ann.id);

    const wasAlreadyOverview = activeTab === 'overview';
    setActiveTab('overview');

    if (hasCoords) {
      setPendingAnnotationScroll(ann.id);
      triggerPulse(ann.id);
    } else if (!wasAlreadyOverview && screenshotRef?.current) {
      screenshotRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Handle pin click
  function handlePinClick(annotationId, setSelectedAnnotationId, setSelectedIssueId, issueRefs, triggerPulse) {
    const issue = findIssueByAnnotationId(annotationId);
    setSelectedAnnotationId(annotationId);
    if (issue) {
      setSelectedIssueId(issue.id);
      const cardEl = issueRefs?.current?.[issue.id];
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    triggerPulse(annotationId);
  }

  return {
    pendingAnnotationScroll,
    findAnnotationByIssueId,
    findIssueByAnnotationId,
    getAnnotationDisplayNum,
    navigateToIssueAnnotation,
    handlePinClick,
  };
}
