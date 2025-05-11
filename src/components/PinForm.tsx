import { useState } from "react";
import styled from "@emotion/styled";

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

interface PinFormProps {
  onSubmit: (data: { name: string; photo: string; location: string }) => void;
  onCancel: () => void;
}

const PinForm = ({ onSubmit, onCancel }: PinFormProps) => {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState("");

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
        <Input
          type="text"
          placeholder="Photo URL"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          required
        />
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
