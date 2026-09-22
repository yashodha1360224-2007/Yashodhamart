'use client';

import { useState } from 'react';
import { Star, MessageSquare, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
  onReviewSubmitted: () => void;
}

export default function ReviewSection({
  productId,
  reviews,
  rating,
  reviewCount,
  onReviewSubmitted,
}: ReviewSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit review.');
      } else {
        setSuccessMsg(data.message);
        setComment('');
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg(null);
          onReviewSubmitted();
        }, 1500);
      }
    } catch {
      setErrorMsg('An error occurred while submitting your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" /> Customer Ratings & Reviews
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Verified buyer opinions & feedback</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Write a Review
        </button>
      </div>

      {/* Rating Overview Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
          <span className="text-4xl font-black text-slate-900">{rating.toFixed(1)}</span>
          <div className="flex items-center text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(rating) ? 'fill-amber-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Based on {reviewCount} ratings
          </span>
        </div>

        <div className="col-span-2 space-y-2 text-xs">
          <p className="font-bold text-slate-800 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Verified Customer Reviews
          </p>
          <p className="text-slate-600 leading-relaxed">
            All reviews on YashodhaMart are written exclusively by customers who have purchased and received this product, ensuring maximum transparency and trust.
          </p>
        </div>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          No reviews yet for this product. Be the first verified buyer to leave a review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {rev.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{rev.user.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Verified Buyer
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= rev.rating ? 'fill-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Write a Product Review</h3>
            <p className="text-xs text-slate-500 mb-4">
              Share your honest experience with fellow YashodhaMart shoppers
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Review Comments *</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe product quality, fabric, fitting, or delivery speed..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
