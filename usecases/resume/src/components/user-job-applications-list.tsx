import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Flex,
  Modal,
  QRCode,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { formatDateString } from "@/lib/helpers";
import { getVPRequestLink } from "@/db/job-applications";

type JobApplicationsListProps = {
  jobApplications: any;
};

type DataType = {
  key: string;
  jobTitle: string;
  company: string;
  applicatonDate: Date;
  applicationStatus: string;
  resume: string;
};

const JobApplicationsList = ({ jobApplications }: JobApplicationsListProps) => {
  const [showVP, setShowVP] = useState(false);
  const [vpLink, setVpLink] = useState("");

  const handleModalClose = () => {
    setShowVP(false);
  };
  const showVPRequest = async (applicationId: string) => {
    {
      const link = await getVPRequestLink(applicationId);
      setVpLink(link as any);
      setShowVP(true);
    }
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "job-title",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Date Applied",
      dataIndex: "applicatonDate",
      key: "application-date",
    },
    {
      title: "Status",
      dataIndex: "applicatonStatus",
      key: "applicationStatus",
      width: 150,
      render: (_, { applicationStatus }) => {
        let color;
        if (applicationStatus === "in review") {
          color = "orange";
        } else if (applicationStatus === "rejected") {
          color = "red";
        } else if (applicationStatus === "VP verified") {
          color = "green";
        }
        return (
          <>
            <Tag color={color} key={applicationStatus}>
              {applicationStatus.toUpperCase()}
            </Tag>
          </>
        );
      },
    },
    {
      title: "VP Requested?",
      dataIndex: "VPRequest",
      key: "VPRequest",
      render: (_, record) => {
        if (record.applicationStatus === "VP Rquested") {
          return (
            <Button type="primary" onClick={() => showVPRequest(record.key)}>
              Show VP Request
            </Button>
          );
        } else if (record.applicationStatus === "VP verified") {
          return "Verification Successful";
        } else {
          return "Not yet";
        }
      },
    },
  ];
  const jobApplicationData = useMemo(() => {
    return jobApplications.map((jobApplication: any) => {
      return {
        key: jobApplication.id,
        jobTitle: jobApplication.job.position,
        company: jobApplication.job.company.name,
        applicatonDate: formatDateString(jobApplication.createdAt),
        applicationStatus: jobApplication.status,
        resume: jobApplication.cv.file_name,
      };
    });
  }, [jobApplications]);

  return (
    <div>
      <Card style={{ zIndex: "1", marginTop: 10 }}>
        <Flex justify="space-between">
          <Typography.Title> My Job Applications</Typography.Title>
        </Flex>
        <Divider style={{ background: "#004494" }} />
        <Table
          dataSource={jobApplicationData}
          pagination={{ pageSize: 7 }}
          scroll={{ y: 300 }}
          columns={columns}
        ></Table>
      </Card>
      <Modal
        open={showVP}
        onCancel={handleModalClose}
        footer={null}
        width={400}
      >
        <Space></Space>
        <Divider>Scan to submit VP</Divider>
        <Flex justify="center">
          <QRCode size={320} value={vpLink} />
        </Flex>
      </Modal>
    </div>
  );
};

export default JobApplicationsList;
