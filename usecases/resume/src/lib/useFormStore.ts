import { create } from "zustand";
import { ResumeFormType } from "@/db/cvs";

interface ResumeStore {
  resumeData: ResumeFormType;
  setResumeData: (data: ResumeFormType) => void;
  removeWorkExperience: (index: number) => void;
  removeEducation: (index: number) => void;
  resetResumeData: () => void;
}

const initialData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    dob: "",
    image: "",
    nationality: "",
    gender: "",
    aboutMe: "",
    email: "",
    phone: "",
    address: "",
  },
  workExperiences: [
    {
      position: "",
      employer: "",
      from: "",
      to: "",
      city: "",
      country: "",
      summary: "",
    },
  ],
  educations: [
    {
      title: "",
      institutionName: "",
      website: "",
      from: "",
      to: "",
      city: "",
      country: "",
    },
  ],
};

const useResumeFormStore = create<ResumeStore>((set) => ({
  resumeData: initialData,
  setResumeData: (data) => set({ resumeData: data }),
  removeWorkExperience: (index: number) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperiences: state.resumeData.workExperiences.filter(
          (_, i) => i !== index,
        ),
      },
    })),
  removeEducation: (index: number) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        educations: state.resumeData.educations.filter((_, i) => i !== index),
      },
    })),
  resetResumeData: () =>
    set({
      resumeData: initialData,
    }),
}));
export default useResumeFormStore;
