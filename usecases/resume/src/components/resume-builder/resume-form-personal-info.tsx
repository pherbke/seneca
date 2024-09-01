import React from "react";
import dayjs from "dayjs";

import {
  Form,
  Input,
  Select,
  DatePicker,
  Typography,
  Flex,
  Divider,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import useResumeFormStore from "@/lib/useFormStore";
import UploadFileComponent from "../upload-file";

const ResumeBuilderPersonalInfo = () => {
  const { resumeData, setResumeData } = useResumeFormStore();
  const handleFieldChange = (fieldName: string, value: string | string[]) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [fieldName]: value,
      },
    });
  };

  return (
    <div>
      <Typography.Title style={{ textAlign: "left", color: "#013581" }}>
        Personal Information
      </Typography.Title>
      <Divider style={{ background: "black" }} />
      <Flex justify="center" style={{ marginBottom: 16, marginTop: 0 }}>
        <UploadFileComponent type="img" />
      </Flex>

      <div style={{ display: "flex", gap: "10px" }}>
        <Form.Item
          name={"firstName"}
          label="First Name"
          style={{ flex: "1 1 25%" }}
        >
          <Input
            defaultValue={resumeData.personalInfo.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name={"lastName"}
          label="Last Name"
          style={{ flex: "1 1 25%" }}
        >
          <Input
            defaultValue={resumeData.personalInfo.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
          />
        </Form.Item>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <Form.Item
          name={"nationality"}
          label="Nationality"
          style={{ flex: "1 1 25%" }}
        >
          <Input
            defaultValue={resumeData.personalInfo.nationality}
            onChange={(e) => handleFieldChange("nationality", e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name={"dob"}
          label="Date of Birth"
          style={{ flex: "0.5 0.5 15%" }}
        >
          <DatePicker
            defaultValue={
              resumeData.personalInfo.dob
                ? dayjs(resumeData.personalInfo.dob, "DD/MM/YYYY")
                : dayjs()
            }
            onChange={(date, dateString) =>
              handleFieldChange("dob", dateString)
            }
          />
        </Form.Item>
        <Form.Item name={"gender"} label="Gender" style={{ flex: "1 1 25%" }}>
          <Select
            defaultValue={resumeData.personalInfo.gender}
            onChange={(value) => handleFieldChange("gender", value)}
          >
            <Select.Option value="Male">Male</Select.Option>
            <Select.Option value="Female">Female</Select.Option>
            <Select.Option value="Diverse">Diverse</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <Form.Item name={"aboutMe"} label="About Me" style={{ flex: "1 1 100%" }}>
        <TextArea
          defaultValue={resumeData.personalInfo.aboutMe}
          onChange={(e) => handleFieldChange("aboutMe", e.target.value)}
        />
      </Form.Item>

      <Typography.Title style={{ textAlign: "left", color: "#013581" }}>
        Contact
      </Typography.Title>
      <Divider style={{ background: "black" }} />
      <Flex wrap gap={20}>
        <Form.Item name={"email"} label="Email" style={{ flex: "1 1 30%" }}>
          <Input
            type="email"
            defaultValue={resumeData.personalInfo.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
          />
        </Form.Item>
        <Form.Item name={"phone"} label="Phone">
          <Input
            type="number"
            defaultValue={resumeData.personalInfo.phone}
            onChange={(e) => handleFieldChange("phone", e.target.value)}
          />
        </Form.Item>
        <Form.Item name={"address"} label="Address" style={{ flex: "1 1 40%" }}>
          <Input
            defaultValue={resumeData.personalInfo.address}
            onChange={(e) => handleFieldChange("address", e.target.value)}
          />
        </Form.Item>
      </Flex>
    </div>
  );
};

export default ResumeBuilderPersonalInfo;
