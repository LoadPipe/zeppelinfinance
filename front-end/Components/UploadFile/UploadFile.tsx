import React, { useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

import upload from "@/images/upload.png";

interface UploadFileProps {
  onDrop: (acceptedFiles: any) => void;
}

const UploadFile: React.FC<UploadFileProps> = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="dropzone w-full h-full flex items-center justify-center flex-col text-center rounded-xl border border-neutral-300 gap-2"
    >
      <div>
        <Image src={upload} alt={" Upload Icon"} width={96} height={96}></Image>
        <input {...getInputProps()} />
      </div>

      <div className="leading-normal">
        <div className=" text-black font-bold text-base">
          <p>Drag your item to upload</p>
        </div>
        <div className=" text-zinc-600 text-sm font-normal leading-[21px]">
          <span> PNG, GIF, WebP, MP4 or MP3. Maximum file size 100 Mb.</span>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
