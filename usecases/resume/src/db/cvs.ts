"use server";
import db from "@/db";
import { Cache } from "./cache";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  image: string;
  gender: string;
  aboutMe: string;
  email: string;
  phone: string;
  address: string;
}

export interface WorkExperience {
  [key: string]: string;
  position: string;
  employer: string;
  from: string;
  to: string;
  city: string;
  country: string;
  summary: string;
}

export interface Education {
  [key: string]: string;
  title: string;
  institutionName: string;
  website: string;
  from: string;
  to: string;
  city: string;
  country: string;
}

export type ResumePreviewExperienceInfoProps = {
  mode?: "viewer" | "editor" | "company";
  workExperiences: WorkExperience[];
  educations: Education[];
};

export interface ResumeFormType {
  personalInfo: PersonalInfo;
  workExperiences: WorkExperience[];
  educations: Education[];
}

export async function createCV(
  userId: string,
  fileName: string,
  cv: ResumeFormType,
) {
  try {
    const cvString = JSON.stringify(cv);
    const result = await db.cV.create({
      data: {
        file_name: fileName,
        cv: cvString,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    Cache.getInstance().evict("getCVsOfUser", [userId]);
    return result;
  } catch (error) {
    console.error("Error creating CV:", error);
    throw error;
  }
}

export async function updateCV(
  userId: string,
  id: string,
  fileName?: string,
  cv?: ResumeFormType,
) {
  try {
    const updateData: any = {};

    if (fileName) {
      updateData.file_name = fileName;
    }

    if (cv) {
      updateData.cv = JSON.stringify(cv);
    }

    const updatedCV = await db.cV.update({
      where: {
        id: id,
      },
      data: updateData,
    });
    Cache.getInstance().evict("getCVsOfUser", [userId]);

    return updatedCV;
  } catch (error) {
    console.error("Error updating CV:", error);
    throw error;
  }
}

export async function deleteCV(userId: string, id: string) {
  try {
    const deletedCV = await db.cV.delete({
      where: {
        id: id,
      },
    });
    Cache.getInstance().evict("getCVsOfUser", [userId]);
    return deletedCV;
  } catch (error) {
    console.error("Error deleting CV:", error);
    throw error;
  }
}

export async function getCVsOfUser(userId: string) {
  const cachedValue = await Cache.getInstance().get("getCVsOfUser", [userId]);
  if (cachedValue) {
    return cachedValue;
  }

  try {
    const cvs = await db.cV.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: false,
      },
    });
    Cache.getInstance().set("getCVsOfUser", [userId], cvs);
    return cvs;
  } catch (error) {
    console.error("Error getting CVs of user:", error);
    throw error;
  }
}
