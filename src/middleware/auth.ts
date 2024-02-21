import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const tokenAuth = (req: Request, res: Response, next: NextFunction): void => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const [_, token] = bearerHeader.split(' ');
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                if (err.message == 'jwt expired') {
                    return res.send({ Status: 403, message: "Token Expired" });
                }
                else {
                    return res.send({ Status: 403, message: "Invalid Token" });
                }
            }
            // req.user = user; // Attach the decoded user to the request object
            next(); // Call the next middleware
        });
    }
    else {
        res.send({ Status: 403, message: "Token Missing" });
    }

};

export {tokenAuth};