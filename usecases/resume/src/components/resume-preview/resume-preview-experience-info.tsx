import {
  Education,
  ResumePreviewExperienceInfoProps,
  WorkExperience,
} from "@/db/cvs";
import { Button, Divider, Flex } from "antd";
import Image from "next/image";
import React from "react";

const ResumePreviewExperienceInfo = ({
  mode,
  workExperiences,
  educations,
}: ResumePreviewExperienceInfoProps) => {
  return (
    <div style={{ margin: "10px", padding: "10px" }}>
      <Flex justify="center">
        <Image src={"/trust-cv-logo.png"} width={150} height={50} alt="logo" />
      </Flex>
      <h2 style={{ fontWeight: "bold", color: "#013581", textAlign: "left" }}>
        Work Experience
      </h2>
      <Divider style={{ background: "#000" }} />
      {workExperiences.map((workExperience: WorkExperience, index: number) => (
        <div key={index} style={{ textAlign: "left" }}>
          <b>{`${workExperience.from} - ${workExperience.to} (${workExperience.city}, ${workExperience.country})`}</b>
          <p>{`${workExperience.position} at ${workExperience.employer} `}</p>
          <p>{`${workExperience.summary}`}</p>
          {mode === "company" ? (
            <>
              {/* <Button
                type="primary"
                onClick={() => {
                  alert("Requesting verification for this work experience...");
                }}
              >
                Request VC
              </Button> */}
            </>
          ) : null}
        </div>
      ))}

      <h2 style={{ fontWeight: "bold", color: "#013581", textAlign: "left" }}>
        Education and Training
      </h2>
      <Divider style={{ background: "#000" }} />
      {educations.map((education: Education, index: number) => (
        <div key={index} style={{ textAlign: "left" }}>
          <b>{`${education.from} - ${education.to} (${education.city}, ${education.country})`}</b>
          <p>{`${education.title} at ${education.institutionName} `}</p>
          <p>{`${education.website}`}</p>
          {/* {mode === "company" ? (
            <>
              <Button type="primary" onClick={() => handleRequestVC()}>
                Request VC
              </Button>
            </>
          ) : null} */}
        </div>
      ))}
    </div>
  );
};

export default ResumePreviewExperienceInfo;
