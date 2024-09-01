"use client";
import { Col, Row, Space, Tabs, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Layout as AntLayout } from "antd";
import { usePathname } from "next/navigation";
import MyLibrary from "./my-lib-content";
import ApplicationsCollection from "./user-job-applications";
import CompanyJobListingView from "./company-job-listing-view";
import CompanyJobApplicantsList from "./company-job-applicants-list";
import { useSession } from "next-auth/react";

const userMenuOptions = [
  {
    key: "0",
    title: "My Library",
    children: (
      <div style={{ width: "90vw" }}>
        <MyLibrary />
      </div>
    ),
  },
  {
    key: "1",
    title: "My Applications",
    children: (
      <div style={{ width: "90vw" }}>
        <ApplicationsCollection />
      </div>
    ),
  },
];

const companyMenuOptions = [
  {
    key: "0",
    title: "Our Jobs Listing",
    children: (
      <div style={{ width: "90vw" }}>
        <CompanyJobListingView />
      </div>
    ),
  },
  {
    key: "1",
    title: "Applicants",
    children: (
      <div style={{ width: "90vw" }}>
        <CompanyJobApplicantsList />
      </div>
    ),
  },
];

type MenuProps = {
  title?: string;
};

const Menu = ({ title }: MenuProps) => {
  const pathname = usePathname();
  const session = useSession();
  const role = session.data?.user.role;
  let menuOptions;
  {
    role === "company"
      ? (menuOptions = companyMenuOptions)
      : (menuOptions = userMenuOptions);
  }
  const [activeTabKey, setActiveTabKey] = useState("0");
  useEffect(() => {
    const storedTabKey = localStorage.getItem("activeTabKey");
    if (storedTabKey) {
      setActiveTabKey(storedTabKey);
    }
  }, []);

  const handleTabClick = (key: string) => {
    localStorage.setItem("activeTabKey", key);
    setActiveTabKey(key);
  };

  return (
    <AntLayout.Header>
      <Row>
        <Col span={8}>
          <Space
            style={{
              backgroundColor: "#fff",
              height: "50px",
            }}
          >
            {pathname === "/" ? (
              <Tabs
                activeKey={activeTabKey}
                onChange={handleTabClick}
                type="card"
                items={menuOptions.map((option, idx) => {
                  return {
                    tabKey: option.key,
                    label: option.title,
                    key: `${idx}`,
                    children: option.children,
                  };
                })}
              />
            ) : title ? (
              <Typography.Title style={{ color: "#565656" }}>
                {title}
              </Typography.Title>
            ) : null}
          </Space>
        </Col>
        <Col span={8} style={{ textAlign: "center" }}></Col>
        <Col span={8}></Col>
      </Row>
    </AntLayout.Header>
  );
};

export default Menu;
