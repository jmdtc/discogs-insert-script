import Release from "../../models/release/model";

const formatDate = function (date: string): Date | null {
  if (!date || date === "?" || date === "") return null;
  if (Number(date.slice(5, 7)) > 12) return new Date(date.slice(0, 4));
  if (date.length === 4) return new Date(date);
  if (date.slice(5, 7) === "00") return new Date(date.slice(0, 4));
  if (date.slice(8, 10) === "00") return new Date(date.slice(0, -3));
  return new Date(date);
};

export default async function (release: any): Promise<Release> {
  const insertedRelease = await Release.create({
    id: release.$.id,
    title: release.title,
    country: release.country,
    releaseDate: formatDate(release.released),
    notes: release.notes,
    master_id: release.master_id ? release.master_id.$text : null,
  });
  return insertedRelease;
}
