import { PostDatabase } from "../database/PostDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness {
    constructor (
        private postDatabase: PostDatabase,
        private idGeneratos: IdGenerator,
        private tokenManager: TokenManager
    ) {}
}