import {
  Sequelize,
  DataTypes,
  Model,
  Association,
  Optional,
  BelongsToManyAddAssociationMixin,
} from "sequelize";
import Artist from "../artist/model";
import Release from "../release";

interface TrackAttributes {
  id: number;
  title: string;
  duration: string;
  position: string;
  release_id: number | null;
}

interface TrackCreationAttributes
  extends Optional<TrackAttributes, "id" | "release_id"> {}

export default class Track extends Model<
  TrackAttributes,
  TrackCreationAttributes
> {
  public id!: number;
  public title!: string;
  public duration!: string;
  public position!: string;
  public release_id!: number | null;

  public readonly release?: Release;
  public readonly artists?: Artist[];

  public addArtist!: BelongsToManyAddAssociationMixin<Artist, number>;
  public addArtists!: BelongsToManyAddAssociationMixin<Artist, Artist[]>;

  public static associations: {
    release: Association<Track, Release>;
    artists: Association<Track, Artist>;
  };
}

export const initTrackModel = async function (
  sequelize: Sequelize
): Promise<void> {
  try {
    Track.init(
      {
        id: {
          type: new DataTypes.INTEGER(),
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: new DataTypes.TEXT(),
          allowNull: false,
        },
        duration: {
          type: new DataTypes.STRING(256),
          allowNull: true,
        },
        position: {
          type: new DataTypes.STRING(256),
          allowNull: true,
        },
        release_id: {
          type: new DataTypes.INTEGER(),
          allowNull: true,
        },
      },
      {
        tableName: "tracks",
        timestamps: false,
        underscored: true,
        sequelize,
      }
    );
    await Track.sync({ alter: true });
  } catch (error) {
    console.error(error);
  }
};
