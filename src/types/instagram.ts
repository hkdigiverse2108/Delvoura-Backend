export type Instagram = {
  type: "img" | "video";
  imageUrl?: string | null;
  link: string;
  videoUrl?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
};
