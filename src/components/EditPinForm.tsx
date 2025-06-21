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
  width: 350px;
  max-height: 80vh;
  overflow-y: auto;
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

const TextArea = styled.textarea`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
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

  &.danger {
    background: #dc3545;
    &:hover {
      background: #c82333;
    }
  }

  &.secondary {
    background: #6c757d;
    &:hover {
      background: #5a6268;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const FileInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const CurrentImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CurrentImage = styled.img`
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
  border: 2px solid #e9ecef;
`;

const RemoveImageButton = styled.button`
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #c82333;
  }
`;

interface Pin {
  id: string;
  position: [number, number];
  name: string;
  photo: string;
  location: string;
  imagePath: string;
}

interface EditPinFormProps {
  pin: Pin;
  onSubmit: (data: {
    name: string;
    photo: string;
    location: string;
    removeImage: boolean;
  }) => void;
  onCancel: () => void;
}

const EditPinForm = ({ pin, onSubmit, onCancel }: EditPinFormProps) => {
  const [name, setName] = useState(pin.name);
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState(pin.location);
  const [removeImage, setRemoveImage] = useState(false);
  const [hasNewImage, setHasNewImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 800,
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhoto(reader.result as string);
          setHasNewImage(true);
          setRemoveImage(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        alert("Failed to compress image.");
      }
    }
  };

  const handleRemoveImage = () => {
    setRemoveImage(true);
    setPhoto("");
    setHasNewImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      photo: hasNewImage ? photo : pin.imagePath,
      location,
      removeImage,
    });
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
          <FileInputLabel htmlFor="photo-upload">
            {hasNewImage ? "Change New Photo" : "Upload New Photo"}
          </FileInputLabel>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          {hasNewImage && <FilePreview src={photo} alt="New Image Preview" />}
        </FileInputContainer>

        {!removeImage && pin.imagePath && !hasNewImage && (
          <CurrentImageContainer>
            <label>Current Image:</label>
            <CurrentImage src={pin.imagePath} alt="Current Image" />
            <RemoveImageButton type="button" onClick={handleRemoveImage}>
              Remove Current Image
            </RemoveImageButton>
          </CurrentImageContainer>
        )}

        <TextArea
          placeholder="Location Description"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <ButtonGroup>
          <Button type="button" onClick={onCancel} className="secondary">
            Cancel
          </Button>
          <Button type="submit">Update Pin</Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default EditPinForm;
