import express from "express";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../types/user_type";
import _ from 'lodash';
import { ValidatedRequest, createValidator} from "express-joi-validation";
import { bodySchemaForUpdateUser, paramsSchemaForUpdateUser, UpdateUserSchema } from "../validation/patch.update-user.schema";
import { bodySchemaForCreatingUser, CreateUserSchema } from "../validation/post.create-user.schema";
import {querySchemaForSuggestedUser, SuggestedUserSchema} from "../validation/get.suggested-user.schema";

const app = express();
const port = 3000;
app.listen(port, () => {
  console.log(`The application is running on ${port}`);
});

//Storage in memory (variable) with default values
let storage: Array<User> = [];
const defaultUser: User = {
  id: uuidv4(),
  login: 'abc',
  password: 'password',
  age: 38,
  isDeleted: false
};
const defaultUser2: User = {
  id: '777',
  login: 'alex',
  password: 'newPassword2',
  age: 27,
  isDeleted: false
};
const defaultUser3: User = {
  id: '111',
  login: 'alexa',
  password: 'newPassword3',
  age: 27,
  isDeleted: false
};
const defaultUser4: User = {
  id: '222',
  login: 'alexandra',
  password: 'newPassword4',
  age: 27,
  isDeleted: false
};
const defaultUser5: User = {
  id: '333',
  login: 'Tom',
  password: 'newPassword5',
  age: 27,
  isDeleted: false
};
storage.push(defaultUser, defaultUser2, defaultUser3, defaultUser4, defaultUser5);

//Validation
const validator = createValidator();

//Middlewares for handling requests
app.use(express.json()); //Body parser for requests

app.get('/', (req, res) => {
  res.send('Welcome to the test server!');
});

app.get('/users', (req, res) => {
  res.json(storage)
});

app.get('/users/:id', (req, res) => {
  let requestedUser = _.find(storage, {id: req.params.id})

  if (requestedUser) {
    res.json(requestedUser);
  } else {
    res.status(404)
      .json({message: `User with id ${req.params.id} not found`})
  }
});

app.get('/search', validator.query(querySchemaForSuggestedUser), (req: ValidatedRequest<SuggestedUserSchema>, res) => {
  const searchSubstring = req.query.loginSubstring;
  const numberOfSearchEntity = req.query.limit;
  const result: Array<User> = getAutoSuggestUsers(searchSubstring, numberOfSearchEntity);

  if (result.length > 0) {
    res.send(result)
  } else {
    res.status(400)
      .json({ message: `Users with substring \u201c${searchSubstring}\u201c at login doesn't exist at data base.`})
  }
})

app.post('/createUser', validator.body(bodySchemaForCreatingUser), (req: ValidatedRequest<CreateUserSchema>, res) => {
  const createdUser = {
    id: uuidv4(),
    ...req.body,
    isDeleted: false
  };

  if ( !_.isEmpty(req.body)) {
    storage.push(createdUser);
    res.status(200)
      .json({message: `User was successfully created with ID ${createdUser.id}!`})
  } else {
    res.status(400)
      .json({message: "User entity couldn't be empty!"})
  }
});

app.patch('/users/:id', validator.body(bodySchemaForUpdateUser), validator.params(paramsSchemaForUpdateUser), (req: ValidatedRequest<UpdateUserSchema>, res) => {
  let requestedUserIndex = storage.findIndex(user => user.id === req.params.id);

  if (requestedUserIndex > 0) {
    storage[requestedUserIndex] = {
      ...storage[requestedUserIndex],
      ...req.body
    }

    res.json({message: `User with ID: ${req.params.id} was successfully updated!`})
  } else {
    res.status(400)
      .json({message: `User with ID: ${req.params.id} doesn't exist`})
  }
});

app.delete('/users/:id', (req, res) => {
  let requestedForDeleteUserIndex = storage.findIndex(user => user.id === req.params.id);

  if (requestedForDeleteUserIndex > 0) {
    storage[requestedForDeleteUserIndex] = {
      ...storage[requestedForDeleteUserIndex],
      isDeleted: true,
    }

    res.json({message: `User with ID: ${req.params.id} was successfully deleted!`})
  } else {
    res.status(400)
      .json({message: `User with ID: ${req.params.id} doesn't exist. Deleting is impossible!`})
  }
})

function getAutoSuggestUsers(loginSubstring: string, limit: number): Array<User> {
  const filteredUsers = storage.filter((user) => (user.login).toLowerCase().includes(loginSubstring.toLowerCase()));
  const sortedUsers = filteredUsers.sort((userA, userB) => sortByLogin(userA.login, userB.login));
  return  sortedUsers.slice(0, limit);
}

function sortByLogin(a: string, b: string) {
  if (a > b) {
    return 1;
  }

  if (a < b) {
    return  -1;
  }

  return 0;
}



