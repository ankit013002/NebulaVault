export type FileType = {
  name: string;
  owner: string;
  lastModified: string;
  fileSize: number;
  fileUnits: string;
};

export const MockFiles: FileType[] = [
  {
    name: "Project Proposal.pdf",
    owner: "You",
    lastModified: "Today",
    fileSize: 230,
    fileUnits: "KB",
  },
  {
    name: "Presentation.pptx",
    owner: "You",
    lastModified: "Yesterday",
    fileSize: 4.5,
    fileUnits: "MB",
  },
  {
    name: "Report.docx",
    owner: "You",
    lastModified: "April 1",
    fileSize: 95,
    fileUnits: "KB",
  },
];
