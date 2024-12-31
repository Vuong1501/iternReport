import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Joi from '../utils/joi/lib';
import moment from 'moment-timezone';
import CONFIG from '../config';
import validate from '../utils/validate';
import userController from '../controllers/usersController';
import { encryptedString, verifyPasswordMd5 } from '../utils/crypto';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
// import Model from '../models/models';
// import models from '../entity/index';
// const {
//   /* sequelize, Op, users, */

// } = models;
const router = Router();

router.get('/generate/data/login', async (req, res, next) => {
  const { username, password } = req.body;
  const data = await encryptedString(`${username}|${password}`, 'nbm@2018');

  console.log('data: ', data);
  res.send(data);
});

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validateAuthen = (req, res, next) => {
  // console.log("validateAuthen")
  const { username, password } = req.body;
  const user = {
    username,
    password
  };

  const SCHEMA = {
    username: Joi.string()
      .label('username')
      .min(6)
      .max(100)
      .required(),
    password: Joi.string()
      .label('password')
      .required()
  };

  // console.log('input: ', input);
  validate(user, SCHEMA)
    .then(() => next())
    .catch(err =>
      next(
        new ApiErrors.BaseError({
          statusCode: 400,
          type: 'loginError',
          error: err,
          name: 'Login'
        })
      )
    );
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

router.post('/', validateAuthen, async (req, res, next) => {
  try {
    console.log('authenticate body: ', req.body);
    console.log("đến đây");
    const { username, password, type } = req.body;
    // const passEncrypt = 'nbm@2018'
    // var encrypted = await encryptedString('hethong@gmail.com|AL7h8Jx4r8a8PjS5', passEncrypt)
    // 1bc2fef9ac032e211503b5690137d9e9addd3bfa8198d5b6f1d06513ec406190c0a7e282d83f648c7f47484b0e68b730
    // const decrypted = await decryptedString(data, passEncrypt)

    const user = {
      username: username,
      password
    };
    console.log("useruseruser", user);

    // if (decrypted && decrypted.split('|').length === 2) {
    //   user = { user: decrypted.split('|')[0], password: decrypted.split('|')[1] }
    // }

    let token;
    let dataToken;
    // let role;

    if (user && user.username) {
      const userInfo = await userController.find_one(user).catch(err => {
        ErrorHelpers.errorThrow(err, 'userNotFoundError', 'Login', 202);
      });

      console.log('fdfds: ', userInfo);

      if (!userInfo) {
        throw new ApiErrors.BaseError({
          statusCode: 200,
          type: 'userNotFoundError',
          name: 'Login'
        });
      }

      if (userInfo && userInfo.dataValues.status === 1) {
        // const passOk = user.password === userInfo.password

        const passOk = await verifyPasswordMd5(user.password, userInfo.password);

        console.log('userInfo.password: ', userInfo.password);
        console.log("passOkpassOk", passOk);
        if (passOk) {
          // console.log("passOk: ", passOk)
          console.log('user: ', user);
          dataToken = {
            user: username,
            userId: userInfo.id,
            // userGroupsId: userInfo.userGroupsId
          };
          token = jwt.sign(
            {
              ...dataToken
            },
            process.env.JWT_SECRET,
            {
              expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}`
              // algorithm: 'RS256'
            }
          );
          // role = [...userInfo.RoleDetails];
          // console.log("token", token)

          if (token) {
            res.status(200).json({
              success: true,
              status: 'ok',
              token,
              role: [],
              type,
              currentAuthority: [],

              ...dataToken
            });
          } else {
            res.status(200).json({
              success: false,
              message: 'Đăng nhập thất bại',
              status: 'error',
              token: null,
              role: {},
              type,
              currentAuthority: 'guest'
            });
          }
        } else {
          // next(new Error("Mật khẩu không đúng!"));
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'loginPassError',
            name: 'Login'
          });
        }
      }
      else {
        console.log('a');
        console.log("statusssssss", userInfo.status);
        if (userInfo.status !== 1) {
          throw new ApiErrors.BaseError({
            statusCode: 200,
            type: 'userInactiveError',
            name: 'Login'
          });
        }
        // else if (!conditionExpire) {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 200,
        //     type: 'userExpireError',
        //     name: 'Login'
        //   });
        // }
      }
    }
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeeee", error);
    // throw new ApiErrors.BaseError({
    //   statusCode: 200,
    //   type: 'loginError',
    //   error,
    //   name: 'Login'
    // })
    // console.log(error)
    next(error);
    // res.status(200).send(new Error(error).message)
  }
});

export default router;
