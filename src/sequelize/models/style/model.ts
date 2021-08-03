import {
    Sequelize,
    DataTypes,
    Model,
    Association,
    Optional
} from "sequelize"
import Release from "../release"

interface StyleAttributes {
    id: number;
    name: string;
}

interface StyleCreationAttributes extends Optional<StyleAttributes, "id"> { }

export default class Style extends Model<StyleAttributes, StyleCreationAttributes> {
    public id!: number;
    public name!: string;

    public readonly releases?: Release;

    public static associations: {
        releases: Association<Style, Release>
    }
}

export const initStyleModel = async function (sequelize: Sequelize): Promise<void> {
    try {
        Style.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: new DataTypes.STRING(128),
                allowNull: false,
            },
        }, {
            tableName: "styles",
            timestamps: false,
            underscored: true,
            sequelize
        })
        await Style.sync({ alter: true })
    } catch (error) {
        console.error(error)
    }
}