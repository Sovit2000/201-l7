/* eslint-disable require-jsdoc */
"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "UserID",
      });
      // define association here
    }

    static addTodo({ title, dueDate, UserID }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        UserID,
      });
    }

    static getTodos() {
      return this.findAll();
    }

    static async overdue(UserID) {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date().toLocaleDateString("en-CA") },
          UserID,
          completed: false,
        },
      });
    }

    static async dueToday(UserID) {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      return await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: new Date().toLocaleDateString("en-CA") },
          UserID,
          completed: false,
        },
      });
    }

    static async dueLater(UserID) {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date().toLocaleDateString("en-CA") },
          UserID,
          completed: false,
        },
      });
    }

    static async remove(id, UserID) {
      return this.destroy({
        where: {
          id,
          UserID,
        },
      });
    }

    static async completedItems(UserID) {
      return this.findAll({
        where: {
          completed: true,
          UserID,
        },
      });
    }
    setCompletionStatus(receiver) {
      return this.update({ completed: receiver });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull:true,
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull:false,
        validate: {
          notNull: true,
        },
      },
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
