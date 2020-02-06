import * as nodeMailer from 'nodemailer';
import { OsTypeEnum, WebRedirectTypeEnum, UserRoleEnum } from './enums';
import mainConfig from '../env';


const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: '2gatherdevelopment@gmail.com',
    pass: 'Password1/'
  }
});

export const sendVerificationEmail = (code: string, email: string, osType: number, name: string) => {
  // TODO Change icon url
  let html = `
    <div style="width: 100%; height: 250px;">
      <div style="width: 500px; position: absolute; left: 0; right: 0; margin: 0 auto;">
        <div>
          <img src="https://ineedapi.armlon.co.uk/photos/2Gather.png" alt="logo" style="height: 35px;">
        </div>
        <div style="height: 160px;border: 1px solid rgba(0,0,0,0.15);margin-top: 20px;border-radius: 5px;padding: 10px 25px;font-size: 14px;">
          <p>Dear ${name}! Thank you for creating your 2Gather account. To continue, please enter this verification code bellow.</p>
          <div style="width: 100%; height: 35px;">
            <div style="border: none; height: 35px; width: 100px; color: white; font-weight: 800; background-color: black; border-radius: 5px; margin: 0 auto;">
              <p style="margin: 0; line-height: 35px; text-align: center;">${code}</p>
            </div>
          </div>
          <p style="font-size: 12px; color: grey;">If you didn't create this account, please ignore this message.</p>
        </div>
      </div>
    </div>
  `;
  if (osType === OsTypeEnum.web) {
    let link = 'http://localhost:3000';
    link += '/auth/password-matches';
    link += `?email=${email}`;
    link += `&code=${code}`;
    link += `&type=${WebRedirectTypeEnum.register}`;
    html = `
    <div style="width: 100%; height: 250px;">
      <div style="width: 500px; position: absolute; left: 0; right: 0; margin: 0 auto;">
        <div>
          <img src="https://ineedapi.armlon.co.uk/photos/2Gather.png" alt="logo" style="height: 35px;">
        </div>
        <div style="height: 160px;border: 1px solid rgba(0,0,0,0.15);margin-top: 20px;border-radius: 5px;padding: 10px 25px;font-size: 14px;">
          <p>Dear ${name}! Thank you for creating your 2Gather account. To continue, please verify your email address by clicking the button below.</p>
          <div style="width: 100%; height: 35px;">
            <div style="border: none; height: 35px; width: 100px; color: white; font-weight: 800; background-color: black; border-radius: 5px; margin: 0 auto;">
              <a style="display: block; color: white;margin: 0; line-height: 35px; text-align: center; text-decoration: none;" href="${link}" target="_blank" rel="noopener noreferrer">
                Verify
              </a>
            </div>
          </div>
          <p style="font-size: 12px; color: grey;">If you didn't create this account, please ignore this message.</p>
        </div>
      </div>
    </div>
  `;
  }
  const emailOptions = {
    from: 'noreply@2gather.am',
    to: email,
    subject: 'Verify your 2Gather account',
    html
  };
  transporter.sendMail(emailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};

export const sendRestoreCode = (code: string, email: string, osType: number, name: string, userRole: number = UserRoleEnum.user) => {
  // TODO Change icon url
  let html = `
    <div style="width: 100%; height: 250px;">
      <div style="width: 500px; position: absolute; left: 0; right: 0; margin: 0 auto;">
        <div>
          <img src="https://ineedapi.armlon.co.uk/photos/2Gather.png" alt="logo" style="height: 35px;">
        </div>
        <div style="height: 160px;border: 1px solid rgba(0,0,0,0.15);margin-top: 20px;border-radius: 5px;padding: 10px 25px;font-size: 14px;">
          <p>Dear ${name}! Seems like you forgot your password for 2gather account. If that is true, please enter this restore code bellow.</p>
          <div style="width: 100%; height: 35px;">
            <div style="border: none; height: 35px; width: 100px; color: white; font-weight: 800; background-color: black; border-radius: 5px; margin: 0 auto;">
              <p style="margin: 0; line-height: 35px; text-align: center;">${code}</p>
            </div>
          </div>
          <p style="font-size: 12px; color: grey;">If you didn't forgot your password, please safely ignore this message.</p>
        </div>
      </div>
    </div>
  `;
  if (osType === OsTypeEnum.web) {
    let link = [UserRoleEnum.admin, UserRoleEnum.superAdmin].includes(userRole) ? `${mainConfig.ADMIN_CLIENT_BASE_URL}login/restore-password` : 'http://localhost:3000';
    link += `?email=${email}`;
    link += `&code=${code}`;
    link += `&type=${WebRedirectTypeEnum.restore}`;
    html = `
    <div style="width: 100%; height: 250px;">
      <div style="width: 500px; position: absolute; left: 0; right: 0; margin: 0 auto;">
        <div>
          <img src="https://ineedapi.armlon.co.uk/photos/2Gather.png" alt="logo" style="height: 35px;">
        </div>
        <div style="height: 160px;border: 1px solid rgba(0,0,0,0.15);margin-top: 20px;border-radius: 5px;padding: 10px 25px;font-size: 14px;">
          <p>Dear ${name ? name : 'Admin'}! Seems like you forgot your password for 2gather account. If that is true, click bellow to reset your password.</p>
          <div style="width: 100%; height: 35px;">
            <div style="border: none; height: 35px; width: 100px; color: white; font-weight: 800; background-color: black; border-radius: 5px; margin: 0 auto;">
              <a style="display: block; color: white;margin: 0; line-height: 35px; text-align: center; text-decoration: none;" href="${link}" target="_blank" rel="noopener noreferrer">
                Reset
              </a>
            </div>
          </div>
          <p style="font-size: 12px; color: grey;">If you didn't forgot your password, please safely ignore this message.</p>
        </div>
      </div>
    </div>
  `;
  }
  const emailOptions = {
    from: 'noreply@2gather.am',
    to: email,
    subject: 'Verify your 2Gather account',
    html
  };
  transporter.sendMail(emailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};