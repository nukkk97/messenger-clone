'use client';

import Input from "@/app/components/input/Input";
import { useCallback, useEffect, useState } from "react";
import type { FieldValues, SubmitHandler } from "react-hook-form";
import {useForm} from "react-hook-form";
import Button from "../../components/Button";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import {useRouter} from "next/navigation"

type Variant = 'LOGIN' | 'REGISTER';
function AuthForm() {
    const session = useSession();
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        if (session?.status == 'authenticated'){
            //console.log('Authenticated');
            router.push('/conversations');
            //toast.success('登登登登登入成功！');
        }
    },[session?.status, router]);



    const toggleVariant = useCallback(() => {
        if (variant == 'LOGIN') {
            setVariant('REGISTER');
        }
        else {
            setVariant('LOGIN');
        }
    }, [variant])

    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            password: '',
        }
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);
      
        if (variant === 'REGISTER') {
          axios.post('/api/register', data)
          .then(() => signIn('credentials', {
            ...data,
            redirect: false,
          }))
          .then((callback) => {
            if (callback?.error) {
              toast.error('註冊失敗！跟我的人生一樣');
            }
    
            if (callback?.ok) {
              router.push('/conversations')
              toast.success('註冊並登入成功！');
            }
          })
          .catch(() => toast.error('帳號已存在!'))
          .finally(() => setIsLoading(false))
        }
    
        if (variant === 'LOGIN') {
          signIn('credentials', {
            ...data,
            redirect: false
          })
          .then((callback) => {
            if (callback?.error) {
              toast.error('帳號或密碼錯誤！');
            }
    
            if (callback?.ok) {
              router.push('/conversations');
              toast.success('登登登登登入成功！');
            }
          })
          .finally(() => setIsLoading(false))
        }
      }

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <Input id="name" label="使用者名稱" register={register} disabled={isLoading} errors={errors} />
                    <Input id="password" label="密碼" type="password" register={register} disabled={isLoading} errors={errors} />
                    <div>
                        <Button disabled={isLoading} fullWidth type="submit">
                            {variant === 'LOGIN' ? '登入！' : '註冊！'}
                        </Button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="w-full border-t border-gray-300"></div>

                </div>
                <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
                    <div>
                        {variant == 'LOGIN' ? '第一次用Messenger喔?笑死' : '已經有帳號了?'}
                    </div>
                    <div onClick={toggleVariant} className="underline cursor-pointer"
                    >
                        {variant == 'LOGIN' ? '註冊新帳號！' : '登入！'}
                    </div>
                </div>
            </div>
        </div>

    );
}
export default AuthForm;