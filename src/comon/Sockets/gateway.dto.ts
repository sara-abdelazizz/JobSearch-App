import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { HUserDocument } from "src/DB/Models/user.model";

export interface IOAuthSocket extends Socket {
  credentials?: {
    user: Partial<HUserDocument>;
    decoded: JwtPayload;
  };
}