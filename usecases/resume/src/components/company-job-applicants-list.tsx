import { ResumeFormType } from "@/db/cvs";
import {
  getJobApplicantsByCompany,
  updateJobApplication,
} from "@/db/job-applications";
import { formatDateString } from "@/lib/helpers";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Modal,
  Space,
  Table,
  TableColumnsType,
  Tag,
  Typography,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import React, { ReactNode, useEffect, useState } from "react";
import ResumePreviewModal from "./resume-preview-modal";
import { handleRequestVC } from "@/lib/actions/server-actions";

const CheckboxGroup = Checkbox.Group;

type DataType = {
  key: string;
  applicantName: string;
  roleAppliedFor: string;
  applicatonDate: string;
  applicationStatus: string;
  resume?: ResumeFormType;
  actions: ReactNode;
};

const columns: TableColumnsType<DataType> = [
  {
    title: "Applicant's Name",
    dataIndex: "applicantName",
    key: "applicantName",
  },
  {
    title: "Role Applied For",
    dataIndex: "roleAppliedFor",
    key: "roleAppliedFor",
  },
  {
    title: "Date Applied",
    dataIndex: "applicatonDate",
    key: "applicatonDate",
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
    title: "Actions",
    dataIndex: "actions",
    key: "actions",
  },
];

const plainOptions = [
  "Personal Info",
  "Work Experience",
  "Education and Training",
];
const defaultCheckedList = ["Education and Training"];

const CompanyJobApplicantsList = () => {
  const session = useSession();
  const user = session.data?.user;
  const [data, setData] = useState<DataType[]>([]);
  const [showResume, setShowResume] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null,
  );
  const [checkedList, setCheckedList] = useState<string[]>(defaultCheckedList);

  const [selectedResume, setSelectedResume] = useState<ResumeFormType>();
  const handlePreviewResume = (resume: ResumeFormType) => {
    setShowResume(true);
    setSelectedResume(resume);
  };

  const handlePreviewResumeClose = () => {
    setShowResume(false);
  };

  const onChange = (list: string[]) => {
    setCheckedList(list);
  };

  const handleOptionsModalOKClick = async () => {
    const res = await handleRequestVC(
      selectedApplication!,
      checkedList,
      user?.name!,
    );
    if (res) message.success("Request sent!");
    else message.error("Error sending request");
    setSelectedApplication(null);
  };

  const handleClickRequestVC = async (applicationId: string) => {
    setSelectedApplication(applicationId);
  };
  useEffect(() => {
    const fetchData = async () => {
      const data = await getJobApplicantsByCompany(user?.id!);
      const jobApplicants = data.map((e) => {
        return {
          key: e.id,
          applicantName: `${e.user.firstName} ${e.user.lastName}`,
          userId: e.userId,
          roleAppliedFor: e.job.position,
          applicatonDate: formatDateString(e.createdAt),
          applicationStatus: e.status,
          resume: JSON.parse(e.cv.cv?.toString()!),
          actions: (
            <>
              <Flex gap={10}>
                <Button
                  key={e.id}
                  onClick={() =>
                    handlePreviewResume(JSON.parse(e.cv.cv?.toString()!))
                  }
                >
                  View resume
                </Button>

                <Button onClick={() => handleClickRequestVC(e.id)}>
                  Request VC
                </Button>
              </Flex>
            </>
          ),
        };
      });
      setData(jobApplicants);
    };
    fetchData();
  }, [user?.id]);

  return (
    <div>
      <Card style={{ zIndex: "1", marginTop: 10 }}>
        <Flex justify="space-between">
          <Typography.Title> Job Applicants</Typography.Title>
        </Flex>
        <Divider style={{ background: "#004494" }} />
        <Table
          dataSource={data}
          pagination={{ pageSize: 7 }}
          scroll={{ y: 300 }}
          columns={columns}
        ></Table>
      </Card>
      {selectedResume ? (
        <ResumePreviewModal
          mode="company"
          resumeData={selectedResume!}
          isOpen={showResume}
          handleClose={handlePreviewResumeClose}
        />
      ) : null}
      <Modal
        open={selectedApplication ? true : false}
        closeIcon={false}
        onCancel={() => setSelectedApplication(null)}
        onOk={handleOptionsModalOKClick}
      >
        <CheckboxGroup
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
          options={plainOptions}
          value={checkedList}
          onChange={onChange}
        />
      </Modal>
    </div>
  );
};

export default CompanyJobApplicantsList;
