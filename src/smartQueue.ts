import { Sequelize } from "sequelize/types";
import Artist from "./sequelize/models/artist/model";
import Format from "./sequelize/models/format/model";
import Genre from "./sequelize/models/genre/model";
import Label from "./sequelize/models/label/model";
import Release from "./sequelize/models/release/model";
import Style from "./sequelize/models/style/model";
import Track from "./sequelize/models/track/model";
import { formatDate } from "./utils";

export default class SmartQueue {
  private sequelize: Sequelize;
  private releases: any[];
  private artists: any[];
  private formats: any[];
  private genres: any[];
  private labels: any[];
  private styles: any[];
  private tracks: any[];

  private lastTrackId: number;
  private lastFormatId: number;
  private lastGenreId: number;
  private lastStyleId: number;

  private artistReleasesValues: string[];
  private releaseFormatsValues: string[];
  private releaseGenresValues: string[];
  private releaseStylesValues: string[];
  private trackArtistsValues: string[];
  private labelReleasesValues: string[];

  private releaseFormatsHash: Record<string, number>;
  private releaseGenresHash: Record<string, number>;
  private releaseStylesHash: Record<string, number>;

  constructor(seq: Sequelize) {
    this.sequelize = seq;

    this.releases = [];
    this.artists = [];
    this.formats = [];
    this.genres = [];
    this.labels = [];
    this.styles = [];
    this.tracks = [];

    this.lastTrackId = 0;
    this.lastFormatId = 0;
    this.lastGenreId = 0;
    this.lastStyleId = 0;

    this.artistReleasesValues = [];
    this.releaseFormatsValues = [];
    this.releaseGenresValues = [];
    this.releaseStylesValues = [];
    this.trackArtistsValues = [];
    this.labelReleasesValues = [];

    this.releaseFormatsHash = {};
    this.releaseGenresHash = {};
    this.releaseStylesHash = {};
  }

  public length() {
    return this.releases.length;
  }

  private removeDuplicates(items: any) {
    const ids = items.map((item: any) => item.id);
    return items.filter(
      ({ id }: any, index: any) => !ids.includes(id, index + 1)
    );
  }

  public prepareData(release: any) {
    this.releases.push(this.formatRelease(release));

    for (const artist of this.removeDuplicates(release.artists.artist)) {
      this.artists.push(this.formatArtist(artist));
      this.artistReleasesValues.push(`(${artist.id}, ${release.$.id})`);
    }

    for (const label of release.labels.label) {
      this.labels.push(this.formatLabels(label.$));
      this.labelReleasesValues.push(
        `(${label.$.id}, ${release.$.id}, '${label.$.catno.replace(
          /'/g,
          '"'
        )}')`
      );
    }

    for (const genre of [
      ...new Set(release?.genres?.genre ?? []),
    ] as string[]) {
      if (!this.releaseGenresHash[genre]) {
        this.lastGenreId++;
        this.releaseGenresHash[genre] = this.lastGenreId;
      }
      this.genres.push({ name: genre, id: this.releaseGenresHash[genre] });
      this.releaseGenresValues.push(
        `(${release.$.id}, ${this.releaseGenresHash[genre]})`
      );
    }

    for (const style of release?.styles?.style
      ? ([...new Set(release.styles.style)] as string[])
      : []) {
      if (!this.releaseStylesHash[style]) {
        this.lastStyleId++;
        this.releaseStylesHash[style] = this.lastStyleId;
      }
      this.styles.push({ name: style, id: this.releaseStylesHash[style] });
      this.releaseStylesValues.push(
        `(${release.$.id}, ${this.releaseStylesHash[style]})`
      );
    }

    for (const format of release.formats.format) {
      if (!this.releaseFormatsHash[format.$.name]) {
        this.lastFormatId++;
        this.releaseFormatsHash[format.$.name] = this.lastFormatId;
      }
      this.formats.push({
        id: this.releaseFormatsHash[format],
        name: format.$.name,
      });
      this.releaseFormatsValues.push(
        `(${release.$.id}, ${this.releaseFormatsHash[format.$.name]}, '${
          format?.descriptions?.description ?? null
        }')`
      );
    }

    for (const track of release.tracklist.track) {
      this.lastTrackId++;

      this.tracks.push({
        id: this.lastTrackId,
        position: track.position ?? null,
        title: track.title,
        duration: track.duration ?? null,
        release_id: release.$.id,
      });

      for (const artist of track.artists?.artist ?? []) {
        this.artists.push(this.formatArtist(artist));
        this.trackArtistsValues.push(
          `(${this.lastTrackId}, ${artist.id},  ${
            artist.anv ? `'${artist.anv.replace(/'/g, '"')}'` : null
          }, ${
            artist.role ? `'${artist.role.replace(/'/g, '"')}'` : null
          }, 'artist')`
        );
      }

      for (const artist of track.extraartists?.artist ?? []) {
        this.artists.push(this.formatArtist(artist));
        this.trackArtistsValues.push(
          `(${this.lastTrackId}, ${artist.id}, ${
            artist.anv ? `'${artist.anv.replace(/'/g, '"')}'` : null
          }, ${
            artist.role ? `'${artist.role.replace(/'/g, '"')}'` : null
          }, 'extra_artist')`
        );
      }
    }
  }

  private formatLabels(label: any) {
    return {
      id: label.id,
      name: label.name,
    };
  }

  private formatRelease(release: any) {
    return {
      id: release.$.id,
      title: release.title,
      country: release.country,
      releaseDate: formatDate(release.released),
      notes: release.notes,
      master_id: release.master_id ? release.master_id.$text : null,
    };
  }

  private formatArtist(artist: any) {
    return {
      id: artist.id,
      name: artist.name,
    };
  }

  public async run() {
    try {
      await Promise.all([
        Release.bulkCreate(this.releases),
        Artist.bulkCreate(this.artists, {
          ignoreDuplicates: true,
        }),
        Label.bulkCreate(this.labels, {
          ignoreDuplicates: true,
        }),
        Genre.bulkCreate(this.genres, {
          ignoreDuplicates: true,
        }),
        Format.bulkCreate(this.formats, {
          ignoreDuplicates: true,
        }),
        Style.bulkCreate(this.styles, {
          ignoreDuplicates: true,
        }),
        Track.bulkCreate(this.tracks),
      ]);

      const artistReleasesQuery = `INSERT INTO artist_releases (artist_id, release_id) VALUES ${this.artistReleasesValues.join(
        ", "
      )} ;`;

      const labelReleasesQuery = `INSERT INTO label_releases (label_id, release_id, catno) VALUES ${this.labelReleasesValues.join(
        ", "
      )} ;`;

      const releaseFormatsQuery = `INSERT INTO release_formats (release_id, format_id, description) VALUES ${this.releaseFormatsValues.join(
        ", "
      )} ;`;

      const releaseGenresQuery = `INSERT INTO release_genres (release_id, genre_id) VALUES ${this.releaseGenresValues.join(
        ", "
      )} ;`;

      const releaseStylesQuery = `INSERT INTO release_styles (release_id, style_id) VALUES ${this.releaseStylesValues.join(
        ", "
      )} ;`;

      const trackArtistsQuery = `INSERT INTO track_artists (track_id, artist_id, anv, role, artist_type) VALUES ${this.trackArtistsValues.join(
        ", "
      )} ;`;

      await Promise.all([
        this.sequelize.query(artistReleasesQuery),
        this.sequelize.query(labelReleasesQuery),
        this.sequelize.query(releaseFormatsQuery),
        this.sequelize.query(releaseGenresQuery),
        this.sequelize.query(releaseStylesQuery),
        this.sequelize.query(trackArtistsQuery),
      ]);
    } catch (error: any) {
    } finally {
      this.releases = [];
      this.artists = [];
      this.labels = [];
      this.genres = [];
      this.formats = [];
      this.styles = [];
      this.tracks = [];

      this.artistReleasesValues = [];
      this.labelReleasesValues = [];
      this.releaseFormatsValues = [];
      this.releaseGenresValues = [];
      this.releaseStylesValues = [];
      this.trackArtistsValues = [];
    }
  }
}

//   const artist = await Artist.findByPk(1, {
//     include: [
//       {
//         model: Release,
//         as: "releases",
//       },
//     ],
//   });
//   for (const release of artist?.releases ?? []) {
//     console.log(release.id);
//   }
