import express from 'express'
import { UserController } from '../controller/UserController'
import { UserBusiness } from '../business/UserBusiness'
import { UserDatabase } from '../database/UserDatabase'
import { IdGenerator } from '../services/IdGenerator'
import { TokenManager } from '../services/TokenManager'
import { HashManager } from '../services/HashManager'

export const userRouter = express.Router()

const userControler = new UserController(
    new UserBusiness(
        new UserDatabase,
        new IdGenerator,
        new TokenManager,
        new HashManager
    )
)

userRouter.post("/signup", userControler.signup)

userRouter.post("/login", userControler.login)