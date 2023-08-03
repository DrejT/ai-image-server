import { PrismaClient } from "@prisma/client";


const Prisma = new PrismaClient();

type registerForm = {
    username:string;
    password:string;
    email:string;
}

export default async function registerValidate({username,password,email}:registerForm){
    const userexists = await Prisma.user.findUnique({
        where:{name:username},
        select:{
            email:true
        }
    })
    console.log(userexists);
    return {}
}