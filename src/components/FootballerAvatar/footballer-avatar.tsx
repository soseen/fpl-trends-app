import type React from "react";
import type { Footballer } from "src/queries/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getFootballersImage } from "src/utils/images";

type Props = {
  footballer: Footballer;
  size?: number;
  styles?: React.CSSProperties;
};

const FootballerAvatar = ({ footballer, size, styles }: Props) => (
  <Avatar
    className="flex justify-center"
    style={{ height: size ?? 12, width: size ?? 12, ...styles }}
  >
    <AvatarImage
      className="rounded-lg object-cover object-top"
      src={getFootballersImage(footballer.code)}
    />
    <AvatarFallback>{footballer.code}</AvatarFallback>
  </Avatar>
);

export default FootballerAvatar;
