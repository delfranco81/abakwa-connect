import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

type Review = {
  id: string;
  place_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

interface BusinessReviewsProps {
  placeId: string;
}

const MAX_COMMENT_LENGTH = 500;

function StarDisplay({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  const safeRating = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  );

  return (
    <span
      aria-label={`${safeRating} out of 5 stars`}
      style={{
        color: "#f59e0b",
        fontSize: size,
        letterSpacing: 2,
        whiteSpace: "nowrap",
      }}
    >
      {"★".repeat(safeRating)}
      {"☆".repeat(5 - safeRating)}
    </span>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose a rating"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          aria-checked={value === star}
          role="radio"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "2px",
            fontSize: 28,
            lineHeight: 1,
            color: star <= value ? "#f59e0b" : "#d1d5db",
          }}
          
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function BusinessReviews({
  placeId,
}: BusinessReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // New review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Edit review
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  /*
   * =========================================================
   * LOAD USER + REVIEWS
   * =========================================================
   */

  useEffect(() => {
    if (!placeId) return;

    loadPageData();
  }, [placeId]);

  async function loadPageData() {
    await Promise.all([
      checkUserSession(),
      fetchReviews(),
    ]);
  }

  async function checkUserSession() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error);
        setCurrentUser(null);
        setIsAdmin(false);
        return;
      }

      setCurrentUser(user);

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const admin =
        user.app_metadata?.role === "admin" ||
        user.user_metadata?.role === "admin" ||
        user.email?.endsWith("@admin.com");

      setIsAdmin(Boolean(admin));
    } catch (error) {
      console.error("Session check failed:", error);
      setCurrentUser(null);
      setIsAdmin(false);
    }
  }

  async function fetchReviews() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, place_id, user_name, rating, comment, created_at"
        )
        .eq("place_id", placeId)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setReviews((data || []) as Review[]);
    } catch (error: any) {
      console.error("Error loading reviews:", error);

      toast.error(
        error?.message || "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * REVIEW STATISTICS
   * =========================================================
   */

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return total / reviews.length;
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    return {
      5: reviews.filter(
        (review) => Number(review.rating) === 5
      ).length,

      4: reviews.filter(
        (review) => Number(review.rating) === 4
      ).length,

      3: reviews.filter(
        (review) => Number(review.rating) === 3
      ).length,

      2: reviews.filter(
        (review) => Number(review.rating) === 2
      ).length,

      1: reviews.filter(
        (review) => Number(review.rating) === 1
      ).length,
    };
  }, [reviews]);

  /*
   * =========================================================
   * CURRENT USER NAME
   * =========================================================
   */

  function getCurrentUserName() {
    if (!currentUser) return "Customer";

    return (
      currentUser.user_metadata?.full_name ||
      currentUser.user_metadata?.name ||
      currentUser.email?.split("@")[0] ||
      "Customer"
    );
  }

  /*
   * =========================================================
   * SUBMIT REVIEW
   * =========================================================
   */

  async function handleSubmitReview(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!currentUser) {
      toast.warning(
        "Please log in to submit a review."
      );
      return;
    }

    const cleanComment = comment.trim();

    if (!cleanComment) {
      toast.error(
        "Please write something about your experience."
      );
      return;
    }

    if (cleanComment.length < 5) {
      toast.error(
        "Your review should contain at least 5 characters."
      );
      return;
    }

    if (cleanComment.length > MAX_COMMENT_LENGTH) {
      toast.error(
        `Your review cannot exceed ${MAX_COMMENT_LENGTH} characters.`
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please choose a rating from 1 to 5.");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * IMPORTANT:
       * Your current database does NOT have user_id.
       *
       * Therefore we check for an existing review using
       * the current user's display name.
       *
       * This is not as secure as user_id + RLS.
       */
      const reviewAuthorName = getCurrentUserName();

      const { data: existingReviews, error: existingError } =
        await supabase
          .from("reviews")
          .select("id, user_name")
          .eq("place_id", placeId)
          .eq("user_name", reviewAuthorName)
          .limit(1);

      if (existingError) {
        throw existingError;
      }

      if (existingReviews && existingReviews.length > 0) {
        toast.warning(
          "You have already reviewed this business."
        );
        return;
      }

      const { error } = await supabase
        .from("reviews")
        .insert([
          {
            place_id: placeId,
            user_name: reviewAuthorName,
            rating,
            comment: cleanComment,
          },
        ]);

      if (error) throw error;

      toast.success(
        "Thank you! Your review has been posted. ⭐"
      );

      setComment("");
      setRating(5);

      await fetchReviews();
    } catch (error: any) {
      console.error(
        "Review submission error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * =========================================================
   * EDIT REVIEW
   * =========================================================
   */

  function handleEditReview(review: Review) {
    setEditingId(review.id);
    setEditRating(Number(review.rating) || 5);
    setEditComment(review.comment || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditRating(5);
    setEditComment("");
  }

  async function handleSaveEdit(reviewId: string) {
    if (!currentUser) {
      toast.warning("Please log in.");
      return;
    }

    const cleanComment = editComment.trim();

    if (!cleanComment) {
      toast.error("Review cannot be empty.");
      return;
    }

    if (cleanComment.length < 5) {
      toast.error(
        "Your review should contain at least 5 characters."
      );
      return;
    }

    if (cleanComment.length > MAX_COMMENT_LENGTH) {
      toast.error(
        `Your review cannot exceed ${MAX_COMMENT_LENGTH} characters.`
      );
      return;
    }

    if (editRating < 1 || editRating > 5) {
      toast.error("Please choose a rating from 1 to 5.");
      return;
    }

    const review = reviews.find(
      (item) => item.id === reviewId
    );

    if (!review) {
      toast.error("Review could not be found.");
      return;
    }

    const currentUserName = getCurrentUserName();

    /*
     * Since the current table has no user_id,
     * we use the author's name for the ownership check.
     */
    if (
      !isAdmin &&
      review.user_name !== currentUserName
    ) {
      toast.error(
        "You can only edit your own review."
      );
      return;
    }

    setSavingEdit(true);

    try {
      let query = supabase
        .from("reviews")
        .update({
          rating: editRating,
          comment: cleanComment,
        })
        .eq("id", reviewId);

      /*
       * Admins can edit any review.
       *
       * Regular users are restricted to the
       * review author's name.
       */
      if (!isAdmin) {
        query = query.eq(
          "user_name",
          currentUserName
        );
      }

      const { error } = await query;

      if (error) throw error;

      toast.success(
        "Review updated successfully. ✨"
      );

      cancelEdit();

      await fetchReviews();
    } catch (error: any) {
      console.error(
        "Review update error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to update your review."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  /*
   * =========================================================
   * DELETE REVIEW
   * =========================================================
   */

  async function handleDeleteReview(
    reviewId: string,
    authorName: string
  ) {
    if (!currentUser) {
      toast.warning("Please log in.");
      return;
    }

    const review = reviews.find(
      (item) => item.id === reviewId
    );

    if (!review) {
      toast.error("Review could not be found.");
      return;
    }

    const currentUserName = getCurrentUserName();

    const isOwnReview =
      review.user_name === currentUserName;

    const canDelete =
      isAdmin || isOwnReview;

    if (!canDelete) {
      toast.error(
        "You can only delete your own review."
      );
      return;
    }

    const message = isAdmin
      ? `Delete ${authorName}'s review permanently?`
      : "Delete your review permanently?";

    if (!window.confirm(message)) {
      return;
    }

    setDeletingId(reviewId);

    try {
      let query = supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      /*
       * Admin can delete any review.
       *
       * Normal users can only delete reviews
       * matching their current display name.
       */
      if (!isAdmin) {
        query = query.eq(
          "user_name",
          currentUserName
        );
      }

      const { error } = await query;

      if (error) throw error;

      toast.success(
        "Review deleted successfully."
      );

      if (editingId === reviewId) {
        cancelEdit();
      }

      await fetchReviews();
    } catch (error: any) {
      console.error(
        "Review deletion error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to delete review."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section
      style={{
        marginTop: 40,
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#111827",
        width: "100%",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 25,
            fontWeight: 800,
          }}
        >
          ⭐ Reviews & Community Ratings
        </h2>

        <p
          style={{
            marginTop: 8,
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          See what customers are saying about this business.
        </p>
      </div>

      {/* =====================================================
          RATING SUMMARY
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns:
            "minmax(150px, 0.7fr) minmax(250px, 1.3fr)",
          gap: 30,
          alignItems: "center",
        }}
      >
        {/* Average */}

        <div
          style={{
            textAlign: "center",
            borderRight: "1px solid #e5e7eb",
            paddingRight: 20,
          }}
        >
          <div
            style={{
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {reviews.length
              ? averageRating.toFixed(1)
              : "—"}
          </div>

          <div style={{ marginTop: 8 }}>
            <StarDisplay
              rating={averageRating}
              size={20}
            />
          </div>

          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
              fontSize: 13,
            }}
          >
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </p>
        </div>

        {/* Breakdown */}

        <div>
          {[5, 4, 3, 2, 1].map((star) => {
            const count =
              ratingCounts[
                star as keyof typeof ratingCounts
              ];

            const percentage =
              reviews.length > 0
                ? (count / reviews.length) * 100
                : 0;

            return (
              <div
                key={star}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "45px 1fr 40px",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {star} ★
                </span>

                <div
                  style={{
                    height: 8,
                    background: "#e5e7eb",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: "#f59e0b",
                      borderRadius: 99,
                      transition: "width 0.3s",
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    textAlign: "right",
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          WRITE REVIEW
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
          marginBottom: 30,
        }}
      >
        <h3
          style={{
            margin: "0 0 18px",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          ✍️ Write a Review
        </h3>

        {currentUser ? (
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Your Rating
              </label>

              <StarPicker
                value={rating}
                onChange={setRating}
              />

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                {rating === 5
                  ? "Excellent"
                  : rating === 4
                  ? "Very good"
                  : rating === 3
                  ? "Average"
                  : rating === 2
                  ? "Needs improvement"
                  : "Poor"}
              </p>
            </div>

            <textarea
              rows={5}
              value={comment}
              maxLength={MAX_COMMENT_LENGTH}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Tell other customers about your experience..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
                fontSize: 14,
                outline: "none",
              }}
              required
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color:
                    comment.length >=
                    MAX_COMMENT_LENGTH
                      ? "#dc2626"
                      : "#6b7280",
                }}
              >
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "11px 22px",
                  border: "none",
                  borderRadius: 8,
                  background: submitting
                    ? "#9ca3af"
                    : "#111827",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {submitting
                  ? "Posting..."
                  : "Post Review ⭐"}
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: 18,
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 600,
              }}
            >
              🔐 Log in to write a review
            </p>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
              }}
            >
              Your feedback helps other people discover
              great businesses.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          RECENT REVIEWS
      ====================================================== */}

      <div>
        <h3
          style={{
            fontSize: 19,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          💬 Recent Feedback
        </h3>

        {loading ? (
          <div
            style={{
              background: "#ffffff",
              padding: 25,
              borderRadius: 10,
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              padding: 30,
              borderRadius: 10,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 35,
                marginBottom: 8,
              }}
            >
              ⭐
            </div>

            <strong>No reviews yet</strong>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
                fontSize: 14,
              }}
            >
              Be the first customer to share your experience.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {reviews.map((review) => {
              const currentUserName =
                getCurrentUserName();

              const isOwner =
                Boolean(currentUser) &&
                review.user_name === currentUserName;

              const canEdit =
                isAdmin || isOwner;

              const canDelete =
                isAdmin || isOwner;

              return (
                <article
                  key={review.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 20,
                  }}
                >
                  {/* Review header */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      gap: 15,
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: 15,
                        }}
                      >
                        {review.user_name}
                      </strong>

                      <div style={{ marginTop: 5 }}>
                        <StarDisplay
                          rating={review.rating}
                          size={15}
                        />
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(
                        review.created_at
                      ).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  {/* =================================================
                      EDIT MODE
                  ================================================== */}

                  {editingId === review.id ? (
                    <div style={{ marginTop: 15 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          marginBottom: 7,
                        }}
                      >
                        Rating
                      </label>

                      <StarPicker
                        value={editRating}
                        onChange={setEditRating}
                      />

                      <textarea
                        rows={5}
                        value={editComment}
                        maxLength={MAX_COMMENT_LENGTH}
                        onChange={(e) =>
                          setEditComment(
                            e.target.value
                          )
                        }
                        style={{
                          width: "100%",
                          marginTop: 12,
                          padding: 12,
                          borderRadius: 8,
                          border:
                            "1px solid #d1d5db",
                          boxSizing: "border-box",
                          resize: "vertical",
                          fontFamily: "inherit",
                          fontSize: 14,
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={() =>
                            handleSaveEdit(
                              review.id
                            )
                          }
                          style={{
                            border: "none",
                            borderRadius: 7,
                            padding: "9px 15px",
                            background: savingEdit
                              ? "#9ca3af"
                              : "#111827",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: savingEdit
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          {savingEdit
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={savingEdit}
                          style={{
                            border:
                              "1px solid #d1d5db",
                            borderRadius: 7,
                            padding: "9px 15px",
                            background: "#fff",
                            color: "#374151",
                            fontWeight: 600,
                            cursor:
                              savingEdit
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* =================================================
                       NORMAL REVIEW
                    ================================================== */

                    <p
                      style={{
                        margin:
                          "14px 0 12px",
                        color: "#374151",
                        lineHeight: 1.6,
                        fontSize: 14,
                      }}
                    >
                      {review.comment}
                    </p>
                  )}

                  {/* =================================================
                      ACTIONS
                  ================================================== */}

                  {(canEdit || canDelete) && (
                    <div
                      style={{
                        borderTop:
                          "1px solid #f3f4f6",
                        paddingTop: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      {canEdit &&
                        editingId !== review.id && (
                          <button
                            type="button"
                            onClick={() =>
                              handleEditReview(
                                review
                              )
                            }
                            style={{
                              border: "none",
                              background:
                                "transparent",
                              color: "#2563eb",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            ✏️ Edit Review
                          </button>
                        )}

                      {canDelete && (
                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            review.id
                          }
                          onClick={() =>
                            handleDeleteReview(
                              review.id,
                              review.user_name
                            )
                          }
                          style={{
                            border: "none",
                            background:
                              "transparent",
                            color: "#dc2626",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor:
                              deletingId ===
                              review.id
                                ? "not-allowed"
                                : "pointer",
                            padding: 0,
                          }}
                        >
                          {deletingId ===
                          review.id
                            ? "Deleting..."
                            : isAdmin
                            ? "🗑 Delete Review"
                            : "🗑 Delete My Review"}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}