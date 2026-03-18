import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "node:crypto";
import { TokenTypeEnum } from "src/comon/enums/user.enums";


export const generateTokens = async (
  jwtService: JwtService,
  payload: object,
  accessSecret: string,
  refreshSecret: string,
  accessExpiresIn: number,
  refreshExpiresIn: number
): Promise<{ accessToken: string; refreshToken: string }> => {
  const jwtid = randomUUID();

  const accessToken = await jwtService.sign(payload, {
    secret: accessSecret,
    expiresIn: accessExpiresIn,
    jwtid,
  });

  const refreshToken = await jwtService.sign(payload, {
    secret: refreshSecret,
    expiresIn: refreshExpiresIn,
    jwtid,
  });

  return { accessToken, refreshToken };
};

export const decodedToken = async ({
  
  authorization,
  tokenType,
}: {
  authorization: string;
  tokenType: TokenTypeEnum;
}) => {
  if (!authorization) {
    throw new Error("Token required");
  }
  const jwtService = new JwtService();

  const token = authorization.split(" ")[1];

  const secret =
    tokenType === TokenTypeEnum.ACCESS
      ? process.env.TOKEN_ACCESS_ADMIN_SECRET
      : process.env.TOKEN_REFRESH_ADMIN_SECRET;

  const decoded = jwtService.verify(token, { secret });

  return {
    user: {
      _id: decoded.id,
      email: decoded.email,
    },
    decoded,
  }};