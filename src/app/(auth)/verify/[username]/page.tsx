"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verifySchema } from "@/schema/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const VerifyAccount = () => {
  const router = useRouter();
  const param = useParams<{ username: string }>();
  //   zod implementation
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post("/api/verify-code", {
        username: param.username,
        code: data.code,
      });

      toast("Success", {
        description: response.data.message,
      });

      router.replace("sign-in");
    } catch (error) {
      console.log("Error in verify page:", error);
      const axiosError = error as AxiosError<ApiResponse>;

      let errorMessage = axiosError.response?.data.message;

      toast("Verify failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 via-purple-300 to-pink-300">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md ">
        {/* upper part design */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-purple-900">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        {/* form part design */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Verification Code</FieldLabel>

                <Input {...field} />
              </Field>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-purple-950 hover:bg-purple-700"
          >
            Verify
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
