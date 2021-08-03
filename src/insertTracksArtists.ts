import { exit } from "process";
import { takeCoverage } from "v8";
import Artist from "./sequelize/models/artist/model";
import Release from "./sequelize/models/release/model";
import Track from "./sequelize/models/track/model";

const findOrInsertArtist = async (id: number, name: string) => {
  const [currentArtist] = await Artist.findOrCreate({
    where: { id: id },
    defaults: {
      name: name,
    },
  });
  return currentArtist;
};

const insertAssociation = async (
  track: Track,
  artist: any,
  type: "artist" | "extra_artist"
) => {
  const { anv, role } = artist;
  const artistInDb = await findOrInsertArtist(artist.id, artist.name);

  await track.addArtist(artistInDb, {
    through: {
      anv: anv,
      role: role,
      artist_type: type,
    },
  });
};

export default function () {
  const artistsHash: Record<number, any> = {};
  return async (release: any, insertFullRelease: any) => {
    const tracklist = release.tracklist.track;
    const releaseId = release.$.id;

    const releaseInDb = await Release.findByPk(Number(release.$.id));
    if (!releaseInDb) {
      await insertFullRelease(release);
    }

    try {
      for (const track of tracklist) {
        if (!track.artists && !track.extraartists) continue;

        const trackInDb = await Track.findOne({
          where: { release_id: Number(releaseId), title: track.title },
        });

        if (!trackInDb) continue;

        const artists = track.artists?.artist ?? [];
        const extraArtists = track.extraartists?.artist ?? [];

        const artistsProm = await Promise.all(
          artists.map(async (artist: any) => {
            if (!artistsHash[artist.id]) {
              const res = await findOrInsertArtist(artist.id, artist.name);
              artistsHash[artist.id] = res;
            }
            return insertAssociation(
              trackInDb,
              artistsHash[artist.id],
              "artist"
            );
          })
        );
        const extraArtistsProm = Promise.all(
          extraArtists.map(async (artist: any) => {
            if (!artistsHash[artist.id]) {
              const res = await findOrInsertArtist(artist.id, artist.name);
              artistsHash[artist.id] = res;
            }
            return insertAssociation(
              trackInDb,
              artistsHash[artist.id],
              "extra_artist"
            );
          })
        );

        await Promise.all([artistsProm, extraArtistsProm]);
      }
    } catch (error) {
      console.log(error);
    }
  };
}

// export default function () {
//   const artistsHash: Record<number, any> = {};
//   return async (release: any, insertFullRelease: any) => {
//     const tracklist = release.tracklist.track;
//     const releaseId = release.$.id;

//     const releaseInDb = await Release.findByPk(Number(release.$.id));
//     if (!releaseInDb) {
//       await insertFullRelease(release);
//     }

//     try {
//       const allTracksInDb = await Track.findAll({
//         where: {
//           release_id: Number(release.$.id),
//         },
//       });
//       console.log(allTracksInDb.map((track) => track.title));
//     } catch (error) {
//       console.log(error);
//     }
//   };
// }
