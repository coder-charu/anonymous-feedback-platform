import mongoose from "mongoose";

// we define ki humara connection object ka type kya hoga,isConnected optional h qki ye ho bhi skta h aur nhi Bigshot_One. agar database connect hi nhi h to isConnected nhi hoga us case m lakin agar hua to uska tyoe number h
type ConnectionObject = {
  isConnected?: number;
};

// we tell here humara connection object ka type ConnectionObject h jo humne upper define kia
const connection: ConnectionObject = {};

// database connection function
async function dbConnect(): Promise<void> {
  // we check ki agar connection object m isConnected h to database already connected h
  if (connection.isConnected) {
    console.log("Already connected to Database!!");
    return;
  }
  // agar database connect nhi h to hum connect kr rhe h aur connection is isConnected m number store kr rhe h
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    connection.isConnected = db.connections[0].readyState;

    console.log("DB connected successfully!!");
  } catch (error) {
    console.log("Database connection failed!!", error);
    process.exit(1);
  }
}

export default dbConnect;
