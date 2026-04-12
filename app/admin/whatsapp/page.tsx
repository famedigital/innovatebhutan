import { WhatsAppHub } from "./whatsapp-hub";

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">WhatsApp</h1>
          <p className="text-sm text-gray-500">Client communication hub</p>
        </div>
      </div>
      <WhatsAppHub />
    </div>
  );
}