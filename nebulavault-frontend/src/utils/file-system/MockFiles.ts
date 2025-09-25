// export const MockFiles: FileType[] = [
//   {
//     name: "Project Proposal.pdf",
//     owner: "You",
//     lastModified: "Today",
//     fileSize: 230,
//     fileUnits: "KB",
//   },
//   {
//     name: "Presentation.pptx",
//     owner: "You",
//     lastModified: "Yesterday",
//     fileSize: 4.5,
//     fileUnits: "MB",
//   },
//   {
//     name: "Report.docx",
//     owner: "You",
//     lastModified: "April 1",
//     fileSize: 95,
//     fileUnits: "KB",
//   },
// ];

// const downloadFile = async () => {
//   if (!file) {
//     return;
//   }

//   const formData = new FormData();
//   formData.append("file", file);

//   setStatus("Uploading...");

//   try {
//     const res = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     console.log(data);
//     setStatus("Upload Complete");
//   } catch (e) {
//     console.error(e);
//     setStatus("Upload Failed");
//   }

//   // console.log("HERE");
//   // const url = URL.createObjectURL(file);
//   // const link = document.createElement("a");
//   // link.href = url;
//   // link.download = file.name;
//   // link.click();
//   // URL.revokeObjectURL(url);
// };
