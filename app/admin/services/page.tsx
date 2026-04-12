import { ServiceEditor } from "./service-editor";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Services</h1>
          <p className="text-sm text-[#717171]">Service catalog</p>
        </div>
      </div>

      <ServiceEditor />
    </div>
  );
}