import React from "react";
import { useFormStatus } from "react-dom";

interface FormSubmissionButtonProps {
  content: string;
  altContent: string;
}

function FormSubmissionButton({
  content,
  altContent,
}: FormSubmissionButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn btn-neutral mt-4"
      type="submit"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="loading loading-spinner mr-2" />
          {altContent}
        </>
      ) : (
        content
      )}
    </button>
  );
}

export default FormSubmissionButton;
