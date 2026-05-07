import type React from "react";
import type { Footballer } from "src/queries/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getFootballersImage } from "src/utils/images";

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
    <AvatarImage
      className={`rounded-lg object-cover object-top ${imageClassName ?? ""}`}
      src={getFootballersImage(footballer.code)}
    />
    <AvatarFallback>{footballer.code}</AvatarFallback>
  </Avatar>
);

export default FootballerAvatar;
