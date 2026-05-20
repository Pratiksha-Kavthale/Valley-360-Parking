import React from 'react';
import Navbar from './NavbarOwner';
import Footer from '../Footer/Footer';
import PaymentReviewPanel from '../Payments/PaymentReviewPanel';

const PaymentReview = () => {
  return (
    <>
      <Navbar />
      <PaymentReviewPanel
        title="Owner Payment Review"
        description="Review customer payment screenshots or UTR submissions, then approve or reject the payment based on the proof provided."
        fetchUrl="/owner/payment-review-queue"
        emptyMessage="No pending payment submissions for your parking areas."
      />
      <Footer />
    </>
  );
};

export default PaymentReview;
