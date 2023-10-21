import "./RowLayout.css";
import { ReactNode } from "react";

interface RowLayoutProps {
  children: ReactNode;
  fit?: boolean;
}

const RowLayout = ({ children, fit = false }: RowLayoutProps) => {
  return <div className={`row_max ${fit ? "px-[80px]" : ""}`}>{children}</div>;
};

export default RowLayout;
