import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncLocalStorage } from '../utils/trace-context';

// Estende a interface Request do Express
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = uuidv4();
    
    // Adiciona o traceId ao objeto request e headers
    req.traceId = traceId;
    req.headers['x-trace-id'] = traceId;
    
    // Executa o resto da requisição com o traceId no contexto
    asyncLocalStorage.run({ traceId }, () => {
      next();
    });
  }
} 