import React, { useEffect, useState } from "react";
import { Progress } from "./progress";

interface Props {
  loading: boolean;
  onFinish: () => void;
}

export default function ProgressFake({ loading, onFinish }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      const fastFinish = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(fastFinish);
            onFinish(); // avisamos al padre
            return 100;
          }
          return p + 5;
        });
      }, 20);
      return () => clearInterval(fastFinish);
    }

    const slowProgress = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        return p + 0.2;
      });
    }, 50);

    return () => clearInterval(slowProgress);
  }, [loading]);

  return <Progress value={progress} className="w-64" />;
}
