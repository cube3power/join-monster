import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean
} from 'graphql'

import Post from './Post'
import User from './User'

export default new GraphQLObjectType({
  description: 'Comments on posts',
  name: 'Comment',
  sqlTable: 'comments',
  uniqueKey: 'id',
  fields: () => ({
    id: {
      type: GraphQLInt
    },
    body: {
      description: 'The content of the comment',
      type: GraphQLString
    },
    postId: {
      type: GraphQLInt,
      sqlColumn: 'post_id'
    },
    post: {
      description: 'The post that the comment belongs to',
      type: Post,
      ...process.env.STRATEGY === 'batch' ?
        { sqlBatch: 
          { thisKey: 'id',
            parentKey: 'post_id' } } :
        { sqlJoin: (commentTable, postTable) => `${commentTable}.post_id = ${postTable}.id` }
    },
    authorId: {
      type: GraphQLInt,
      sqlColumn: 'author_id'
    },
    author: {
      description: 'The user who wrote the comment',
      type: User,
      ...process.env.STRATEGY === 'batch' ?
        { sqlBatch:
          { thisKey: 'id',
            parentKey: 'author_id' } } :
        { sqlJoin: (commentTable, userTable) => `${commentTable}.author_id = ${userTable}.id` }
    },
    likers: {
      description: 'Which users have liked this comment',
      joinTable: 'likes',
      type: User,
      sqlJoins: [
        (commentTable, likesTable) => `${commentTable}.id = ${likesTable}.comment_id`,
        (likesTable, userTable) => `${likesTable}.account_id = ${userTable}.id`
      ]
    },
    archived: {
      type: GraphQLBoolean
    },
    createdAt: {
      description: 'When this was created',
      type: GraphQLString,
      sqlColumn: 'created_at'
    }
  })
})

