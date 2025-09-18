import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
