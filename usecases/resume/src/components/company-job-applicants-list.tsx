import { ResumeFormType } from "@/db/cvs";
import {
  getJobApplicantsByCompany,
  updateJobApplication
} from "@/db/job-applications";
import { formatDateString } from "@/lib/helpers";
import {
  Button,
  Card,
  Divider,
  Flex,
  Table,
  TableColumnsType,
  Tag,
  Typography,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import React, { ReactNode, useEffect, useState } from "react";
import ResumePreviewModal from "./resume-preview-modal";
import { sendVCRequest } from "@/lib/actions/server-actions";

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

const CompanyJobApplicantsList = () => {
  const session = useSession();
  const user = session.data?.user;
  const [data, setData] = useState<DataType[]>([]);
  const [showResume, setShowResume] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeFormType>();
  const handlePreviewResume = (resume: ResumeFormType) => {
    setShowResume(true);
    setSelectedResume(resume);
  };
  const handlePreviewResumeClose = () => {
    setShowResume(false);
  };

  const handleRequestVC = async (applicationId: string, userId: string) => {
    const pd = {
      id: "d49ee616-0e8d-4698-aff5-2a8a2362652d",
      name: "UniversityDegree",
      format: {
        "vc+sd-jwt": {
          alg: ["ES256"],
        },
        "vp+sd-jwt": {
          alg: ["ES256", "ES384"],
        },
      },
      input_descriptors: [
        {
          id: "abd4acb1-1dcb-41ad-8596-ceb1401a69c7",
          format: {
            "vc+sd-jwt": {
              alg: ["ES256", "ES384"],
            },
          },
          constraints: {
            fields: [
              {
                path: [
                  "$.credentialSubject.degree",
                  "$.vc.credentialSubject.degree",
                ],
              },
            ],
          },
          limit_disclosure: "required",
        },
      ],
    };
    try {
      const res = await sendVCRequest(applicationId, pd);
      if (true) {
        message.success("Request sent!");
        await updateJobApplication(
          applicationId,
          undefined,
          undefined,
          undefined,
          "VP Requested",
        );
      }
    } catch (error) {
      console.log(error);
    }
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

                <Button onClick={() => handleRequestVC(e.id, e.userId)}>
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
    </div>
  );
};

export default CompanyJobApplicantsList;
