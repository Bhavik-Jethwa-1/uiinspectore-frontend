/**
 * Admin review navigation helper.
 * Use this instead of hardcoding `/review/` links inside admin components.
 *
 * Usage:
 *   import { openAdminReview } from '../../utils/adminNav';
 *   openAdminReview(navigate, reviewId);
 */

/**
 * Navigate to the admin review detail page.
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {number|string} reviewId
 */
export function openAdminReview(navigate, reviewId) {
  navigate(`/admin/reviews/${reviewId}`);
}
