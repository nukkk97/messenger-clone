'use client'

import type { User } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FieldValues, SubmitHandler} from "react-hook-form";
import { useForm } from "react-hook-form";
import axios from "axios";
//import toast from "react-hot-toast";
import Modal from "../Modal";
import Input from "../input/Input";
import Image from "next/image";
import { CldUploadButton} from "next-cloudinary";
import type {CldUploadWidgetResults} from "next-cloudinary";
import Button from "../Button";

interface SettingsModalProps {
    isOpen?: boolean;
    onClose: () => void;
    currentUser: User;
}

function SettingsModal({
    isOpen,
    onClose,
    currentUser,
}: SettingsModalProps){
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: currentUser?.name,
            image: currentUser?.image
        }
    });

    const image = watch('image');
    const handleUpload = (result: CldUploadWidgetResults) => {
        if (result && typeof result.info === 'object' && 'secure_url' in result.info) {
            setValue('image', result.info.secure_url, {
                shouldValidate: true
            });}
    }

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        axios.post('/api/settings', data)
            .then(() => {
                router.refresh();
                onClose();
            })
            //.catch(() => toast.error('something went wrong!'))
            .finally(() => setIsLoading(false))
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">我的檔案</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">編輯個人檔案</p>
                        <div className="mt-10
                        flex
                        flex-col
                        gap-y-8">
                            <Input
                            disabled
                            label="使用者名稱 (*目前尚未開放更改名稱)"
                            id="name"
                            errors={errors}
                            required
                            register={register}
                            />
                        </div>
                        &nbsp;
                        <label className="block
                        text-sm
                        font-medium
                        leading-6
                        text-gray-900">
                            大頭貼
                        </label>
                        <div className="mt-2 flex items-center gap-x-3">
                            <Image width="48"
                            height="48"
                            className="rounded-full"
                            src={image || currentUser?.image || '/images/placeholder.jpeg'}
                            alt="avatar"
                            />
                            <CldUploadButton options={{maxFiles: 1}} onUpload={handleUpload} uploadPreset="sodam1ve">
                                <Button
                                disabled={isLoading}
                                safe
                                type="button"
                                >
                                    換一張！
                                </Button>
                            </CldUploadButton>
                        </div>
                    </div>
                    <div className="mt-6
                    flex
                    items-center
                    justify-end
                    gap-x-6">
                        <Button disabled={isLoading} danger onClick={onClose}>
                            取消
                        </Button>
                        <Button disabled={isLoading} type="submit"  safe>
                            儲存
                        </Button>


                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default SettingsModal;