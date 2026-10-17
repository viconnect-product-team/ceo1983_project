import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/dialog";
import { X, Building2, Download } from "lucide-react";
import {
  CompanyProfile3DTemplate,
  type CompanyProfileData,
} from "./CompanyProfile3DTemplate";

interface CompanyProfileTemplateModalProps {
  open: boolean;
  onClose: () => void;
  data: CompanyProfileData;
  onDownloadCustomProfile?: () => void;
}

export function CompanyProfileTemplateModal({
  open,
  onClose,
  data,
  onDownloadCustomProfile,
}: CompanyProfileTemplateModalProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-950 border border-slate-800 text-white rounded-3xl [scrollbar-width:thin]">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
              <Building2 className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-sm sm:text-base font-black text-white">
                Hồ Sơ Doanh Nghiệp 3D
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Template bảo chứng điện tử CLB Doanh Nhân CEO 1983
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <CompanyProfile3DTemplate
            data={data}
            showDownloadButton={true}
            onDownloadCustomProfile={onDownloadCustomProfile}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
