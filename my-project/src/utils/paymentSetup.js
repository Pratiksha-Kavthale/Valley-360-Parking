export const isOwnerPaymentSetupComplete = (settings) => {
  const upiId = settings?.upiId?.trim();
  const displayName = settings?.upiDisplayName?.trim();

  return Boolean(settings?.paymentEnabled && upiId && displayName);
};
