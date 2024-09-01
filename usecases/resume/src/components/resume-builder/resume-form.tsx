import React from "react";
import { Button, Card, Flex, Form, Tooltip } from "antd";
import ResumeBuilderPersonalInfo from "./resume-form-personal-info";
import ResumeBuilderWorkExperience from "./resume-form-work-experience";
import ResumeBuilderEducation from "./resume-form-education";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import useResumeFormStore from "@/lib/useFormStore";
import { Education, WorkExperience } from "@/db/cvs";

const ResumeBuilderForm = () => {
  const { resumeData, setResumeData, removeEducation, removeWorkExperience } =
    useResumeFormStore();

  const addWorkExperience = () => {
    const updatedWorkExperiences = [...resumeData.workExperiences];
    updatedWorkExperiences.push({} as WorkExperience);
    setResumeData({
      ...resumeData,
      workExperiences: updatedWorkExperiences,
    });
  };

  const addEducation = () => {
    const updatedEducations = [...resumeData.educations];
    updatedEducations.push({} as Education);
    setResumeData({
      ...resumeData,
      educations: updatedEducations,
    });
  };

  return (
    <div style={{ height: "calc(100vh - 250px)", overflowY: "auto" }}>
      <Card style={{ display: "flex", justifyContent: "center" }}>
        <Form
          layout="vertical"
          style={{
            maxWidth: "80vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          scrollToFirstError
        >
          <ResumeBuilderPersonalInfo />
          <div>
            {resumeData.workExperiences.map(
              (workExperience: WorkExperience, index: number) => (
                <div key={index}>
                  <ResumeBuilderWorkExperience index={index} />
                  <Flex justify="end">
                    {resumeData.workExperiences.length > 1 && (
                      <Tooltip title="remove work experience">
                        <MinusCircleOutlined
                          onClick={() => removeWorkExperience(index)}
                          style={{ color: "red", fontSize: "20px" }}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                </div>
              ),
            )}
            <Flex justify="center">
              <Tooltip title="add new work experience">
                <Button onClick={addWorkExperience}>
                  <PlusOutlined style={{ color: "green" }} />
                </Button>
              </Tooltip>
            </Flex>
          </div>
          <div>
            {resumeData.educations.map(
              (education: Education, index: number) => (
                <div key={index}>
                  <ResumeBuilderEducation index={index} />
                  <Flex justify="end">
                    {resumeData.educations.length > 1 && (
                      <Tooltip title="remove education">
                        <MinusCircleOutlined
                          onClick={() => removeEducation(index)}
                          style={{ color: "red", fontSize: "20px" }}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                </div>
              ),
            )}
            <Flex justify="center">
              <Tooltip title="add new education">
                <Button onClick={addEducation}>
                  <PlusOutlined style={{ color: "green" }} />
                </Button>
              </Tooltip>
            </Flex>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResumeBuilderForm;
