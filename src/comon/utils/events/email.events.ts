import EventEmitter from "events";
import { OtpEnum } from "src/comon/enums/user.enums";
import { template } from "../email/verifyEmail.tenplate";
import { sendEmail } from "../email/sendEmail";

export const emailEvents = new EventEmitter();

emailEvents.on("confirmEmail", async (data) => {
  try {
    data.subject = OtpEnum.EMAIL_VERIFICATION;
    data.html = template(data.otp, data.firstName, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.log("fail to send email", error);
  }
});

emailEvents.on("applicationStatus", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  } catch (error) {
    console.log("fail to send application status email", error);
  }
});