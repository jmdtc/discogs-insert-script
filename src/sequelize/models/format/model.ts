import {
    Sequelize,
    DataTypes,
    Model,
    Association,
    Optional
} from "sequelize"
import Release from "../release"

interface FormatAttributes {
    id: number;
    name: string;
    description: string;
}

interface FormatCreationAttributes extends Optional<FormatAttributes, "id"> { }


export default class Format extends Model<FormatAttributes, FormatCreationAttributes> {
    public id!: number;
    public name!: string;
    public description!: string;

    public readonly releases?: Release;

    public static associations: {
        releases: Association<Format, Release>
    }
}

export const initFormatModel = async function (sequelize: Sequelize): Promise<void> {
    try {
        Format.init({
            id: {
                type: new DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: new DataTypes.STRING(256),
                allowNull: false
            },
            description: {
                type: new DataTypes.STRING(256),
                allowNull: true
            }
        }, {
            tableName: "formats",
            timestamps: false,
            underscored: true,
            sequelize
        })
        await Format.sync({ alter: true })
    } catch (error) {
        console.error(error);
    }
}