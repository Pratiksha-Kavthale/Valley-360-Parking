import React from 'react';
import PaymentReviewPanel from '../Payments/PaymentReviewPanel';

const PaymentReview = () => {
  return (
    <PaymentReviewPanel
      title="Admin Payment Review"
      description="Audit all submitted customer payment proofs across the platform and confirm or reject them as needed."
      fetchUrl="/Admin/payment-review-queue"
      emptyMessage="No payment submissions currently require admin review."
    />
  );
};

export default PaymentReview;
