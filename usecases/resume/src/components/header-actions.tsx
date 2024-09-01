"use client";

import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Tooltip } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";

const HeaderActions: FC = () => {
  const session = useSession();
  const loggedIn = session.status === "authenticated";

  if (!loggedIn) {
    return (
      <Space style={{ float: "right" }}>
        <Button type="text" onClick={() => signIn()}>
          <u>Log in</u>
        </Button>

        <Tooltip title="Log in">
          <Button
            shape="circle"
            icon={<UserOutlined />}
            onClick={() => signIn()}
          />
        </Tooltip>
      </Space>
    );
  }

  const avatarDropdownItems = [
    {
      key: "profile",
      title: "Account Settings",
      label: <Link href={`/profile`}>Account Settings</Link>,
    },
  ];

  let actionButton;
  if (loggedIn) {
    actionButton = (
      <Button
        type="text"
        onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
      >
        <u>Logout</u>
      </Button>
    );
  } else
    actionButton = (
      <Button type="text" onClick={() => signIn()}>
        <u>Sign In</u>
      </Button>
    );

  return (
    <Space style={{ float: "right", padding: "16px" }}>
      {actionButton}
      <Dropdown
        menu={{
          items: avatarDropdownItems,
        }}
      >
        <Avatar size={"large"} icon={<UserOutlined />} />
      </Dropdown>
    </Space>
  );
};

export default HeaderActions;
