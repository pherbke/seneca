import { Form, Input, Button, Upload, Space } from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { createJob, getJobsOfCompany, updateJob } from "../db/jobs-db";
import { getCurrentUser } from "@/lib/server-side-session";
import { useEffect } from "react";

type CreateJobListingProps = {
  job?: {
    id: string;
    position: string;
    description: string;
    requirements: string[];
    location: string | null;
    companyId: string;
    company: {
      name: string;
    };
  };
};

const CreateJobListing = ({ job }: CreateJobListingProps) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (job) {
      console.log(job.position);
      form.setFieldsValue({
        jobTitle: job.position,
        location: job.location,
        requirements: job.requirements,
        description: job.description,
      });
    } else {
      form.resetFields();
    }
  }, [job]);

  const onFinish = async (values: any) => {
    const { jobTitle, location, requirements, description } = values;
    console.log(values);
    const { userId } = await getCurrentUser();
    // Call the createJob function with the form values
    if (job) {
      console.log("updateJob");
      updateJob(job.id, jobTitle, description, location, requirements);
    } else {
      createJob(userId, jobTitle, description, location, requirements);
    }

    const jobs = await getJobsOfCompany(userId);
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item name="jobTitle" rules={[{ required: true }]}>
        <Input placeholder="Job Title" />
      </Form.Item>

      <Form.Item name="location" rules={[{ required: true }]}>
        <Input placeholder="Location" />
      </Form.Item>
      <Form.List name="requirements">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => {
              const { key, ...rest } = field;
              return (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...rest}
                    rules={[{ required: true, message: "Missing requirement" }]}
                  >
                    <Input placeholder="Requirement" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              );
            })}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add requirement
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item name="description" rules={[{ required: true }]}>
        <Input.TextArea placeholder="Job description" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {job ? "Edit Job Listing" : "Create Job Listing"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateJobListing;
