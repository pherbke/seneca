import { JobWithCompany } from "@/lib/schema";
import { Button, Card, Divider, Flex, Space } from "antd";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import axios from "axios";

type JobDescriptionPreviewProps = {
  selectedJobListing: JobWithCompany;
  applyButtonClick: () => void;
};

const JobDescriptionPreview = ({
  selectedJobListing,
  applyButtonClick,
}: JobDescriptionPreviewProps) => {
  const { data: session } = useSession();
  const role = session?.user.role;

  const handleApplyButtonClick = async () => {
    const userId = session?.user.id;
    const applicationId = selectedJobListing.id;

    if (!userId || !applicationId) {
      console.error("User ID or Application ID is missing");
      return;
    }

    applyButtonClick();
  };

  return (
    <Card>
      <Card
        style={{
          height: role == "user" ? "55vh" : "60vh",
          overflowY: "scroll",
        }}
      >
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(
            selectedJobListing.company.logo!,
          )}`}
          width={150}
          height={150}
          alt="company-logo"
        />
        <Flex justify="space-between">
          <h2>{selectedJobListing.position}</h2>
        </Flex>

        <Divider />
        <div style={{ minHeight: "300px", overflowY: "scroll" }}>
          <Space>
            <h3>Location:</h3>
            {selectedJobListing.location}
          </Space>
          <h3>Description:</h3>
          <p>{selectedJobListing.description}</p>
          <h3>Requirements:</h3>
          {selectedJobListing.requirements.map((requirement, idx) => (
            <p key={idx}> - {requirement}</p>
          ))}
        </div>
        <p style={{ fontStyle: "italic" }}>{selectedJobListing.company.name}</p>
      </Card>
      {role === "user" ? (
        <Flex justify="end" style={{ marginTop: 10 }}>
          <Button type="primary" onClick={applyButtonClick}>
            Apply
          </Button>
        </Flex>
      ) : null}
    </Card>
  );
};

export default JobDescriptionPreview;
