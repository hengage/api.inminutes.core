import mongoose from "mongoose";
import { DB_URL } from "./secrets.config";

export class DBConfig {
  private db: mongoose.Connection | undefined;

  constructor() {
    this.db = undefined;
  }

  async connect() {
    mongoose.set("strictQuery", false);
    await mongoose.connect(`${DB_URL}`);
    this.db = mongoose.connection;

    let connectionState;
    switch (this.db.readyState) {
      case 0:
        connectionState = "disconnected";
        break;
      case 1:
        connectionState = "connected";
        break;
      case 2:
        connectionState = "connecting";
        break;
      case 3:
        connectionState = "disconnecting";
        break;
      case 99:
        connectionState = "uninitiaized";
        break;
      default:
        break;
    }

    console.log(
      `DB connection state: ${this.db.readyState}(${connectionState})`,
    );
    this.db.on("error", () => {
      console.error.bind(console, "connection error:");
    });
    this.db.once("open", () => {
      console.log(`Connected to database`);
    });
  }
}
