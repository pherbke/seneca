"use server";
import db from "@/db";
export async function createCompany(
  name: string,
  email: string,
  password: string,
) {
  try {
    return await db.company.create({
      data: {
        name,
        email,
        password,
      },
    });
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
}

export async function updateCompany(
  id: string,
  name?: string,
  email?: string,
  password?: string,
) {
  try {
    const updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    if (email) {
      updateData.email = email;
    }

    if (password) {
      updateData.password = password;
    }

    const updatedCompany = await db.company.update({
      where: {
        id: id,
      },
      data: updateData,
    });
    return updatedCompany;
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
}

export async function deleteCompany(id: string) {
  try {
    const deletedCompany = await db.company.delete({
      where: {
        id: id,
      },
    });
    return deletedCompany;
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
}

export async function getCompany(id: string) {
  try {
    const company = await db.company.findUnique({
      where: {
        id: id,
      },
      include: {
        jobs: true,
      },
    });
    return company;
  } catch (error) {
    console.error("Error getting company:", error);
    throw error;
  }
}
