"use client";
import { FC, PropsWithChildren, useEffect, useState, useCallback } from "react";
import {
  Layout as AntLayout,
  Space,
  Badge,
  Drawer,
  Card,
  Divider,
  Modal,
  Flex,
  QRCode,
  Button,
  message,
  Row,
  Col,
} from "antd";
import Image from "next/image";
import Nav from "./nav";
import Menu from "./menu";
import { useSession } from "next-auth/react";
import HeaderActions from "./header-actions";
import {
  createPubSubTopicAndSubscribe,
  verifyToken,
} from "@/lib/actions/server-actions";
import { BellOutlined } from "@ant-design/icons";
import React from "react";
import { Notification, NotificationType } from "@/lib/schema";
import useWebSocket from "@/lib/useWebsocket";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

import { updateJobApplication } from "@/db/job-applications";


interface vpData {
  vc: {
    issuer: {
      id: string;
    };
  };
  vpToken: string;
}

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
};

const contentStyle: React.CSSProperties = {
  textAlign: "left",
  paddingTop: "5px",
  color: "#000",
  display: "flex",
  justifyContent: "center",
  flexDirection: "row",
  alignItems: "start",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#000",
  backgroundColor: "#F3F6FB",
};

const layoutStyle = {
  borderRadius: 8,
  overflow: "hidden",
  width: "calc(100% - 0px)",
  maxWidth: "calc(100% - 0px)",
};

type ContentProps = PropsWithChildren<{ title?: string }>;

const useNotifications = (userId: string | undefined) => {
  const session = useSession();

  const [notification, setNotification] = useState<Notification[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);

  useEffect(() => {
    if (userId) {
      const setupSSE = async () => {
        await createPubSubTopicAndSubscribe(userId);

        const eventSource = new EventSource(
          `http://localhost:3001/sse?userId=${userId}`,
        );

        eventSource.onopen = () => {
          console.log("Connection to SSE established");
        };

        eventSource.onerror = (error) => {
          console.error("SSE error:", error);
        };

        eventSource.onmessage = async (event) => {
          const newMessage: Notification = JSON.parse(event.data);

          setNotification((prevNotifications) => [
            newMessage,
            ...prevNotifications,
          ]);
          if (newMessage.type === "vpRequest") {
            const state = userId + ";" + newMessage.userId;
            console.log(state);
            const res = await fetch(
              `${
                window.location.origin
              }/api/verifier/generate-vp-request?state=${state}&pd=${JSON.stringify(
                newMessage.pd,
              )}`,
            );
            const link = await res.json();
            await updateJobApplication(
              newMessage.applicationId!,
              undefined,
              undefined,
              undefined,
              undefined,
              link.vpRequest,
            );
          }
          setNotificationCounter((prevCounter) => prevCounter + 1);
        };

        return () => {
          eventSource.close();
        };
      };
      setupSSE();
    }
  }, [session.data?.user.id, userId]);

  return {
    notification,
    notificationCounter,
    setNotification,
    setNotificationCounter,
  };
};

const Content: FC<ContentProps> = ({ children, title }) => {
  const session = useSession();

  const {
    socket,
    wsClientId,
    setWsClientId,
    showQR,
    vpLink,
    setShowQR,
    setVpLink,
  } = useWebSocket(
    session.status === "authenticated"
      ? `ws://localhost:8080?clientId=${session.data.user.id}`
      : null,
  );

  const {
    notification,
    notificationCounter,
    setNotification,
    setNotificationCounter,
  } = useNotifications(session.data?.user?.id);

  const [open, setOpen] = useState(false);
  const [vpData, setVPData] = useState<vpData>();
  const [replyTopic, setReplyTopic] = useState("");
  const [showVP, setShowVP] = useState(false);
  const [selectedApplicationID, setSelectedApplicationID] = useState<
    string | null
  >(null);
  const [ebsiResponse, setEbsiResponse] = useState<any | null>(null);

  const showDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleVerifyVP = async () => {
    if (vpData) {
      const issuerDid = vpData.vc.issuer.id || vpData.vc.issuer;
      const vpToken = vpData.vpToken;
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api-pilot.ebsi.eu/did-registry/v4/identifiers/${issuerDid}`,
        headers: {
          Accept: "application/did+ld+json",
        },
      };

      try {
        const res = await axios.request(config);
        if (res.status === 200) {
          setEbsiResponse(res.data);
          const verificationMethods = res.data.verificationMethod;
          let result = false;
          for (const method of verificationMethods) {
            try {
              const publicKeyJwk = method.publicKeyJwk;
              const verification = await verifyToken(publicKeyJwk, vpToken);
              if (verification === true) {
                result = true;
                break;
              }
            } catch (error) {
              console.error("Verification failed:", error);
            }
          }
          if (result) {
            message.success("Signature Verification Successful");
            //setShowVP(false);
            await updateJobApplication(
              selectedApplicationID!,
              undefined,
              undefined,
              undefined,
              "VP verified",
            );
          } else message.error("Signature could not be verified");
        }
      } catch (error) {
        console.error("Axios request failed:", error);
        message.error("DID could not be resolved");
      }
    }
  };

  const handleNotificationCardClick = async (notification: Notification) => {
    setSelectedApplicationID(notification.applicationId || null);

    setNotificationCounter((currentCounter) =>
      currentCounter > 0 ? currentCounter - 1 : 0,
    );
    // Mark the notification as read
    setNotification((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notification.id ? { ...notif, read: true } : notif,
      ),
    );

    if (notification.type === "vpRequest") {
      setReplyTopic(notification.userId);
      const res = await fetch(
        `${
          window.location.origin
        }/api/verifier/generate-vp-request?state=${wsClientId}&pd=${JSON.stringify(
          notification.pd,
        )}`,
      );
      const link = await res.json();
      setVpLink(link.vpRequest);
      setShowQR(true);
    } else if (notification.type === "vpSubmission") {
      setVPData(notification.vpData);
      setShowVP(true);
    }
  };
  useEffect(() => {
    if (socket) {
      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data);
        if (!message.data.toString().includes("Hello")) {
          setShowQR(false);
          const res = await axios.post("http://localhost:3001/publish", {
            topic: replyTopic === "" ? data.destination : replyTopic,
            message: {
              type: "vpSubmission",
              userId: session.data?.user.id,
              id: uuid(),
              read: false,
              vpData: data.message,
              title: "Verifiable Presentation Submission",
              message: `${session.data?.user.name} has submitted Verifiable Presentation`,
              timestamp: new Date(),
              applicationId: selectedApplicationID,
            },
          });
          console.log(res.statusText);
        } else {
          setWsClientId(data.clientId);
        }
      };
    }
  }, [
    replyTopic,
    selectedApplicationID,
    session.data?.user.id,
    session.data?.user.name,
    setShowQR,
    setWsClientId,
    socket,
  ]);

  const handleModalClose = () => {
    setShowQR(false);
  };

  const loggedIn = session.status === "authenticated";

  return (
    <AntLayout style={layoutStyle}>
      <AntLayout.Header style={headerStyle}>
        <Image src={"/trust-cv-logo.png"} width={150} height={50} alt="logo" />
        <Space>
          {loggedIn ? (
            <>
              <p>
                Hello{" "}
                <b style={{ color: "#013581" }}>{session.data?.user?.name}</b>
              </p>
              <Badge count={notificationCounter}>
                <BellOutlined
                  style={{ fontSize: "24px" }}
                  onClick={showDrawer}
                />
              </Badge>
            </>
          ) : null}
          <HeaderActions />
        </Space>
      </AntLayout.Header>
      {loggedIn ? (
        <>
          <Nav />
          <Menu title={title} />
          <AntLayout>
            <AntLayout.Content style={contentStyle}>
              {children}
              <Drawer
                onClose={onClose}
                open={open}
                closeIcon={false}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
              >
                <div style={{ marginTop: "35%" }}>
                  {notification.length > 0 ? (
                    notification.map((notif) => (
                      <React.Fragment key={notif.id}>
                        <Card
                          style={{
                            backgroundColor: notif.read ? "#E1E2E4" : "#FFFFFF",
                          }}
                          hoverable
                          onClick={() => handleNotificationCardClick(notif)}
                        >
                          <p>
                            <b>{notif.title}</b>
                          </p>
                          <p>{notif.message}</p>
                          <p style={{ textAlign: "right" }}>
                            <small>{notif.timestamp}</small>
                          </p>
                        </Card>
                        <Divider />
                      </React.Fragment>
                    ))
                  ) : (
                    <p style={{ textAlign: "center", color: "grey" }}>
                      No notifications
                    </p>
                  )}
                </div>
              </Drawer>

              <Modal
                open={showQR}
                onCancel={handleModalClose}
                footer={<></>}
                width={400}
              >
                <Space></Space>
                <Divider>Scan to submit VP</Divider>
                <Flex justify="center">
                  <QRCode value={vpLink} />
                </Flex>
              </Modal>

              <Modal
                open={showVP}
                onCancel={() => {
                  setShowVP(false);
                  setEbsiResponse(null);
                }}
                footer={
                  <>
                    <Button onClick={handleVerifyVP}>Verify</Button>
                  </>
                }
                width={1200}
              >
                <Divider>Submitted Verifiable Presentation</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={ebsiResponse ? 12 : 24}>
                    <b>Verifiable Presentation</b>
                    <div style={{ height: "550px", overflowY: "scroll" }}>
                      <JsonView
                        data={vpData!}
                        shouldExpandNode={allExpanded}
                        style={defaultStyles}
                      />
                    </div>
                  </Col>

                  {ebsiResponse ? (
                    <Col span={12}>
                      <b>DID Document</b>
                      <div style={{ height: "550px", overflowY: "scroll" }}>
                        <JsonView
                          data={ebsiResponse}
                          shouldExpandNode={allExpanded}
                          style={defaultStyles}
                        />
                      </div>
                    </Col>
                  ) : null}
                </Row>
              </Modal>
            </AntLayout.Content>
          </AntLayout>
        </>
      ) : null}
      <AntLayout.Footer style={footerStyle}>© 2024 Trust CV</AntLayout.Footer>
    </AntLayout>
  );
};

export default React.memo(Content);