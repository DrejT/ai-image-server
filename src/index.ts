import { PrismaClient } from "@prisma/client";
import express, { json } from 'express'
import { generate } from "./external/image"
import loginValidate from "./external/login";
import registerValidate from "./external/register";
import { getImageUrl } from "./external/imageupload";

const app = express();
const Prisma = new PrismaClient();

app.use(express.json());
// GET request to fetch all the posts from the database

app.get('/feed',async (req,res) => {
    const posts = await Prisma.post.findMany();
    res.json(posts);
})

app.get(`/post/:id`, async (req, res) => {
    const { id } = req.params
    const post = await Prisma.post.findUnique({
      where: { id: Number(id) },
    });
    res.json(post);
  })

app.get('/user/:name',async (req,res) => {
    const {name} = req.params;
    console.log(name);
    if (typeof name === "string"){
        const user = await Prisma.user.findUnique({
            where: {name:String(name)},
            include: {
                posts:true,
            }
        });
        if (user!==null){
            user!.passwordHash = "";
            user!.email = "";
            console.log(user);
            res.json(user);
        } else {
            return res.json(null);
        }
    }
})

app.get("/generate/:prompt",async (req,res) => {
    const {prompt} = req.params;
    const image = await generate(prompt);
    res.json({
        "image":image,
        "prompt":prompt
    })
})

// POST request to post an image from a user
app.post("/post/upload/",async (req,res) => {
    const {imageData,prompt,username} = req.body;
    console.log(prompt,username);
    const user = await Prisma.user.findUnique({
        where:{name:String(username)}
    })
    // const useremail = user?.email;
    const url = await getImageUrl(imageData);
    console.log(url)
    const newPost = await Prisma.post.create({
        data: {
            prompt:prompt,
            imageUrl:url,
            author: { connect: { 
                name: username,
            }}
        }
    });
    newPost?res.json(true):res.json(null);
})


// route to login an existing user
app.post("/login",async (req,res) => {
    const {username, password} = req.body;
    if ((typeof username === "string") &&
        (typeof password === "string")) {
            const loginData = await loginValidate(username,password);
            console.log(loginData);
            res.json(loginData);
        }
        else {
            res.json("Please fill valid values into the form.")
        }
    }
)

app.post("/register",async (req,res) => {
    const {username, password, email} = req.body;
        if ( (typeof username === "string") &&
        (typeof email === "string") &&
        (typeof password === "string")) {
            const registerData = await registerValidate({username,password,email});
            res.json(registerData);
        }
        else {
            res.json("Please input valid values into the form.")
        }
    }
)





app.listen(8080, () => {
    console.log("started server on port 8080")
})