import { PostDatabase } from "../database/PostDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/post/createPost.dto";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { Post } from "../models/Post";
import { GetPostsInputDTO, GetPostsOutputDTO } from "../dtos/post/getPost.dto";
import { EditPostInputDTO, EditPostOutputDTO } from "../dtos/post/editPost.dto";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { DeletePostInputDTO, DeletePostOutputDTO } from "../dtos/post/deletePost.dto";
import { USER_ROLES } from "../models/User";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public createPost = async (input: CreatePostInputDTO): Promise<CreatePostOutputDTO> => {
        const { content, token } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const id = this.idGenerator.generate()

        const post = new Post(
            id,
            content,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString(),
            payload.id,
            payload.name
        )

        const postDB = post.toDBModel()

        await this.postDatabase.insertPost(postDB)

        const output: CreatePostOutputDTO = undefined

        return (output)

    }

    public getPosts = async (input: GetPostsInputDTO): Promise<GetPostsOutputDTO> => {
        const { token } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postsDBWithCreatorName =
            await this.postDatabase.getPostsWithCreatorName()

        const postsModel = postsDBWithCreatorName.map((postWithCreatorName) => {
            const post = new Post(
                postWithCreatorName.id,
                postWithCreatorName.content,
                postWithCreatorName.likes,
                postWithCreatorName.dislikes,
                postWithCreatorName.created_at,
                postWithCreatorName.updated_at,
                postWithCreatorName.creator_id,
                postWithCreatorName.creator_name
            )
            return post.toBusinessModel()
        })

        const output: GetPostsOutputDTO = postsModel

        return output
    }

    public editPost = async (input: EditPostInputDTO): Promise<EditPostOutputDTO> => {
        const { content, token, idToEdit } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToEdit)

        if (!postDB) {
            throw new NotFoundError("Não exite post com essa Id")
        }

        if (payload.id !== postDB.creator_id) {
            throw new ForbiddenError("Você não tem permissão para editar esse post.")
        }

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at,
            postDB.creator_id,
            payload.name
        )

        post.setContent(content)

        const updatedPostDB = post.toDBModel()

        await this.postDatabase.updatePost(updatedPostDB)

        const output: EditPostOutputDTO = undefined

        return output

    }

    public deletePost = async (input: DeletePostInputDTO): Promise<DeletePostOutputDTO> => {
        const { idToDelete, token } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("Não exite post com essa Id")
        }
        if (payload.role !== USER_ROLES.ADMIN) {

            if (payload.id !== postDB.creator_id) {
                throw new ForbiddenError("Você não tem permissão para editar esse post.")
            }
        }

        await this.postDatabase.deletePostById(idToDelete)

        const output: DeletePostOutputDTO = undefined

        return output

    }

}