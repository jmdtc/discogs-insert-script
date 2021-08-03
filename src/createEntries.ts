import createRelease from "./sequelize/insertFunctions/Release/createRelease";

import Release from "./sequelize/models/release";
import Artist from "./sequelize/models/artist";
import Style from "./sequelize/models/style";
import Genre from "./sequelize/models/genre";
import Format from "./sequelize/models/format";
import Label from "./sequelize/models/label";
import Track from "./sequelize/models/track";

const insertGenres = async function (
  genres: any,
  insertedRelease: Release
): Promise<void> {
  if (!genres) return;
  for (const el of genres) {
    const [currentGenre] = await Genre.findOrCreate({
      where: { name: el },
    });
    await insertedRelease.addGenres([currentGenre]);
  }
};
const insertStyles = async function (
  styles: any,
  insertedRelease: Release
): Promise<void> {
  if (!styles) return;
  for (const el of styles) {
    const [currentStyle] = await Style.findOrCreate({
      where: { name: el },
    });
    await insertedRelease.addStyles([currentStyle]);
  }
};
const insertTracks = async function (
  args: any,
  insertedRelease: Release
): Promise<void> {
  const { tracks, artistsHash } = args;
  if (!tracks) return;
  const insertedTracks: Track[] = [];
  for (const { position, title, duration, artists, extraartists } of tracks) {
    const currentTrack = await Track.create({
      position: position,
      title: title,
      duration: duration,
    });
    insertedTracks.push(currentTrack);

    // TODO
    if (artists || extraartists) {
      const trackArtists = artists?.artist ?? [];
      const trackExtraArtists = extraartists?.artist ?? [];

      const insertedArtists: any = await Promise.all(
        trackArtists
          .map(async (artist: any) => {
            const junction = {
              through: {
                anv: artist.anv,
                role: artist.role,
                artist_type: "artist",
              },
            };
            const artistId = Number(artist.id);
            if (!artistsHash[artist.id]) {
              const [res] = await Artist.findOrCreate({
                where: { id: artistId },
                defaults: {
                  name: artist.name,
                },
              });
              return {
                artist: res,
                junction,
              };
            } else {
              return {
                artist: artistsHash[artistId],
                junction,
              };
            }
          })
          .concat(
            trackExtraArtists.map(async (artist: any) => {
              const junction = {
                through: {
                  anv: artist.anv,
                  role: artist.role,
                  artist_type: "extra_artist",
                },
              };
              const artistId = Number(artist.id);
              if (!artistsHash[artist.id]) {
                const [res] = await Artist.findOrCreate({
                  where: { id: artistId },
                  defaults: {
                    name: artist.name,
                  },
                });
                return {
                  artist: res,
                  junction,
                };
              } else {
                return {
                  artist: artistsHash[artistId],
                  junction,
                };
              }
            })
          )
      );

      await Promise.all(
        insertedArtists.map(({ artist, junction }: any) =>
          currentTrack.addArtist(artist, junction)
        )
      );
    }
  }
  await insertedRelease.addTracks(insertedTracks);
};
const insertFormats = async function (
  formats: any,
  insertedRelease: Release
): Promise<void> {
  if (!formats) return;
  for (const { descriptions, $ } of formats) {
    const [currentFormat] = await Format.findOrCreate({
      where: { name: $.name },
      defaults: {
        name: $.name,
        description: descriptions ? descriptions.description : null,
      },
    });
    await insertedRelease.addFormats([currentFormat]);
  }
};
const insertLabels = function () {
  const labelsHash: Record<number, Label> = {};
  return async (labels: any, insertedRelease: Release) => {
    if (!labels) return;

    let currentLabel: any;
    for (const { $ } of labels) {
      const labelId = Number($.id);
      if (!labelsHash[labelId]) {
        const [res] = await Label.findOrCreate({
          where: { id: $.id },
          defaults: {
            name: $.name,
            catno: $.catno,
          },
        });
        labelsHash[labelId] = res;
        currentLabel = res;
      } else {
        currentLabel = labelsHash[labelId];
      }
      await currentLabel.addReleases([insertedRelease]);
    }
  };
};

const insertAssociations = async function (
  release: any,
  insertedRelease: Release,
  artistsHash: Record<number, Artist>,
  labelsClosure: any
): Promise<void> {
  const { style } = release.styles || {};
  const { genre } = release.genres || {};
  const { track } = release.tracklist || {};
  const { label } = release.labels || {};
  const { format } = release.formats || {};

  const funcs = [
    {
      func: insertStyles,
      arg: style,
    },
    {
      func: insertGenres,
      arg: genre,
    },
    {
      func: insertTracks,
      arg: {
        tracks: track,
        artistsHash,
      },
    },
    {
      func: labelsClosure,
      arg: label,
    },
    {
      func: insertFormats,
      arg: format,
    },
  ];
  await Promise.all(funcs.map(({ func, arg }) => func(arg, insertedRelease)));
};

export default function () {
  const artistsHash: Record<number, Artist> = {};
  const labelsClosure = insertLabels();

  return async (release: any) => {
    try {
      const { artist } = release.artists;

      let insertedRelease: any;
      let currentArtist: any;
      for (let idx = 0; idx < artist.length; idx++) {
        const artistId = Number(artist[idx].id);
        if (!artistsHash[artistId]) {
          const [res] = await Artist.findOrCreate({
            where: { id: Number(artist[idx].id) },
            defaults: {
              name: artist[idx].name,
            },
          });
          currentArtist = res;
          artistsHash[artistId] = res;
        } else {
          currentArtist = artistsHash[artistId];
        }
        if (idx === 0) {
          insertedRelease = await createRelease(release);
          await currentArtist.addReleases([insertedRelease]);
        } else await currentArtist.addReleases([insertedRelease]);
      }
      await insertAssociations(
        release,
        insertedRelease,
        artistsHash,
        labelsClosure
      );
    } catch (error) {
      console.error(error);
    }
  };
}
