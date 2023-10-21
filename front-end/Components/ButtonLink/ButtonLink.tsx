import Image from "next/image";
import React from "react";
import Link from "next/link";
import { StaticImageData } from "@/node_modules/next/image";

interface ButtonLinkProps {
  href: string;
  src?: StaticImageData;
  children?: string;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({ href, src, children }) => {
  return (
    <div className="text-zinc-600 text-sm">
      <Link href={href}>
        {src ? (
          <Image src={src} alt={"icon social"} height={22} width={22} />
        ) : (
          children
        )}
      </Link>
    </div>
  );
};

export default ButtonLink;
