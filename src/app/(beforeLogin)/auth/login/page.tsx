"use client";

import Image from "next/image";
import Logo from "../../../../../public/images/logo.png";
import Link from "next/link";
import { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Page() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axiosInstance.get("/users/login", {
                params: {
                    email,
                    password,
                },
            });

            if (response.data) {
                // 토큰을 로컬 스토리지에 저장
                localStorage.setItem(
                    "access_token",
                    response.data.access_token
                );
                localStorage.setItem("token_type", response.data.token_type);

                await Swal.fire({
                    title: "로그인에 성공하였습니다!",
                    icon: "success",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#3699ff",
                });
                router.push("/");
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                await Swal.fire({
                    title: "존재하지 않는 계정입니다.",
                    icon: "error",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#3699ff",
                });
            } else {
                await Swal.fire({
                    title: "로그인 중 오류가 발생했습니다.",
                    icon: "error",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#3699ff",
                });
            }
        }
    };

    return (
        <div className="w-[22rem] mx-auto flex flex-col items-center justify-center min-h-screen">
            <Image src={Logo} alt="logo" width={300} className="mb-[4.5rem]" />
            <form onSubmit={handleSubmit} className="animate-fade-in w-full">
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <h1 className="text-[1.7rem] font-bold mb-9 text-slate-700">
                    로그인
                </h1>
                <input
                    type="text"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 p-6 bg-slate-100 rounded-[0.75rem] mb-6 outline-none"
                />
                <div className="w-full flex relative mb-6">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-14 p-6 bg-slate-100 rounded-[0.75rem] outline-none"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="flex items-center justify-center absolute w-12 h-full right-0 bg-[#e1f0ff] rounded-tr-[0.75rem] rounded-br-[0.75rem]"
                    >
                        {showPassword ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18"
                                viewBox="0 -960 960 960"
                                width="18"
                                fill="#3699ff"
                            >
                                <path d="M630.922-441.078 586-486q9-49.693-28.346-89.346Q520.307-615 466-606l-44.922-44.922q13.538-6.077 27.769-9.115 14.23-3.039 31.153-3.039 68.076 0 115.576 47.5T643.076-500q0 16.923-3.039 31.538-3.038 14.615-9.115 27.384Zm127.231 124.462L714-358q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-46.614-46.614q37.923-15.077 77.461-22.231 39.538-7.154 81.153-7.154 140.615 0 253.614 77.538 113 77.539 164.846 202.461-22.231 53.615-57.423 100.076-35.192 46.461-82.884 83.308Zm32.308 231.383L628.616-245.848q-30.769 11.385-68.192 18.616Q523-220.001 480-220.001q-140.999 0-253.614-77.538Q113.771-375.078 61.54-500q22.154-53 57.231-98.885 35.077-45.884 77.231-79.576l-110.77-112 42.154-42.153 705.228 705.228-42.153 42.153ZM238.155-636.309q-31.692 25.231-61.654 60.655Q146.539-540.231 128-500q50 101 143.5 160.5T480-280q27.308 0 54.386-4.616 27.077-4.615 45.923-9.538l-50.616-51.847q-10.231 4.153-23.693 6.615-13.461 2.462-26 2.462-68.076 0-115.576-47.5T316.924-500q0-12.154 2.462-25.423 2.462-13.27 6.615-24.27l-87.846-86.616ZM541-531Zm-131.768 65.769Z"></path>
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18"
                                viewBox="0 -960 960 960"
                                width="18"
                                fill="#3699ff"
                            >
                                <path d="M480.091-336.924q67.985 0 115.485-47.59 47.5-47.591 47.5-115.577 0-67.985-47.59-115.485-47.591-47.5-115.577-47.5-67.985 0-115.485 47.59-47.5 47.591-47.5 115.577 0 67.985 47.59 115.485 47.591 47.5 115.577 47.5ZM480-392q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm.055 171.999q-137.977 0-251.439-76.115Q115.155-372.231 61.54-500q53.615-127.769 167.022-203.884 113.406-76.115 251.383-76.115t251.439 76.115Q844.845-627.769 898.46-500q-53.615 127.769-167.022 203.884-113.406 76.115-251.383 76.115ZM480-500Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"></path>
                            </svg>
                        )}
                    </button>
                </div>
                <div className="w-full flex justify-between items-center mb-8">
                    <Link
                        href="#"
                        className="text-slate-500 text-sm hover:text-[#3699ff]"
                    >
                        비밀번호 찾기
                    </Link>
                    <button
                        type="submit"
                        className="bg-[#3699ff] hover:bg-[#1086ff] px-6 py-3 text-sm text-white rounded-[0.75rem]"
                    >
                        로그인
                    </button>
                </div>
                <div className="flex gap-2 items-center justify-content">
                    <span className="text-slate-500 text-sm">
                        아직 계정이 없으신가요?
                    </span>
                    <Link
                        href="/auth/registration"
                        className="text-[#3699ff] hover:text-[#1086ff] text-sm"
                    >
                        회원가입
                    </Link>
                </div>
            </form>
        </div>
    );
}
