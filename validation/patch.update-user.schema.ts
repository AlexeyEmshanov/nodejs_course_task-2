import * as Joi from "joi";
import {ContainerTypes, ValidatedRequestSchema} from "express-joi-validation";
import {IUserWithOptionalFields} from "../types/user_type";

const bodySchemaForUpdateUser = Joi.object({
  login: Joi.string(),
  password: Joi.string().alphanum(),
  age: Joi.number().min(4).max(130),
  isDeleted: Joi.boolean()
});

const paramsSchemaForUpdateUser = Joi.object({
  id: Joi.string().guid({version: 'uuidv4'}).required()
})

interface UpdateUserSchema extends ValidatedRequestSchema {
  [ContainerTypes.Body]: IUserWithOptionalFields,
  [ContainerTypes.Params]: { id: string }
}

export { bodySchemaForUpdateUser, paramsSchemaForUpdateUser, UpdateUserSchema };
