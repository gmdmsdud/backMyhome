import { DataSource } from "typeorm";
import { Board } from "./Board.postgres";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// The GraphQL schema
const typeDefs = `#graphql

  input CreateBoardInput {
    writer: String
    title: String
    contents: String
  }

  type MyBoard {
    number: Int
    writer: String
    title: String
    contents: String
  }

  type Query {
    fetchBoards: [MyBoard] 
  }

  type Mutation {
    createBoard: {createBoardInput: CreateBoardInput}:String
  }
`;

// api
const resolvers = {
  Query: {
    fetchBoards: async () => {
      //모두꺼내기
      const result = await Board.find();

      //한개만 골라서꺼내기
      // const result = await Board.findOne({where: {number:3}})
      return result;
    },
  },
  Mutation: {
    createBoard: async (parent: any, args: any, context: any, info: any) => {
      await Board.insert({
        ...args.createBoardInput,
      });
      return "게시글등록에 성공";
    },
    // 3게시글을 영구로 바꿔줘
    // updateBoard: async()=> {
    //   await Board.update({number:3},{writer:"영구"},)
    //   return "게시글 수정에 성공"
    // },
    // deleteBoard: async()=>{
    //   await Board.delete({number:3})
    // return "게시글삭제에 성공 "
    // }
    // await Board.update({number:3},{isDeleted:true}); //3번게시글삭제했다 치자. 초기값이 false이면 삭제 안된것, true이면 삭제된것
    // await Board.update({number:3},{deletedAt:new Date()}) //deletedAt 초기값 null이면 삭제안된것, nuw Date()들어가 있으면 삭제된것
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // cors: {
  //   origin: [ "http:/naver.com", "http://qqq.com"]
  // }
});

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "password",
  database: "postgres2",
  synchronize: true,
  logging: true,
  entities: [Board],
});

AppDataSource.initialize()
  .then(() => {
    console.log("db성공");

    startStandaloneServer(server).then(() => {
      console.log(`🚀 Server ready `);
    });
  })
  .catch((error) => {
    console.log("db접속에 실패");
    console.log(error);
  });
