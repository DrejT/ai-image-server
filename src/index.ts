import { PrismaClient } from "@prisma/client";
import express, { json } from 'express'
import { generate } from "./external/image"
import loginValidate from "./external/login";
import registerValidate from "./external/register";
import { getImageUrl } from "./external/imageupload";

const app = express();
const Prisma = new PrismaClient();



app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb'}));

app.use(express.json());

// GET request to fetch all the posts from the database
app.get('/feed',async (req,res) => {
    const posts = await Prisma.post.findMany(); // find all the posts from the Post model in the db
    res.json(posts); 
})

// takes a userid as the params and returns the requested post of the current user
app.get(`/post/:id`, async (req, res) => {
    const { id } = req.params
    const post = await Prisma.post.findUnique({
      where: { id: Number(id) },
    });
    res.json(post);
  })

app.get("/search/:username",async (req,res) => {
    const {username} = req.params;
    const user = await Prisma.user.findUnique({
        where:{name:username},
        include:{
            posts:true
        }
    });
    if (user){
        user.email = "";
        user.passwordHash = "";
        user.posts = []
        res.json(user);
    } else {
        res.json(null);
    }
})

// takes the username as params and returns data realted to the requested user
app.get('/user/:name',async (req,res) => {
    const {name} = req.params;
    if (typeof name === "string"){
        const user = await Prisma.user.findUnique({
            where: {name:String(name)},
            include: {
                posts:true, // includes the posts by the specified user
            }
        });
        // the returned user obj also includes the passwordHash field which contains the 
        // password of the user and hence has to be removed by replacing with an empty string 
        // instead. 
        if (user!==null){
            user!.passwordHash = "";
            user!.email = "";
            console.log(user);
            res.json(user);
        } else {
            res.json(null);
        }
    }
})

// Takes the user prompt as the params passes the prompt to the generate function which 
// makes a request to the stability ai api and return a base64 string
app.get("/generate/:prompt",async (req,res) => {
    const {prompt} = req.params;
    console.log(prompt);
    const image = await generate(prompt);
    res.json({
        "image":image,
        "prompt":prompt
    })
})

// This is the route used to post an image from the user
// the post request expects the username returned from the getUsername function on the client side
app.post("/post/upload/",async (req,res) => {
    const {imageData,prompt,username} = req.body;
    const user = await Prisma.user.findUnique({
        where:{name:String(username)}
    })
    // const useremail = user?.email;
    const url = await getImageUrl(imageData);
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
            const loginData = await loginValidate(username,password); // validates the password and the username
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