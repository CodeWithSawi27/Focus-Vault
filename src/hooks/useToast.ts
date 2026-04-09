import { ToastOptions, useToastContext } from "@/src/context/ToastContext";

// ─── Promise messages ──────────────────────────────────────────────────────────

export interface PromiseMessages<T = unknown> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
}

const TRANSITION_DELAY = 300;

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * The complete toast API — import this anywhere in your app.
 *
 * @example
 * const toast = useToast();
 *
 * // Basic types
 * toast.success('Saved!');
 * toast.error('Something broke.'); // persistent by default
 * toast.warning('Low battery.');
 * toast.info('Update available.');
 *
 * // Description + action
 * toast.success('Payment confirmed.', {
 *   description: 'Invoice #2048 for $299.00 has been paid.',
 *   action: { label: 'View receipt', onPress: openReceipt },
 * });
 *
 * // Step 9: tap the toast body to navigate
 * toast.info('Your order has shipped.', {
 *   onPress: () => navigation.navigate('OrderTracking'),
 * });
 *
 * // Async flow
 * toast.promise(uploadFile(f), {
 *   loading: 'Uploading...',
 *   success: (res) => `Uploaded ${res.filename}!`,
 *   error:   (err) => `Failed: ${err.message}`,
 * });
 *
 * // Programmatic control
 * const id = toast.info('Processing...', { persistent: true });
 * await doWork();
 * toast.dismiss(id);
 * toast.dismissAll();
 */
export function useToast() {
  const { showToast, dismiss, dismissAll } = useToastContext();

  // ── promise ──────────────────────────────────────────────────────────────────
  function promise<T>(
    fn: Promise<T>,
    messages: PromiseMessages<T>,
    options?: Pick<ToastOptions, "duration">,
  ): Promise<T> {
    const id = showToast(messages.loading, "loading", { persistent: true });

    fn.then((data) => {
      dismiss(id);
      const msg =
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success;
      setTimeout(() => showToast(msg, "success", options), TRANSITION_DELAY);
    }).catch((err) => {
      dismiss(id);
      const msg =
        typeof messages.error === "function"
          ? messages.error(err)
          : messages.error;
      setTimeout(() => showToast(msg, "error", options), TRANSITION_DELAY);
    });

    return fn;
  }

  return {
    success: (message: string, options?: ToastOptions): string =>
      showToast(message, "success", options),
    error: (message: string, options?: ToastOptions): string =>
      showToast(message, "error", options),
    info: (message: string, options?: ToastOptions): string =>
      showToast(message, "info", options),
    warning: (message: string, options?: ToastOptions): string =>
      showToast(message, "warning", options),
    dismiss,
    dismissAll,
    promise,
  };
}
