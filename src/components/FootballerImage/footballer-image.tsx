import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { CircleUserRound } from "lucide-react";
import {
  FOOTBALLER_IMAGE_DIMENSIONS,
  type FootballerImageSize,
  getFootballersImage,
} from "src/utils/images";

type Props = {
  code: number;
  className?: string;
  alt?: string;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  mobileSize?: FootballerImageSize;
  size?: FootballerImageSize;
};

// Renders the player photo with a graceful fallback when the FPL CDN
// 404s. Two failure modes worth knowing about:
//
// 1. Browser cache: if the photo is already cached, the <img> can fire
//    `load` (or `error`) before React attaches its handlers — onLoad
//    never runs, so the element stays at opacity-0 forever and the
//    card looks empty. The post-mount effect below covers this by
//    inspecting `img.complete` + `naturalWidth` directly.
//
// 2. Cached 404: same problem in reverse — onError doesn't fire on a
//    cached failure either. `naturalWidth === 0` on a `complete` image
//    is the canonical "broken" signal.
const FootballerImage = ({
  code,
  className,
  alt = "",
  fetchPriority = "auto",
  loading = "lazy",
  mobileSize,
  size = "regular",
}: Props) => {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dimensions = FOOTBALLER_IMAGE_DIMENSIONS[size];

  // Reset whenever the player changes — without this, a transient PL CDN
  // 404 on one player would lock this component instance into the
  // placeholder for the rest of the session, even after pagination /
  // modal-reopen swaps in a player whose photo would actually load.
  useEffect(() => {
    setImageError(false);
    setLoaded(false);
  }, [code]);

  // Detect cached images that completed before React's handlers were
  // attached. Runs after each render so it catches both the initial
  // mount and post-`code`-change resets above.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0) {
      if (!imageError) setImageError(true);
    } else if (!loaded) {
      setLoaded(true);
    }
  }, [code, imageError, loaded]);

  if (imageError) {
    return (
      <CircleUserRound
        className={clsx("h-auto object-contain text-accent4", className)}
      />
    );
  }

  const img = (
    <img
      ref={imgRef}
      src={getFootballersImage(code, size)}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={clsx("object-contain", loaded ? "opacity-100" : "opacity-0", className)}
      decoding="async"
      fetchPriority={fetchPriority}
      loading={loading}
      onLoad={() => setLoaded(true)}
      onError={() => setImageError(true)}
    />
  );

  if (mobileSize && mobileSize !== size) {
    return (
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={getFootballersImage(code, mobileSize)}
        />
        {img}
      </picture>
    );
  }

  return img;
};

export default FootballerImage;
