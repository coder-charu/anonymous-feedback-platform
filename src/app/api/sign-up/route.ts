import dbConnect from "@/lib/dbConnected";
import userModel from "@/model/User.model";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();

    const existingUsername = await userModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        },
      );
    }

    const existingEmail = await userModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingEmail) {
      if (existingEmail.isVerified) {
        return Response.json(
          {
            success: true,
            message: "User already exist with this email",
          },
          {
            status: 400,
          },
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingEmail.password = hashedPassword;
        existingEmail.verifyCode = verifyCode;
        existingEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new userModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        message: [],
      });

      await newUser.save();
    }

    // send otp to email

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );
    // if otp not sent to email than give error
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        },
      );
    }
    // if otp sent successfully than register user successfully into db
    return Response.json(
      {
        success: true,
        message:
          "Registration successful.Please check your email to verify your account.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log("Error registering user", error);

    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      },
    );
  }
}
