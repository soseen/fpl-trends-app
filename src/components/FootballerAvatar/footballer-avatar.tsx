import type React from "react";
import type { Footballer } from "src/queries/types";
import { Avatar } from "@/components/ui/avatar";
import FootballerImage from "../FootballerImage/footballer-image";

type Props = {
  footballer: Footballer;
  size?: number;
  styles?: React.CSSProperties;
  className?: string;
  imageClassName?: string;
};

const FootballerAvatar = ({
  footballer,
  size,
  styles,
  className,
  imageClassName,
}: Props) => (
  <Avatar
    className={`flex justify-center ${className ?? ""}`}
    style={{ height: size ?? 12, width: size ?? 12, ...styles }}
  >
    <FootballerImage
      code={footballer.code}
      size="small"
      className={`h-full w-full rounded-lg object-cover object-top ${imageClassName ?? ""}`}
    />
  </Avatar>
);

export default FootballerAvatar;
