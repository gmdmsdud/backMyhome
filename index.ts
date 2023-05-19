import { DataSource } from "typeorm";
import { Board } from "./Board.postgres";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import cors from 'cors';
import dotenv from 'dotenv';
const express = require('express')
const app = express()

app.use(cors()) 
dotenv.config();

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
    createBoard(createBoardInput:CreateBoardInput): String
  }
`;

// api
const resolvers = {
  Query: {
    fetchBoards: async () => {
      const result = await Board.find();
      console.log(result);

      return result;
    },
  },
  Mutation: {
    createBoard: async (parent: any, args: any, context: any, info: any) => {
      await Board.insert({
        ...args.createBoardInput,
      });
      return "게시글 등록에 성공했어요";
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  
});

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port:5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
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
