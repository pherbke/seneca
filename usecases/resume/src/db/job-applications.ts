// job-applications.ts

"use server";
import db from "@/db";

export async function createJobApplication(
  userId: string,
  jobId: string,
  cvId: string,
) {
  try {
    return await db.jobApplication.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        job: {
          connect: {
            id: jobId,
          },
        },
        cv: {
          connect: {
            id: cvId,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating job application:", error);
    throw error;
  }
}

export async function updateJobApplication(
  id: string,
  userId?: number,
  jobId?: number,
  cvId?: number,
  status?: string,
  vpRequestLink?: string,
) {
  try {
    const updateData: any = {};

    if (userId) {
      updateData.userId = userId;
    }

    if (status) {
      updateData.status = status;
    }

    if (jobId) {
      updateData.jobId = jobId;
    }

    if (cvId) {
      updateData.cvId = cvId;
    }
    if (vpRequestLink) {
      updateData.vpRequestLink = vpRequestLink;
    }

    const updatedJobApplication = await db.jobApplication.update({
      where: {
        id: id,
      },
      data: updateData,
    });
    return updatedJobApplication;
  } catch (error) {
    console.error("Error updating job application:", error);
    throw error;
  }
}

export async function deleteJobApplication(id: string) {
  try {
    const deletedJobApplication = await db.jobApplication.delete({
      where: {
        id: id,
      },
    });
    return deletedJobApplication;
  } catch (error) {
    console.error("Error deleting job application:", error);
    throw error;
  }
}

export async function getJobApplicationsOfUser(userId: string) {
  try {
    const jobApplications = await db.jobApplication.findMany({
      where: {
        userId: userId,
      },
      include: {
        cv: true,
        job: {
          select: {
            position: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return jobApplications;
  } catch (error) {
    console.error("Error getting job applications of user:", error);
    throw error;
  }
}
export async function getJobApplicantsByCompany(companyId: string) {
  try {
    const result = await db.jobApplication.findMany({
      where: {
        job: {
          companyId: companyId,
        },
      },
      include: {
        cv: {
          select: {
            cv: true,
          },
        },
        job: {
          select: {
            position: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return result;
  } catch (error) {
    console.error("Error getting job applications of a company: ", error);
    throw error;
  }
}

export async function getJobApplicationsById(applicationId: string) {
  try {
    return await db.jobApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching job app by id", error);
  }
}

export async function getVPRequestLink(applicationId: string) {
  return (
    await db.jobApplication.findUnique({
      where: { id: applicationId },
      select: { vpRequestLink: true },
    })
  )?.vpRequestLink;
}
