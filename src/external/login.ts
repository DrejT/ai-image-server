import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();

type user = {
    username:string;
    password:string;
};

export default async function loginValidate(username:string, password:string){
    const user = await Prisma.user.findUnique({
        where:{name:username},
        select:{
          passwordHash: true,
          id: true,
        }
    });
    if (!user) {
        return null;
      }
    
      if (password === user.passwordHash){
        return { "id": user.id, "username":username };
      }
      else {
        return null;
      }    
} 