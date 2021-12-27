import { DataTypes, Sequelize } from "sequelize";
import Release, { initReleaseModel } from "./models/release";
import Artist, { initArtistModel } from "./models/artist";
import Style, { initStyleModel } from "./models/style";
import Genre, { initGenreModel } from "./models/genre";
import Format, { initFormatModel } from "./models/format";
import Label, { initLabelModel } from "./models/label";
import Track, { initTrackModel } from "./models/track";

export default async function (): Promise<Sequelize> {
  const sequelize = new Sequelize(
    "postgresql://unicorn_user:magical_password@localhost:6000/rainbow_database",
    {
      logging: false,
    }
  );

  const initModelFunctions = [
    initReleaseModel,
    initArtistModel,
    initStyleModel,
    initGenreModel,
    initFormatModel,
    initLabelModel,
    initTrackModel,
  ];
  await Promise.all(initModelFunctions.map((func) => func(sequelize)));

  // M:N Artist / Release
  Artist.belongsToMany(Release, {
    through: "artist_releases",
    as: "releases",
    timestamps: false,
  });
  Release.belongsToMany(Artist, {
    through: "artist_releases",
    as: "artists",
    timestamps: false,
  });

  // M:N Style / Release
  Release.belongsToMany(Style, {
    through: "release_styles",
    as: "styles",
    timestamps: false,
  });
  Style.belongsToMany(Release, {
    through: "release_styles",
    as: "releases",
    timestamps: false,
  });

  // M:N Genre / Release
  Release.belongsToMany(Genre, {
    through: "release_genres",
    as: "genres",
    timestamps: false,
  });
  Genre.belongsToMany(Release, {
    through: "release_genres",
    as: "releases",
    timestamps: false,
  });

  // M:N Format / Release
  const ReleaseFormats = sequelize.define(
    "release_formats",
    {
      // necessary because otherwise sequelize does not support
      // non unique associations PKEY
      id: {
        type: new DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
      },
      description: {
        type: new DataTypes.STRING(),
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
    }
  );

  Release.belongsToMany(Format, {
    through: { model: ReleaseFormats, unique: false },
    as: "formats",
    foreignKey: "release_id",
  });

  Format.belongsToMany(Release, {
    through: { model: ReleaseFormats, unique: false },
    as: "releases",
    foreignKey: "format_id",
  });

  // O:M Release / Tracks
  Release.hasMany(Track, {
    as: "tracks",
    sourceKey: "id",
    foreignKey: "release_id",
  });
  Track.belongsTo(Release, {
    as: "release",
    foreignKey: "release_id",
  });

  // M:N Label / Release with extra columns
  const LabelReleases = sequelize.define(
    "label_releases",
    {
      // necessary because otherwise sequelize does not support
      // non unique associations PKEY
      id: {
        type: new DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
      },
      catno: {
        type: new DataTypes.STRING(),
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
    }
  );

  Release.belongsToMany(Label, {
    through: { model: LabelReleases, unique: false },
    as: "labels",
    foreignKey: "release_id",
  });
  Label.belongsToMany(Release, {
    through: { model: LabelReleases, unique: false },
    as: "releases",
    foreignKey: "label_id",
  });

  // M:N Track / Artist with extra columns
  const TrackArtists = sequelize.define(
    "track_artists",
    {
      // necessary because otherwise sequelize does not support
      // non unique associations PKEY
      id: {
        type: new DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
      },
      anv: {
        type: new DataTypes.TEXT(),
        allowNull: true,
      },
      role: {
        type: new DataTypes.TEXT(),
        allowNull: true,
      },
      artist_type: {
        type: new DataTypes.STRING(),
        allowNull: false,
        validate: {
          isIn: {
            args: [["artist", "extra_artist"]],
            msg: "Wrong artist_type",
          },
        },
      },
    },
    {
      timestamps: false,
      underscored: true,
    }
  );
  Track.belongsToMany(Artist, {
    through: { model: TrackArtists, unique: false },
    as: "artists",
    foreignKey: "track_id",
  });
  Artist.belongsToMany(Track, {
    through: { model: TrackArtists, unique: false },
    as: "tracks",
    foreignKey: "artist_id",
  });

  await sequelize.sync({ force: true });
  return sequelize;
}
