"use client";
import { getJobApplicationsOfUser } from "@/db/job-applications";
import JobApplicationsList from "./user-job-applications-list";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const ApplicationsCollection = () => {
  const session = useSession();
  const user = session.data?.user;
  const [jobApplications, setJobApplications] = useState<any>([]);

  const fetchJobApplications = useCallback(async () => {
    const jobApps = await getJobApplicationsOfUser(user!.id);
    setJobApplications(jobApps);
  }, [user]);

  useEffect(() => {
    fetchJobApplications();
  }, [fetchJobApplications]);

  return <JobApplicationsList jobApplications={jobApplications} />;
};

export default ApplicationsCollection;
