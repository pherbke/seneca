import React from "react";
import { Card, Row, Col } from "antd";
import Image from "next/image";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";

type ResumeCardProps = {
  fullOptionsMode: boolean;
  cvFile: any;
  handleResumeCardClick: (cvFile: any) => void;
  handleEyeButtonClick?: () => void;
  handleEditButtonClick?: () => void;
  handleDeleteButtonClick?: (id: string) => void;
  handleEditFileNameClick?: () => void;
};

const ResumeCard: React.FC<ResumeCardProps> = ({
  fullOptionsMode,
  cvFile,
  handleResumeCardClick,
  handleEyeButtonClick,
  handleEditButtonClick,
  handleDeleteButtonClick,
  handleEditFileNameClick,
}) => {
  return (
    <Card
      onClick={() => handleResumeCardClick(cvFile)}
      key={cvFile.id}
      hoverable
      actions={
        fullOptionsMode
          ? [
              <EyeOutlined onClick={handleEyeButtonClick} key={cvFile.id} />,
              <EditOutlined onClick={handleEditButtonClick} key={cvFile.id} />,
              handleDeleteButtonClick ? (
                <DeleteOutlined
                  onClick={() => handleDeleteButtonClick(cvFile.id)}
                  key={cvFile.id}
                />
              ) : null,
            ]
          : []
      }
      style={{
        background: "#F5F5F5",
        width: 340,
        border: "0.5px solid black",
      }}
    >
      <Row>
        <Col span={16}>
          {cvFile.cv.personalInfo ? (
            <>
              <p style={{ textAlign: "left" }}>
                <b>{cvFile.fileName}</b>{" "}
                {fullOptionsMode ? (
                  <EditOutlined onClick={handleEditFileNameClick} />
                ) : null}
              </p>
              <p style={{ textAlign: "left" }}>
                <b>Name:</b>{" "}
                {`${cvFile.cv.personalInfo.firstName} ${cvFile.cv.personalInfo.lastName}`}
              </p>
              <p style={{ textAlign: "left" }}>
                <b>DOB:</b> {cvFile.cv.personalInfo.dob}
              </p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Col>
        <Col span={8}>
          {cvFile.cv.personalInfo ? (
            <Image
              src={cvFile.cv.personalInfo.image}
              height={100}
              width={100}
              alt="cv"
            />
          ) : null}
        </Col>
      </Row>
    </Card>
  );
};

export default ResumeCard;
