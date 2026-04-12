import { AIConsole } from "./ai-console";

export default function AIPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">AI Console</h1>
          <p className="text-sm text-[#717171]">AI monitoring</p>
        </div>
      </div>

      <AIConsole />
    </div>
  );
}