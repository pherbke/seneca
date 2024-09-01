import { Flex, Space, Typography } from "antd";
import Image from "next/image";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";
import { PersonalInfo } from "@/db/cvs";

export type PersonalInfoPreviewProps = PersonalInfo;

const PersonalInfoPreview = ({
  firstName,
  lastName,
  dob,
  nationality,
  image,
  email,
  gender,
  aboutMe,
  phone,
  address,
}: PersonalInfoPreviewProps) => {
  return (
    <div
      style={{
        margin: "10px",
        padding: "10px",
        marginTop: "25%",
        marginBottom: "25%",
        height: "100%",
      }}
    >
      <Flex justify="center">
        {image ? (
          <Image src={image} height={150} width={150} alt="resume-pic" />
        ) : (
          <UserOutlined style={{ fontSize: "100px" }} />
        )}
      </Flex>
      <h2 style={{ fontWeight: "bold", color: "#565656" }}>
        {firstName} {lastName}
      </h2>
      <Flex align="start" vertical>
        <Typography.Text>
          <b style={{ textAlign: "left", color: "#565656" }}>Date of Birth: </b>
          {dob}
        </Typography.Text>
        <Typography.Text>
          {" "}
          <b style={{ textAlign: "left", color: "#565656" }}>Nationality: </b>
          {nationality}
        </Typography.Text>
        <Typography.Text>
          <b style={{ textAlign: "left", color: "#565656" }}>Gender: </b>
          {gender}
        </Typography.Text>
      </Flex>
      <h2 style={{ textAlign: "left", color: "#565656" }}>Contact</h2>
      <Flex vertical>
        <Space>
          <FaLocationDot /> {address}
        </Space>
        <Space>
          <MdEmail /> {email}
        </Space>
        <Space>
          <FaPhoneAlt /> {phone}
        </Space>
      </Flex>
    </div>
  );
};

export default PersonalInfoPreview;
