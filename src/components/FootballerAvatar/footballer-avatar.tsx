import React from "react";
import { Footballer } from "src/queries/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getFootballersImage } from "src/utils/images";

type Props = {
  footballer: Footballer;
  size?: number;
};

const FootballerAvatar = ({ footballer, size }: Props) => (
  <Avatar
    className={`flex justify-center`}
    style={{ height: size ? size : 12, width: size ? size : 12 }}
  >
    <AvatarImage
      className="rounded-lg object-cover object-top"
      src={getFootballersImage(footballer.code)}
    />
    <AvatarFallback>{footballer.code}</AvatarFallback>
  </Avatar>
);

export default FootballerAvatar;
