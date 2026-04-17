import { redirect } from 'next/navigation';

export default function ServicesPreviewPage() {
  // Redirect to actual services page for now
  // The full grid redesign will be implemented in the main services page
  redirect('/services');
}
