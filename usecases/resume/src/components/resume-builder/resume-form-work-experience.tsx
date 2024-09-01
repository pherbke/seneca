import React from "react";
import { Form, Input, DatePicker, Typography, Divider, Flex } from "antd";
import TextArea from "antd/es/input/TextArea";
import useResumeFormStore from "@/lib/useFormStore";
import dayjs from "dayjs";

type ResumeBuilderWorkExperienceProps = {
  index: number;
};

const ResumeBuilderWorkExperience = ({
  index,
}: ResumeBuilderWorkExperienceProps) => {
  const { resumeData, setResumeData } = useResumeFormStore();

  const handleFieldChange = (fieldName: string, value: string | string[]) => {
    const updatedWorkExperiences = [...resumeData.workExperiences];
    if (updatedWorkExperiences[index]) {
      updatedWorkExperiences[index][fieldName] = value as string;

      setResumeData({
        ...resumeData,
        workExperiences: updatedWorkExperiences,
      });
    }
  };

  return (
    <div>
      <Typography.Title style={{ textAlign: "left", color: "#013581" }}>
        {index + 1}. Work Experience
      </Typography.Title>
      <Divider style={{ background: "black" }} />
      <Flex wrap gap={20}>
        <Form.Item
          name={`position${index}`}
          label="Position"
          style={{ flex: "1 1 25%" }}
        >
          <Input
            defaultValue={resumeData.workExperiences[index]?.position || ""}
            onChange={(e) => handleFieldChange("position", e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name={`employer${index}`}
          label="Employer"
          style={{ flex: "1 1 25%" }}
        >
          <Input
            defaultValue={resumeData.workExperiences[index]?.employer || ""}
            onChange={(e) => handleFieldChange("employer", e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name={`from${index}`}
          label="From"
          style={{ flex: "1 1 15%" }}
        >
          <DatePicker
            defaultValue={
              resumeData.workExperiences[index].from
                ? dayjs(resumeData.workExperiences[index].from, "DD/MM/YYYY")
                : dayjs()
            }
            onChange={(date, dateString) =>
              handleFieldChange("from", dateString)
            }
          />
        </Form.Item>
        <Form.Item name={`to${index}`} label="To" style={{ flex: "1 1 15%" }}>
          <DatePicker
            defaultValue={
              resumeData.workExperiences[index].to
                ? dayjs(resumeData.workExperiences[index].to, "DD/MM/YYYY")
                : dayjs()
            }
            onChange={(date, dateString) => handleFieldChange("to", dateString)}
          />
        </Form.Item>
        <Form.Item
          name={`city${index}`}
          label="City"
          style={{ flex: "1 1 15%" }}
        >
          <Input
            defaultValue={resumeData.workExperiences[index]?.city || ""}
            onChange={(e) => handleFieldChange("city", e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name={`country${index}`}
          label="Country"
          style={{ flex: "1 1 15%" }}
        >
          <Input
            defaultValue={resumeData.workExperiences[index]?.country || ""}
            onChange={(e) => handleFieldChange("country", e.target.value)}
          />
        </Form.Item>
      </Flex>
      <Form.Item
        name={`summary${index}`}
        label="Main activities and responsibilities"
        style={{
          flex: "1 1 15%",
          flexDirection: "column",
          alignContent: "",
        }}
      >
        <TextArea
          defaultValue={resumeData.workExperiences[index]?.summary || ""}
          onChange={(e) => handleFieldChange("summary", e.target.value)}
        />
      </Form.Item>
    </div>
  );
};

export default ResumeBuilderWorkExperience;
