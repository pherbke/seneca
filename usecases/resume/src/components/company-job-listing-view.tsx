import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Tooltip,
  Modal,
  message,
  Flex,
} from "antd";
import {
  PlusCircleOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { deleteJob, getJobsOfCompany } from "../db/jobs-db";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ImLocation } from "react-icons/im";
import { FaBuilding, FaFeather } from "react-icons/fa";
import CreateJobListing from "./create-job-listing";
import { getCurrentUser } from "@/lib/server-side-session";

interface Job {
  id: string;
  position: string;
  description: string;
  requirements: string[];
  location: string | null;
  companyId: string;
  company: {
    name: string;
    logo: string | null;
  };
}

const cardStyle: React.CSSProperties = {
  width: 300,
  height: 420,
  border: "1px solid black",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
};

const CompanyJobListingView = () => {
  const [isJobListingModalOpen, setIsJobListingModalOpen] = useState(false);
  const [isJobListingViewModalOpen, setIsJobListingViewModalOpen] =
    useState(false);
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined);

  const handleViewClick = (job: any) => {
    setSelectedJob(job);
    setIsJobListingViewModalOpen(true);
  };

  const handleEditClick = (job: any) => {
    setSelectedJob(job);
    setIsJobListingModalOpen(true);
  };

  const handleDeleteClick = (job: any) => {
    Modal.confirm({
      title: "Are you sure you want to delete this job listing?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteJob(job.id).then(() => {
          const updatedJobsData = jobsData.filter((j) => j.id !== job.id);
          setJobsData(updatedJobsData);
          message.success("Job listing deleted successfully");
        });
      },
    });
  };

  const closeJobListingViewModal = () => {
    setIsJobListingViewModalOpen(false);
  };
  const openJobListingModal = () => {
    setSelectedJob(undefined);
    setIsJobListingModalOpen(true);
  };

  const closeJobListingModal = () => {
    setIsJobListingModalOpen(false);
  };

  const onLoad = async () => {
    const { userId } = await getCurrentUser();
    const jobs: Job[] = await getJobsOfCompany(userId);

    setJobsData(jobs);
  };

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <div style={{ minHeight: "100%", background: "yellow" }}>
      <Card
        style={{
          zIndex: "1",
          marginTop: 10,
        }}
      >
        <Space
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignContent: "center",
          }}
        >
          <Tooltip title="Add new job listing">
            <Button type="primary">
              <PlusCircleOutlined
                onClick={openJobListingModal}
                style={{
                  fontSize: "24px",
                  color: "white",
                }}
              />
            </Button>
          </Tooltip>
        </Space>
        <div
          style={{
            background: "#f5f5f5",
            marginTop: 5,
            padding: 15,
            height: "55vh",
            overflowY: "scroll",
          }}
        >
          <Row gutter={[16, 16]} justify="start">
            {jobsData.map((job, index) => (
              <Col
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Card
                  style={cardStyle}
                  actions={[
                    <EyeOutlined
                      key="view"
                      onClick={() => handleViewClick(job)}
                    />,
                    <EditOutlined
                      key="edit"
                      onClick={() => handleEditClick(job)}
                    />,
                    <DeleteOutlined
                      key="delete"
                      onClick={() => handleDeleteClick(job)}
                    />,
                  ]}
                >
                  <Space direction="vertical">
                    <Image
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(
                        job.company.logo!,
                      )}`}
                      width={50}
                      height={50}
                      alt="logo"
                    />
                    <h2>{job.position}</h2>
                    <Space>
                      <ImLocation />
                      <p>{job.location}</p>
                    </Space>
                    <Space>
                      <FaBuilding />
                      <p>{job.company.name}</p>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Card>

      <Modal
        title={selectedJob ? "Edit Job Listing" : "Create Job Listing"}
        open={isJobListingModalOpen}
        onCancel={closeJobListingModal}
        footer={[
          <Button key="back" onClick={closeJobListingModal}>
            Close
          </Button>,
        ]}
      >
        <CreateJobListing job={selectedJob} />
      </Modal>

      <Modal
        title="Job Details"
        open={isJobListingViewModalOpen}
        onCancel={closeJobListingViewModal}
        footer={[
          <Button key="back" onClick={() => closeJobListingViewModal()}>
            Close
          </Button>,
        ]}
      >
        {selectedJob && (
          <>
            <Flex vertical>
              <h2>{selectedJob.position}</h2>
              <Space>
                <FaBuilding />
                {selectedJob.company.name}
                <ImLocation />
                {selectedJob.location}
              </Space>
              <Space>
                <p>{selectedJob.description}</p>
              </Space>
              <Space>
                <FaFeather /> Requirements
              </Space>
              <Space>
                <ul>
                  {selectedJob.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </Space>
            </Flex>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CompanyJobListingView;
