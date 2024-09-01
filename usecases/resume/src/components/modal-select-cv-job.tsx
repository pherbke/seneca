import { ResumeFormType, getCVsOfUser } from "@/db/cvs";
import { Button, Divider, Flex, Modal, message } from "antd";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import ResumeCard from "./resume-card";
import { createJobApplication } from "@/db/job-applications";

type ModalSelectCVProps = {
  isOpen: boolean;
  handleClose: () => void;
  selectedJobId: string;
};

const ModalSelectCV = ({
  isOpen,
  handleClose,
  selectedJobId,
}: ModalSelectCVProps) => {
  const [userCVs, setUserCVs] = useState([]);
  const session = useSession();
  const user = session.data?.user;
  const [selectedResume, setSelectedResume] = useState<{
    id: string;
    fileName: string;
    cv: ResumeFormType;
  } | null>(null);

  const handleResumeCardClick = useCallback(
    async (cvFile: { id: string; fileName: string; cv: ResumeFormType }) => {
      setSelectedResume(cvFile);
      handleClose();
      const res = await createJobApplication(
        user?.id!,
        selectedJobId,
        cvFile.id,
      );
      if (res && res.id) {
        message.success("");
      } else {
        message.error("Error");
      }
    },
    [handleClose, selectedJobId, user?.id],
  );

  const fetchData = useCallback(async () => {
    const newCVFiles = await getCVsOfUser(user!.id);
    setUserCVs(
      newCVFiles.map((item: any) => {
        return {
          id: item.id,
          fileName: item.file_name,
          cv: JSON.parse(item.cv?.toString()!),
        };
      }),
    );
  }, [user]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <Modal
      onCancel={handleClose}
      open={isOpen}
      title={
        <>
          <Flex justify="center">Select Resume</Flex>
          <Divider />
        </>
      }
      footer={<Button onClick={handleClose}>Close</Button>}
    >
      <Flex
        justify="space-evenly"
        wrap
        style={{
          height: "400px",
          overflowY: "scroll",
        }}
      >
        <Flex vertical style={{ gap: 10 }}>
          {userCVs.map((cvFile, idx) => (
            <ResumeCard
              key={idx}
              fullOptionsMode={false}
              cvFile={cvFile}
              handleResumeCardClick={handleResumeCardClick}
            />
          ))}
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ModalSelectCV;
