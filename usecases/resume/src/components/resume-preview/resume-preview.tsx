import { Button, Card, Col, Row, Space } from "antd";
import React from "react";
import PersonalInfoPreview from "./resume-preview-personal-info";
import ResumePreviewExperienceInfo from "./resume-preview-experience-info";
import { ResumeFormType } from "@/db/cvs";

type ResumePreviewProps = {
  mode?: "viewer" | "editor" | "company";
  resumeData: ResumeFormType;
};

const ResumePreview = ({ mode, resumeData }: ResumePreviewProps) => {
  return (
    <div
      style={{
        maxHeight: "calc(100vh - 250px)",
        overflowY: "auto",
      }}
    >
      <div id="resume-preview">
        <Card>
          <Row>
            <Col span={8} style={{ background: "#F5F5F5" }}>
              <PersonalInfoPreview {...resumeData.personalInfo} />
            </Col>
            <Col span={16}>
              <ResumePreviewExperienceInfo
                mode={mode}
                workExperiences={resumeData.workExperiences}
                educations={resumeData.educations}
              />
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default ResumePreview;
