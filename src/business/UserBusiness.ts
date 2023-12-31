import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { HashManager } from "../services/HashManager";
import { UserDatabase } from "../database/UserDatabase";
import { SignUpInputDTO, SignUpOutputDTO } from "../dtos/user/signup.dto";
import { TokenPayload, USER_ROLES, User } from "../models/User";
import { LoginInputDTO, LoginOutputDTO, LoginSchema } from "../dtos/user/login.dto";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";

export class UserBusiness {
    constructor(
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) { }

    public signup = async (input: SignUpInputDTO): Promise<SignUpOutputDTO> => {
        const { name, email, password } = input

        const id = this.idGenerator.generate()

        const hashedPassword = await this.hashManager.hash(password)

        const user = new User(
            id,
            name,
            email,
            hashedPassword,
            USER_ROLES.NORMAL,
            new Date().toISOString()
        )
        const userDB = user.toDBModel()
        await this.userDatabase.insertUser(userDB)

        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

        const token = this.tokenManager.createToken(payload)

        const output: SignUpOutputDTO = {
            token
        }

        return output
    }

    public login = async (input: LoginInputDTO
    ): Promise<LoginOutputDTO> => {
        const { email, password } = input

        const userDB = await this.userDatabase.findUserByEmail(email)

        if (!userDB) {
            throw new BadRequestError("Email ou senha invalido")
        }

        const user = new User(
            userDB.id,
            userDB.name,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at
        )

        const hashedPassword = user.getPassword()

        const isPasswordCorrect = await this.hashManager.compare(password, hashedPassword)

        if (!isPasswordCorrect) {
            throw new BadRequestError("Email ou senha invalido")
        }

        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

        const token = this.tokenManager.createToken(payload)

        const output: LoginOutputDTO = {
            token
        }

        return output
    }



}
