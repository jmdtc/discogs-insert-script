import {
    Sequelize,
    DataTypes,
    Model,
    Association,
    HasManyAddAssociationMixin
} from "sequelize"
import Release from "../release"

interface LabelAttributes {
    id: number;
    name: string;
    catno: string;
}

export default class Label extends Model<LabelAttributes, {}> {
    public id!: number;
    public name!: string;
    public catno!: string;

    public readonly releases?: Release;

    public addReleases!: HasManyAddAssociationMixin<Release, Release[]>

    public static associations: {
        releases: Association<Label, Release>
    }
}

export const initLabelModel = async function (sequelize: Sequelize): Promise<void> {
    try {
        Label.init({
            id: {
                type: new DataTypes.INTEGER,
                primaryKey: true
            },
            name: {
                type: new DataTypes.STRING,
                allowNull: false
            },
            catno: {
                type: new DataTypes.STRING(256),
                allowNull: false
            }
        }, {
            tableName: "labels",
            timestamps: false,
            underscored: true,
            sequelize
        })
        await Label.sync({ alter: true })
    } catch (error) {
        console.error(error);
    }
}