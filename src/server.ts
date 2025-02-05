import dotenv from "dotenv";
dotenv.config();
import express, { type Express, type Request, type Response } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";
import cookieParser from "cookie-parser";
import { initDB } from "./common/services/database.service";
import { initPassport } from "./common/services/passport-jwt.service";
import { loadConfig } from "./common/helper/config.helper";
import { type IUser } from "./user/user.dto";
import errorHandler from "./common/middleware/error-handler.middleware";
import routes from "./routes";
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { rateLimiter } from "./common/helper/rate-limiter.helper";



loadConfig();
 
//swagger files config

declare global {  
  namespace Express {
    interface User extends Omit<IUser, "password"> { }
    interface Request {
      user?: User;
    }
  }
}
 
const port = 8000;

const app: Express = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(rateLimiter)
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())
app.use(cors({origin : '*', credentials : true}));

const initApp = async (): Promise<void> => {
  // init mongodb
  await initDB();

  // passport init
  //initPassport();

  
  
  // Static file serving for the JSON file

  // set base path to /api
  app.use("/api", routes);

  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });



  // error handler
  app.use(errorHandler);
  http.createServer(app).listen(port, () => {
    console.log("Server is runnuing on port", port);
  });
};

void initApp();
   