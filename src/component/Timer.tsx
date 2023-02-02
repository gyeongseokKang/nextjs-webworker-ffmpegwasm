import React, { useEffect, useState } from "react";

const Timer: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let intervalId = setInterval(() => {
      setTime(new Date());
    }, 10);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {time.toLocaleTimeString()} : {time.getMilliseconds()}
    </div>
  );
};

export default Timer;
