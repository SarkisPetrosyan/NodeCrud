import * as jwt	from 'jsonwebtoken';

import UserSchema   		from '../schemas/user';

import APIError 				from '../services/APIError';
import mainConfig       from '../env';

import { Request, Response, NextFunction } from 'express';

import { IUser } from '../schemas/user/model';
import { IRequest } from './model';
import { UserRoleEnum } from '../services/enums';


/**
 *  Middleware checks JWT and role access
 *  @param {Array<number>} userTypes
 */
const createJwtValidation = (userTypes: number[]) =>  {
	return async (req: IRequest, res: Response, next: NextFunction) => {
		try {
			const bearerToken = req.headers.authorization;
			if (!bearerToken) return res.sendStatus(401);
			const token = bearerToken.slice(7);
			jwt.verify(token, mainConfig.JWT_SECRET, async (error, dtls: IJwtDetails) => {
				if (error) {
					new APIError('UNAUTHORIZED', 401);
					return res.sendStatus(401);
				}
				if (!userTypes.includes(dtls.role)) {
					new APIError('FORBIDDEN', 403);
					return res.sendStatus(403);
				}
				const user = await UserSchema.findOne({ _id: dtls._id, role: dtls.role });
				if (!user || user.blocked) {
					new APIError('UNAUTHORIZED', 401);
					return res.sendStatus(401);
				}
        req.user = user;
        return next();
			});
		} catch (err) {
			new APIError(err.message ? err.message : 'INTERNAL SERVER ERROR', 500);
			return res.sendStatus(500);
		}
	};
};

/**
 *  Middleware checks JWT and role access
 *  @param {Array<number>} userTypes
 */
const createGuestOrUserJwtValidation = () =>  {
	return async (req: IRequest, res: Response, next: NextFunction) => {
		try {
			const bearerToken = req.headers.authorization;
			if (!bearerToken) return next();
			const token = bearerToken.slice(7);
			jwt.verify(token, mainConfig.JWT_SECRET, async (error, dtls: IJwtDetails) => {
				if (error) {
					new APIError('UNAUTHORIZED', 401);
					return res.sendStatus(401);
				}
				const user = await UserSchema.findOne({ _id: dtls._id, role: dtls.role });
				if (!user) {
					new APIError('UNAUTHORIZED', 401);
					return res.sendStatus(401);
				}
        req.user = user;
        return next();
			});
		} catch (err) {
			new APIError(err.message ? err.message : 'INTERNAL SERVER ERROR', 500);
			return res.sendStatus(500);
		}
	};
};

export default {
	validateSuperAdmin: createJwtValidation([UserRoleEnum.superAdmin]),
	validateAdmin: createJwtValidation([UserRoleEnum.superAdmin, UserRoleEnum.admin]),
	validateUser: createJwtValidation([UserRoleEnum.superAdmin, UserRoleEnum.admin, UserRoleEnum.user, UserRoleEnum.corporate]),
	validateGuestOrUser: createGuestOrUserJwtValidation()
};

export interface IJwtDetails {
	_id: string;
  role: number;
  provider: number;
	iat: number;
  exp: number;
}