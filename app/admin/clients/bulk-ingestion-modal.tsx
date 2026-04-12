"use client";

import * as React from "react";
import { 
  FileUp, 
  Database, 
  ShieldAlert, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function BulkIngestionModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [ingesting, setIngesting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startIngestion = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIngesting(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setIngesting(false);
        setOpen(false);
        toast.success(`Successfully imported ${Math.floor(Math.random() * 300 + 50)} records`);
        setFile(null);
        setProgress(0);
      }
      setProgress(currentProgress);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white border-[#E5E5E1] max-w-md p-0 shadow-xl rounded-xl">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-orange-500" />
             </div>
             <div>
                <DialogTitle className="text-lg font-semibold">Bulk Import</DialogTitle>
                <DialogDescription className="text-xs text-[#717171]">Import clients from CSV or Excel</DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {!ingesting ? (
            <div 
              className="border-2 border-dashed border-[#E5E5E1] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#3ECF8E] transition-colors bg-[#F9F9F7]"
              onClick={() => document.getElementById('bulk-file')?.click()}
            >
               <input 
                 type="file" 
                 id="bulk-file" 
                 className="hidden" 
                 accept=".csv, .xlsx" 
                 onChange={handleFileChange}
               />
               <div className="w-12 h-12 rounded-lg bg-[#F3F3F1] flex items-center justify-center mb-3">
                  <FileUp className="w-5 h-5 text-[#717171]" />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">{file ? file.name : "Select File"}</p>
                  <p className="text-[10px] text-[#717171]">Supports .CSV and .XLSX</p>
               </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-xs font-medium text-orange-600 animate-pulse">Importing...</p>
                     <p className="text-xl font-bold">{Math.floor(progress)}%</p>
                  </div>
                  <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
               </div>
               <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
             <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
             <p className="text-xs text-yellow-700">
               Duplicate entries will be skipped based on phone number.
             </p>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-[#E5E5E1]">
          <Button 
            disabled={!file || ingesting}
            onClick={startIngestion}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {ingesting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {ingesting ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}