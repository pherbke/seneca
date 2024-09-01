"use client";
import { Col, Flex, Modal, QRCode, Row } from "antd";
import React, { useEffect, useState } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { getRequest } from "@/lib/walt-id-test";
import TextArea from "antd/es/input/TextArea";

const Page = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [link, setLink] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [testReq, setTestReq] = useState("");

  const getLink = async () => {
    const testReq = await getRequest();
    setTestReq(testReq);
    const res = await fetch(
      "http://localhost:3000/api/verifier/generate-vp-request",
    );
    const link = await res.json();
    setLink(link.vpRequest);
  };

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");
    newSocket.onopen = () => {
      console.log("Connection established");
      newSocket.send("Hello Server!");
    };
    newSocket.onmessage = (message) => {
      if (!message.data.toString().includes("Hello")) {
        const vp = JSON.parse(message.data);
        setResponse(vp);
        setModalOpen(true);
      }
    };
    getLink();
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const claimsData: any[] = [];
  const vpData: any[] = [];

  if (response) {
    for (const key in response.claims) {
      if (key === "vp") {
        const vp = response.claims[key];
        for (const vpKey in vp) {
          vpData.push({ key: vpKey, value: vp[vpKey] });
        }
      } else {
        claimsData.push({ key, value: response.claims[key] });
      }
    }
  }

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <Row>
        <Col span={12} style={{ width: "400px", overflowX: "clip" }}>
          <Flex vertical>
            Grant IO
            <TextArea value={link} style={{ width: "40vw" }} />
            <QRCode value={link} />
          </Flex>
        </Col>
        <Col span={12}>
          <Flex vertical>
            Walt ID
            <TextArea value={testReq} style={{ width: "40vw" }} />
            <QRCode value={testReq} />
          </Flex>
        </Col>
      </Row>

      {response ? (
        <>
          <Modal
            open={modalOpen}
            title="Response"
            onCancel={handleModalClose}
            footer={<></>}
            width={800}
          >
            <div style={{ height: "550px", overflowY: "scroll" }}>
              <JsonView
                data={response}
                shouldExpandNode={allExpanded}
                style={defaultStyles}
              />
            </div>
          </Modal>
        </>
      ) : null}
    </div>
  );
};

export default Page;
