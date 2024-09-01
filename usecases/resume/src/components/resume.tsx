"use client";
import React, { useState } from "react";
import { Col, Row, Radio, Space } from "antd"; // Import Col and Row from Ant Design
import ResumeBuilderForm from "./resume-builder/resume-form";
import ResumePreview from "./resume-preview/resume-preview";
import useFormStore from "@/lib/useFormStore";

const Resume = () => {
  const { resumeData } = useFormStore();

  const [layout, setResumeLayout] = useState("split");

  return (
    <Row gutter={16}>
      <Space style={{ marginLeft: "10px" }}>
        <Radio.Group
          value={layout}
          onChange={(e) => setResumeLayout(e.target.value)}
          buttonStyle="solid"
          style={{ marginBottom: "10px" }}
        >
          <Radio.Button value="builder">Editor</Radio.Button>
          <Radio.Button value="split">Split</Radio.Button>
          <Radio.Button value="preview">Preview</Radio.Button>
        </Radio.Group>
      </Space>
      <Col span={24}></Col>
      {layout === "split" && (
        <>
          <Col span={12}>
            <ResumeBuilderForm />
          </Col>
          <Col span={12}>
            <div>
              <ResumePreview resumeData={resumeData} />
            </div>
          </Col>
        </>
      )}
      {layout !== "split" && (
        <Col span={24}>
          {layout === "builder" && <ResumeBuilderForm />}
          {layout === "preview" && (
            <div>
              <ResumePreview resumeData={resumeData} />
            </div>
          )}
        </Col>
      )}
    </Row>
  );
};

export default Resume;
