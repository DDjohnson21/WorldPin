import { useState, useRef } from "react";
import styled from "@emotion/styled";
import imageCompression from "browser-image-compression";

const FormContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 300px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const FileInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DragDropZone = styled.div<{ isDragOver: boolean }>`
  border: 2px dashed ${(props) => (props.isDragOver ? "#007bff" : "#ccc")};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: ${(props) => (props.isDragOver ? "#f8f9fa" : "white")};
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: #007bff;
    background: #f8f9fa;
  }
`;

const DragDropText = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 14px;
`;

const FilePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  display: ${(props) => (props.src ? "block" : "none")};
`;

const FileInputLabel = styled.label`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;

  &:hover {
    background: #5a6268;
  }
`;

interface PinFormProps {
  onSubmit: (data: { name: string; photo: string; location: string }) => void;
  onCancel: () => void;
}

const PinForm = ({ onSubmit, onCancel }: PinFormProps) => {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setIsProcessing(true);
      try {
        // Skip compression for small files (under 300KB)
        let processedFile = file;
        if (file.size > 300 * 1024) {
          processedFile = await imageCompression(file, {
            maxSizeMB: 0.8, // Increased for faster processing
            maxWidthOrHeight: 1500, // Increased for less resizing
            useWebWorker: true,
            fileType: "image/jpeg",
          });
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setPhoto(reader.result as string);
          setIsProcessing(false);
        };
        reader.readAsDataURL(processedFile);
      } catch (err) {
        alert("Failed to process image.");
        setIsProcessing(false);
      }
    } else {
      alert("Please select an image file.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processImageFile(files[0]);
    }
  };

  const handleDragDropClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, photo, location });
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FileInputContainer>
          <DragDropZone
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDragDropClick}
          >
            {isProcessing ? (
              <>
                <DragDropText>⏳</DragDropText>
                <DragDropText>Processing image...</DragDropText>
              </>
            ) : photo ? (
              <>
                <FilePreview src={photo} alt="Preview" />
                <DragDropText>Click or drag to change photo</DragDropText>
              </>
            ) : (
              <>
                <DragDropText>📷</DragDropText>
                <DragDropText>Drag & drop an image here</DragDropText>
                <DragDropText>or click to browse</DragDropText>
              </>
            )}
          </DragDropZone>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
            required
          />
        </FileInputContainer>
        <Input
          type="text"
          placeholder="Location Description"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <ButtonGroup>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Pin</Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default PinForm;
