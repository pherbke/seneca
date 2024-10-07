"use client";
import { useSearchParams } from "next/navigation";
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
  Modal,
  QRCode,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { SignInOptions, signIn } from "next-auth/react";
import useWebSocket from "@/lib/useWebsocket";

const loginCredentiaPD = {
  id: "046acbac-ea8d-4f95-8b57-f58dd178132b",
  name: "LoginCredential",
  format: {
    jwt_vc: {
      alg: ["ES256"],
    },
  },
  input_descriptors: [
    {
      id: "ef91319b-81a5-4f71-a602-de3eacccb543",
      constraints: {
        fields: [
          {
            path: ["$.credentialSubject.email"],
          },
        ],
      },
    },
  ],
};

const SignIn = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const authError = searchParams.get("error");

  const {
    socket,
    wsClientId,
    setWsClientId,
    showQR,
    setShowQR,
    vpLink,
    setVpLink,
  } = useWebSocket("ws://localhost:8080");

  const handleSignInWithVP = async () => {
    const res = await fetch(
      `${
        window.location.origin
      }/api/verifier/generate-vp-request?state=${wsClientId}&pd=${JSON.stringify(
        loginCredentiaPD,
      )}`,
    );
    const link = await res.json();
    setVpLink(link.vpRequest);
    setShowQR(true);
  };
  const handleModalClose = () => {
    setShowQR(false);
  };

  const handleOnFinish = async (values: SignInOptions | undefined) => {
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values?.identifier as string,
      );
      if (isEmail) {
        await signIn("credentials-login", {
          email: values?.identifier,
          password: values?.password,
          callbackUrl,
        });
      } else {
        await signIn("credentials-login", {
          ...values,
          username: values?.identifier,
          password: values?.password,
          callbackUrl,
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data);
        if (!message.data.toString().includes("Hello")) {
          setShowQR(false);
          await signIn("credentials-login", {
            login_vp_token: data.vpToken,
            callbackUrl,
          });
        } else {
          setWsClientId(data.clientId);
        }
      };
    }
  }, [socket, callbackUrl, setShowQR, setWsClientId]);

  return (
    <AntLayout>
      <AntLayout.Header></AntLayout.Header>
      <div style={{ top: "20%", position: "absolute" }}>
        <Flex justify="center" style={{ width: "100vw" }}>
          <Card
            style={{
              boxShadow:
                "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
              minHeight: "500px",
              minWidth: "400px",
            }}
          >
            <Flex justify="space-between">
              <h1>Sign In</h1>
              <Image
                src={"/trust-cv-logo.png"}
                height={50}
                width={150}
                alt="logo"
              />
            </Flex>
            {authError && (
              <Alert
                description={"Invalid email or password"}
                type="error"
                style={{ marginBottom: "2rem" }}
              />
            )}

            <Form
              layout="vertical"
              className="login-form"
              onFinish={handleOnFinish}
            >
              <Form.Item
                name="identifier"
                style={{ width: "100%" }}
                rules={[{ type: "string", required: true }]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Email or Username"
                  style={{ minHeight: "50px" }}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ type: "string", required: true }]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Password"
                  style={{ minHeight: "50px" }}
                />
              </Form.Item>
              <Link href={"/signin"}>Forgot Password?</Link>
              <Flex vertical style={{ marginTop: 20 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="login-form-button"
                >
                  Login
                </Button>
                <Divider>or</Divider>
                <Button size="large" onClick={handleSignInWithVP}>
                  Sign In with VP
                </Button>
                <Divider></Divider>
                <Space>
                  Not registered yet? <Link href={"/signup"}>Sign up here</Link>
                </Space>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </div>
      <Modal
        open={showQR}
        onCancel={handleModalClose}
        footer={<></>}
        width={400}
      >
        <Space></Space>
        <Divider>QRCode Authentication</Divider>
        <Flex justify="center">
          <QRCode size={320} value={vpLink} />
        </Flex>
      </Modal>
    </AntLayout>
  );
};

export default SignIn;
