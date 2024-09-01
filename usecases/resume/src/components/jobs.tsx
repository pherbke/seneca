import { getAllJobs } from "@/db/jobs-db";
import React from "react";
import JobsList from "./jobs-list";

const Jobs = async () => {
  const jobs = await getAllJobs();
  return <JobsList jobs={jobs} />;
};

export default Jobs;
