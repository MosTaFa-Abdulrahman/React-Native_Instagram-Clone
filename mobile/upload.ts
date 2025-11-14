import axios from "axios";

// Function to determine if a file is an image or video
const getUploadUrl = (file: any): string => {
  const type = file.type || "image/jpeg";
  if (type.startsWith("image/")) {
    return "https://api.cloudinary.com/v1_1/dkqpzws52/image/upload";
  } else if (type.startsWith("video/")) {
    return "https://api.cloudinary.com/v1_1/dkqpzws52/video/upload";
  } else {
    throw new Error("Unsupported file type");
  }
};

const upload = async (file: any): Promise<string | undefined> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "upload");

  try {
    const uploadUrl = getUploadUrl(file);
    const uploadRes = await axios.post(uploadUrl, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const { url } = uploadRes.data;

    return url as string;
  } catch (error: any) {
    console.log("Upload error:", error.message);
    throw error;
  }
};

export default upload;
