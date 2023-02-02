import React from "react";

interface Props {
  progress: number;
}

const ProgressBar: React.FC<Props> = ({ progress }) => {
  return (
    <div style={{ width: "100%", height: "20px", backgroundColor: "lightgray" }}>
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "blue",
          transition: "width 0.5s ease-in-out",
        }}
      />
    </div>
  );
};

export default ProgressBar;
