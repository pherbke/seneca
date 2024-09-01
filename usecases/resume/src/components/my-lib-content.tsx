import { PlusCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Tooltip,
  Typography,
  message,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import CreateCVModal from "./create-cv-modal";
import { ResumeFormType, deleteCV, getCVsOfUser, updateCV } from "@/db/cvs";

import ResumePreviewModal from "./resume-preview-modal";
import FormItem from "antd/es/form/FormItem";
import { useSession } from "next-auth/react";
import ResumeCard from "./resume-card";
import { NextResponse } from "next/server";
import axios from 'axios';

const MyLibrary = () => {
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditFileNameModal, setShowEditFileNameModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const session = useSession();
  const user = session.data?.user;
  const [cvFiles, setCvs] = useState<
    { id: string; fileName: string; cv: any }[]
  >([]);
  const [selectedResume, setSelectedResume] = useState<{
    id: string;
    fileName: string;
    cv: ResumeFormType;
  } | null>(null);

  const refreshData = useCallback(async () => {
    const newCVFiles = await getCVsOfUser(user!.id);
    setCvs(
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
    refreshData();
  }, [refreshData]);

  const handleCreateNewCVButtonClick = () => {
    setIsCVModalOpen(true);
  };
  const handleModalClose = () => {
    setIsCVModalOpen(false);
  };
  const handleResumeCardClick = (cvFile: {
    id: string;
    fileName: string;
    cv: ResumeFormType;
  }) => {
    setSelectedResume(cvFile);
  };

  const handleEyeButtonClick = () => {
    setShowResume(true);
  };

  const handlePreviewModalClose = () => {
    setShowResume(false);
  };

  const handleEditButtonClick = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleEditFileNameClick = () => {
    setShowEditFileNameModal(true);
  };
  const handleEditFileNameModalClose = () => {
    setShowEditFileNameModal(false);
  };
  const handleEditFileNameModalOK = async () => {
    const response = await updateCV(
      user?.id!,
      selectedResume?.id!,
      newFileName,
    );
    if (response && response.id) {
      await refreshData();
      message.success("");
    } else {
      message.error("Error updating filename");
    }
    handleEditFileNameModalClose();
  };

  const handleDeleteButtonClick = async (id: string) => {
    const response = await deleteCV(user?.id!, id);
    if (response && response.id) {
      await refreshData();
      message.success("");
    } else {
      message.error("Error occured deleting resume");
    }
  };

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);



  return (
    <div>
      <Card style={{ zIndex: "1", marginTop: 10 }}>
        <Flex justify="space-between">
          <Typography.Title>CVs</Typography.Title>
          <Flex gap={10}>
            <Tooltip title="Upload CV">
              <Button>
                <PlusCircleOutlined
                  onClick={() => {}}
                  style={{ fontSize: "20px", color: "green" }}
                />
              </Button>
            </Tooltip>
            <Button type="primary" onClick={handleCreateNewCVButtonClick}>
              Create a CV
            </Button>
            {isCVModalOpen ? (
              <CreateCVModal
                refreshData={refreshData}
                isOpen={isCVModalOpen}
                handleClose={handleModalClose}
                mode={"create"}
              />
            ) : null}
          </Flex>
        </Flex>
        <Divider style={{ background: "#004494" }} />
        <div
          style={{
            height: "410px",
            overflowY: "scroll",
          }}
        >
          <Flex
            justify="flex-start"
            wrap
            gap={10}
            style={{ paddingBottom: 10 }}
          >
            {cvFiles.length < 1 ? (
              <div>No CVs found</div>
            ) : (
              <>
                {cvFiles.map((cvFile, idx) => (
                  <ResumeCard
                    key={idx}
                    cvFile={cvFile}
                    fullOptionsMode={true}
                    handleResumeCardClick={handleResumeCardClick}
                    handleEditFileNameClick={handleEditFileNameClick}
                    handleDeleteButtonClick={handleDeleteButtonClick}
                    handleEditButtonClick={handleEditButtonClick}
                    handleEyeButtonClick={handleEyeButtonClick}
                  />
                ))}
              </>
            )}
          </Flex>
        </div>
      </Card>
      {selectedResume && showResume ? (
        <ResumePreviewModal
          mode="viewer"
          isOpen={showResume}
          handleClose={handlePreviewModalClose}
          resumeData={selectedResume.cv}
          fileName={selectedResume.fileName}
        />
      ) : null}
      {selectedResume && showEditModal ? (
        <CreateCVModal
          refreshData={refreshData}
          mode={"update"}
          handleClose={handleCloseEditModal}
          isOpen={showEditModal}
          dataToUpdate={{
            id: selectedResume.id,
            resumeData: selectedResume.cv,
            fileName: selectedResume.fileName,
          }}
        />
      ) : null}
      {selectedResume && showEditFileNameModal ? (
        <Modal
          open={showEditFileNameModal}
          onCancel={handleEditFileNameModalClose}
          onOk={handleEditFileNameModalOK}
        >
          <Form layout="vertical">
            <FormItem label="File Name">
              <Input
                defaultValue={selectedResume.fileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </FormItem>
          </Form>
        </Modal>
      ) : null}
    </div>
  );
};

export default MyLibrary;
