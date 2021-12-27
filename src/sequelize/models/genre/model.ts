import { Sequelize, DataTypes, Model, Association, Optional } from "sequelize";
import Release from "../release";

interface GenreAttributes {
  id: number;
  name: string;
}

interface GenreCreationAttributes extends Optional<GenreAttributes, "id"> {}

export default class Genre extends Model<
  GenreAttributes,
  GenreCreationAttributes
> {
  public id!: number;
  public name!: string;

  public readonly releases?: Release[];

  public static associations: {
    releases: Association<Genre, Release>;
  };
}

export const initGenreModel = async function (
  sequelize: Sequelize
): Promise<void> {
  try {
    Genre.init(
      {
        id: {
          type: new DataTypes.INTEGER(),
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: new DataTypes.STRING(128),
          allowNull: false,
        },
      },
      {
        tableName: "genres",
        timestamps: false,
        underscored: true,
        sequelize,
      }
    );
    await Genre.sync({ alter: true });
  } catch (error) {
    console.error(error);
  }
};
