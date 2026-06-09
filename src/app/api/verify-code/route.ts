import dbConnect from "@/lib/dbConnected";
import userModel from "@/model/User.model";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await userModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 },
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpiry = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpiry) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account Verified Successfully",
        },
        { status: 200 },
      );
    } else if (!isCodeNotExpiry) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code is expired, please signup again to get a new code",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Verification code is incorrect",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error verifying code api", error);

    return Response.json(
      {
        success: false,
        message: "Error verifying code api",
      },
      { status: 500 },
    );
  }
}
