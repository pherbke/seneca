"use server";
import db from "@/db";

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  try {
    return await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(
  id: string,
  email?: string,
  password?: string,
) {
  try {
    const updateData: any = {};

    if (email) {
      updateData.email = email;
    }

    if (password) {
      updateData.password = password;
    }

    const updatedUser = await db.user.update({
      where: {
        id: id,
      },
      data: updateData,
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    const deletedUser = await db.user.delete({
      where: {
        id: id,
      },
    });
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: id,
      },
      include: {
        CVs: false,
        applications: false,
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}
