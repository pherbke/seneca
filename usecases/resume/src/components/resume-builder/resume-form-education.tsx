import React from "react";
import { Form, Input, DatePicker, Typography, Divider, Flex } from "antd";
import useResumeFormStore from "@/lib/useFormStore";
import dayjs from "dayjs";

const ResumeBuilderEducation = ({ index }: { index: number }) => {
  const { resumeData, setResumeData } = useResumeFormStore();

  const handleFieldChange = (fieldName: string, value: string | string[]) => {
    const updatedEducations = [...resumeData.educations];
    updatedEducations[index][fieldName] = value as string;
    setResumeData({
      ...resumeData,
      educations: updatedEducations,
    });
  };

  return (
    <div>
      <Typography.Title style={{ textAlign: "left", color: "#013581" }}>
        {index + 1}. Education and training
      </Typography.Title>
      <Divider style={{ background: "black" }} />
      <Flex wrap gap={20}>
        <Form.Item
          name={"title of qualification"}
          label="Title of qualification"
          style={{ flex: "1 1 25%" }}
        >
          <Input
            defaultValue={resumeData.educations[index].title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name={"institutionName"}
          label="Institution"
          style={{ flex: "1 1 25%" }}
        >
          <Input
            defaultValue={resumeData.educations[index].institutionName}
            onChange={(e) =>
              handleFieldChange("institutionName", e.target.value)
            }
          />
        </Form.Item>
        <Form.Item name={"website"} label="Website" style={{ flex: "1 1 25%" }}>
          <Input
            defaultValue={resumeData.educations[index].website}
            onChange={(e) => handleFieldChange("website", e.target.value)}
          />
        </Form.Item>
        <Form.Item name={"from"} label="From" style={{ flex: "1 1 25%" }}>
          <DatePicker
            defaultValue={
              resumeData.educations[index].from
                ? dayjs(resumeData.educations[index].from, "DD/MM/YYYY")
                : dayjs()
            }
            onChange={(date, dateString) =>
              handleFieldChange("from", dateString)
            }
          />
        </Form.Item>
        <Form.Item name={"to"} label="To" style={{ flex: "1 1 25%" }}>
          <DatePicker
            defaultValue={
              resumeData.educations[index].to
                ? dayjs(resumeData.educations[index].to, "DD/MM/YYYY")
                : dayjs()
            }
            onChange={(date, dateString) => handleFieldChange("to", dateString)}
          />
        </Form.Item>
        <Form.Item name={"city"} label="City" style={{ flex: "1 1 25%" }}>
          <Input
            defaultValue={resumeData.educations[index].city}
            onChange={(e) => handleFieldChange("city", e.target.value)}
          />
        </Form.Item>
        <Form.Item name={"country"} label="Country" style={{ flex: "1 1 25%" }}>
          <Input
            defaultValue={resumeData.educations[index].country}
            onChange={(e) => handleFieldChange("country", e.target.value)}
          />
        </Form.Item>
      </Flex>
    </div>
  );
};

export default ResumeBuilderEducation;
