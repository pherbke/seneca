"use client";
import { useState } from "react";
import { Layout as AntLayout, Space } from "antd";
import Link from "next/link";

type NavLink = {
  title: string;
  link: string;
};

const navLinks: NavLink[] = [
  {
    title: "Home",
    link: "/",
  },
  {
    title: "Job Portal",
    link: "/jobs-listing",
  },
];

const Nav = () => {
  const [hoveredLink, setHoveredLink] = useState("");
  return (
    <AntLayout.Header
      style={{
        background: "linear-gradient(to top left, #4e7fff, #3adb76)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "right",
      }}
    >
      <Space style={{ gap: 50 }}>
        {navLinks.map((navLink, idx) => (
          <Link
            key={idx}
            href={navLink.link}
            onMouseEnter={() => setHoveredLink(navLink.link)}
            onMouseLeave={() => setHoveredLink("")}
            style={{
              color: "#fff",
              fontSize: hoveredLink === navLink.link ? "1.2em" : "1em",
              transform: hoveredLink === navLink.link ? "scale(1.1)" : "none",
              transition: "all 0.3s ease-in-out",
            }}
          >
            {navLink.title}
          </Link>
        ))}
      </Space>
    </AntLayout.Header>
  );
};

export default Nav;
