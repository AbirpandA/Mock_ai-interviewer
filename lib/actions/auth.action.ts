"use server";

import { auth, db} from "@/firebase/admin";
import { cookies } from "next/headers";


const oneWeek= 60*60*24*7


export async function signUp(params:SignUpParams){
    const {uid,name,email}=params

    try{
        const userRecord=await db.collection('users').doc(uid).get()

        if(userRecord.exists){
            return{
                success:false,
                message:'User already exists . Please signIn instead'
            }
        }

        await db.collection('users').doc(uid).set({
            name,email
        })

        return{
            success:true,
            message:'signUp successfull Please signIn'
        }

        

    }catch(err:any){
        console.error('Error Creating a user',err)

        if(err.code==='auth/email-already-exists'){
            return{
                success:false,
                message:'Email is already in use'
            }

        }

        return{
            success:false,
            message:'Failed to create an Account'
        }
    }

}

export async function signIn(params:SignInParams) {
    const {email,idToken}=params
    try{
        const userRecord=await auth.getUserByEmail(email)

        if(!userRecord){
            return{
                success:false,
                message:'User does not exist .Please create an account'
            }
        }

        await setSessionCookie(idToken)
    }catch(err){
        console.log(err)

        return{
            success:false,
            message:'Failed to log into an account'
        }
    }
}

export async function setSessionCookie(idToken:string){
    const cookieStore= await cookies()

    const sessionCookie= await auth.createSessionCookie(idToken,{
        expiresIn:oneWeek*1000,

    })

    cookieStore.set('session',sessionCookie,{
        maxAge:oneWeek,
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        path:'/',
        sameSite:"lax"
    })
}


export async function getCurrentUser():Promise< User|null>{
    const cookieStore=await cookies()
    
    try{
        const sessionCookie=cookieStore.get('session')?.value;
        if(!sessionCookie)return null

        const decodedClaims=await auth.verifySessionCookie(sessionCookie,true);

        const userRecord=await db.collection('users').doc(decodedClaims.uid).get()

        if(!userRecord.exists) return null

        return{
            ...userRecord.data(),
            id:userRecord.id
        }as User



    }catch(err){
        console.log(err)
        return null
    }
}

export async function isAuthenticated(){
    const user=await getCurrentUser();

    return !!user;
}


