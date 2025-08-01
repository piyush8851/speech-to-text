import React, { useRef, useState, type JSX } from "react";

interface AudioUploaderProps {
  onUpload: (files: FileList | File[]) => void;
}

export default function AudioUploader({
  onUpload,
}: AudioUploaderProps): JSX.Element {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      fileInput.current?.click();
    }
  };

  return (
    <div
      className={`upload-container ${dragActive ? "drag-active" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
      aria-label="Drag and drop audio file or click to upload"
      onClick={() => fileInput.current?.click()}
      onKeyDown={handleKeyDown}
    >
      <input
        ref={fileInput}
        type="file"
        accept="audio/*"
        multiple // <-- Enable multiple file selection
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <p>Drag & drop audio files here, or click to select files</p>
      <button className="upload-btn" type="button">
        Upload Audio
      </button>
    </div>
  );
}
