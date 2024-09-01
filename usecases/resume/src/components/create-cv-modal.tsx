import { Button, Flex, Form, Input, Modal, message } from "antd";
import React, { useEffect, useState } from "react";
import Resume from "./resume";
import useResumeFormStore from "@/lib/useFormStore";
import { ResumeFormType, createCV, updateCV } from "@/db/cvs";
import FormItem from "antd/es/form/FormItem";
import { useSession } from "next-auth/react";

type UpdateCVProps = {
  resumeData?: ResumeFormType;
  fileName?: string;
  id?: string;
};

type CreateCVModalProps = {
  mode: "update" | "create";
  isOpen: boolean;
  dataToUpdate?: UpdateCVProps;
  handleClose: () => void;
  refreshData: () => void;
};

const CreateCVModal = ({
  mode,
  isOpen,
  handleClose,
  dataToUpdate,
  refreshData,
}: CreateCVModalProps) => {
  const { resumeData, resetResumeData, setResumeData } = useResumeFormStore();
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const user = useSession().data?.user;
  const [fileName, setFileName] = useState("");
  const [id, setId] = useState("");

  const handleSaveButtonClick = async () => {
    if (mode === "create") {
      setIsFileNameModalOpen(true);
    } else {
      const jsonData = {
        personalInfo: resumeData.personalInfo,
        workExperiences: resumeData.workExperiences,
        educations: resumeData.educations,
      };
      const response = await updateCV(user!.id, id, fileName, jsonData);
      if (response && response.id) {
        message.success("");
        await refreshData();
        handleClose();
      } else {
        message.error("Error");
      }
    }
  };
  useEffect(() => {
    if (dataToUpdate && mode === "update") {
      setResumeData(dataToUpdate.resumeData!);
      setId(dataToUpdate.id!);
      setFileName(dataToUpdate.fileName!);
    }
    return () => {
      resetResumeData();
    };
  }, [dataToUpdate, mode, resetResumeData, setResumeData]);

  const handleOkClick = async () => {
    const jsonData = {
      personalInfo: resumeData.personalInfo,
      workExperiences: resumeData.workExperiences,
      educations: resumeData.educations,
    };

    const response = await createCV(user!.id, fileName, jsonData);
    if (response && response.id) {
      message.success("");
      await refreshData();
      setIsFileNameModalOpen(false);
      handleClose();
    } else {
      message.error("Error");
    }
  };

  return (
    <div>
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            {mode == "create" ? "Create new resume" : "Update resume"}
          </div>
        }
        open={isOpen}
        closeIcon={false}
        width={1400}
        onCancel={handleClose}
        zIndex={200}
        footer={
          <Flex justify="end" gap={20}>
            <Button
              onClick={handleSaveButtonClick}
              type="primary"
              style={{ border: "1px solid black" }}
            >
              {mode === "create" ? "Save" : "Update"}
            </Button>
            <Button onClick={handleClose} style={{ border: "1px solid black" }}>
              Close
            </Button>
          </Flex>
        }
      >
        {(mode === "update" && id) || mode === "create" ? <Resume /> : null}
      </Modal>

      <Modal
        open={isFileNameModalOpen}
        onCancel={() => setIsFileNameModalOpen(false)}
        onOk={handleOkClick}
      >
        <Form layout="vertical">
          <FormItem name="file name" label="File Name">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateCVModal;
