import z from 'zod'

export interface LikeOrDislikePostInputDTO {
    postId: string,
    token: string,
    like: boolean
}

export type LikeOrDislikePostOutputDTO = undefined

export const LikeOrDislikePostchema = z.object({
    postId: z.string().min(1),
    token: z.string().min(1),
    like: z.boolean()
})
