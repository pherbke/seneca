import { Button, Flex, Modal } from "antd";
import React from "react";
import { ResumeFormType } from "@/db/cvs";
import ResumePreview from "./resume-preview/resume-preview";

const generatePdfPromise: Promise<(() => void) | null> =
  typeof window !== "undefined"
    ? import("../lib/generatePDF").then((mod) => mod.generatePdf)
    : Promise.resolve(null);

type ResumePreviewModalProps = {
  mode?: "viewer" | "editor" | "company";
  isOpen: boolean;
  fileName?: string;
  resumeData: ResumeFormType;
  id?: number;
  handleClose: () => void;
};
const ResumePreviewModal = ({
  mode,
  isOpen,
  resumeData,
  fileName,
  id,
  handleClose,
}: ResumePreviewModalProps) => {
  const generatePdf = async () => {
    const generatePdfFunction = await generatePdfPromise;
    if (generatePdfFunction && typeof generatePdfFunction === "function") {
      generatePdfFunction();
    }
  };

  return (
    <div>
      <Modal
        title={<div style={{ textAlign: "center" }}>{fileName}</div>}
        open={isOpen}
        closeIcon={false}
        width={1200}
        onCancel={handleClose}
        zIndex={2}
        footer={
          <Flex justify="end" gap={20}>
            {mode === "viewer" ? (
              <Button type="primary" onClick={generatePdf}>
                Save as PDF
              </Button>
            ) : null}
            <Button onClick={handleClose}>Close</Button>
          </Flex>
        }
      >
        <ResumePreview mode={mode} resumeData={resumeData} />
      </Modal>
    </div>
  );
};

export default ResumePreviewModal;
