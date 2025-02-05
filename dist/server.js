"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_service_1 = require("./common/services/database.service");
const config_helper_1 = require("./common/helper/config.helper");
const error_handler_middleware_1 = __importDefault(require("./common/middleware/error-handler.middleware"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const rate_limiter_helper_1 = require("./common/helper/rate-limiter.helper");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, config_helper_1.loadConfig)();
const port = 8000;
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(rate_limiter_helper_1.rateLimiter);
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
    // init mongodb
    yield (0, database_service_1.initDB)();
    // passport init
    //initPassport();
    // Static file serving for the JSON file
    // set base path to /api
    app.use("/api", routes_1.default);
    app.get("/", (req, res) => {
        res.send({ status: "ok" });
    });
    // error handler
    app.use(error_handler_middleware_1.default);
    http_1.default.createServer(app).listen(port, () => {
        console.log("Server is runnuing on port", port);
    });
});
void initApp();
