import html2pdf from "html2pdf.js";

export const generatePdf = () => {
  const element = document.getElementById("resume-preview");
  if (element) {
    html2pdf().from(element).save("resume.pdf");
  }
};
