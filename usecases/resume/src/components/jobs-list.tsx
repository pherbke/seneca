"use client";
import { Button, Card, Col, Divider, Flex, Row } from "antd";
import React, { useEffect, useState } from "react";
import ModalSelectCV from "./modal-select-cv-job";
import { JobWithCompany } from "@/lib/schema";
import JobDescriptionPreview from "./job-description-preview";
import Image from "next/image";

type JobWithCompanyArrayProps = {
  jobs: JobWithCompany[];
};

const JobsList = ({ jobs }: JobWithCompanyArrayProps) => {
  const [showSelectCVModal, setShowSelectCVModal] = useState(false);
  const [selectedJobListing, setSelectedJobListing] = useState<JobWithCompany>(
    jobs[0],
  );

  useEffect(() => {
    const selectedJobListing = localStorage.getItem("selectedJobListing");
    if (selectedJobListing) {
      setSelectedJobListing(JSON.parse(selectedJobListing));
    }
  }, []);

  const handlJobListingClick = (selectedJobListing: JobWithCompany) => {
    setSelectedJobListing(selectedJobListing);
    localStorage.setItem(
      "selectedJobListing",
      JSON.stringify(selectedJobListing),
    );
  };

  const handleApplyButtonClick = () => {
    setShowSelectCVModal(true);
  };

  const handleModalClose = () => {
    setShowSelectCVModal(false);
  };
  return (
    <>
      <Row style={{ marginTop: 10 }}>
        <Col span={12}>
          <Flex
            justify="center"
            style={{
              height: "65vh",
              marginTop: 5,
            }}
          >
            <Flex
              vertical
              gap={10}
              style={{ maxWidth: "90%", minWidth: "90%", overflowY: "scroll" }}
            >
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  hoverable
                  style={{
                    flex: 1,
                    backgroundColor:
                      selectedJobListing.id === job.id ? "#fff" : "#fff",
                    border:
                      selectedJobListing.id === job.id
                        ? "2px solid lightblue"
                        : "#fff",
                  }}
                  onClick={() => handlJobListingClick(job)}
                >
                  <h2>{job.position}</h2>
                  <p>{job.company.name}</p>
                  <Image
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                      job.company.logo!,
                    )}`}
                    width={100}
                    height={100}
                    alt="company-logo"
                  />
                </Card>
              ))}
            </Flex>
          </Flex>
        </Col>
        <Col span={12}>
          {selectedJobListing ? (
            <JobDescriptionPreview
              selectedJobListing={selectedJobListing}
              applyButtonClick={handleApplyButtonClick}
            />
          ) : null}
        </Col>
      </Row>

      <ModalSelectCV
        selectedJobId={selectedJobListing.id}
        isOpen={showSelectCVModal}
        handleClose={handleModalClose}
      />
    </>
  );
};

export default JobsList;
