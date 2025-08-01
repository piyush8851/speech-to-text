import type { JSX } from "react";

interface NotificationProps {
  type: "error" | "success";
  message: string;
}

export default function Notification({
  type,
  message,
}: NotificationProps): JSX.Element {
  return (
    <div
      className={`notification ${type === "error" ? "error" : "success"}`}
      role="alert"
    >
      {message}
    </div>
  );
}
