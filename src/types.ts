import { FindOptions as FO } from 'mongodb'

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type MongoDocument = {
    id: string
    [key: string]: any
}

export type RequiredIfPresent<T, U> = {
    [P in keyof T]: P extends keyof U ? Required<T[P]> : T[P];
};

type NonNullProjection<T extends MongoDocument> = Partial<Record<keyof T, 1 | 0>>

export type Projection<T extends MongoDocument> = NonNullProjection<T> | undefined

type GivenProjectionReturnType<T extends MongoDocument, P extends NonNullProjection<T>> =
    P extends Partial<Record<keyof T, 0>>
    ? {
        [K in keyof T as P[K] extends 0 ? never : K]: T[K]
    }
    : {
        [K in keyof T as P[K] extends 1 ? K : never]: T[K]
    };

export type ProjectionReturnType<T extends MongoDocument, P extends Projection<T>> =
    P extends NonNullProjection<T> ? GivenProjectionReturnType<T, P> : T

// export type ProjectionReturnType<T extends MongoDocument, P extends Projection<T>> =
//     P extends Partial<Record<keyof T, 0>>
//     ? {
//         [K in keyof T as P[K] extends 0 ? never : K]: T[K]
//     }
//     : (P extends Partial<Record<keyof T, 0 | 1>> ? {
//         [K in keyof T as P[K] extends 1 ? K : (
//             K extends 'id' ? (
//                 P[K] extends 0 ? never : K
//             ) :
//             never
//         )]: T[K]
//     } : T)

export type FindOptions<T extends MongoDocument, K extends Projection<T>> = Omit<FO<T>, 'projection'> & {
    projection?: K
}