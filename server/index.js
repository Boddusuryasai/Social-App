import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
// These two will allow use to set the path , when we configure directories;
import path from "path"; 
import { fileURLToPath } from "url";
import {register} from "./controllers/auth.js"
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js" ;

// Configurations (middlewares)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit:"30mb", extended:true}));
app.use(bodyParser.urlencoded({limit:"30mb", extended:true}));
app.use(cors());
app.use("/assets" , express.static(path.join(__dirname, "public/assets")))


//Fire storage
const storage = multer.diskStorage({
    destination:function(req, file , cb){
        cb(null , "public/assets");
    },
    filename:function(req, file , cb){
        
        cb(null , file.originalname);
    }
});
const upload = multer({storage});

//Routes with files
app.post("/auth/register", upload.single("picture"), register);

app.use("/auth" , authRoutes);
app.use("/users" , userRoutes);
app.use("/posts" , postRoutes);


//mongoose setup;
mongoose.set("strictQuery", false);
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    app.listen(PORT , ()=>console.log(`server is running at ${ PORT}`))
})
.catch((error) => {
    console.log("DB connection failed");
    console.log(error);
    process.exit(1)
})
