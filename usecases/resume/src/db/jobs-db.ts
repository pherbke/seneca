"use server";
import db from "@/db";

export async function createJob(
  companyId: string,
  position: string,
  description: string,
  location: string,
  requirements: string[],
) {
  try {
    return await db.job.create({
      data: {
        position,
        description,
        location,
        requirements: [...requirements],
        company: {
          connect: {
            id: companyId,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

export async function updateJob(
  id: string,
  position?: string,
  description?: string,
  location?: string,
  requirements?: string[],
) {
  try {
    const updateData: any = {};

    if (position) {
      updateData.position = position;
    }

    if (description) {
      updateData.description = description;
    }
    if (location) {
      updateData.location = location;
    }
    if (requirements) {
      updateData.requirements = [...requirements];
    }

    const updatedJob = await db.job.update({
      where: {
        id: id,
      },
      data: updateData,
    });
    return updatedJob;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
}

export async function deleteJob(id: string) {
  try {
    const deletedJob = await db.job.delete({
      where: {
        id: id,
      },
    });
    return deletedJob;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
}

export async function getAllJobs() {
  try {
    const jobs = await db.job.findMany({
      include: {
        company: {
          select: {
            id: true,
            email: true,
            logo: true,
            name: true,
          },
        },
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error getting all jobs:", error);
    throw error;
  }
}

export async function getJobsOfCompany(companyId: string) {
  try {
    const jobs = await db.job.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error getting jobs of company:", error);
    throw error;
  }
}
