"use client";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import Formfield from "./Formfield";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/Client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(4),
  });
};

const Authform = ({ type }: { type: FormType }) => {
    const router= useRouter()
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-in") {
        const {email,password}=values;

        const userCredentials = await signInWithEmailAndPassword(auth,email,password)

        const idToken=await userCredentials.user.getIdToken()

        if(!idToken){
            toast.error('Sign in failed')
            return
        }

        await signIn({email,idToken})

        toast.success('Sign In sucessfully');
        router.push('/')
      } else {

        
        const {name,email,password}=values

        const userCredentials=await createUserWithEmailAndPassword(auth,email,password);

        const result=await signUp({uid: userCredentials.user.uid,name:name!,email,password})

        if(!result?.success){
            toast.error(result?.message)
            return
        }


        toast.success('Account created  sucessfully');
        router.push('/sign-in')
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  }

  

  const isSignin = type === "sign-in";

  return (
    <div className="card-border lg:min-w[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10 ">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepTime</h2>
        </div>
        <h3>Take Mokup interviews from Ai</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignin && (
              <Formfield
                control={form.control}
                label="Name"
                name="name"
                placeholder="Your Name"
                type={"text"}
              />
            )}
            <Formfield
              control={form.control}
              label="Email"
              name="email"
              placeholder="Enter your email"
              type={"email"}
            />
            <Formfield
              control={form.control}
              label="Password"
              name="password"
              placeholder="Enter your password"
              type={"password"}
            />
            <Button className="btn" type="submit">
              {isSignin ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignin ? "No account yet:" : "Have an account already"}
          <Link
            rel="stylesheet"
            href={!isSignin ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {isSignin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Authform;
