"use client";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Card,
  Divider,
  Flex,
  Layout as AntLayout,
  Alert,
  Space,
  message,
  Modal,
  QRCode,
} from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { generateLoginVC, signUp } from "@/lib/actions/server-actions";
import axios from "axios";

const SignUp = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const authError = searchParams.get("error");
  const router = useRouter();
  const [credentialOfferLink, setCredentialOfferLink] = useState("");

  const handleOnFinish = async (values: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    try {
      const response = await signUp({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      });
      if (response) {
        message.success("Registered Successfully");
        const credentialOfferLink = await generateLoginVC(response);
        if (credentialOfferLink) {
          setCredentialOfferLink(credentialOfferLink);
        }
      } else {
        message.error("User with email already exists");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleModalClose = () => {
    setCredentialOfferLink("");
    router.push("/signin");
  };

  return (
    <AntLayout>
      <AntLayout.Header></AntLayout.Header>
      <div style={{ top: "10%", position: "absolute" }}>
        <Flex justify="center" style={{ width: "100vw" }}>
          <Card
            style={{
              boxShadow:
                "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              minHeight: "650px",
              minWidth: "400px",
            }}
          >
            <Flex justify="space-between">
              <h1>Sign Up</h1>
              <Image
                src={"/trust-cv-logo.png"}
                height={50}
                width={150}
                alt="logo"
              />
            </Flex>
            {authError && (
              <Alert
                description={authError}
                type="error"
                style={{ marginBottom: "2rem" }}
              />
            )}

            <Form
              layout="vertical"
              className="signup-form"
              onFinish={handleOnFinish}
            >
              <Form.Item
                name="firstName"
                style={{ width: "100%" }}
                rules={[
                  { required: true, message: "Please enter your first name" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="First Name"
                  style={{ minHeight: "50px" }}
                />
              </Form.Item>
              <Form.Item
                name="lastName"
                style={{ width: "100%" }}
                rules={[
                  { required: true, message: "Please enter your last name" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Last Name"
                  style={{ minHeight: "50px" }}
                />
              </Form.Item>
              <Form.Item
                name="email"
                style={{ width: "100%" }}
                rules={[
                  {
                    type: "email",
                    required: true,
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="Email"
                  style={{ minHeight: "50px" }}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please enter a password" }]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Password"
                  style={{ minHeight: "50px" }}
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match"),
                      );
                    },
                  }),
                ]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Confirm Password"
                  style={{ minHeight: "50px" }}
                />
              </Form.Item>
              <Flex vertical style={{ marginTop: 20 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="signup-form-button"
                >
                  Create Account
                </Button>
                <Divider></Divider>
                <Space>
                  Already registered? <Link href={"/signin"}>Login</Link>
                </Space>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </div>
      <Modal
        open={credentialOfferLink ? true : false}
        onCancel={handleModalClose}
        closable
        footer={<></>}
      >
        <Divider>Scan with wallet to issue a Login VC</Divider>
        <Flex justify="center">
          <QRCode value={credentialOfferLink} />
        </Flex>
      </Modal>
    </AntLayout>
  );
};

export default SignUp;
