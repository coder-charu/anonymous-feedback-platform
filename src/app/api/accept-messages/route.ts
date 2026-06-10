import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnected";
import userModel from "@/model/User.model";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const loggedInUser: User = session?.user as User;

  if (!session || !loggedInUser) {
    return Response.json(
      {
        success: false,
        message: "Please log in to continue",
      },
      { status: 401 },
    );
  }

  const loggedInUserId = loggedInUser._id;
  const { shouldAcceptMessages } = await request.json();

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      loggedInUserId,
      { isAcceptingMessage: shouldAcceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Unable to update message acceptance setting",
        },
        { status: 401 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message settings updated successfully",
        updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error updating message settings:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong while updating message settings",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const loggedInUser: User = session?.user as User;

  if (!session || !loggedInUser) {
    return Response.json(
      {
        success: false,
        message: "Please log in to continue",
      },
      { status: 401 },
    );
  }

  const loggedInUserId = loggedInUser._id;

  try {
    const currentUser = await userModel.findById(loggedInUserId);

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          message: "Account not found",
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: currentUser.isAcceptingMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error fetching message acceptance status:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to fetch message settings",
      },
      { status: 500 },
    );
  }
}
