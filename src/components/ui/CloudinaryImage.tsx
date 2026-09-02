import Image, { ImageProps } from "next/image";

type Props = ImageProps;

export function CloudinaryImage(props: Props) {
  return <Image {...props} />;
}